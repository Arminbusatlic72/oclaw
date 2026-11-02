import type {Metadata} from 'next'
import {Clock3, Mail, MapPin, Phone} from 'lucide-react'

import ContactFormClient from '@/app/components/blocks/ContactFormClient'
import LocationMap from '@/app/components/blocks/LocationMap'
import PageHero from '@/app/components/blocks/PageHero'
import type {Locale} from '@/lib/i18n'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'
import {sanityFetch} from '@/sanity/lib/live'
import {officeListQuery} from '@/sanity/lib/queries'

const copy = {
  en: {
    title: 'Contact us for help with your legal issues',
    description: 'Contact OC Law Group for help with your legal matter or to request an appointment.',
    introduction: 'We help solve your legal issues',
    email: 'Email',
    phone: 'Phone',
    hours: 'Working hours',
    weekdays: 'Monday to Friday: 9:00 a.m. to 5:00 p.m.',
    saturday: 'Saturday: 10:00 a.m. to 1:00 p.m. (emergency calls only)',
    sunday: 'Sunday: Closed',
    fallbackDescription: 'Online appointment requests will be available when offices are published. In the meantime, contact us by phone or email.',
    formHeading: 'Request an appointment',
    formDescription: 'Share your details and our team will contact you to discuss your case.',
    success: 'Thank you. We received your request and will be in touch.',
    error: 'We could not send your request. Please try again.',
    submit: 'SUBMIT',
    privacy: 'Privacy Policy',
    ariaLabel: 'Contact information',
    fallbackPhones: ['Chicago', 'New York', 'Miami'],
  },
  es: {
    title: 'Contáctenos para obtener ayuda con sus problemas legales',
    description: 'Comuníquese con OC Law Group para recibir ayuda con sus asuntos legales o solicitar una cita.',
    introduction: 'Ayudamos a resolver sus problemas legales',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    hours: 'Horario de atención',
    weekdays: 'Lunes a viernes: 9:00 a. m. a 5:00 p. m.',
    saturday: 'Sábado: 10:00 a. m. a 1:00 p. m. (solo llamadas de emergencia)',
    sunday: 'Domingo: cerrado',
    fallbackDescription: 'El formulario de citas estará disponible cuando se publiquen las oficinas. Mientras tanto, puede comunicarse con nosotros por teléfono o correo electrónico.',
    formHeading: 'Solicite una cita',
    formDescription: 'Comparta sus datos y nuestro equipo se comunicará con usted para conversar sobre su caso.',
    success: 'Gracias. Recibimos su solicitud y nos comunicaremos con usted.',
    error: 'No se pudo enviar su solicitud. Inténtelo de nuevo.',
    submit: 'ENVIAR',
    privacy: 'Política de Privacidad',
    ariaLabel: 'Información de contacto',
    fallbackPhones: ['Chicago', 'Nueva York', 'Miami'],
  },
} as const

const phoneNumbers = ['+1 847 258 9954', '+1 347 305 7600', '+1 786 383 0297']

export function contactFallbackMetadata(locale: Locale): Metadata {
  const spanish = locale === 'es'
  const pagePath = spanish ? '/es/contacto/' : '/contact/'
  return {
    title: spanish ? 'Contacto' : 'Contact Us',
    description: copy[locale].description,
    alternates: {
      canonical: pagePath,
      languages: {en: '/contact/', es: '/es/contacto/'},
    },
  }
}

function addressLines(office: {
  streetAddress?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
}) {
  const locality = [office.city, office.state, office.postalCode].filter(Boolean).join(', ')
  return [office.streetAddress, office.addressLine2, locality, office.country].filter(Boolean)
}

function displayOfficeName(name: string, locale: Locale) {
  return locale === 'es' && name === 'New York' ? 'Nueva York' : name
}

