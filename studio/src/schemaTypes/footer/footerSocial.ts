import {EarthGlobeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const platforms = [
  {title: 'Facebook', value: 'facebook'},
  {title: 'Instagram', value: 'instagram'},
  {title: 'YouTube', value: 'youtube'},
  {title: 'LinkedIn', value: 'linkedin'},
  {title: 'X / Twitter', value: 'x'},
  {title: 'TikTok', value: 'tiktok'},
  {title: 'Other', value: 'other'},
] as const

const footerSocialLink = defineArrayMember({
  name: 'footerSocialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {list: [...platforms]},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'iconIdentifier',
      title: 'Fallback icon',
      description: 'Used for other platforms.',
      type: 'string',
      hidden: ({parent}) => parent?.platform !== 'other',
      options: {
        list: [
          {title: 'Globe', value: 'globe'},
          {title: 'Link', value: 'link'},
          {title: 'Message', value: 'message'},
        ],
      },
      initialValue: 'globe',
    }),
    defineField({
      name: 'label',
      title: 'Accessible label',
      description: 'Describes the destination to screen-reader users.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {title: 'label', platform: 'platform', subtitle: 'url'},
    prepare({title, platform, subtitle}) {
      return {title: title || platform || 'Social link', subtitle}
    },
  },
})

export const footerSocial = defineType({
  name: 'footerSocial',
  title: 'Social media',
  type: 'object',
  icon: EarthGlobeIcon,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'links',
      title: 'Social links',
      type: 'array',
      of: [footerSocialLink],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'heading', links: 'links'},
    prepare({title, links}) {
      const count = links?.length || 0
      return {title: title || 'Social media', subtitle: `${count} link${count === 1 ? '' : 's'}`}
    },
  },
})
