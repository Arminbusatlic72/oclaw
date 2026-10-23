import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings" && _id == $id][0]`)
const footerLinkFields = /* groq */ `link{..., page->{_id, language, "slug": slug.current}}`
export const footerQuery = defineQuery(`
  *[_type == "footer" && _id == $id][0]{
    ...,
    blocks[]{
      ...,
      _type == "footerContact" => {..., offices[]->{_id, name, language, "slug": slug.current, streetAddress, addressLine2, city, state, postalCode, country, phone, email}},
      _type == "footerLinkGroup" => {..., links[]{..., ${footerLinkFields}}}
    },
    bottomLinks[]{..., ${footerLinkFields}},
    links[]{..., ${footerLinkFields}}
  }
`)

export const navigationQuery = defineQuery(`
  *[_type == "navigation" && _id == $id][0]{
    logo{alt, asset->{_id, metadata{dimensions{aspectRatio}}}},
    navItems[]{title, href, externalUrl, isButton,
      link{..., page->{_id,language,"slug":slug.current}},
      children[]{title,href,link{...,page->{_id,language,"slug":slug.current}}}
    },
    ctaLabel, ctaHref, ctaLink{...,page->{_id,language,"slug":slug.current}}
  }
`)

const linkFields = /* groq */ `link{..., page->{_id, language, "slug": slug.current}}`

const pageFields = /* groq */ `
  _id, _type, language, name, slug, heading, subheading, seo,
  "pageBuilder": pageBuilder[]{
    ...,
    _type == "callToAction" => {..., button{..., ${linkFields}}},
    _type == "heroSlider" => {..., slides[]{..., image{..., asset->{_id, metadata{dimensions{width,height}}}}, cta{..., ${linkFields}}, secondaryCta{..., ${linkFields}}}},
    _type == "cardGrid" => {..., cards[]{..., image{..., asset->{_id,url}}, cta{..., ${linkFields}}}},
    _type == "processSteps" => {..., button{..., ${linkFields}}},
    _type == "parallaxFeatures" => {..., features[]{..., image{..., asset->{_id,_ref,url}}, cta{..., ${linkFields}}}},
    _type == "infoSection" => {..., content[]{..., markDefs[]{..., _type == "link" => {page->{_id, language, "slug": slug.current}}}}},
    _type == "whyChooseUs" => {..., image{..., asset->{_id,url}}, highlights[]{...}, ctaLink{..., page->{_id, language, "slug": slug.current}}, body[]{..., markDefs[]{..., _type == "link" => {page->{_id, language, "slug": slug.current}}}}}
  }
`

export const getPageQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug &&
    ($language == "en" && coalesce(language, "en") == "en" || language == $language)][0]{${pageFields}}
`)

export const homePageQuery = defineQuery(`
  *[_type == "settings" && _id == $id][0].homePage->{${pageFields}}
`)

export const homePageIdsQuery = defineQuery(`
  *[_type == "settings" && _id in ["siteSettings", "siteSettings-es"]]{_id, "pageId": homePage._ref}
`)

export const translationQuery = defineQuery(`
  *[_type == "translation.metadata" && references($id)][0]{
    translations[]{language, "page": value->{_id, language, "slug": slug.current, "noIndex": seo.noIndex}}
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" && defined(slug.current) && (coalesce(language, "en") == "en" || language == "es")] {
    _id, language, "slug": slug.current, _updatedAt, seo,
    "translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{language, "page": value->{_id, language, "slug": slug.current}}
  }
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current) &&
    ($language == "en" && coalesce(language, "en") == "en" || language == $language)]{"slug": slug.current}
`)

export const routeCandidatesQuery = defineQuery(`
  *[_type in ["page", "blogPost"] && slug.current == $slug &&
    ($language == "en" && coalesce(language, "en") == "en" || language == $language)]{_id, _type}
`)

const postFields = /* groq */ `_id, _type, title, "slug": slug.current, language, excerpt, featuredImage, author, publishedAt, updatedAt, body[]{..., markDefs[]{..., page->{_id, _type, language, "slug": slug.current}}}, categories, tags, seo,
  relatedPosts[]->{_id, title, "slug": slug.current, language, publishedAt, featuredImage, excerpt}`

export const blogPostQuery = defineQuery(`
  *[_type == "blogPost" && slug.current == $slug && language == $language && defined(publishedAt) && publishedAt <= now()][0]{${postFields}}
`)
export const blogPostByIdQuery = defineQuery(`
  *[_type == "blogPost" && _id == $id && defined(publishedAt) && publishedAt <= now()][0]{_id, title, "slug": slug.current, language, seo}
`)
export const blogArchiveQuery = defineQuery(`*[_type == "blogArchive" && _id == $id][0]`)
export const blogPostsQuery = defineQuery(`
  *[_type == "blogPost" && language == $language && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc, _id asc)[$start...$end]{_id, title, "slug": slug.current, excerpt, featuredImage, publishedAt, language}
