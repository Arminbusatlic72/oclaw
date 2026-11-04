import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'
import type {Link} from '../../../sanity.types'
import {calendlyOfficeOptionsField, calendlyUrlField} from './calendlyActionFields'

/**
 * Link schema object. This link object lets the user first select the type of link and then
 * enter the URL or page reference depending on the type selected.
 * Learn more: https://www.sanity.io/docs/studio/object-type
 */

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      initialValue: 'href',
      options: {
        list: [
          {title: 'URL', value: 'href'},
          {title: 'Page', value: 'page'},
          {title: 'Site route', value: 'route'},
          {title: 'Calendly booking', value: 'calendly'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'href',
      validation: (Rule) =>
        // Custom validation to ensure URL is provided if the link type is 'href'
        Rule.custom((value, context) => {
          const parent = context.parent as Link
          if (parent?.linkType === 'href' && !value) {
            return 'URL is required when Link Type is URL'
          }
          return true
        }),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      description: 'Select a standard page or a collection archive page.',
      to: [{type: 'page'}, {type: 'practiceAreaArchive'}, {type: 'blogArchive'}],
      hidden: ({parent}) => parent?.linkType !== 'page',
      validation: (Rule) =>
        // Custom validation to ensure page reference is provided if the link type is 'page'
        Rule.custom((value, context) => {
          const parent = context.parent as Link
          if (parent?.linkType === 'page' && !value) {
            return 'Page reference is required when Link Type is Page'
          }
          return true
        }),
    }),
    defineField({
      name: 'route',
      title: 'Site route',
      type: 'string',
      description: 'Built-in listing pages are selected here instead of the Page reference picker.',
      options: {
        list: [
          {title: 'Attorneys', value: 'attorneys'},
          {title: 'Offices', value: 'offices'},
          {title: 'Resources', value: 'resources'},
          {title: 'Privacy Policy', value: 'privacyPolicy'},
        ],
      },
      hidden: ({parent}) => parent?.linkType !== 'route',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {linkType?: string}
          if (parent?.linkType === 'route' && !value) return 'Select a site route'
          return true
        }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => parent?.linkType === 'calendly',
    }),
    calendlyUrlField(
      'calendlyEventUrl',
      'Global Calendly event URL',
      ({parent}) => parent?.linkType !== 'calendly',
    ),
    calendlyOfficeOptionsField(
      'calendlyOfficeBookingOptions',
      ({parent}) => parent?.linkType !== 'calendly',
    ),
    defineField({
      name: 'calendlyPrivacyNotice',
      title: 'Calendly privacy notice',
      type: 'text',
      rows: 3,
      hidden: ({parent}) => parent?.linkType !== 'calendly',
      description: 'Optional localized notice. Do not request case details or confidential information.',
    }),
    defineField({
      name: 'calendlyFallbackLinkLabel',
      title: 'Calendly fallback link label',
      type: 'string',
      hidden: ({parent}) => parent?.linkType !== 'calendly',
    }),
  ],
  validation: (Rule) =>
    Rule.custom((value) => {
      const action = value as
        | {
            linkType?: string
            calendlyEventUrl?: string
            calendlyOfficeBookingOptions?: Array<{eventUrl?: string}>
          }
        | undefined
      if (action?.linkType !== 'calendly') return true
      return action.calendlyEventUrl ||
        action.calendlyOfficeBookingOptions?.some((option) => option.eventUrl)
        ? true
        : 'This action is disabled publicly until a client-approved Calendly URL is added.'
    }).warning(),
})
