import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings" && _id == $id][0]`)
const footerLinkFields = /* groq */ `link{..., page->{_id, language, "slug": slug.current}}`
export const footerQuery = defineQuery(`
  *[_type == "footer" && _id == $id][0]{
    ...,
    blocks[]{
      ...,
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
