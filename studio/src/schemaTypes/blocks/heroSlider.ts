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
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [slideObject],
      validation: (Rule) => Rule.min(1),
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
