import {PlayIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const youtubeUrlPattern =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)[A-Za-z0-9_-]{11}(?:[?&#/].*)?$/i

const youtubeVideo = defineArrayMember({
  name: 'youtubeVideo',
  title: 'YouTube video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'YouTube URL',
      type: 'url',
      description: 'Paste a youtube.com or youtu.be video URL.',
      validation: (Rule) =>
        Rule.required().custom((value) =>
          !value || youtubeUrlPattern.test(value) ? true : 'Enter a valid YouTube video URL.',
        ),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'url'},
    prepare: ({title, subtitle}) => ({title: title || 'Untitled video', subtitle, media: PlayIcon}),
  },
})

export const youtubeVideos = defineType({
  name: 'youtubeVideos',
  title: 'YouTube videos',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'Video library',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Insights from our team',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'videos',
      title: 'Videos',
      type: 'array',
      of: [youtubeVideo],
      validation: (Rule) => Rule.required().length(3),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Channel button label',
      type: 'string',
      initialValue: 'Visit our YouTube channel',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'channelUrl',
      title: 'YouTube channel URL',
      type: 'url',
      validation: (Rule) =>
        Rule.required().uri({scheme: ['https']}).custom((value) => {
          if (!value) return true
          try {
            const hostname = new URL(value).hostname.replace(/^www\./, '')
            return hostname === 'youtube.com' || hostname === 'youtu.be'
              ? true
              : 'Enter a YouTube channel URL.'
          } catch {
            return 'Enter a valid URL.'
          }
        }),
    }),
    defineField({
      name: 'theme',
      title: 'Background',
      type: 'string',
      initialValue: 'light',
      options: {
        list: [
          {title: 'Light', value: 'light'},
          {title: 'Dark', value: 'dark'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'anchor',
      title: 'Section anchor',
      type: 'slug',
      options: {source: 'heading'},
    }),
  ],
  preview: {
    select: {title: 'heading', videos: 'videos'},
    prepare: ({title, videos}) => ({
      title: title || 'YouTube videos',
      subtitle: `${Array.isArray(videos) ? videos.length : 0} of 3 videos`,
      media: PlayIcon,
    }),
  },
})
