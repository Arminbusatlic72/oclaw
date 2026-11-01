import {PinIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const locationMap = defineType({
  name: 'locationMap',
  title: 'Location map',
  type: 'object',
  icon: PinIcon,
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({
      name: 'offices',
      title: 'Office records',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'office'}], options: {filter: ({document}) => ({filter: '($language == "en" && coalesce(language, "en") == "en") || language == $language', params: {language: document?.language || 'en'}})}}],
      validation: (Rule) => Rule.required().min(1).unique(),
    }),
    defineField({
      name: 'embedUrl',
      title: 'Optional approved map embed URL',
      description: 'Leave blank to create a keyless Google Maps embed from each selected Office address. Never paste an API key here.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['https']}),
    }),
    defineField({name: 'mapHeight', title: 'Map height (pixels)', type: 'number', initialValue: 520, validation: (Rule) => Rule.integer().min(320).max(900)}),
    defineField({name: 'mapLinkLabel', title: 'Optional map link label', type: 'string'}),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || 'Location map', subtitle: 'Location map', media: PinIcon})},
})
