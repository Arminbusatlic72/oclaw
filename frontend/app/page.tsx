import Link from 'next/link'
import {PortableText} from '@portabletext/react'

import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggeredGrid from '@/components/animations/StaggeredGrid'
import ParallaxHero from '@/components/sections/ParallaxHero'
import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {studioUrl} from '@/sanity/lib/api'
import {dataAttr} from '@/sanity/lib/utils'
import DynamicPage from '@/app/components/DynamicPage'
import {localizeContent} from '@/lib/localized-content'
import {pageMetadata} from '@/lib/page-metadata'
import {homePageQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const {data: page} = await sanityFetch({
    query: homePageQuery,
    params: {id: 'siteSettings'},
    stega: false,
  })
  if (!page || (page.language && page.language !== 'en')) {
    return {alternates: {canonical: 'https://www.oclaw.us/'}}
  }
  return pageMetadata(page, 'en', null, true)
}

const starterHighlights = [
  'Page builder with reusable blocks for fast page composition.',
  'Global navigation and settings documents wired into the frontend.',
  'Validation, bootstrap, and new block scaffolding commands for repeatable project setup.',
] as const

export default async function Page() {
  const [{data: settings}, {data: homePage}] = await Promise.all([
    sanityFetch({query: settingsQuery, params: {id: 'siteSettings'}}),
    sanityFetch({query: homePageQuery, params: {id: 'siteSettings'}}),
  ])
  if (homePage && (!homePage.language || homePage.language === 'en')) {
    return <DynamicPage page={await localizeContent(homePage, 'en')} />
  }

  return (
    <>
      <ParallaxHero
        title="Start new CMS projects with a cleaner base."
        subtitle="The starter now ships with smooth inertia scroll, scroll-triggered reveals, and parallax primitives that you can reuse across real client pages."
        ctaLabel="Open Sanity Studio"
        ctaHref={studioUrl}
        backgroundImage="/images/tile-grid-white.png"
      />

      <section className="relative border-b border-slate-200 bg-linear-to-b from-slate-50 to-white py-20 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
        <div className="container">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <ScrollReveal direction="up">
              <span className="rounded-full border border-slate-300 px-4 py-1 text-xs uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Blocks-First CMS Starter
              </span>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.08} className="max-w-3xl">
              <div className="text-base text-slate-600 sm:text-lg dark:text-slate-300">
                {settings?.description && (
                  <div
                    data-sanity={dataAttr({
                      id: settings._id,
                      type: 'settings',
                      path: 'description',
                    }).toString()}
                  >
                    <PortableText value={settings.description} />
                  </div>
                )}
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.16}>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href={studioUrl}
                  className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                  target="_blank"
                >
                  Open Sanity Studio
                </Link>
                <Link
                  href="https://www.sanity.io/docs"
                  className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-100 dark:hover:text-slate-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sanity Docs
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-950">
        <div className="container grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ScrollReveal direction="left">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Start Here
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                What this starter keeps
              </h2>
              <StaggeredGrid columns={3} className="mt-6 sm:grid-cols-1 lg:grid-cols-1">
                {starterHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </StaggeredGrid>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.08}>
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-slate-100 shadow-sm dark:border-slate-800">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
                Recommended First Steps
              </p>
              <ol className="mt-6 grid gap-4 text-sm text-slate-200">
                <li className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  Update site settings, logo, and navigation in Studio.
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  Create your first real page and compose it with blocks.
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  Run <code className="font-mono text-xs">pnpm new:block --name FeatureGrid</code>{' '}
                  when you need a new section type.
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  Replace this homepage once your real content model is ready.
                </li>
              </ol>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