export default async function ContactPageFallback({locale}: {locale: Locale}) {
  const t = copy[locale]
  const {data: localizedOffices} = await sanityFetch({query: officeListQuery, params: {language: locale}, perspective: 'published', stega: false})
  let offices = localizedOffices
  if (locale === 'es' && !offices.length) {
    offices = (await sanityFetch({query: officeListQuery, params: {language: 'en'}, perspective: 'published', stega: false})).data
  }
  const uploadsEnabled = process.env.CONTACT_FORM_UPLOADS_ENABLED === 'true' && Boolean(process.env.CONTACT_FORM_WEBHOOK_URL && process.env.CONTACT_FORM_WEBHOOK_TOKEN)
  const formBlock: ExtractPageBuilderType<'contactForm'> = {
    _type: 'contactForm',
    _key: `${locale}-contact-fallback`,
    heading: t.formHeading,
    description: offices.length ? t.formDescription : t.fallbackDescription,
    formMode: 'appointmentRequest',
    submitButtonLabel: t.submit,
    successMessage: t.success,
    errorMessage: t.error,
    privacyPolicyLink: {_type: 'link', linkType: 'href', href: '/privacy-policy/', page: null},
  }
  const mapBlock: ExtractPageBuilderType<'locationMap'> = {
    _type: 'locationMap',
    _key: `${locale}-contact-offices`,
    heading: locale === 'es' ? 'Nuestras oficinas' : 'Our offices',
    offices: offices.map((office) => ({
      _id: office._id,
      name: displayOfficeName(office.name, locale),
      language: locale,
      streetAddress: office.streetAddress,
      addressLine2: office.addressLine2,
      city: office.city,
      state: office.state,
      postalCode: office.postalCode,
      country: office.country,
      phone: office.phone,
      mapUrl: office.mapUrl,
      coordinates: null,
      attorneys: office.attorneys,
    })),
  }

  return <>
    <PageHero block={{_key: `${locale}-contact-hero`, _type: 'pageHero', eyebrow: 'OC Law Group', heading: t.title, showBreadcrumb: true}} locale={locale} />
    <section className="contact-cards-section" aria-label={t.ariaLabel}>
      <div className="container">
        <h2 className="contact-section-heading">{t.introduction}</h2>
        <div className="contact-cards-grid">
          <article className="contact-info-card" data-index="01">
            <span className="contact-card-icon" aria-hidden="true"><Mail size={34} strokeWidth={1.8} /></span>
            <h3>{t.email}</h3>
            <div className="contact-card-lines"><a href="mailto:info@oclaw.us">info@oclaw.us</a></div>
          </article>
          <article className="contact-info-card" data-index="02">
            <span className="contact-card-icon" aria-hidden="true"><Phone size={34} strokeWidth={1.8} /></span>
            <h3>{t.phone}</h3>
            <div className="contact-card-lines">
              {offices.filter((office) => office.phone).map((office) => <p key={office._id}>{displayOfficeName(office.name, locale)}: <a href={`tel:${office.phone!.replace(/[^\d+]/g, '')}`}>{office.phone}</a></p>)}
              {!offices.some((office) => office.phone) && phoneNumbers.map((phone, index) => <p key={phone}>{t.fallbackPhones[index]}: <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a></p>)}
            </div>
          </article>
          <article className="contact-info-card" data-index="03">
            <span className="contact-card-icon" aria-hidden="true"><Clock3 size={34} strokeWidth={1.8} /></span>
            <h3>{t.hours}</h3>
            <div className="contact-card-lines"><p>{t.weekdays}</p><p>{t.saturday}</p><p>{t.sunday}</p></div>
          </article>
          {locale === 'en' && offices.map((office, index) => <article className="contact-info-card" data-index={String(index + 4).padStart(2, '0')} key={office._id}>
            <span className="contact-card-icon" aria-hidden="true"><MapPin size={34} strokeWidth={1.8} /></span>
            <h3>{displayOfficeName(office.name, locale)}</h3>
            <div className="contact-card-lines">
              <address>{addressLines(office).map((line) => <span key={line}>{line}<br /></span>)}</address>
              {office.phone && <a href={`tel:${office.phone.replace(/[^\d+]/g, '')}`}>{office.phone}</a>}
            </div>
          </article>)}
        </div>
      </div>
    </section>
    <LocationMap block={mapBlock} locale={locale} />
    <ContactFormClient
      block={formBlock}
      locale={locale}
      offices={offices.map((office) => ({id: office._id, label: displayOfficeName(office.name, locale)}))}
      privacyPolicyHref="/privacy-policy/"
      uploadsEnabled={uploadsEnabled}
    />
  </>
}