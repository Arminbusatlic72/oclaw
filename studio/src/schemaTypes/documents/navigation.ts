import {MenuIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

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
        rule.custom((value) => {
          if (!value) return 'Internal path is required'
          if (!value.startsWith('/')) return 'Internal path must start with /'
          return true
        }),
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
          const parent = context.parent as {externalUrl?: string; children?: unknown[]}
          if (parent?.externalUrl || (parent?.children && parent.children.length > 0)) return true
          if (!value) return 'Internal path is required when no external URL or children are set'
          if (!value.startsWith('/')) return 'Internal path must start with /'
          return true
        }),
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
          const parent = context.parent as {ctaLabel?: string}
          if (!parent?.ctaLabel) return true
          if (!value) return 'CTA path is required when CTA label is set'
          if (!value.startsWith('/')) return 'CTA path must start with /'
          return true
        }),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Navigation',
      }
    },
  },
})
