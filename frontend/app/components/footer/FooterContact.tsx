import type {FooterContactBlock} from './types'
import type {Locale} from '@/lib/i18n'

function phoneHref(number: string) {
  const normalized = number.replace(/[^\d+*#,;]/g, '')
  return normalized ? `tel:${normalized}` : null
}

export default function FooterContact({block, locale}: {block: FooterContactBlock; locale: Locale}) {
  const offices = block.offices?.filter((office) => office && office.language === locale) || []
  const hasContent = offices.length || block.email?.address || block.phones?.length || block.addresses?.length
  if (!hasContent) return null

  return (
    <section>
      {block.heading && (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
          {block.heading}
        </h2>
      )}
      <div className={block.heading ? 'mt-4 space-y-4' : 'space-y-4'}>
        {offices.length > 0 ? offices.map((office) => <div key={office._id} className="text-sm leading-6"><p className="font-semibold">{office.name}</p><address className="not-italic">{[office.streetAddress, office.addressLine2, [office.city, office.state, office.postalCode].filter(Boolean).join(', '), office.country].filter(Boolean).map((line, index) => <span key={index}>{line}<br /></span>)}</address>{office.phone && <a href={phoneHref(office.phone) || undefined}>{office.phone}</a>}{office.email && <p><a href={`mailto:${office.email}`}>{office.email}</a></p>}</div>) : <>
        {block.email?.address && (
          <div>
            {block.email.label && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {block.email.label}
              </p>
            )}
            <a
              href={`mailto:${block.email.address}`}
              className="break-all text-sm text-slate-700 underline-offset-4 hover:underline dark:text-slate-200"
            >
              {block.email.address}
            </a>
          </div>
        )}
        {block.phones?.map((phone) => {
          const href = phoneHref(phone.number)
          return (
            <div key={phone._key}>
              {phone.label && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {phone.label}
                </p>
              )}
              {href ? (
                <a
                  href={href}
                  className="text-sm text-slate-700 underline-offset-4 hover:underline dark:text-slate-200"
                >
                  {phone.number}
                </a>
              ) : (
                <span className="text-sm text-slate-700 dark:text-slate-200">{phone.number}</span>
              )}
            </div>
          )
        })}
        {block.addresses?.map((item) => (
          <div key={item._key}>
            {item.label && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
            )}
            <address className="whitespace-pre-line text-sm not-italic leading-6 text-slate-700 dark:text-slate-200">
              {item.address}
            </address>
          </div>
        ))}
        </>}
      </div>
    </section>
  )
}
