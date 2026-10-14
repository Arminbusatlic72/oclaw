import PageBuilderPage from '@/app/components/PageBuilder'
import type {GetPageQueryResult} from '@/sanity.types'

export default function DynamicPage({page}: {page: NonNullable<GetPageQueryResult>}) {
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
      <PageBuilderPage page={page} />
    </div>
  )
}
