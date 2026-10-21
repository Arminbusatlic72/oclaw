#!/usr/bin/env python3
"""Read-only by default WordPress -> Sanity blog migration.

Requires Python 3.10+. Apply needs explicit target confirmation and a write token.
The dry run never sends a mutation or downloads image bytes.
"""
import argparse
import html
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://www.oclaw.us'
POSTS_API = SOURCE + '/wp-json/wp/v2/posts?per_page=100&_embed=1'
RESERVED = {'api', 'es', 'blog', 'blog-espanol', 'studio', '_next',
            'favicon.ico', 'robots.txt', 'sitemap.xml', 'opengraph-image',
            'icon', 'apple-icon'}
OUTPUT = ROOT / 'migration' / 'wordpress'
BLOCK_TAGS = {'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'figure', 'img'}
SAFE_WRAPPERS = {'div', 'section', 'main', 'article', 'span'}


def request(url, *, method='GET', data=None, token=None, content_type=None):
    headers = {'User-Agent': 'OclawMigration/1.0 (read-only inventory)'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    if content_type:
        headers['Content-Type'] = content_type
    for attempt in range(4):
        try:
            with urlopen(Request(url, data=data, method=method, headers=headers), timeout=30) as response:
                return response.read(), dict(response.headers)
        except HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 3:
                raise RuntimeError(f'{method} {urlparse(url).path}: HTTP {error.code}') from error
        except URLError as error:
            if attempt == 3:
                raise RuntimeError(f'{method} {urlparse(url).path}: {error.reason}') from error
        time.sleep(2 ** attempt)


def env_file(path):
    if path.exists():
        for line in path.read_text().splitlines():
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                value = value.strip()
                if value.startswith(('"', "'")):
                    quote_char = value[0]
                    value = value[1:].split(quote_char, 1)[0]
                else:
                    value = value.split('#', 1)[0].strip()
                os.environ.setdefault(key.strip(), value)


def node(tag='root', attrs=None):
    return {'tag': tag, 'attrs': dict(attrs or []), 'children': []}


class Tree(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = node()
        self.stack = [self.root]
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        child = node(tag, attrs)
        self.stack[-1]['children'].append(child)
        if tag not in {'br', 'img', 'hr', 'source', 'input', 'meta'}:
            self.stack.append(child)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index]['tag'] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1]['children'].append(data)


def plain(item):
    if isinstance(item, str):
        return item
    return ''.join(plain(child) for child in item['children'])


def keygen():
    count = 0
    def next_key():
        nonlocal count
        count += 1
        return f'wp{count:05d}'
    return next_key


def normalize_text(value):
    return re.sub(r'\s+', ' ', html.unescape(value))


def spans(item, next_key, definitions, marks=()):
    if isinstance(item, str):
        value = normalize_text(item)
        return [{'_type': 'span', '_key': next_key(), 'text': value, 'marks': list(marks)}] if value else []
    tag = item['tag']
    if tag == 'br':
        return [{'_type': 'span', '_key': next_key(), 'text': '\n', 'marks': list(marks)}]
    if tag in {'strong', 'b', 'em', 'i'}:
        marks += ('strong' if tag in {'strong', 'b'} else 'em',)
    if tag == 'a' and item['attrs'].get('href'):
        href = urljoin(SOURCE, item['attrs']['href'])
        if urlparse(href).scheme in {'http', 'https', 'mailto', 'tel'}:
            mark = next_key()
            definitions.append({'_type': 'link', '_key': mark, 'href': href})
            marks += (mark,)
    result = []
    for child in item['children']:
        result.extend(spans(child, next_key, definitions, marks))
    return result


def block(item, style, next_key, list_item=None, level=None):
    definitions = []
    children = []
    for child in item['children']:
        if not isinstance(child, dict) or child['tag'] not in {'ul', 'ol'}:
            children.extend(spans(child, next_key, definitions))
    if not ''.join(x['text'] for x in children).strip():
        return None
    output = {'_type': 'block', '_key': next_key(), 'style': style,
              'markDefs': definitions, 'children': children}
    if list_item:
        output.update(listItem=list_item, level=level)
    return output


def images_in(item):
    if isinstance(item, str):
        return []
    return ([item] if item['tag'] == 'img' else []) + [image for child in item['children'] for image in images_in(child)]


def embeds_in(item):
    if isinstance(item, str):
        return []
    return ([item] if item['tag'] in {'iframe', 'video', 'audio'} else []) + [embed for child in item['children'] for embed in embeds_in(child)]


def convert(source, source_url):
    root = Tree(source).root
    next_key = keygen()
    output, assets, unsupported = [], [], []
    links = []

    def image_block(item, caption=''):
        src = item['attrs'].get('src') or item['attrs'].get('data-src')
        if not src:
            unsupported.append('image without src')
            return
        src = urljoin(source_url, src)
        alt = item['attrs'].get('alt', '').strip()
        assets.append({'url': src, 'alt': alt, 'caption': caption.strip(), 'role': 'inline'})
        output.append({'_type': 'image', '_key': next_key(), '_migrationUrl': src,
                       'alt': alt, 'caption': caption.strip()})

    def walk(item, list_kind=None, level=1):
        if isinstance(item, str):
            if item.strip():
                unsupported.append('loose text outside block')
            return
        tag = item['tag']
        if tag in {'p', 'h2', 'h3', 'h4', 'blockquote', 'li'}:
            b = block(item, 'blockquote' if tag == 'blockquote' else tag if tag in {'h2', 'h3', 'h4'} else 'normal',
                      next_key, list_kind if tag == 'li' else None, level if tag == 'li' else None)
            if b:
                output.append(b)
                links.extend(mark['href'] for mark in b['markDefs'])
            for child in item['children']:
                if isinstance(child, dict) and child['tag'] in {'ul', 'ol'}:
                    walk(child, None, level + 1)
                elif isinstance(child, dict) and child['tag'] == 'img':
                    image_block(child)
        elif tag in {'ul', 'ol'}:
            for child in item['children']:
                if isinstance(child, dict) and child['tag'] == 'li':
                    walk(child, 'bullet' if tag == 'ul' else 'number', level)
        elif tag == 'figure':
            pictures = images_in(item)
            caption = next((plain(x) for x in item['children'] if isinstance(x, dict) and x['tag'] == 'figcaption'), '')
            for picture in pictures:
                image_block(picture, caption)
            if not pictures:
                unsupported.append('figure without image (embed/widget)')
            for embed in embeds_in(item):
                unsupported.append(embed['tag'] + ' embed: ' + embed['attrs'].get('src', 'unknown'))
        elif tag == 'img':
            image_block(item)
        elif tag in SAFE_WRAPPERS or tag == 'root':
            for child in item['children']:
                walk(child, list_kind, level)
        elif tag not in {'figcaption'}:
            unsupported.append('unsupported HTML tag: ' + tag)
    walk(root)
    unsupported.extend('shortcode: ' + match for match in re.findall(r'\[[a-z][\w-]*(?:\s[^\]]*)?\]', source, re.I))
    return output, assets, sorted(set(unsupported)), sorted(set(links))


def wp_posts():
    data, headers = request(POSTS_API)
    posts = json.loads(data)
    total = int(headers.get('X-Wp-Total', headers.get('X-WP-Total', len(posts))))
    pages = int(headers.get('X-Wp-Totalpages', headers.get('X-WP-TotalPages', 1)))
    if pages > 1:
        for page in range(2, pages + 1):
            more, _ = request(POSTS_API + f'&page={page}')
            posts.extend(json.loads(more))
    if len(posts) != total:
        raise RuntimeError(f'WordPress pagination incomplete: {len(posts)} of {total}')
    return posts, total, pages


def sanity_docs(project, dataset, token):
    query = '*[_type in ["page", "blogPost"]]{_id,_type,language,"slug":slug.current}'
    url = f'https://{project}.api.sanity.io/v2025-09-25/data/query/{dataset}?query={quote(query)}'
    data, _ = request(url, token=token)
    return json.loads(data)['result']


def iso(value):
    return value + 'Z' if value and not re.search(r'(Z|[+-]\d\d:\d\d)$', value) else value


def inspect_post(post):
    embedded = post.get('_embedded') or {}
    media = (embedded.get('wp:featuredmedia') or [{}])[0]
    terms = [term for group in embedded.get('wp:term', []) for term in group]
    author = (embedded.get('author') or [{}])[0].get('name') or post.get('yoast_head_json', {}).get('author')
    seo = post.get('yoast_head_json') or {}
    body, inline, unsupported, links = convert(post['content']['rendered'], post['link'])
    featured_url = media.get('source_url')
    assets = ([{'url': featured_url, 'alt': media.get('alt_text') or '', 'caption':
                html.unescape(re.sub(r'<[^>]*>', '', media.get('caption', {}).get('rendered', ''))).strip(),
                'role': 'featured'}] if featured_url else []) + inline
    slug = post['slug']
    canonical = seo.get('canonical')
    expected = SOURCE + '/' + slug + '/'
    language = 'es' if urlparse(post['link']).path.startswith('/es/') or seo.get('og_locale', '').startswith('es') else 'en'
    issues = []
    if canonical and canonical != expected:
        issues.append('non-default canonical')
    if not body:
        issues.append('empty converted body')
    if unsupported:
        issues.append('unsupported content')
    if any(not asset['alt'] for asset in assets):
        issues.append('missing image alt text')
    if post['link'].rstrip('/') != expected.rstrip('/') and language == 'en':
        issues.append('source URL differs from target')
    if len(slug) > 160:
        issues.append('slug exceeds current Sanity maxLength 160')
    if post['content']['rendered'].count('<br') > 10:
        issues.append('complex line-break formatting')
    return {'wpId': post['id'], 'sourceUrl': post['link'], 'slug': slug,
            'language': language, 'targetId': f'drafts.wp-blog-{language}-{post["id"]}',
            'title': html.unescape(re.sub(r'<[^>]*>', '', post['title']['rendered'])),
            'publishedAt': iso(post.get('date_gmt') or post['date']),
            'updatedAt': iso(post.get('modified_gmt') or post['modified']),
            'excerpt': html.unescape(re.sub(r'<[^>]*>', '', post['excerpt']['rendered'])).strip(),
            'sourceHtml': post['content']['rendered'], 'portableText': body,
            'featuredImageUrl': featured_url, 'assets': assets, 'author': author,
            'categories': [term['name'] for term in terms if term.get('taxonomy') == 'category'],
            'tags': [term['name'] for term in terms if term.get('taxonomy') == 'post_tag'],
            'seo': {'title': seo.get('title'), 'description': seo.get('description'),
                    'canonical': canonical, 'robots': seo.get('robots'),
                    'openGraphImageUrl': (seo.get('og_image') or [{}])[0].get('url')},
            'internalLinks': [link for link in links if urlparse(link).netloc in {'oclaw.us', 'www.oclaw.us'}],
            'externalLinks': [link for link in links if urlparse(link).netloc not in {'oclaw.us', 'www.oclaw.us'}],
            'embeddedMedia': [u for u in unsupported if 'embed' in u or 'iframe' in u],
            'unsupported': unsupported, 'review': issues}


def image_available(url):
    parsed = urlparse(url)
    if parsed.scheme != 'https' or parsed.hostname not in {'www.oclaw.us', 'oclaw.us'}:
        return False
    try:
        _, headers = request(url, method='HEAD')
        return headers.get('Content-Type', '').startswith('image/')
    except RuntimeError:
        return False


def upload_asset(url, project, dataset, token, uploaded):
    if url in uploaded:
        return uploaded[url]
    if not image_available(url):
        raise RuntimeError(f'Image URL is not a reachable Oclaw HTTPS image: {url}')
    source, headers = request(url)
    content_type = headers.get('Content-Type', '').split(';')[0]
    if not content_type.startswith('image/'):
        raise RuntimeError(f'Not an image: {url}')
    filename = quote(Path(urlparse(url).path).name)
    endpoint = f'https://{project}.api.sanity.io/v2025-09-25/assets/images/{dataset}?filename={filename}'
    result, _ = request(endpoint, method='POST', data=source, token=token, content_type=content_type)
    uploaded[url] = json.loads(result)['document']['_id']
    return uploaded[url]


def apply_post(record, project, dataset, token, uploaded):
    body = json.loads(json.dumps(record['portableText']))
    for item in body:
        if item['_type'] == 'image':
            url = item.pop('_migrationUrl')
            item['asset'] = {'_type': 'reference', '_ref': upload_asset(url, project, dataset, token, uploaded)}
    doc = {'_id': record['targetId'], '_type': 'blogPost', 'language': record['language'],
           'title': record['title'], 'slug': {'_type': 'slug', 'current': record['slug']},
           'excerpt': record['excerpt'], 'author': record['author'],
           'publishedAt': record['publishedAt'], 'updatedAt': record['updatedAt'],
           'body': body, 'categories': record['categories'], 'tags': record['tags']}
    featured = next((asset for asset in record['assets'] if asset['role'] == 'featured'), None)
    if featured:
        doc['featuredImage'] = {'_type': 'image', 'alt': featured['alt'],
                                'asset': {'_type': 'reference', '_ref': upload_asset(featured['url'], project, dataset, token, uploaded)}}
    seo = record['seo']
    doc['seo'] = {'_type': 'seo'}
    if seo['title']:
        doc['seo']['title'] = seo['title']
    if seo['description']:
        doc['seo']['description'] = seo['description']
    if seo['robots'] and seo['robots'].get('index') == 'noindex':
        doc['seo']['noIndex'] = True
    endpoint = f'https://{project}.api.sanity.io/v2025-09-25/data/mutate/{dataset}'
    payload = json.dumps({'mutations': [{'create': doc}]}).encode()
    request(endpoint, method='POST', data=payload, token=token, content_type='application/json')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--confirm-project')
    parser.add_argument('--confirm-dataset')
    parser.add_argument('--limit', type=int)
    parser.add_argument('--post-id', type=int)
    parser.add_argument('--skip-image-head', action='store_true', help='Only for offline/test dry runs')
    args = parser.parse_args()
    env_file(ROOT / 'frontend/.env.local')
    project = os.getenv('NEXT_PUBLIC_SANITY_PROJECT_ID')
    dataset = os.getenv('NEXT_PUBLIC_SANITY_DATASET')
    if not project or not dataset:
        parser.error('Configure NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET')
    if args.apply and (args.confirm_project != project or args.confirm_dataset != dataset):
        parser.error('--apply requires exact --confirm-project and --confirm-dataset')
    if args.limit is not None and args.limit < 1:
        parser.error('--limit must be positive')
    token = os.getenv('SANITY_API_WRITE_TOKEN') if args.apply else os.getenv('SANITY_API_READ_TOKEN')
    if args.apply and not token:
        parser.error('--apply requires SANITY_API_WRITE_TOKEN')
    posts, total, pages = wp_posts()
    docs = sanity_docs(project, dataset, token)
    records = [inspect_post(post) for post in posts]
    existing = {(doc.get('language') or 'en', (doc.get('slug') or '').casefold()): doc for doc in docs}
    ids = {doc['_id'] for doc in docs}
    seen = set()
    for record in records:
        slug_key = (record['language'], record['slug'].casefold())
        if record['slug'].casefold() in RESERVED:
            record['review'].append('reserved route')
        if slug_key in existing:
            record['review'].append('Sanity slug collision: ' + existing[slug_key]['_id'])
        if slug_key in seen:
            record['review'].append('WordPress slug collision')
        if record['targetId'] in ids or record['targetId'].removeprefix('drafts.') in ids:
            record['review'].append('target ID already exists')
        seen.add(slug_key)
    urls = sorted({asset['url'] for record in records for asset in record['assets']})
    image_status = {url: image_available(url) for url in urls} if not args.skip_image_head else {}
    for record in records:
        if any(image_status.get(asset['url']) is False for asset in record['assets']):
            record['review'].append('inaccessible image')
    blockers = ('collision', 'reserved route', 'target ID already exists', 'unsupported content',
                'inaccessible image', 'empty converted body', 'source URL differs')
    eligible = [r for r in records if r['language'] == 'en' and
                not any(any(blocker in issue for blocker in blockers) for issue in r['review'])]
    selected = [r for r in eligible if args.post_id is None or r['wpId'] == args.post_id]
    if args.limit:
        selected = selected[:args.limit]
    summary = {'sourceTotal': total, 'sourcePages': pages, 'english': sum(r['language'] == 'en' for r in records),
               'spanish': sum(r['language'] == 'es' for r in records),
               'existingSanityPosts': sum(doc['_type'] == 'blogPost' for doc in docs),
               'existingSanityPages': sum(doc['_type'] == 'page' for doc in docs),
               'eligibleForApply': len(eligible), 'selectedForApply': len(selected),
               'slugConflicts': [r['wpId'] for r in records if any('collision' in issue or issue == 'reserved route' for issue in r['review'])],
               'missingFeaturedImages': [r['wpId'] for r in records if not r['featuredImageUrl']],
               'inaccessibleImages': [url for url, available in image_status.items() if not available],
               'internalLinksNeedingReview': {str(r['wpId']): [u for u in r['internalLinks']
                   if urlparse(u).path.startswith('/wp-content/')]
                   for r in records if any(urlparse(u).path.startswith('/wp-content/') for u in r['internalLinks'])},
               'unsupportedContent': {str(r['wpId']): r['unsupported'] for r in records if r['unsupported']},
               'seoTitles': sum(bool(r['seo']['title']) for r in records),
               'seoDescriptions': sum(bool(r['seo']['description']) for r in records),
               'uniqueImageUrls': len(urls),
               'manualReview': {str(r['wpId']): r['review'] for r in records if r['review']},
               'targetIds': {str(r['wpId']): r['targetId'] for r in records}}
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / 'inventory.json').write_text(json.dumps({'summary': summary, 'posts': records}, indent=2, ensure_ascii=False) + '\n')
    (OUTPUT / 'report.md').write_text(report(summary, records, project, dataset))
    print(json.dumps(summary, indent=2))
    if args.apply:
        if not selected:
            raise RuntimeError('No eligible articles selected; review report')
        path = OUTPUT / 'apply-manifest.json'
        manifest = json.loads(path.read_text()) if path.exists() else {'project': project, 'dataset': dataset,
                                                                      'createdDrafts': [], 'uploadedAssets': {}}
        if manifest['project'] != project or manifest['dataset'] != dataset:
            raise RuntimeError('Existing apply manifest belongs to another Sanity target')
        uploaded = manifest['uploadedAssets']
        for record in selected:
            try:
                apply_post(record, project, dataset, token, uploaded)
                manifest['createdDrafts'].append({'wpId': record['wpId'], 'id': record['targetId'], 'slug': record['slug']})
                path.write_text(json.dumps(manifest, indent=2) + '\n')
                print('Created draft', record['targetId'])
            except Exception:
                path.write_text(json.dumps(manifest, indent=2) + '\n')
                raise


