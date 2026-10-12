import {defineArrayMember, defineField, defineType} from 'sanity'
import {BlockElementIcon} from '@sanity/icons'

const featureItem = defineArrayMember({
  name: 'parallaxFeatureItem',
  title: 'Feature',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
        }),
        defineField({
          name: 'url',
          title: 'URL',
          type: 'url',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image.asset',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Untitled feature',
        subtitle: 'Feature',
        media: selection.media || undefined,
      }
    },
  },
})

export const parallaxFeatures = defineType({
  name: 'parallaxFeatures',
  title: 'Parallax Features',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [featureItem],
      validation: (Rule) => Rule.min(1).max(4).required(),
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      initialValue: 2,
      options: {
        list: [1, 2, 3],
      },
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      initialValue: 'light',
      options: {
        list: [
          {title: 'Light', value: 'light'},
          {title: 'Dark', value: 'dark'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      features: 'features',
    },
    prepare(selection) {
      const featureCount = Array.isArray(selection.features) ? selection.features.length : 0

      return {
        title: selection.title || 'Parallax features',
        subtitle: featureCount === 1 ? '1 feature' : `${featureCount} features`,
      }
    },
  },
})
