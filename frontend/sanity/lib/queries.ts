import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "heroSlider" => {
        slides[]{
          _key,
          title,
          subtitle,
          description,
          image{
            ..., 
            crop,
            hotspot,
            alt,
            asset->{
              _id,
              metadata {
                dimensions {
                  width,
                  height,
                },
              },
            },
          },
          cta {
            label,
            url,
          },
        },
        autoplay,
        autoplayInterval,
        showDots,
        showArrows,
      },
      _type == "cardGrid" => {
        heading,
        subheading,
        columns,
        alignment,
        cards[]{
          _key,
          title,
          description,
          tag,
          cta {
            label,
            url,
          },
          image {
            ..., 
            crop,
            hotspot,
            alt,
            asset->{
              _id,
              url,
            },
          },
        },
      },
      _type == "processSteps" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "parallaxFeatures" => {
        heading,
        subheading,
        columns,
        theme,
        features[]{
          _key,
          title,
          description,
          image{
            ...,
            crop,
            hotspot,
            alt,
            asset->{
              _id,
              _ref,
              url,
            },
          },
          cta {
            label,
            url,
          },
        },
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" && defined(slug.current)] | order(_updatedAt desc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)
