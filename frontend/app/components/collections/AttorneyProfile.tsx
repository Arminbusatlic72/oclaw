import Link from 'next/link'
import type {PortableTextBlock} from 'next-sanity'
import SanityImage from '@/app/components/SanityImage'
import CustomPortableText from '@/app/components/PortableText'
import {collectionPath} from '@/lib/collection-routing'
import {absoluteUrl, type Locale} from '@/lib/i18n'
import type {AttorneyQueryResult} from '@/sanity.types'

type Person = NonNullable<AttorneyQueryResult>

/** Marker list used for Education / Achievements (the "»" rows in the design). */
function MarkerList({items}: {items?: string[] | null}) {
  if (!items?.length) return null
  return (
    <ul className="attorney-marker-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <span aria-hidden="true">»</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

function Fact({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="attorney-fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function AttorneyProfile({person, locale, slug}: {person: Person; locale: Locale; slug: string}) {
  const es = locale === 'es'
  const t = es
    ? {position: 'Puesto', experience: 'Experiencia', address: 'Dirección', phone: 'Teléfono', email: 'Correo', certificates: 'Certificados', personal: 'Experiencia personal', education: 'Educación', skills: 'Habilidades', achievements: 'Logros', practices: 'Áreas de práctica', contact: 'Contacto', home: 'Inicio', attorneys: 'Abogados'}
    : {position: 'Position', experience: 'Experience', address: 'Address', phone: 'Phone', email: 'Email', certificates: 'Certificates', personal: 'Personal Experience', education: 'Education', skills: 'Skills', achievements: 'Achievements', practices: 'Practice Areas', contact: 'Contact', home: 'Home', attorneys: 'Attorneys'}

  const homePath = es ? '/es/' : '/'
  const archivePath = collectionPath('attorney', locale)
  const facts: Array<{label: string; value: React.ReactNode}> = []
  if (person.professionalTitle) facts.push({label: `${t.position}:`, value: person.professionalTitle})
  if (person.yearsOfExperience) facts.push({label: `${t.experience}:`, value: person.yearsOfExperience})
  if (person.practiceAddress) facts.push({label: `${t.address}:`, value: person.practiceAddress})
  if (person.phone) facts.push({label: `${t.phone}:`, value: <a href={`tel:${person.phone.replace(/[^\d+]/g, '')}`}>{person.phone}</a>})
  if (person.email) facts.push({label: `${t.email}:`, value: <a href={`mailto:${person.email}`}>{person.email}</a>})

  const experienceBody = person.experience?.length
    ? person.experience
    : person.biography?.length
      ? person.biography
      : null
  const hasExperience = Boolean(experienceBody?.length || person.shortBiography)
  const hasEducation = Boolean(person.education?.length)
  const hasSkills = Boolean(person.skills?.length)
  const hasAchievements = Boolean(person.achievements?.length)
  const socialLinks = person.socialLinks?.filter((item) => item.url && item.label) ?? []
  const practiceAreas = person.practiceAreas?.filter((area) => area?.slug && area?.title) ?? []

  return (
    <div className="attorney-single">
      <header className="attorney-hero">
        <div className="container attorney-hero-inner">
          <h1>{person.fullName}</h1>
          <nav aria-label="Breadcrumb" className="attorney-hero-breadcrumb">
            <Link href={homePath}>{t.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={archivePath}>{t.attorneys}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{person.fullName}</span>
          </nav>
        </div>
      </header>

      <section className="attorney-intro">
        <div className="container">
          <div className="attorney-profile-card">
            <div className="attorney-profile-photo">
              {person.profileImage?.asset?._ref ? (
                <SanityImage id={person.profileImage.asset._ref} alt={person.profileImage.alt || person.fullName || ''} width={640} mode="cover" />
              ) : (
                <span className="attorney-profile-photo-empty" aria-hidden="true" />
              )}
            </div>
            <div className="attorney-profile-info">
              <h2>{person.fullName}</h2>
              {facts.length > 0 && (
                <dl className="attorney-facts">
                  {facts.map((fact) => (
                    <Fact key={fact.label} label={fact.label}>{fact.value}</Fact>
                  ))}
                </dl>
              )}
              {person.certificates?.some((cert) => cert.asset?._ref) && (
                <div className="attorney-certificates">
                  <h3>{t.certificates}</h3>
                  <ul>
                    {person.certificates.filter((cert) => cert.asset?._ref).map((cert) => (
                      <li key={cert._key}>
                        <SanityImage id={cert.asset!._ref!} alt={cert.alt || ''} width={300} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {(hasExperience || hasEducation) && (
        <section className="attorney-columns">
          <div className="container attorney-columns-grid">
            {hasExperience && (
              <div className="attorney-col">
                <h2>{t.personal}</h2>
                {experienceBody?.length ? (
                  <CustomPortableText value={experienceBody as PortableTextBlock[]} />
                ) : (
                  <p>{person.shortBiography}</p>
                )}
              </div>
            )}
            {hasEducation && (
              <div className="attorney-col">
                <h2>{t.education}</h2>
                <MarkerList items={person.education} />
              </div>
            )}
          </div>
        </section>
      )}

      {(hasSkills || hasAchievements) && (
        <section className="attorney-columns attorney-columns-alt">
          <div className="container attorney-columns-grid">
            {hasSkills && (
              <div className="attorney-col">
                <h2>{t.skills}</h2>
                <ul className="attorney-skill-list">
                  {person.skills!.map((skill) => {
                    const level = Math.max(0, Math.min(100, skill.level ?? 0))
                    return (
                      <li key={skill.label}>
                        <div className="attorney-skill-head">
                          <span>{skill.label}</span>
                          <span>{level}%</span>
                        </div>
                        <div className="attorney-skill-bar" role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={100} aria-label={skill.label}>
                          <span style={{width: `${level}%`}} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {hasAchievements && (
              <div className="attorney-col">
                <h2>{t.achievements}</h2>
                <MarkerList items={person.achievements} />
              </div>
            )}
          </div>
        </section>
      )}

      {(practiceAreas.length > 0 || socialLinks.length > 0) && (
        <section className="attorney-footer-band">
          <div className="container attorney-footer-band-inner">
            {practiceAreas.length > 0 ? (
              <div className="attorney-practices">
                <h2>{t.practices}</h2>
                <ul className="attorney-chip-list">
                  {practiceAreas.map((area) => (
                    <li key={area._id}>
                      <Link href={collectionPath('practiceArea', locale, area.slug)}>{area.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {socialLinks.length > 0 ? (
              <div className="attorney-social">
                <h2>{t.contact}</h2>
                <ul className="attorney-chip-list">
                  {socialLinks.map((item) => (
                    <li key={item._key}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({'@context': 'https://schema.org', '@type': 'Person', name: person.fullName, jobTitle: person.professionalTitle || undefined, email: person.email || undefined, telephone: person.phone || undefined, url: absoluteUrl(collectionPath('attorney', locale, slug))}).replace(/</g, '\\u003c')}} />
    </div>
  )
}
