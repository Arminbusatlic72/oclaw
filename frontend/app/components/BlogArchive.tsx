import Link from 'next/link'
import {notFound} from 'next/navigation'
import {ChevronLeft, ChevronRight, Search, Scale} from 'lucide-react'
import CustomPortableText from './PortableText'
import type {PortableTextBlock} from 'next-sanity'
import Image from './SanityImage'
import ArchiveHero from './ArchiveHero'
import {archiveId, archivePath, postPath} from '@/lib/blog'
import {archiveMetadata} from '@/lib/blog-metadata'
import type {Locale} from '@/lib/i18n'
import {sanityFetch} from '@/sanity/lib/live'
import {blogArchiveFacetsQuery, blogArchiveQuery, blogCountQuery, blogPostsQuery} from '@/sanity/lib/queries'

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

type BlogArchiveProps = {locale: Locale; rawPage?: string; search?: string; category?: string; tag?: string}
type BlogListPost = {
  _id: string
  title: string
  slug: string
  excerpt: string | null
  author: string | null
  publishedAt: string
  categories: string[] | null
  tags: string[] | null
  featuredImage: {alt?: string | null; asset?: {_ref?: string} | null} | null
}
type BlogFacets = {categories: string[] | null; tags: string[] | null; recent: BlogListPost[] | null}

