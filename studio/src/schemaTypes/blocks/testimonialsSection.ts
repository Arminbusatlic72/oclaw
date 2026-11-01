import {SparklesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const testimonial = defineArrayMember({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Review',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required().max(900),
    }),
    defineField({
      name: 'name',
      title: 'Reviewer name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Reviewer detail',
      type: 'string',
      description: 'Optional subtitle, such as “Immigration client”.',
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      initialValue: 5,
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'photo',
      title: 'Reviewer photo',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      description: 'Optional link to the original review.',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'quote', media: 'photo'},
    prepare: ({title, subtitle, media}) => ({
      title: title || 'Unnamed reviewer',
      subtitle: subtitle || 'No review text',
      media: media || SparklesIcon,
    }),
  },
})

export const testimonialsSection = defineType({
  name: 'testimonialsSection',
  title: 'Testimonials',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'accessibleLabel',
      title: 'Accessible section label',
      type: 'string',
      initialValue: 'Client testimonials',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Review source',
      type: 'string',
      initialValue: 'manual',
      options: {
        list: [
          {title: 'Manual testimonials', value: 'manual'},
          {title: 'Google Reviews (with manual fallback)', value: 'google'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Leave blank when the image is purely decorative.',
        }),
      ],
    }),
    defineField({
      name: 'testimonials',
      title: 'Manual testimonials / fallback',
      type: 'array',
      of: [testimonial],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'autoplayInterval',
      title: 'Autoplay interval (seconds)',
      type: 'number',
      initialValue: 7,
      hidden: ({parent}) => parent?.autoplay === false,
      validation: (Rule) => Rule.integer().min(4).max(15),
    }),
  ],
  preview: {
    select: {source: 'source', testimonials: 'testimonials', media: 'backgroundImage'},
    prepare: ({source, testimonials, media}) => ({
      title: 'Testimonials',
      subtitle:
        source === 'google'
          ? 'Google Reviews with manual fallback'
          : `${Array.isArray(testimonials) ? testimonials.length : 0} manual testimonials`,
      media: media || SparklesIcon,
    }),
  },
})
