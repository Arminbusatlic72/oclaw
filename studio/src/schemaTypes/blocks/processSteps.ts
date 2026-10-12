import {SparklesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const stepItem = defineArrayMember({
  name: 'processStepItem',
  title: 'Step',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
    }),
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
      rows: 4,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'eyebrow',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Untitled step',
        subtitle: selection.subtitle || 'Step',
      }
    },
  },
})

export const processSteps = defineType({
  name: 'processSteps',
  title: 'Process Steps',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
    }),
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
      rows: 3,
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [stepItem],
      validation: (Rule) => Rule.min(2).max(6).required(),
    }),
    defineField({
      name: 'button',
      title: 'Optional button',
      type: 'button',
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
      steps: 'steps',
    },
    prepare(selection) {
      const stepCount = Array.isArray(selection.steps) ? selection.steps.length : 0

      return {
        title: selection.title || 'Process steps',
        subtitle: stepCount === 1 ? '1 step' : `${stepCount} steps`,
      }
    },
  },
})
