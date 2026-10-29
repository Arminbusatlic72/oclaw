import ContactFormClient from './ContactFormClient'
import type {Locale} from '@/lib/i18n'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'
import {sanityFetch} from '@/sanity/lib/live'
import {officeListQuery, practiceAreasQuery} from '@/sanity/lib/queries'

type Block = ExtractPageBuilderType<'contactForm'>

export default async function ContactForm({block, locale}: {block: Block; locale: Locale}) {
  const [{data: practiceAreas}, {data: offices}] = await Promise.all([
    sanityFetch({query: practiceAreasQuery, params: {language: locale}, perspective: 'published', stega: false}),
    sanityFetch({query: officeListQuery, params: {language: locale}, perspective: 'published', stega: false}),
  ])
  const privacy = block.privacyPolicyLink
  const privacyPolicyHref = privacy?.linkType === 'page' && typeof privacy.page === 'string' ? privacy.page : privacy?.href || (locale === 'es' ? '/es/politica-de-privacidad/' : '/privacy-policy/')
  return <ContactFormClient block={block} locale={locale} practiceAreas={practiceAreas.map((area) => ({id: area._id, label: area.title}))} offices={offices.map((office) => ({id: office._id, label: office.name}))} privacyPolicyHref={privacyPolicyHref} />
}
