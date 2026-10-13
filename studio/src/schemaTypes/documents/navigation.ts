import {MenuIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {createLanguageField} from '../../i18n/config'

const navChildItem = defineArrayMember({
  name: 'navChildItem',
  title: 'Child Item',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Internal Path',
      description: 'Example: /about',
      type: 'string',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {link?: unknown}
          if (parent?.link) return true
          if (!value) return 'A referenced link or legacy internal path is required'
          if (!value.startsWith('/')) return 'Internal path must start with /'
          return true
        }),
    }),
    defineField({
      name: 'link',
      title: 'Referenced link',
      description: 'Preferred for new internal links. The legacy path remains supported.',
      type: 'link',
    }),
  ],
})

const navItem = defineArrayMember({
  name: 'navItem',
  title: 'Navigation Item',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Internal Path',
      description: 'Example: /about',
      type: 'string',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {
            externalUrl?: string
            link?: unknown
            children?: unknown[]
          }
          if (
            parent?.externalUrl ||
            parent?.link ||
            (parent?.children && parent.children.length > 0)
          ) {
            return true
          }
          if (!value) {
            return 'A referenced link, legacy path, external URL, or child item is required'
          }
          if (!value.startsWith('/')) return 'Internal path must start with /'
          return true
        }),
    }),
    defineField({
      name: 'link',
      title: 'Referenced link',
      description: 'Preferred for new links. Legacy path and external URL fields remain supported.',
      type: 'link',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
    }),
    defineField({
      name: 'isButton',
      title: 'Render as Outline Button',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'children',
      title: 'Children',
      type: 'array',
      of: [navChildItem],
    }),
  ],
})

export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: MenuIcon,
  fields: [
    createLanguageField(),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'navItems',
      title: 'Navigation Items',
      type: 'array',
      of: [navItem],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA Internal Path',
      description: 'Example: /contact',
      type: 'string',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {ctaLabel?: string; ctaLink?: unknown}
          if (!parent?.ctaLabel) return true
          if (parent?.ctaLink) return true
          if (!value) return 'A referenced link or legacy CTA path is required when a label is set'
          if (!value.startsWith('/')) return 'CTA path must start with /'
          return true
        }),
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA referenced link',
      description: 'Preferred for new links. The legacy CTA path remains supported.',
      type: 'link',
    }),
  ],
  preview: {
    select: {
      language: 'language',
    },
    prepare({language}) {
      return {
        title: 'Navigation',
        subtitle: language ? String(language).toUpperCase() : 'Language not assigned',
      }
    },
  },
})
