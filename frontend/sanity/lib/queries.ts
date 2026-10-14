import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings" && _id == $id][0]`)
export const footerQuery = defineQuery(
  `*[_type == "footer" && _id == $id][0]{..., links[]{..., link{..., page->{_id, language, "slug": slug.current}}}}`,
)

export const navigationQuery = defineQuery(`
  *[_type == "navigation" && _id == $id][0]{
    logo{alt, asset},
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
    _type == "heroSlider" => {..., slides[]{..., image{..., asset->{_id, metadata{dimensions{width,height}}}}, cta{..., ${linkFields}}}},
    _type == "cardGrid" => {..., cards[]{..., image{..., asset->{_id,url}}, cta{..., ${linkFields}}}},
    _type == "processSteps" => {..., button{..., ${linkFields}}},
    _type == "parallaxFeatures" => {..., features[]{..., image{..., asset->{_id,_ref,url}}, cta{..., ${linkFields}}}},
    _type == "infoSection" => {..., content[]{..., markDefs[]{..., _type == "link" => {page->{_id, language, "slug": slug.current}}}}}
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
