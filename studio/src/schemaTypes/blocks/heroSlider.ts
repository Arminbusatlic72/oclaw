import {defineArrayMember, defineField, defineType} from 'sanity'

const slideObject = defineArrayMember({
  name: 'heroSliderSlide',
  title: 'Slide',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
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
      name: 'awardBadge',
      title: 'Award badge',
      description:
        'Shown above the heading in the Immigration layout or Enhanced Classic when enabled. Keep the original badge proportions.',
      type: 'image',
      options: {hotspot: false},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({name: 'link', title: 'Badge link', type: 'link'}),
      ],
    }),
    defineField({
      name: 'multilingualInfo',
      title: 'Multilingual support information',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'services',
      title: 'Immigration services',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'cta',
      title: 'Primary call to action',
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
        defineField({
          name: 'link',
          title: 'Referenced link',
          description: 'Preferred for new links. The legacy URL remains supported.',
          type: 'link',
        }),
      ],
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary call to action',
      description: 'Optional second button displayed beside the primary call to action.',
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
        defineField({
          name: 'link',
          title: 'Referenced link',
          description: 'Preferred for new links. The legacy URL remains supported.',
          type: 'link',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'image.asset',
    },
    prepare(selection) {
      const {title, subtitle, media} = selection
      return {
        title: title || 'Untitled slide',
        subtitle: subtitle || 'Hero slide',
        media: media || undefined,
      }
    },
  },
})

export const heroSlider = defineType({
  name: 'heroSlider',
  title: 'Hero Slider',
  type: 'object',
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'classic',
      options: {
        list: [
          {title: 'Classic', value: 'classic'},
          {title: 'Immigration', value: 'immigration'},
        ],
      },
    }),
    defineField({
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [slideObject],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'enhancedClassic',
      title: 'Enable Enhanced Classic design',
      description:
        'Adds the premium navy-and-gold presentation while preserving the existing Classic slider behavior.',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => parent?.layout === 'immigration',
    }),
    defineField({
      name: 'showAwardBadge',
      title: 'Show award badge',
      description: 'Uses the award badge configured on each slide.',
      type: 'boolean',
      initialValue: true,
      hidden: ({parent}) => parent?.layout === 'immigration' || !parent?.enhancedClassic,
    }),
    defineField({
      name: 'showPracticeAreas',
      title: 'Show Practice Areas below slider',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => parent?.layout === 'immigration',
    }),
    defineField({
      name: 'practiceAreasHeading',
      title: 'Practice Areas heading',
      description: 'Optional localized heading displayed above the Practice Areas list.',
      type: 'string',
      hidden: ({parent}) =>
        parent?.layout === 'immigration' ||
        !parent?.showPracticeAreas,
    }),
    defineField({
      name: 'practiceAreasSelectionMode',
      title: 'Practice Areas selection mode',
      type: 'string',
      options: {
        list: [
          {title: 'Manual', value: 'manual'},
          {title: 'Automatic — featured on homepage', value: 'automatic'},
        ],
      },
      initialValue: 'manual',
      hidden: ({parent}) =>
        parent?.layout === 'immigration' ||
        !parent?.showPracticeAreas,
    }),
    defineField({
      name: 'practiceAreas',
      title: 'Selected Practice Areas',
      description:
        'Select and order Practice Area documents. The matching published translation is used on localized pages.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'practiceArea'}]}],
      validation: (Rule) => Rule.unique().max(6),
      hidden: ({parent}) =>
        parent?.layout === 'immigration' ||
        !parent?.showPracticeAreas ||
        parent?.practiceAreasSelectionMode !== 'manual',
    }),
    defineField({
      name: 'maximumPracticeAreas',
      title: 'Maximum visible Practice Areas',
      type: 'number',
      initialValue: 6,
      validation: (Rule) => Rule.integer().min(1).max(6),
      hidden: ({parent}) =>
        parent?.layout === 'immigration' ||
        !parent?.showPracticeAreas,
    }),
    defineField({
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'autoplayInterval',
      title: 'Autoplay interval (ms)',
      type: 'number',
      initialValue: 5000,
      validation: (Rule) => Rule.min(1000),
    }),
    defineField({
      name: 'showDots',
      title: 'Show dots',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showArrows',
      title: 'Show arrows',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'slides[0].title',
      subtitle: 'slides[0].subtitle',
      media: 'slides[0].image.asset',
    },
    prepare(selection) {
      const {title, subtitle, media} = selection
      return {
        title: title || 'Hero Slider',
        subtitle: subtitle || 'Slides defined',
        media: media || undefined,
      }
    },
  },
})