def report(summary, records, project, dataset):
    lines = [f'# WordPress blog migration dry run', '', f'Target: `{project}/{dataset}`. No Sanity writes in dry run.', '',
             f"- WordPress posts: {summary['sourceTotal']} across {summary['sourcePages']} API page(s); English: {summary['english']}; Spanish: {summary['spanish']}.",
             f"- Existing Sanity pages: {summary['existingSanityPages']}; blog posts: {summary['existingSanityPosts']}.",
             f"- Eligible without review: {summary['eligibleForApply']}; slug conflicts: {len(summary['slugConflicts'])}.",
             f"- Featured image absent in source: {len(summary['missingFeaturedImages'])}; unique image URLs: {summary['uniqueImageUrls']}; inaccessible: {len(summary['inaccessibleImages'])}.",
             f"- SEO titles: {summary['seoTitles']}; SEO descriptions: {summary['seoDescriptions']}.", '',
             '## Article inventory', '', '| WP ID | Slug | Date | Featured | Review |', '|---:|---|---|---|---|']
    for record in records:
        lines.append(f"| {record['wpId']} | `{record['slug']}` | {record['publishedAt'][:10]} | {'yes' if record['featuredImageUrl'] else 'no'} | {', '.join(record['review']) or 'none'} |")
    lines += ['', '## Source and target differences', '',
              '- WordPress Yoast canonical URLs are recorded in inventory; target derives the canonical from the unchanged slug. Non-default values are flagged.',
              '- WordPress index/noindex is mapped to `seo.noIndex`; original follow directives and other Yoast robots values are recorded for review.',
              '- Yoast Article structured data becomes BlogPosting in the frontend. Review schema differences before publishing.',
              '- Images are represented by source URLs in dry-run Portable Text and uploaded once per URL in apply mode.',
              '- Missing SEO descriptions remain absent; the frontend uses the excerpt as its existing fallback.',
              '- Spanish source posts are inventoried separately and never inferred from English articles.', '',
              '## Internal links needing review', '']
    for wp_id, urls in summary['internalLinksNeedingReview'].items():
        for url in urls:
            lines.append(f'- WordPress {wp_id}: `{url}` needs asset preservation or a redirect if WordPress media hosting changes.')
    lines += ['',
              '## Manual review', '']
    for record in records:
        if record['review']:
            lines.append(f"- **{record['wpId']}** `{record['slug']}`: {', '.join(record['review'])}.")
    lines += ['', '## Import and rollback', '',
              'Run the script with `--apply --confirm-project=' + project + ' --confirm-dataset=' + dataset + ' --post-id=ID` only after approval and a Sanity export.',
              'The script creates `drafts.wp-blog-en-ID` with Sanity `create` (never overwrite). It writes `apply-manifest.json` after each draft.',
              'For rollback, use the manifest to delete only its `createdDrafts` IDs after reviewing dependencies. Delete uploaded assets only when no other document references them.',
              'Never delete pre-existing pages, posts, translation.metadata, or shared assets.']
    return '\n'.join(lines) + '\n'


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, HTTPError) as error:
        print(f'Migration failed: {error}', file=sys.stderr)
        sys.exit(1)
