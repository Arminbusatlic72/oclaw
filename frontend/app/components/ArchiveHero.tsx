import Link from 'next/link'
import {absoluteUrl, type Locale} from '@/lib/i18n'

export default function ArchiveHero({locale, title, path}: {locale: Locale; title: string; path: string}) {
  const homePath = locale === 'es' ? '/es/' : '/'
  const homeLabel = locale === 'es' ? 'Inicio' : 'Home'
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: homeLabel, item: absoluteUrl(homePath)},
      {'@type': 'ListItem', position: 2, name: title, item: absoluteUrl(path)},
    ],
  }

  return (
    <header className="about-hero">
      <div className="container about-hero-inner">
        <p className="site-eyebrow">OC Law Group</p>
        <h1>{title}</h1>
        <nav aria-label="Breadcrumb" className="about-breadcrumb">
          <Link href={homePath}>{homeLabel}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c')}}
      />
    </header>
  )
}
