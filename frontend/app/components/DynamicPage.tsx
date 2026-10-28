import PageBuilderPage from '@/app/components/PageBuilder'
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

  return (
    <main className={hasPageHero ? undefined : 'my-10 lg:my-16'}>
      {!hasPageHero && <section>
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
      </section>}
      <PageBuilderPage page={page} />
    </main>
  )
}
