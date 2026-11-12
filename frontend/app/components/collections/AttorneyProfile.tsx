import Link from 'next/link'
import type {ReactNode} from 'react'
import type {PortableTextBlock} from 'next-sanity'
import SanityImage from '@/app/components/SanityImage'
import CustomPortableText from '@/app/components/PortableText'
import ResolvedLink from '@/app/components/ResolvedLink'
import {collectionPath} from '@/lib/collection-routing'
import {postPath} from '@/lib/blog-routing'
import {absoluteUrl, type Locale} from '@/lib/i18n'
import type {DereferencedLink} from '@/sanity/lib/types'
import type {AttorneyQueryResult} from '@/sanity.types'

type Person = NonNullable<AttorneyQueryResult>

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

function ProfileSection({id, title, children}: {id: string; title: string; children: ReactNode}) {
  return (
    <section id={id} className="attorney-section" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      <span className="about-accent" aria-hidden="true" />
      {children}
    </section>
  )
}

function externalResourceUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

export default function AttorneyProfile({
  person,
  locale,
  slug,
  bookingAction,
}: {
  person: Person
  locale: Locale
  slug: string
  bookingAction?: DereferencedLink | null
}) {
  const es = locale === 'es'
  const t = es
    ? {
        position: 'Puesto',
        overview: 'Descripción general',
        memberships: 'Membresías y participación',
        insights: 'Recursos y perspectivas',
        speaking: 'Conferencias',
        blog: 'Artículos del blog',
        news: 'Noticias del bufete',
        offices: 'Oficinas',
        consultation: 'Programar una consulta',
        experience: 'Experiencia',
        address: 'Dirección',
        phone: 'Teléfono',
        email: 'Correo',
        certificates: 'Certificados',
        personal: 'Experiencia personal',
        education: 'Educación',
        admissions: 'Admisiones',
        skills: 'Habilidades',
        achievements: 'Logros',
        practices: 'Servicios y áreas de práctica',
        contact: 'Contacto',
        languages: 'Idiomas',
        home: 'Inicio',
        attorneys: 'Abogados',
        navigation: 'En este perfil',
      }
    : {
        position: 'Position',
        overview: 'Overview',
        memberships: 'Membership & Involvement',
        insights: 'Resources & Insights',
        speaking: 'Speaking Engagements',
        blog: 'Blog Posts',
        news: 'Firm News',
        offices: 'Offices',
        consultation: 'Schedule a Consultation',
        experience: 'Experience',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        certificates: 'Certificates',
        personal: 'Personal Experience',
        education: 'Education',
        admissions: 'Admissions',
        skills: 'Skills',
        achievements: 'Achievements',
        practices: 'Services / Practice Areas',
        contact: 'Contact',
        languages: 'Languages',
        home: 'Home',
        attorneys: 'Attorneys',
        navigation: 'In this profile',
      }

  const practiceAreas = person.practiceAreas?.filter((area) => area?.slug && area?.title) ?? []
  const offices = person.offices?.filter((office) => office?.slug && office?.name) ?? []
  const socialLinks = person.socialLinks?.filter((item) => item.url && item.label) ?? []
  const education = person.educationDetails?.filter((item) => item.institution || item.degree) ?? []
  const admissions = person.admissions?.filter((item) => item.jurisdiction || item.bar) ?? []
  const memberships = person.professionalMemberships?.filter((item) => item.trim()) ?? []
  const resources = (person.insights ?? []).flatMap((item) => {
    // A missing, unpublished or wrong-language reference must never fall back to an external URL.
    const href = item.hasPost
      ? item.post?.slug
        ? postPath(locale, item.post.slug)
        : null
      : externalResourceUrl(item.url)
    const title = item.hasPost ? item.post?.title : item.title
    return href && title
      ? [{...item, href, title, date: item.date || item.post?.publishedAt?.slice(0, 10)}]
      : []
  })
  const resourceGroups = (['speaking', 'blog', 'news'] as const)
    .map((category) => ({
      category,
      title: t[category],
      items: resources.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length)
  const sections = [
    {id: 'overview', title: t.overview, visible: person.biography?.length},
    {id: 'memberships', title: t.memberships, visible: memberships.length},
    {id: 'insights', title: t.insights, visible: resourceGroups.length},
    {id: 'services', title: t.practices, visible: practiceAreas.length},
    {id: 'education', title: t.education, visible: education.length || person.education?.length},
    {
      id: 'admissions',
      title: t.admissions,
      visible: admissions.length || person.barAdmissions?.length,
    },
  ].filter((section) => section.visible)
  const action =
    person.consultationLink?.linkType === 'calendly'
      ? person.consultationLink
      : bookingAction?.linkType === 'calendly'
        ? bookingAction
        : {_type: 'link' as const, linkType: 'calendly' as const}

  return (
    <main className="attorney-single attorney-profile">
      <header className="about-hero">
        <div className="container about-hero-inner">
          <p className="site-eyebrow">OC Law Group</p>
          <h1>{person.fullName}</h1>
          <nav aria-label="Breadcrumb" className="about-breadcrumb">
            <Link href={es ? '/es/' : '/'}>{t.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={collectionPath('attorney', locale)}>{t.attorneys}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{person.fullName}</span>
          </nav>
        </div>
      </header>
      <section className="attorney-profile-header" aria-label={person.fullName || t.attorneys}>
        <div className="container">
          <div className="attorney-header-grid attorney-profile-card">
            <div className="attorney-profile-photo">
              {person.profileImage?.asset?._ref ? (
                <SanityImage
                  id={person.profileImage.asset._ref}
                  alt={person.profileImage.alt || person.fullName || ''}
                  width={800}
                  mode="cover"
                />
              ) : (
                <span className="attorney-profile-photo-empty" aria-hidden="true" />
              )}
            </div>
            <div className="attorney-header-copy">
              <h2>{person.fullName}</h2>
              <dl className="attorney-header-contact">
                {person.professionalTitle && (
                  <div>
                    <dt>{t.position}</dt>
                    <dd>{person.professionalTitle}</dd>
                  </div>
                )}
                {person.yearsOfExperience && (
                  <div>
                    <dt>{t.experience}</dt>
                    <dd>{person.yearsOfExperience}</dd>
                  </div>
                )}
                {person.practiceAddress && (
                  <div>
                    <dt>{t.address}</dt>
                    <dd>{person.practiceAddress}</dd>
                  </div>
                )}
                {person.phone && (
                  <div>
                    <dt>{t.phone}</dt>
                    <dd>
                      <a href={`tel:${person.phone.replace(/[^\d+]/g, '')}`}>{person.phone}</a>
                    </dd>
                  </div>
                )}
                {person.email && (
                  <div>
                    <dt>{t.email}</dt>
                    <dd>
                      <a href={`mailto:${person.email}`}>{person.email}</a>
                    </dd>
                  </div>
                )}
              </dl>
              <div className="attorney-profile-introduction">
                {person.shortBiography && (
                  <p className="attorney-header-summary">{person.shortBiography}</p>
                )}
                <ResolvedLink
                  link={action as DereferencedLink}
                  locale={locale}
                  className="site-button-outline attorney-consultation"
                >
                  {t.consultation}
                </ResolvedLink>
                {offices.length > 0 && (
                  <div className="attorney-profile-offices">
                    <h3>{t.offices}</h3>
                    <ul>
                      {offices.map((office) => (
                        <li key={office._id}>
                          <Link href={collectionPath('office', locale, office.slug)}>
                            {office.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container attorney-profile-layout">
        {sections.length > 0 && (
          <nav className="attorney-section-nav" aria-label={t.navigation}>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
          </nav>
        )}
        <div className="attorney-profile-body">
          {person.biography?.length ? (
            <ProfileSection id="overview" title={t.overview}>
              <CustomPortableText value={person.biography as PortableTextBlock[]} />
            </ProfileSection>
          ) : null}
          {memberships.length > 0 && (
            <ProfileSection id="memberships" title={t.memberships}>
              <MarkerList items={memberships} />
            </ProfileSection>
          )}
          {resourceGroups.length > 0 && (
            <ProfileSection id="insights" title={t.insights}>
              {resourceGroups.map((group) => (
                <div key={group.category} className="attorney-insight-group">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item._key}>
                        {item.hasPost ? (
                          <Link href={item.href}>{item.title}</Link>
                        ) : (
                          <a href={item.href} target="_blank" rel="noopener noreferrer">
                            {item.title}
                          </a>
                        )}
                        {item.date && (
                          <time dateTime={item.date}>
                            {new Intl.DateTimeFormat(es ? 'es' : 'en', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              timeZone: 'UTC',
                            }).format(new Date(`${item.date}T12:00:00Z`))}
                          </time>
                        )}
                        {item.description && <p>{item.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </ProfileSection>
          )}
          {practiceAreas.length > 0 && (
            <ProfileSection id="services" title={t.practices}>
              <ul className="attorney-service-list">
                {practiceAreas.map((area) => (
                  <li key={area._id}>
                    <Link href={collectionPath('practiceArea', locale, area.slug)}>
                      {area.title}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ProfileSection>
          )}
          {(education.length > 0 || Boolean(person.education?.length)) && (
            <ProfileSection id="education" title={t.education}>
              {education.length > 0 && (
                <ul className="attorney-credential-list">
                  {education.map((item) => (
                    <li key={item._key}>
                      <h3>{item.institution}</h3>
                      <p>{[item.degree, item.graduationYear].filter(Boolean).join(', ')}</p>
                      {item.description && <p>{item.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <MarkerList items={person.education} />
            </ProfileSection>
          )}
          {(admissions.length > 0 || Boolean(person.barAdmissions?.length)) && (
            <ProfileSection id="admissions" title={t.admissions}>
              {admissions.length > 0 && (
                <ul className="attorney-credential-list">
                  {admissions.map((item) => (
                    <li key={item._key}>
                      <h3>{item.jurisdiction}</h3>
                      {(item.bar || item.year) && (
                        <p>{[item.bar, item.year].filter(Boolean).join(', ')}</p>
                      )}
                      {item.description && <p>{item.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <MarkerList items={person.barAdmissions} />
            </ProfileSection>
          )}
          {person.experience?.length ? (
            <ProfileSection id="experience" title={t.personal}>
              <CustomPortableText value={person.experience as PortableTextBlock[]} />
            </ProfileSection>
          ) : null}
          {person.skills?.length ? (
            <ProfileSection id="skills" title={t.skills}>
              <ul className="attorney-skill-list">
                {person.skills.map((skill, index) => {
                  const level = Math.max(0, Math.min(100, skill.level ?? 0))
                  return (
                    <li key={`${skill.label}-${index}`}>
                      <div className="attorney-skill-head">
                        <span>{skill.label}</span>
                        <span>{level}%</span>
                      </div>
                      <div
                        className="attorney-skill-bar"
                        role="progressbar"
                        aria-valuenow={level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={skill.label || undefined}
                      >
                        <span style={{width: `${level}%`}} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </ProfileSection>
          ) : null}
          {person.achievements?.length ? (
            <ProfileSection id="achievements" title={t.achievements}>
              <MarkerList items={person.achievements} />
            </ProfileSection>
          ) : null}
          {person.certificates?.some((cert) => cert.asset?._ref) && (
            <ProfileSection id="certificates" title={t.certificates}>
              <div className="attorney-certificates">
                <ul>
                  {person.certificates
                    .filter((cert) => cert.asset?._ref)
                    .map((cert) => (
                      <li key={cert._key}>
                        <SanityImage id={cert.asset!._ref!} alt={cert.alt || ''} width={300} />
                      </li>
                    ))}
                </ul>
              </div>
            </ProfileSection>
          )}
          {person.languagesSpoken?.length ? (
            <ProfileSection id="languages" title={t.languages}>
              <MarkerList items={person.languagesSpoken} />
            </ProfileSection>
          ) : null}
          {socialLinks.length > 0 && (
            <ProfileSection id="contact" title={t.contact}>
              <ul className="attorney-profile-social">
                {socialLinks.map((item) => (
                  <li key={item._key}>
                    <a href={item.url!} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </ProfileSection>
          )}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            'name': person.fullName,
            'jobTitle': person.professionalTitle || undefined,
            'email': person.email || undefined,
            'telephone': person.phone || undefined,
            'url': absoluteUrl(collectionPath('attorney', locale, slug)),
          }).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  )
}