export default async function BlogArchive({locale, rawPage, search: rawSearch, category: rawCategory, tag: rawTag}: BlogArchiveProps) {
  const page = archivePageNumber(rawPage)
  if (!page) notFound()
  const isSpanish = locale === 'es'
  const search = rawSearch?.trim().slice(0, 100) || ''
  const category = rawCategory?.trim().slice(0, 100) || ''
  const tag = rawTag?.trim().slice(0, 100) || ''
  const searchPattern = search ? `*${search.replaceAll('*', '')}*` : ''
  const archive = await getArchive(locale)
  const pageSize = archive?.postsPerPage && archive.postsPerPage >= 1 && archive.postsPerPage <= 50 ? archive.postsPerPage : 3
  const params = {language: locale, search, searchPattern, category, tag}
  const [countResult, postsResult, facetsResult] = await Promise.all([
    sanityFetch({query: blogCountQuery, params: params as never, perspective: 'published', stega: false}),
    sanityFetch({query: blogPostsQuery, params: {...params, start: (page - 1) * pageSize, end: page * pageSize} as never, perspective: 'published', stega: false}),
    sanityFetch({query: blogArchiveFacetsQuery, params: {language: locale}, perspective: 'published', stega: false}),
  ])
  const count = countResult.data as number
  const posts = postsResult.data as BlogListPost[]
  const facets = facetsResult.data as BlogFacets
  const pages = Math.max(1, Math.ceil(count / pageSize))
  if (page > pages) notFound()
  const pageNumbers = [...new Set([1, pages, page - 1, page, page + 1].filter((number) => number >= 1 && number <= pages))].sort((a, b) => a - b)

  const title = archive?.heading || (isSpanish ? 'Blog en Español' : 'Blog')
  const basePath = archivePath(locale)
  const hrefFor = (next: {page?: number; search?: string; category?: string; tag?: string} = {}) => {
    const query = new URLSearchParams()
    const nextSearch = next.search ?? search
    const nextCategory = next.category ?? category
    const nextTag = next.tag ?? tag
    if (nextSearch) query.set('search', nextSearch)
    if (nextCategory) query.set('category', nextCategory)
    if (nextTag) query.set('tag', nextTag)
    if (next.page && next.page > 1) query.set('page', String(next.page))
    return query.size ? `${basePath}?${query}` : basePath
  }
  const dateFormatter = new Intl.DateTimeFormat(isSpanish ? 'es' : 'en', {day: '2-digit', month: 'short', year: '2-digit', timeZone: 'UTC'})
  const activeFilter = search || category || tag
  const categories = (facets?.categories || []).filter(Boolean).sort((a, b) => a.localeCompare(b))
  const tags = (facets?.tags || []).filter(Boolean).sort((a, b) => a.localeCompare(b))

  return <>
    <ArchiveHero locale={locale} title={title} path={basePath} />
    <main className="blog-archive">
      <div className="container blog-archive-layout">
        <section className="blog-post-list" aria-label={isSpanish ? 'Artículos' : 'Articles'}>
          {(archive?.description || archive?.introduction || (archive?.ctaLabel && archive.ctaHref)) && <header className="blog-archive-intro">
            {archive?.description && <p>{archive.description}</p>}
            {archive?.introduction && <CustomPortableText value={archive.introduction as PortableTextBlock[]} />}
            {archive?.ctaLabel && archive.ctaHref && <Link href={archive.ctaHref}>{archive.ctaLabel}</Link>}
          </header>}

          {activeFilter && <div className="blog-filter-summary" role="status"><span>{count} {count === 1 ? (isSpanish ? 'resultado' : 'result') : (isSpanish ? 'resultados' : 'results')}</span><Link href={basePath}>{isSpanish ? 'Borrar filtros' : 'Clear filters'}</Link></div>}

          {posts.length ? posts.map((post) => <article key={post._id} className="blog-archive-post">
            {post.featuredImage?.asset?._ref && <Link href={postPath(locale, post.slug!)} className="blog-post-image-link" tabIndex={-1} aria-hidden="true"><Image id={post.featuredImage.asset._ref} alt={post.featuredImage.alt || ''} width={1200} className="blog-post-image" /></Link>}
            <div className="blog-post-meta">
              <span>{isSpanish ? 'POR' : 'BY'} <strong>{post.author || post.categories?.[0] || (isSpanish ? 'EQUIPO LEGAL' : 'LEGAL TEAM')}</strong></span>
              {post.categories?.[0] && post.author && <><i aria-hidden="true" /><Link href={hrefFor({category: post.categories[0], tag: '', page: 1})}>{post.categories[0]}</Link></>}
              <i aria-hidden="true" /><time dateTime={post.publishedAt!}>{dateFormatter.format(new Date(post.publishedAt!)).toUpperCase()}</time>
            </div>
            <h2><Link href={postPath(locale, post.slug!)}>{post.title}</Link></h2>
            {post.excerpt && <p>{post.excerpt}</p>}
            <Link href={postPath(locale, post.slug!)} className="blog-read-more">{isSpanish ? 'LEER MÁS…' : 'READ MORE…'}</Link>
          </article>) : <div className="blog-empty" role="status"><h2>{isSpanish ? 'No encontramos artículos' : 'No articles found'}</h2><p>{archive?.emptyMessage || (isSpanish ? 'Prueba con otra búsqueda o elimina los filtros.' : 'Try a different search or clear the active filters.')}</p><Link href={basePath}>{isSpanish ? 'Ver todos los artículos' : 'View all articles'}</Link></div>}

          {pages > 1 && <nav aria-label={isSpanish ? 'Páginas del blog' : 'Blog pages'} className="blog-pagination">
            <Link href={page > 1 ? hrefFor({page: page - 1}) : hrefFor({page: 1})} aria-disabled={page === 1} tabIndex={page === 1 ? -1 : undefined} rel={page > 1 ? 'prev' : undefined} aria-label={isSpanish ? 'Página anterior' : 'Previous page'}><ChevronLeft aria-hidden="true" /></Link>
            {pageNumbers.map((number, index) => <span key={number} className="blog-pagination-item">{index > 0 && number > pageNumbers[index - 1] + 1 && <span aria-hidden="true">…</span>}<Link href={hrefFor({page: number})} aria-current={number === page ? 'page' : undefined}>{number}</Link></span>)}
            <Link href={page < pages ? hrefFor({page: page + 1}) : hrefFor({page})} aria-disabled={page === pages} tabIndex={page === pages ? -1 : undefined} rel={page < pages ? 'next' : undefined} aria-label={isSpanish ? 'Página siguiente' : 'Next page'}><ChevronRight aria-hidden="true" /></Link>
          </nav>}
        </section>

        <aside className="blog-sidebar" aria-label={isSpanish ? 'Herramientas del blog' : 'Blog tools'}>
          <section className="blog-sidebar-card blog-search-card"><form action={basePath} role="search"><label className="sr-only" htmlFor="blog-search">{isSpanish ? 'Buscar artículos' : 'Search articles'}</label><input id="blog-search" type="search" name="search" defaultValue={search} placeholder={isSpanish ? 'Buscar artículo…' : 'Search post…'} /><button type="submit" aria-label={isSpanish ? 'Buscar' : 'Search'}><Search aria-hidden="true" /></button></form></section>

          {categories.length > 0 && <section className="blog-sidebar-card"><h2>{isSpanish ? 'Categorías' : 'Categories'}</h2><nav className="blog-category-list" aria-label={isSpanish ? 'Categorías' : 'Categories'}>{categories.map((item) => <Link key={item} href={hrefFor({category: item, tag: '', page: 1})} aria-current={category === item ? 'true' : undefined}><ChevronRight aria-hidden="true" />{item}</Link>)}</nav></section>}

          {facets?.recent?.length ? <section className="blog-sidebar-card"><h2>{isSpanish ? 'Artículos recientes' : 'Recent Posts'}</h2><div className="blog-recent-list">{facets.recent.map((post) => <article key={post._id}>{post.featuredImage?.asset?._ref && <Image id={post.featuredImage.asset._ref} alt={post.featuredImage.alt || ''} width={180} className="blog-recent-image" />}<div><h3><Link href={postPath(locale, post.slug!)}>{post.title}</Link></h3><time dateTime={post.publishedAt!}>{dateFormatter.format(new Date(post.publishedAt!)).toUpperCase()}</time></div></article>)}</div></section> : null}

          {tags.length > 0 && <section className="blog-sidebar-card"><h2>{isSpanish ? 'Etiquetas' : 'Tags'}</h2><div className="blog-tag-list">{tags.map((item) => <Link key={item} href={hrefFor({tag: item, category: '', page: 1})} aria-current={tag === item ? 'true' : undefined}>{item}</Link>)}</div></section>}

          <section className="blog-consultation-card"><Scale aria-hidden="true" /><h2>{isSpanish ? 'Obtén asesoría sobre tu caso' : 'Get Advice About Your Case'}</h2><p>{isSpanish ? 'Nuestro equipo está listo para escuchar.' : 'Our legal team is ready to listen.'}</p><Link href={isSpanish ? '/es/contacto' : '/contact'}>{isSpanish ? 'Contáctanos' : 'Contact Us'}</Link></section>
        </aside>
      </div>
    </main>
  </>
}
