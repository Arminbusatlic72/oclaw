import {CogIcon, DocumentIcon} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

import {DEFAULT_LANGUAGE, localizedSingletons, supportedLanguages} from '../i18n/config'

function pagesByLanguage(S: StructureBuilder) {
  return S.listItem()
    .title('Pages')
    .icon(DocumentIcon)
    .child(
      S.list()
        .title('Pages')
        .items(
          supportedLanguages.map((language) =>
            S.listItem()
              .id(`pages-${language.id}`)
              .title(language.title)
              .icon(DocumentIcon)
              .child(
                S.documentList()
                  .id(`pages-${language.id}-list`)
                  .title(`${language.title} Pages`)
                  .schemaType('page')
                  .initialValueTemplates([S.initialValueTemplateItem(`page-${language.id}`)])
                  .filter(
                    language.id === DEFAULT_LANGUAGE
                      ? '_type == "page" && coalesce(language, $defaultLanguage) == $language'
                      : '_type == "page" && language == $language',
                  )
                  .params({language: language.id, defaultLanguage: DEFAULT_LANGUAGE}),
              ),
          ),
        ),
    )
}

function localizedSingletonGroups(S: StructureBuilder) {
  return localizedSingletons.map((singleton) =>
    S.listItem()
      .id(`${singleton.schemaType}-group`)
      .title(singleton.title)
      .icon(CogIcon)
      .child(
        S.list()
          .id(`${singleton.schemaType}-languages`)
          .title(singleton.title)
          .items(
            supportedLanguages.map((language) => {
              const documentId = singleton.documents[language.id]

              return S.listItem()
                .id(`${singleton.schemaType}-${language.id}`)
                .title(language.title)
                .icon(CogIcon)
                .child(
                  S.document()
                    .id(documentId)
                    .schemaType(singleton.schemaType)
                    .documentId(documentId)
                    .initialValueTemplate(`${singleton.schemaType}-${language.id}`),
                )
            }),
          )
          .canHandleIntent(
            (intentName, params) =>
              intentName === 'edit' &&
              Object.values(singleton.documents).some((documentId) => documentId === params.id),
          ),
      ),
  )
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Website Content')
    .items([pagesByLanguage(S), S.listItem().title('Blog posts').icon(DocumentIcon).child(S.documentTypeList('blogPost').title('Blog posts')), ...localizedSingletonGroups(S)])
