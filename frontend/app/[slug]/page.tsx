import type {Metadata} from 'next'

import PageBuilderPage from '@/app/components/PageBuilder'
import {PageOnboarding} from '@/app/components/Onboarding'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pagesSlugs,
    // // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: page} = await sanityFetch({
    query: getPageQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })

  return {
    title: page?.name,
    description: page?.heading,
  } satisfies Metadata
}

export default async function Page(props: Props) {
  const params = await props.params
  const [{data: page}] = await Promise.all([sanityFetch({query: getPageQuery, params})])
  if (!page?._id) {
    return (
      <div className="py-40">
        <PageOnboarding />
      </div>
    )
  }

  return (
    <div className="my-10 lg:my-16">
      <section>
        <div className="container">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="max-w-3xl">
              <h1 className="text-4xl text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-100">
                {page.heading}
              </h1>
              {page.subheading && (
                <p className="mt-4 text-sm uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
                  {page.subheading}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      <PageBuilderPage page={page as GetPageQueryResult} />
    </div>
  )
}
