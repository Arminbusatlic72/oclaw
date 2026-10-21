import Link from 'next/link'
import {PortableText, type PortableTextBlock, type PortableTextComponents} from 'next-sanity'
import Image from './SanityImage'
import {archivePath, postPath} from '@/lib/blog'
import {absoluteUrl, type Locale} from '@/lib/i18n'
import {sanityFetch} from '@/sanity/lib/live'
import {newerBlogPostQuery, olderBlogPostQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Post = NonNullable<Awaited<ReturnType<typeof import('@/lib/blog').getPublishedPost>>>

function ArticleBody({body, locale}: {body: Post['body']; locale: Locale}) {
  const components: PortableTextComponents = {
    types: {image: ({value}) => value.asset?._ref ? <figure className="my-8"><Image id={value.asset._ref} alt={value.alt || ''} width={900} className="w-full rounded-lg" />{value.caption && <figcaption className="mt-2 text-sm text-slate-500">{value.caption}</figcaption>}</figure> : null},
    marks: {link: ({children, value}) => {
      const target = value.page
      const href = target?._id && target.slug && (target.language === locale || (locale === 'en' && !target.language)) ? postPath(locale, target.slug) : value.href
      if (!href || !(href.startsWith('/') || /^(https?:|mailto:|tel:)/i.test(href))) return <>{children}</>
      const external = /^https?:/i.test(href)
      return <Link href={href} target={external && value.openInNewTab ? '_blank' : undefined} rel={external && value.openInNewTab ? 'noopener noreferrer' : undefined}>{children}</Link>
    }},
  }
  return <div className="prose prose-slate max-w-none prose-lg"><PortableText value={(body || []) as PortableTextBlock[]} components={components} /></div>
}

export default async function BlogArticle({post, locale}: {post: Post; locale: Locale}) {
  const [{data: previous}, {data: next}] = await Promise.all([
    sanityFetch({query: olderBlogPostQuery, params: {language: locale, id: post._id, date: post.publishedAt!}, perspective: 'published', stega: false}),
    sanityFetch({query: newerBlogPostQuery, params: {language: locale, id: post._id, date: post.publishedAt!}, perspective: 'published', stega: false}),
  ])
  const related = (post.relatedPosts || []).filter((item) => item && item.language === locale && item.slug && item.publishedAt && new Date(item.publishedAt) <= new Date())
  const date = new Intl.DateTimeFormat(locale === 'es' ? 'es' : 'en', {dateStyle: 'long', timeZone: 'UTC'}).format(new Date(post.publishedAt!))
  const path = postPath(locale, post.slug!)
  const jsonLd = [
    {'@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.seo?.description || post.excerpt || undefined, image: resolveOpenGraphImage(post.seo?.openGraphImage || post.featuredImage)?.url, inLanguage: locale, datePublished: post.publishedAt, dateModified: post.updatedAt || post.publishedAt, mainEntityOfPage: absoluteUrl(path), author: post.author ? {'@type': 'Person', name: post.author} : undefined},
    {'@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      {'@type': 'ListItem', position: 1, name: locale === 'es' ? 'Inicio' : 'Home', item: absoluteUrl(locale === 'es' ? '/es/' : '/')},
      {'@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl(archivePath(locale))},
      {'@type': 'ListItem', position: 3, name: post.title, item: absoluteUrl(path)},
    ]},
  ]
  return <div className="container mx-auto px-4 py-12 sm:py-16">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}} />
    <nav aria-label={locale === 'es' ? 'Ruta de navegación' : 'Breadcrumb'} className="mb-8 text-sm text-slate-600"><Link href={locale === 'es' ? '/es/' : '/'}>{locale === 'es' ? 'Inicio' : 'Home'}</Link> / <Link href={archivePath(locale)}>Blog</Link> / <span aria-current="page">{post.title}</span></nav>
    <article className="mx-auto max-w-3xl"><header><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
      <p className="mt-5 text-slate-600"><time dateTime={post.publishedAt!}>{date}</time>{post.author && <> · {post.author}</>}</p></header>
      {post.featuredImage?.asset?._ref && <Image id={post.featuredImage.asset._ref} alt={post.featuredImage.alt || ''} width={1200} className="my-8 w-full rounded-xl" />}
      <ArticleBody body={post.body} locale={locale} />
      {(post.categories?.length || post.tags?.length) ? <footer className="mt-10 border-t pt-5 text-sm text-slate-600">{[...(post.categories || []), ...(post.tags || [])].filter(Boolean).join(' · ')}</footer> : null}
    </article>
    <nav aria-label={locale === 'es' ? 'Artículos cercanos' : 'Adjacent articles'} className="mx-auto mt-12 flex max-w-3xl justify-between gap-8 border-t pt-6">
      <div>{previous && <Link href={postPath(locale, previous.slug!)}>← {previous.title}</Link>}</div>
      <div>{next && <Link href={postPath(locale, next.slug!)}>{next.title} →</Link>}</div>
    </nav>
    {related.length > 0 && <section className="mx-auto mt-12 max-w-3xl"><h2 className="text-2xl font-semibold">{locale === 'es' ? 'Artículos relacionados' : 'Related articles'}</h2><ul className="mt-4 space-y-2">{related.map((item) => <li key={item!._id}><Link className="underline" href={postPath(locale, item!.slug!)}>{item!.title}</Link></li>)}</ul></section>}
  </div>
}
