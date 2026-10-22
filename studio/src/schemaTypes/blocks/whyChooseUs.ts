import {defineArrayMember, defineField, defineType} from 'sanity'
import {BlockElementIcon} from '@sanity/icons'

const highlight = defineArrayMember({
  name: 'whyChooseUsHighlight',
  title: 'Highlight',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      initialValue: 'award',
      description: 'Choose a supported decorative icon for this highlight.',
      options: {
        list: [
          {title: 'Award', value: 'award'},
          {title: 'Briefcase', value: 'briefcase'},
          {title: 'Scale', value: 'scale'},
          {title: 'Shield', value: 'shield'},
          {title: 'People', value: 'people'},
          {title: 'Star', value: 'star'},
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'A short proof point, such as “10 Years”, “120+” or “99%”.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {title: 'value', subtitle: 'label'},
    prepare({title, subtitle}) {
      return {title: title || 'Untitled highlight', subtitle: subtitle || 'Highlight'}
    },
  },
})

export const whyChooseUs = defineType({
  name: 'whyChooseUs',
  title: 'Why Choose Us',
  type: 'object',
  icon: BlockElementIcon,
  fieldsets: [
    {name: 'section', title: 'Section', options: {collapsible: true, collapsed: false}},
    {name: 'image', title: 'Image', options: {collapsible: true, collapsed: false}},
    {name: 'highlights', title: 'Highlights', options: {collapsible: true, collapsed: false}},
    {name: 'content', title: 'Content', options: {collapsible: true, collapsed: false}},
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Section heading',
      type: 'string',
      fieldset: 'section',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'anchorId',
      title: 'Section anchor ID',
      type: 'string',
      fieldset: 'section',
      description: 'Optional ID for linking directly to this section. Use letters, numbers and hyphens.',
      validation: (Rule) => Rule.regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/).warning(),
    }),
    defineField({
      name: 'backgroundTheme',
      title: 'Background theme',
      type: 'string',
      fieldset: 'section',
      initialValue: 'navy',
      options: {
        list: [
          {title: 'Dark navy', value: 'navy'},
          {title: 'Light', value: 'light'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Layout variant',
      type: 'string',
      fieldset: 'section',
      initialValue: 'standard',
      description: 'Choose a predefined spacing treatment for this section.',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Compact', value: 'compact'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      fieldset: 'image',
      description: 'Portrait-oriented photography works best. Focal point and crop are editor-controlled.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the image for visitors using assistive technology.',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const image = context.parent as {asset?: {_ref?: string}} | undefined
              return image?.asset?._ref && !value
                ? 'Alt text is required when an image is selected.'
                : true
            }),
        }),
        defineField({name: 'caption', title: 'Caption', type: 'string'}),
      ],
    }),
    defineField({
      name: 'specializationHeading',
      title: 'Specialization heading',
      type: 'string',
      fieldset: 'highlights',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'highlights',
      title: 'Statistics and highlights',
      type: 'array',
      fieldset: 'highlights',
      description: 'Add at least three proof points. Drag items to change their display order.',
      of: [highlight],
      validation: (Rule) => Rule.min(3).required(),
    }),
    defineField({
      name: 'contentHeading',
      title: 'Content heading',
      type: 'string',
      fieldset: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      fieldset: 'content',
      description: 'Write the descriptive copy for this section.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      fieldset: 'content',
      description: 'Leave blank to omit the button.',
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA link',
      type: 'link',
      fieldset: 'content',
      description: 'Choose an internal page or external URL. The button is shown only when both label and link are set.',
    }),
  ],
  preview: {
    select: {title: 'heading', highlights: 'highlights', media: 'image.asset'},
    prepare({title, highlights, media}) {
      const count = Array.isArray(highlights) ? highlights.length : 0
      return {
        title: title || 'Why Choose Us',
        subtitle: `${count} ${count === 1 ? 'highlight' : 'highlights'}`,
        media,
      }
    },
  },
})