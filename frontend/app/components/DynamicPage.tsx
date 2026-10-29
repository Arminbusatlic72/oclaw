import PageBuilderPage from '@/app/components/PageBuilder'
import Link from 'next/link'
import type {GetPageQueryResult} from '@/sanity.types'

export default function DynamicPage({page, isHomepage = false}: {page: NonNullable<GetPageQueryResult>; isHomepage?: boolean}) {
  if (isHomepage) {
    return (
      <div className="homepage">
        <h1 className="sr-only">{page.heading}</h1>
        <PageBuilderPage page={page} />
      </div>
    )
  }

  const hasPageHero = page.pageBuilder?.[0]?._type === 'pageHero'
  const locale = page.language === 'es' ? 'es' : 'en'
  const homePath = locale === 'es' ? '/es/' : '/'
  const homeLabel = locale === 'es' ? 'Inicio' : 'Home'

  return (
    <main>
      {!hasPageHero && <header className="about-hero">
        <div className="container about-hero-inner">
          {page.subheading && <p className="site-eyebrow">{page.subheading}</p>}
          <h1>{page.heading}</h1>
          <nav aria-label="Breadcrumb" className="about-breadcrumb">
            <Link href={homePath}>{homeLabel}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{page.heading}</span>
          </nav>
        </div>
      </header>}
      <PageBuilderPage page={page} />
    </main>
  )
}
