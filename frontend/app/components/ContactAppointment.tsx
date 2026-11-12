import {ArrowUpRight, CalendarDays} from 'lucide-react'

import ResolvedLink from '@/app/components/ResolvedLink'
import {approvedCalendlyUrl, calendlyOptionsFromAction} from '@/lib/calendly'
import {navigationId, type Locale} from '@/lib/i18n'
import {sanityFetch} from '@/sanity/lib/live'
import {navigationQuery} from '@/sanity/lib/queries'

export default async function ContactAppointment({locale, requestFormId}: {locale: Locale; requestFormId?: string}) {
  const {data: navigation} = await sanityFetch({
    query: navigationQuery,
    params: {id: navigationId(locale)},
    perspective: 'published',
    stega: false,
  })
  const defaultEventUrl = approvedCalendlyUrl(process.env.CONTACT_CALENDLY_EVENT_URL)
  const link = navigation?.ctaLink?.linkType === 'calendly'
    ? navigation.ctaLink
    : defaultEventUrl ? {_type: 'link' as const, linkType: 'calendly' as const, calendlyEventUrl: defaultEventUrl} : null
  const canBook = link?.linkType === 'calendly' && calendlyOptionsFromAction(link, locale).length > 0
  const spanish = locale === 'es'
  const heading = spanish ? 'Reserve una cita' : 'Book an appointment'
  const label = canBook ? heading : spanish ? 'Solicite una cita' : 'Request an appointment'
  const content = <>
    <CalendarDays aria-hidden="true" focusable="false" />
    <span className="site-button-prominent-label">{label}</span>
    <ArrowUpRight aria-hidden="true" focusable="false" />
  </>
  const className = 'site-button-outline site-button-prominent'

  // Do not invent a booking URL or treat a form request as a confirmed booking.
  if (!canBook && !requestFormId) return null

  return <section className="contact-appointment">
    <div className="container">
      <h2>{heading}</h2>
      <p>{canBook
        ? spanish ? 'Elija un horario disponible para hablar con nuestro equipo.' : 'Choose an available time to speak with our team.'
        : spanish ? 'Envíe el formulario y nuestro equipo se comunicará con usted para confirmar la disponibilidad.' : 'Send us your details using the form below. Our team will contact you to confirm availability.'}</p>
      {canBook && link
        ? <ResolvedLink link={link} locale={locale} className={className}>{content}</ResolvedLink>
        : <a href={`#${requestFormId}`} className={className}>{content}</a>}
    </div>
  </section>
}
