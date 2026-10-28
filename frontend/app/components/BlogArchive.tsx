import Link from 'next/link'
import {notFound} from 'next/navigation'
import CustomPortableText from './PortableText'
import type {PortableTextBlock} from 'next-sanity'
import Image from './SanityImage'
import ArchiveHero from './ArchiveHero'
import {archiveId, archivePath, postPath} from '@/lib/blog'
import {archiveMetadata} from '@/lib/blog-metadata'
import type {Locale} from '@/lib/i18n'
import {sanityFetch} from '@/sanity/lib/live'
import {blogArchiveQuery, blogCountQuery, blogPostsQuery} from '@/sanity/lib/queries'

export function archivePageNumber(value?: string) {
  if (value === undefined) return 1
  if (!/^[1-9]\d*$/.test(value)) return null
  const number = Number(value)
  return Number.isSafeInteger(number) ? number : null
}

export async function getArchive(locale: Locale) {
  const {data} = await sanityFetch({query: blogArchiveQuery, params: {id: archiveId(locale)}, perspective: 'published', stega: false})
  return data
}

export async function getArchiveMetadata(locale: Locale, rawPage?: string) {
  const page = archivePageNumber(rawPage)
  if (!page) return {}
  return archiveMetadata(await getArchive(locale), locale, page)
}

export default async function BlogArchive({locale, rawPage}: {locale: Locale; rawPage?: string}) {
  const page = archivePageNumber(rawPage)
  if (!page) notFound()
  const archive = await getArchive(locale)
  const pageSize = archive?.postsPerPage && archive.postsPerPage >= 1 && archive.postsPerPage <= 50 ? archive.postsPerPage : 10
  const [{data: count}, {data: posts}] = await Promise.all([
    sanityFetch({query: blogCountQuery, params: {language: locale}, perspective: 'published', stega: false}),
    sanityFetch({query: blogPostsQuery, params: {language: locale, start: (page - 1) * pageSize, end: page * pageSize}, perspective: 'published', stega: false}),
  ])
  const pages = Math.max(1, Math.ceil(count / pageSize))
  if (page > pages) notFound()
  const pageNumbers = [...new Set([1, pages, page - 1, page, page + 1].filter((number) => number >= 1 && number <= pages))].sort((a, b) => a - b)
  const title = archive?.heading || (locale === 'es' ? 'Blog en Español' : 'Blog')
  const pageHref = (number: number) => number === 1 ? archivePath(locale) : `${archivePath(locale)}?page=${number}`
  return <><ArchiveHero locale={locale} title={title} path={archivePath(locale)} /><main className="container mx-auto px-4 py-12 sm:py-16">
    {(archive?.description || archive?.introduction || (archive?.ctaLabel && archive.ctaHref)) && <header className="archive-introduction">
      {archive?.description && <p>{archive.description}</p>}
      {archive?.introduction && <CustomPortableText className="mt-6" value={archive.introduction as PortableTextBlock[]} />}
      {archive?.ctaLabel && archive.ctaHref && <Link className="mt-5 inline-block underline" href={archive.ctaHref}>{archive.ctaLabel}</Link>}
    </header>}
    {posts.length ? <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <article key={post._id} className="overflow-hidden rounded-xl border border-slate-200">
      <Link href={postPath(locale, post.slug!)} className="block focus-visible:outline-2 focus-visible:outline-offset-2">
        {post.featuredImage?.asset?._ref && <Image id={post.featuredImage.asset._ref} alt={post.featuredImage.alt || ''} width={800} className="aspect-[16/10] w-full object-cover" />}
        <div className="p-5"><time dateTime={post.publishedAt!} className="text-sm text-slate-500">{new Intl.DateTimeFormat(locale === 'es' ? 'es' : 'en', {dateStyle: 'medium', timeZone: 'UTC'}).format(new Date(post.publishedAt!))}</time>
          <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>{post.excerpt && <p className="mt-3 text-slate-600">{post.excerpt}</p>}</div>
      </Link></article>)}</div> : <p role="status">{archive?.emptyMessage || (locale === 'es' ? 'Aún no hay artículos publicados.' : 'No articles have been published yet.')}</p>}
    {pages > 1 && <nav aria-label={locale === 'es' ? 'Páginas del blog' : 'Blog pages'} className="mt-12 flex flex-wrap items-center gap-3">
      {page > 1 && <Link rel="prev" href={pageHref(page - 1)} className="rounded border px-4 py-2">{locale === 'es' ? 'Anterior' : 'Previous'}</Link>}
      {pageNumbers.map((number, index) => <span key={number} className="inline-flex items-center gap-3">{index > 0 && number > pageNumbers[index - 1] + 1 && <span aria-hidden="true">…</span>}<Link href={pageHref(number)} aria-current={number === page ? 'page' : undefined} className="rounded border px-4 py-2" aria-label={`${locale === 'es' ? 'Página' : 'Page'} ${number}`}>{number}</Link></span>)}
      {page < pages && <Link rel="next" href={pageHref(page + 1)} className="rounded border px-4 py-2">{locale === 'es' ? 'Siguiente' : 'Next'}</Link>}
    </nav>}
  </main></>
}
