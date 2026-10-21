import {defineArrayMember, defineField, defineType} from 'sanity'

export const blogBody = defineType({
  name: 'blogBody', title: 'Article body', type: 'array',
  of: [
    defineArrayMember({type: 'block', styles: [
      {title: 'Paragraph', value: 'normal'}, {title: 'Heading 2', value: 'h2'},
      {title: 'Heading 3', value: 'h3'}, {title: 'Heading 4', value: 'h4'},
      {title: 'Quote', value: 'blockquote'},
    ], lists: [{title: 'Bullets', value: 'bullet'}, {title: 'Numbers', value: 'number'}],
    marks: {decorators: [{title: 'Bold', value: 'strong'}, {title: 'Italic', value: 'em'}],
      annotations: [{name: 'link', title: 'Link', type: 'object', fields: [
        defineField({name: 'href', title: 'External URL', type: 'url',
          validation: (Rule) => Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']})}),
        defineField({name: 'page', title: 'Internal page or article', type: 'reference', to: [{type: 'page'}, {type: 'blogPost'}]}),
        defineField({name: 'openInNewTab', title: 'Open in new tab', type: 'boolean'}),
      ]}]},
    }),
    defineArrayMember({type: 'image', options: {hotspot: true}, fields: [
      defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (Rule) => Rule.required()}),
      defineField({name: 'caption', title: 'Caption', type: 'string'}),
    ]}),
  ],
})