`)
export const blogCountQuery = defineQuery(`count(*[_type == "blogPost" && language == $language && defined(slug.current) && defined(publishedAt) && publishedAt <= now()])`)
export const newerBlogPostQuery = defineQuery(`
  *[_type == "blogPost" && language == $language && defined(slug.current) && defined(publishedAt) && publishedAt <= now() && (publishedAt > $date || publishedAt == $date && _id < $id)] | order(publishedAt asc, _id desc)[0]{_id, title, "slug": slug.current}
`)
export const olderBlogPostQuery = defineQuery(`
  *[_type == "blogPost" && language == $language && defined(slug.current) && defined(publishedAt) && publishedAt <= now() && (publishedAt < $date || publishedAt == $date && _id > $id)] | order(publishedAt desc, _id asc)[0]{_id, title, "slug": slug.current}
`)
export const blogTranslationQuery = defineQuery(`
  *[_type == "translation.metadata" && references($id)][0].translations[]{language, "post": value->{_id, _type, language, "slug": slug.current, publishedAt, seo}}
`)
export const blogSitemapQuery = defineQuery(`
  *[_type == "blogPost" && defined(slug.current) && defined(publishedAt) && publishedAt <= now() && language in ["en", "es"]]{
    _id, language, "slug": slug.current, publishedAt, updatedAt, _updatedAt, seo,
    "translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{language, "post": value->{_id, language, "slug": slug.current, publishedAt, seo}}
  }
`)

// Public collection queries always use the published perspective at the call site.
export const practiceAreasQuery = defineQuery(`*[_type == "practiceArea" && language == $language && defined(slug.current)] | order(displayOrder asc, title asc){_id, title, "slug": slug.current, language, shortDescription, icon, mainImage, featuredOnHomepage, displayOrder, seo, _updatedAt}`)
export const practiceAreaQuery = defineQuery(`*[_type == "practiceArea" && language == $language && slug.current == $slug][0]{_id, title, "slug": slug.current, language, shortDescription, mainImage, body, sections, consultationLabel, seo, _updatedAt}`)
export const attorneyListQuery = defineQuery(`*[_type == "attorney" && language == $language && defined(slug.current)] | order(displayOrder asc, fullName asc){_id, fullName, "slug": slug.current, language, professionalTitle, profileImage, shortBiography, seo, _updatedAt}`)
export const attorneyQuery = defineQuery(`*[_type == "attorney" && language == $language && slug.current == $slug][0]{_id, fullName, "slug": slug.current, language, professionalTitle, profileImage, shortBiography, biography, email, phone, seo, _updatedAt, "practiceAreas": practiceAreas[]->[_type == "practiceArea" && language == $language && defined(slug.current)]{_id,title,"slug":slug.current}, "offices": offices[]->[_type == "office" && language == $language && defined(slug.current)]{_id,name,"slug":slug.current,city}}`)
export const officeListQuery = defineQuery(`*[_type == "office" && language == $language && defined(slug.current)] | order(displayOrder asc, name asc){_id, name, "slug": slug.current, language, streetAddress, addressLine2, city, state, postalCode, country, phone, email, mapUrl, image, openingHours, seo, _updatedAt}`)
export const officeQuery = defineQuery(`*[_type == "office" && language == $language && slug.current == $slug][0]{_id, name, "slug": slug.current, language, streetAddress, addressLine2, city, state, postalCode, country, phone, email, mapUrl, coordinates, image, openingHours, seo, _updatedAt}`)
export const attorneysForPracticeQuery = defineQuery(`*[_type == "attorney" && language == $language && defined(slug.current) && $id in practiceAreas[]._ref] | order(displayOrder asc, fullName asc){_id, fullName, "slug": slug.current, professionalTitle, profileImage, shortBiography, "officeIds": offices[]._ref}`)
export const attorneysForOfficeQuery = defineQuery(`*[_type == "attorney" && language == $language && defined(slug.current) && $id in offices[]._ref] | order(displayOrder asc, fullName asc){_id, fullName, "slug": slug.current, professionalTitle, profileImage, shortBiography}`)
export const practiceAreaArchiveQuery = defineQuery(`*[_type == "practiceAreaArchive" && _id == $id][0]`)
export const collectionTranslationQuery = defineQuery(`*[_type == "translation.metadata" && references($id)][0].translations[]{language,"target":value->{_id,_type,language,"slug":slug.current,"noIndex":seo.noIndex}}`)
export const practiceSelectionTranslationsQuery = defineQuery(`*[_type == "translation.metadata" && references($ids)]{translations[]{language,"target":value->{_id,_type,language,"slug":slug.current}}}`)
export const collectionSitemapQuery = defineQuery(`*[_type in ["practiceArea", "attorney", "office"] && language in ["en", "es"] && defined(slug.current)]{_id,_type,language,"slug":slug.current,_updatedAt,seo,"translations":*[_type == "translation.metadata" && references(^._id)][0].translations[]{language,"target":value->{_id,_type,language,"slug":slug.current,"noIndex":seo.noIndex}}}`)
