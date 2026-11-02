import Link from 'next/link'
import {Download, FileText} from 'lucide-react'

import {breadcrumbs} from '@/lib/collections'
import type {Locale} from '@/lib/i18n'

const resourceFiles = [
  {id: 'form-i-485', form: 'I-485', href: '/resources/i485.pdf'},
  {id: 'form-i-360', form: 'I-360', href: '/resources/i360.pdf'},
  {id: 'form-i-589', form: 'I-589', href: '/resources/i589.pdf'},
  {
    id: 'form-i-130',
    form: 'I-130',
    href: '/resources/i130-in-removal-proceedings.pdf',
  },
] as const

const copy = {
  en: {
    home: 'Home',
    title: 'Resources',
    path: '/resources/',
    eyebrow: 'Free immigration guides',
    introduction:
      "At OC Law Group, we understand that navigating the intricacies of immigration law can be daunting. That's why we're dedicated to providing you with the tools and resources you need to navigate the legal landscape with confidence. Our Resources page is your go-to destination for free guides and valuable resources designed to empower you in your immigration journey.",
    download: 'Download',
    downloadsHeading: 'After-filing guides',
    resourceTitle: 'Next steps and important information',
    details: [
      'Marriage-based cases',
      'VAWA self-petition',
      'Application for Asylum and for Withholding of Removal',
      'If the beneficiary is in removal proceedings',
    ],
    downloadPdf: 'Download PDF',
    closingHeading: 'Move forward with confidence',
    closing:
      'Empower yourself with the knowledge and resources you need to navigate the complexities of immigration law confidently. Explore our collection of free guides and resources, and take the first step towards achieving your immigration goals with OC Law Group by your side.',
    disclaimerLabel: 'Disclaimer',
    disclaimer:
      'The information provided on this page is for educational purposes only and should not be construed as legal advice. For personalized guidance on your specific legal matters, please consult with a qualified immigration attorney.',
    downloadsNav: 'Resource downloads',
    guidanceEyebrow: 'Need legal guidance?',
    guidanceHeading: 'Get advice about your case',
    guidanceCopy: 'Speak with our immigration law team about your next step.',
    appointment: 'Request an appointment',
    contactPath: '/contact/',
    legalDisclaimer: 'Legal disclaimer',
  },
  es: {
    home: 'Inicio',
    title: 'Recursos',
    path: '/es/recursos/',
    eyebrow: 'Guías gratuitas de inmigración',
    introduction:
      'En OC Law Group, entendemos que navegar por las complejidades de la ley de inmigración puede ser desalentador. Es por eso que nos dedicamos a brindarle las herramientas y recursos que necesita para navegar con confianza en el panorama legal. Nuestra página de Recursos es su destino ideal para obtener guías gratuitas y recursos valiosos diseñados para empoderarlo en su viaje de inmigración.',
    download: 'Descargar',
    downloadsHeading: 'Guías para después de presentar su solicitud',
    resourceTitle: 'Próximos pasos e información importante',
    details: [
      'Casos basados en matrimonio',
      'Autopetición VAWA',
      'Solicitud de Asilo y Retención de expulsión',
      'Si el beneficiario está en proceso de deportación',
    ],
    downloadPdf: 'Descargar PDF',
    closingHeading: 'Avance con confianza',
    closing:
      'Obtenga el conocimiento y los recursos que necesita para navegar con confianza por las complejidades de las leyes de inmigración. Explore nuestra colección de guías y recursos gratuitos y dé el primer paso para lograr sus objetivos de inmigración con OC Law Group a su lado.',
    disclaimerLabel: 'Descargo de responsabilidad',
    disclaimer:
      'La información proporcionada en esta página tiene fines educativos únicamente y no debe interpretarse como asesoramiento legal. Para obtener orientación personalizada sobre sus asuntos legales específicos, consulte con un abogado de inmigración calificado.',
    downloadsNav: 'Descargas de recursos',
    guidanceEyebrow: '¿Necesita orientación legal?',
    guidanceHeading: 'Obtenga asesoramiento sobre su caso',
    guidanceCopy: 'Hable con nuestro equipo de inmigración sobre su próximo paso.',
    appointment: 'Solicitar una cita',
    contactPath: '/es/contacto/',
    legalDisclaimer: 'Descargo de responsabilidad legal',
  },
} as const

function JsonLd({value}: {value: object}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(value).replace(/</g, '\\u003c')}}
    />
  )
}

export default function ResourcesPage({locale}: {locale: Locale}) {
  const content = copy[locale]
  const breadcrumbItems = [
    {name: content.home, path: locale === 'es' ? '/es/' : '/'},
    {name: content.title, path: content.path},
  ]

  return (
    <div className="collection-page container resources-page">
      <nav aria-label="Breadcrumb" className="collection-breadcrumbs">
        {breadcrumbItems.map((item, index) => (
          <span key={item.path}>
            {index > 0 && <span aria-hidden="true"> / </span>}
            <Link
              href={item.path}
              aria-current={index === breadcrumbItems.length - 1 ? 'page' : undefined}
            >
              {item.name}
            </Link>
          </span>
        ))}
      </nav>

      <div className="practice-detail">
        <main className="practice-article resources-article">
          <p className="practice-eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="practice-lead">{content.introduction}</p>

          <section className="resources-downloads" aria-labelledby="downloads-heading">
            <div className="resources-section-heading">
              <p className="site-eyebrow">{content.download}</p>
              <h2 id="downloads-heading">{content.downloadsHeading}</h2>
            </div>

            <div className="resources-list">
              {resourceFiles.map((resource, index) => {
                const formLabel = `${locale === 'es' ? 'Formulario' : 'Form'} ${resource.form}`
                return (
                  <article className="resource-card" id={resource.id} key={resource.id}>
                    <div className="resource-card-number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="resource-card-icon" aria-hidden="true">
                      <FileText size={28} strokeWidth={1.5} />
                    </div>
                    <div className="resource-card-copy">
                      <p>{formLabel}</p>
                      <h3>{content.resourceTitle}</h3>
                      <span>{content.details[index]}</span>
                    </div>
                    <a
                      className="resource-download"
                      href={resource.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${content.downloadPdf}: ${formLabel}, ${content.details[index]}`}
                    >
                      <Download size={18} aria-hidden="true" />
                      <span>{content.downloadPdf}</span>
                    </a>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="practice-content-section resources-closing">
            <h2>{content.closingHeading}</h2>
            <p>{content.closing}</p>
          </section>

          <aside className="resources-disclaimer" aria-label={content.legalDisclaimer}>
            <strong>{content.disclaimerLabel}</strong>
            <p>{content.disclaimer}</p>
          </aside>
        </main>

        <aside className="practice-sidebar resources-sidebar">
          <section className="practice-sidebar-panel">
            <h2>{content.title}</h2>
            <nav aria-label={content.downloadsNav}>
              {resourceFiles.map((resource) => (
                <a href={`#${resource.id}`} key={resource.id}>
                  {locale === 'es' ? 'Formulario' : 'Form'} {resource.form}
                </a>
              ))}
            </nav>
          </section>

          <div className="practice-sidebar-callout">
            <p className="site-eyebrow">{content.guidanceEyebrow}</p>
            <h2>{content.guidanceHeading}</h2>
            <p>{content.guidanceCopy}</p>
            <Link className="resources-consultation-link" href={content.contactPath}>
              {content.appointment}
            </Link>
          </div>
        </aside>
      </div>

      <JsonLd value={breadcrumbs(breadcrumbItems)} />
    </div>
  )
}
