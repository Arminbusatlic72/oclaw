import ContactFormClient from './ContactFormClient'
import type {Locale} from '@/lib/i18n'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'
import {sanityFetch} from '@/sanity/lib/live'
import {officeListQuery} from '@/sanity/lib/queries'

type Block = ExtractPageBuilderType<'contactForm'>

export default async function ContactForm({block, locale}: {block: Block; locale: Locale}) {
  const {data: offices} = await sanityFetch({query: officeListQuery, params: {language: locale}, perspective: 'published', stega: false})
  const uploadsEnabled = process.env.CONTACT_FORM_UPLOADS_ENABLED === 'true' && Boolean(process.env.CONTACT_FORM_WEBHOOK_URL && process.env.CONTACT_FORM_WEBHOOK_TOKEN)
  const privacy = block.privacyPolicyLink
  const privacyPolicyHref = privacy?.linkType === 'page' && typeof privacy.page === 'string' ? privacy.page : privacy?.href || (locale === 'es' ? '/es/politica-de-privacidad/' : '/privacy-policy/')
  return <ContactFormClient block={block} locale={locale} offices={offices.map((office) => ({id: office._id, label: office.name}))} privacyPolicyHref={privacyPolicyHref} uploadsEnabled={uploadsEnabled} />
}
