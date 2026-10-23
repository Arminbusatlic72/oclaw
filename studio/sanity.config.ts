/**
 * This config is used to configure your Sanity Studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {
  presentationTool,
  defineDocuments,
  defineLocations,
  type DocumentLocation,
} from 'sanity/presentation'
import {assist} from '@sanity/assist'
import {documentInternationalization} from '@sanity/document-internationalization'
import {localizedSingletons, supportedLanguages, translatedSchemaTypes} from './src/i18n/config'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// URL for preview functionality, defaults to localhost:3000 if not set
const SANITY_STUDIO_PREVIEW_URL = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

// Define the home location for the presentation tool
const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

// resolveHref() is a convenience function that resolves the URL
// path for different document types and used in the presentation tool.
function resolveHref(documentType?: string, slug?: string, language = 'en'): string | undefined {
  switch (documentType) {
    case 'page':
    case 'blogPost':
      if (!slug) return language === 'es' ? '/es/' : '/'
      return language === 'es' ? `/es/${slug}/` : `/${slug}/`
    case 'practiceArea':
      return slug ? `${language === 'es' ? '/es/areas-de-practica' : '/practice-areas'}/${slug}/` : undefined
    case 'attorney':
      return slug ? `${language === 'es' ? '/es/abogados' : '/attorneys'}/${slug}/` : undefined
    case 'office':
      return slug ? `${language === 'es' ? '/es/oficinas' : '/offices'}/${slug}/` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}

// Main Sanity configuration
export default defineConfig({
  name: 'default',
  title: 'OC Law CMS Starter',

  projectId,
  dataset,

  plugins: [
    documentInternationalization({
      supportedLanguages: [...supportedLanguages],
      schemaTypes: translatedSchemaTypes,
      languageField: 'language',
      weakReferences: false,
      allowCreateMetaDoc: true,
      hideLanguageFilter: ['navigation', 'settings', 'footer'],
      metadataOmnisearchVisibility: false,
      apiVersion: '2025-09-25',
    }),
    // Presentation tool configuration for Visual Editing
    presentationTool({
      previewUrl: {
        origin: SANITY_STUDIO_PREVIEW_URL,
        previewMode: {
          enable: '/api/draft-mode/enable/',
        },
      },
      resolve: {
        // The Main Document Resolver API provides a method of resolving a main document from a given route or route pattern. https://www.sanity.io/docs/visual-editing/presentation-resolver-api#57720a5678d9
        mainDocuments: defineDocuments([
          {
            route: '/es',
            filter: `_type == "settings" && _id == "siteSettings-es"`,
          },
          {
            route: '/es/:slug',
            filter: `_type in ["page", "blogPost"] && language == "es" && slug.current == $slug`,
          },
          {
            route: '/',
            filter: `_type == "settings" && _id == "siteSettings"`,
          },
          {
            route: '/:slug',
            filter: `_type in ["page", "blogPost"] && coalesce(language, "en") == "en" && slug.current == $slug`,
          },
          {route: '/practice-areas/:slug', filter: `_type == "practiceArea" && language == "en" && slug.current == $slug`},
          {route: '/es/areas-de-practica/:slug', filter: `_type == "practiceArea" && language == "es" && slug.current == $slug`},
          {route: '/attorneys/:slug', filter: `_type == "attorney" && language == "en" && slug.current == $slug`},
          {route: '/es/abogados/:slug', filter: `_type == "attorney" && language == "es" && slug.current == $slug`},
          {route: '/offices/:slug', filter: `_type == "office" && language == "en" && slug.current == $slug`},
          {route: '/es/oficinas/:slug', filter: `_type == "office" && language == "es" && slug.current == $slug`},
        ]),
        // Locations Resolver API allows you to define where data is being used in your application. https://www.sanity.io/docs/visual-editing/presentation-resolver-api#8d8bca7bfcd7
        locations: {
          practiceArea: defineLocations({select: {title: 'title', slug: 'slug.current', language: 'language'}, resolve: (doc) => ({locations: doc?.slug ? [{title: doc.title || 'Practice area', href: resolveHref('practiceArea', doc.slug, doc.language)!}] : []})}),
          attorney: defineLocations({select: {title: 'fullName', slug: 'slug.current', language: 'language'}, resolve: (doc) => ({locations: doc?.slug ? [{title: doc.title || 'Attorney', href: resolveHref('attorney', doc.slug, doc.language)!}] : []})}),
          office: defineLocations({select: {title: 'name', slug: 'slug.current', language: 'language'}, resolve: (doc) => ({locations: doc?.slug ? [{title: doc.title || 'Office', href: resolveHref('office', doc.slug, doc.language)!}] : []})}),
          blogPost: defineLocations({
            select: {title: 'title', slug: 'slug.current', language: 'language'},
            resolve: (doc) => ({locations: doc?.slug ? [{title: doc.title || 'Article', href: resolveHref('blogPost', doc.slug, doc.language)!}] : []}),
          }),
          settings: defineLocations({
            select: {id: '_id'},
            resolve: (doc) => ({
              locations: [
                doc?.id === 'siteSettings-es' ? {title: 'Inicio', href: '/es/'} : homeLocation,
              ],
              message: 'This document is used on all pages in its language',
              tone: 'positive',
            }),
          }),
          page: defineLocations({
            select: {
              name: 'name',
              slug: 'slug.current',
              language: 'language',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.name || 'Untitled',
                  href: resolveHref('page', doc?.slug, doc?.language)!,
                },
              ],
            }),
          }),
          navigation: defineLocations({
            select: {id: '_id'},
            resolve: (doc) => ({
              locations: [
                doc?.id === 'siteNavigation-es' ? {title: 'Inicio', href: '/es/'} : homeLocation,
              ],
              message: 'This navigation is used on all pages in its language',
              tone: 'positive',
            }),
          }),
          footer: defineLocations({
            select: {id: '_id'},
            resolve: (doc) => ({
              locations: [
                doc?.id === 'siteFooter-es' ? {title: 'Inicio', href: '/es/'} : homeLocation,
              ],
              message: 'This footer is used on all pages in its language',
              tone: 'positive',
            }),
          }),
        },
      },
    }),
    structureTool({
      structure, // Custom studio structure configuration, imported from ./src/structure.ts
    }),
    // Additional plugins for enhanced functionality
    unsplashImageAsset(),
    assist(),
    visionTool(),
  ],

  // Schema configuration, imported from ./src/schemaTypes/index.ts
  schema: {
    types: schemaTypes,
    templates: (templates) => {
      const singletonTypes = new Set(localizedSingletons.map(({schemaType}) => schemaType))
      const localizedSingletonTemplates = localizedSingletons.flatMap((singleton) =>
        supportedLanguages.map((language) => ({
          id: `${singleton.schemaType}-${language.id}`,
          title: `${singleton.title} (${language.title})`,
          schemaType: singleton.schemaType,
          value: {language: language.id},
        })),
      )

      return [
        ...templates.filter(
          (template) =>
            !singletonTypes.has(
              template.schemaType as (typeof localizedSingletons)[number]['schemaType'],
            ) && !(template.schemaType === 'page' && template.id === 'page'),
        ),
        ...localizedSingletonTemplates,
      ]
    },
  },
})
