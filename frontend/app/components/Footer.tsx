export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="container py-10">
        <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Built with Sanity + Next.js
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Use this project as a reusable, CMS-first starter for modern websites.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
            <a
              href="https://github.com/sanity-io/sanity-template-nextjs-clean"
              className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
            <a
              href="https://nextjs.org/docs"
              className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
