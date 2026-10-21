import type {FooterWorkingHoursBlock} from './types'

export default function FooterWorkingHours({block}: {block: FooterWorkingHoursBlock}) {
  if (!block.entries?.length) return null

  return (
    <section>
      {block.heading && (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
          {block.heading}
        </h2>
      )}
      <dl className={block.heading ? 'mt-4 space-y-3' : 'space-y-3'}>
        {block.entries.map((entry) => (
          <div key={entry._key}>
            <dt className="text-sm font-medium text-slate-700 dark:text-slate-200">{entry.days}</dt>
            <dd className="text-sm text-slate-600 dark:text-slate-300">
              {entry.isClosed ? entry.closedLabel : entry.hours}
              {entry.note && <span className="block text-xs">{entry.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
