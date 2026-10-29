import {ChartUpwardIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const statistic = defineArrayMember({
  name: 'statistic',
  title: 'Statistic',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Number',
      type: 'number',
      description: 'The number the counter animates to.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'suffix',
      title: 'Suffix',
      type: 'string',
      description: 'Optional character shown after the number, such as + or %.',
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Optional icon displayed above this statistic.',
      initialValue: 'none',
      options: {
        list: [
          {title: 'No icon', value: 'none'},
          {title: 'Cases / briefcase', value: 'briefcase'},
          {title: 'Clients / people', value: 'people'},
          {title: 'Office / building', value: 'building'},
          {title: 'Law / scales', value: 'scales'},
          {title: 'Achievement / trophy', value: 'trophy'},
          {title: 'Location / pin', value: 'location'},
        ],
        layout: 'dropdown',
      },
    }),
  ],
  preview: {
    select: {value: 'value', suffix: 'suffix', label: 'label'},
    prepare: ({value, suffix, label}) => ({
      title: `${value ?? 0}${suffix || ''}`,
      subtitle: label || 'Statistic',
    }),
  },
})

export const statisticsSection = defineType({
  name: 'statisticsSection',
  title: 'Statistics',
  type: 'object',
  icon: ChartUpwardIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Statistics',
      type: 'array',
      of: [statistic],
      initialValue: [
        {
          _type: 'statistic',
          _key: 'cases-solved',
          value: 1000,
          suffix: '+',
          label: 'Cases Solved',
          icon: 'briefcase',
        },
        {
          _type: 'statistic',
          _key: 'happy-clients',
          value: 800,
          suffix: '+',
          label: 'Happy Clients',
          icon: 'people',
        },
        {_type: 'statistic', _key: 'offices', value: 3, label: 'Offices', icon: 'building'},
      ],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),
  ],
  preview: {
    select: {items: 'items'},
    prepare: ({items}) => {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: 'Statistics',
        subtitle: `${count} ${count === 1 ? 'item' : 'items'}`,
        media: ChartUpwardIcon,
      }
    },
  },
})
