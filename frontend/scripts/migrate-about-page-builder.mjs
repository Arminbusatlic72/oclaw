import {createReadStream} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'

const ENGLISH_ID = 'b6c94469-f8ea-405c-b0b1-c7b9cacbd5a2'
const SPANISH_ID = '9765a4db-9c9d-4150-bcdc-37add9a35ec9'
const IMAGE_PATH = fileURLToPath(new URL('../public/about/oc-law-about.webp', import.meta.url))
const IMAGE_FILENAME = 'oc-law-about.webp'
const args = process.argv.slice(2)
const apply = args.includes('--apply')
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-25'

if (!projectId || !dataset) throw new Error('Sanity project ID and dataset are required')
if (apply && (!process.env.SANITY_API_WRITE_TOKEN ||
  !args.includes(`--confirm-project=${projectId}`) ||
  !args.includes(`--confirm-dataset=${dataset}`))) {
  throw new Error('Apply requires the write token and exact project and dataset confirmations')
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'raw',
  token: apply ? process.env.SANITY_API_WRITE_TOKEN : process.env.SANITY_API_READ_TOKEN,
})

const block = (key, text) => ({
  _key: key,
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{_key: `${key}-span`, _type: 'span', marks: [], text}],
})

const content = {
  en: {
    heading: 'About Us',
    subheading: 'OC Law Group',
    seoTitle: 'About Us - OC Law Group',
    introduction: 'We focus our practice on immigration and nationality law and we have the expertise you can trust to help you achieve your goals. We understand how intimidating this process can be and we are here to help you. We promise to provide excellent service partnered with clear and prompt communication regarding your case. We are a team working together to help you realize the results you deserve.',
    membershipsHeading: 'Associations & Memberships',
    memberships: 'Our attorney Theresia Ortiz is a member of the Illinois Bar Association and California Bar Association, while attorney Filip Chichevaliev is a member of the Missouri Bar Association and Macedonian Bar Association.',
    attorneysHeading: 'Immigration Attorneys',
    contactHeading: 'We help solve your legal issues',
    contactLabel: 'Request an Appointment',
    contactPath: 'https://www.oclaw.us/contact/',
    imageAlt: 'Two OC Law Group colleagues reviewing a document',
  },
  es: {
    heading: 'Sobre nosotros',
    subheading: 'OC Law Group',
    seoTitle: 'Sobre nosotros - OC Law Group',
    introduction: 'Enfocamos nuestra práctica en leyes de inmigración y nacionalidad y tenemos la experiencia en la que puede confiar para ayudarlo a lograr sus objetivos. Entendemos lo intimidante que puede ser este proceso y estamos aquí para ayudarlo. Prometemos brindar un excelente servicio junto con una comunicación clara y rápida sobre su caso. Somos un equipo que trabaja en conjunto para ayudarlo a obtener los resultados que se merece.',
    membershipsHeading: 'Asociaciones y Membresías',
    memberships: 'Nuestra abogada Theresia Ortiz es miembro del Colegio de Abogados de Illinois y del Colegio de Abogados de California, mientras que el abogado Filip Chichevaliev es miembro del Colegio de Abogados de Missouri y del Colegio de Abogados de Macedonia.',
    attorneysHeading: 'Abogados de inmigración',
    contactHeading: 'Ayudamos a resolver sus problemas legales',
    contactLabel: 'CONSEGUIR CITA',
    contactPath: 'https://www.oclaw.us/es/contacto/',
    imageAlt: 'Dos colegas de OC Law Group revisando un documento',
  },
}

const pageBuilder = (language, imageId) => {
  const copy = content[language]
  return [
    {_key: `about-hero-${language}`, _type: 'pageHero', eyebrow: 'OC Law Group', heading: copy.heading, showBreadcrumb: true},
    {_key: `about-intro-${language}`, _type: 'editorialSection', eyebrow: copy.heading, heading: 'OC Law Group', body: [block(`about-intro-body-${language}`, copy.introduction)], image: {_type: 'image', asset: {_type: 'reference', _ref: imageId}, alt: copy.imageAlt}, layout: 'split', imagePosition: 'right', theme: 'white'},
    {_key: `about-memberships-${language}`, _type: 'editorialSection', eyebrow: 'OC Law Group', heading: copy.membershipsHeading, body: [block(`about-memberships-body-${language}`, copy.memberships)], layout: 'contained', theme: 'soft'},
    {_key: `about-attorneys-${language}`, _type: 'attorneysSection', subtitle: 'OC Law Group', heading: copy.attorneysHeading, selectionMode: 'automatic', maximumItems: 8, showSocialLinks: true, theme: 'light'},
    {_key: `about-cta-${language}`, _type: 'ctaBanner', eyebrow: 'OC Law Group', heading: copy.contactHeading, button: {_type: 'button', buttonText: copy.contactLabel, link: {_type: 'link', linkType: 'href', href: copy.contactPath, openInNewTab: false}}},
  ]
}

const ids = [ENGLISH_ID, `drafts.${ENGLISH_ID}`, SPANISH_ID, `drafts.${SPANISH_ID}`]
const [documents, existingAsset] = await Promise.all([
  client.getDocuments(ids),
  client.fetch('*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}', {filename: IMAGE_FILENAME}),
])
const [english, englishDraft, spanish, spanishDraft] = documents
const conflicts = []
if (!english || english.slug?.current !== 'about-us' || english.language !== 'en') conflicts.push('English About page is missing or changed')
if (!spanish || spanish.slug?.current !== 'sobre-nosotros' || spanish.language !== 'es') conflicts.push('Spanish About page is missing or changed')
if (englishDraft || spanishDraft) conflicts.push('An About page has an unpublished draft; merge it before running this migration')

console.log(JSON.stringify({mode: apply ? 'apply' : 'dry-run', projectId, dataset, pageIds: [ENGLISH_ID, SPANISH_ID], existingAssetId: existingAsset?._id || null, conflicts}, null, 2))
if (conflicts.length) process.exitCode = 1
else if (apply) {
  const asset = existingAsset || await client.assets.upload('image', createReadStream(IMAGE_PATH), {filename: IMAGE_FILENAME})
  const transaction = client.transaction()
  for (const [document, language] of [[english, 'en'], [spanish, 'es']]) {
    const copy = content[language]
    transaction.patch(client.patch(document._id).ifRevisionId(document._rev).set({
      heading: copy.heading,
      subheading: copy.subheading,
      pageBuilder: pageBuilder(language, asset._id),
      seo: {...document.seo, _type: 'seo', title: copy.seoTitle, noIndex: false},
    }))
  }
  const result = await transaction.commit()
  console.log(JSON.stringify({applied: true, assetId: asset._id, transactionId: result.transactionId}))
}
