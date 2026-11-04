import {collectionPath, type Collection} from './collection-routing.ts'
import {archivePath as blogArchivePath, postPath} from './blog-routing.ts'
import {localePath, type Locale} from './i18n.ts'

export const SANITY_CACHE_TAG = 'sanity'

export const REVALIDATED_DOCUMENT_TYPES = [
  'page',
  'practiceArea',
  'attorney',
  'office',
  'blogPost',
  'navigation',
  'footer',
  'settings',
  'practiceAreaArchive',
  'blogArchive',
  'translation.metadata',
] as const

type RevalidatedDocumentType = (typeof REVALIDATED_DOCUMENT_TYPES)[number]
type Operation = 'create' | 'update' | 'delete'

export type RevalidationTarget = {
  _id?: string | null
  _type?: string | null
  language?: string | null
  slug?: string | null
}

export type RevalidationDocument = RevalidationTarget & {
  homePage?: RevalidationTarget | null
  practiceAreas?: RevalidationTarget[] | null
  offices?: RevalidationTarget[] | null
  translations?: RevalidationTarget[] | null
}

export type SanityRevalidationPayload = {
  operation?: string | null
  before?: RevalidationDocument | null
  after?: RevalidationDocument | null
}

export type RevalidationPlan = {
  documentType: RevalidatedDocumentType
  operation: Operation
  paths: string[]
  revalidateLayout: boolean
}

const supportedTypes = new Set<string>(REVALIDATED_DOCUMENT_TYPES)

function locale(value: string | null | undefined): Locale {
  return value === 'es' ? 'es' : 'en'
}

function addLocalizedHomes(paths: Set<string>, locales: Set<Locale>) {
  for (const item of locales) paths.add(localePath(item))
}

function addTargetPath(paths: Set<string>, target: RevalidationTarget | null | undefined) {
  if (!target?.slug) return
  const targetLocale = locale(target.language)
  if (target._type === 'practiceArea') {
    paths.add(collectionPath('practiceArea', targetLocale, target.slug))
  } else if (target._type === 'attorney') {
    paths.add(collectionPath('attorney', targetLocale, target.slug))
  } else if (target._type === 'office') {
    paths.add(collectionPath('office', targetLocale, target.slug))
  } else if (target._type === 'blogPost') {
    paths.add(postPath(targetLocale, target.slug))
  } else if (target._type === 'page') {
    paths.add(localePath(targetLocale, target.slug))
  }
}

function addCollectionPaths(
  paths: Set<string>,
  type: Collection,
  states: RevalidationDocument[],
  locales: Set<Locale>,
) {
  for (const item of locales) paths.add(collectionPath(type, item))
  for (const state of states) addTargetPath(paths, state)
}

export function createRevalidationPlan(
  payload: SanityRevalidationPayload,
): RevalidationPlan | null {
  const states = [payload.before, payload.after].filter(
    (value): value is RevalidationDocument => Boolean(value),
  )
  const documentType = (payload.after?._type || payload.before?._type) as
    | RevalidatedDocumentType
    | undefined
  if (!documentType || !supportedTypes.has(documentType)) return null

  const inferredOperation: Operation = !payload.before
    ? 'create'
    : !payload.after
      ? 'delete'
      : 'update'
  const operation = payload.operation || inferredOperation
  if (operation !== 'create' && operation !== 'update' && operation !== 'delete') return null

  const paths = new Set<string>(['/sitemap.xml'])
  const locales = new Set<Locale>(states.map((state) => locale(state.language)))
  let revalidateLayout = false

  switch (documentType) {
    case 'page':
      for (const state of states) addTargetPath(paths, state)
      addLocalizedHomes(paths, locales)
      // Page slugs can be dereferenced by navigation, footer, settings and other pages.
      revalidateLayout = states.some((state) => state.slug !== payload.after?.slug)
      break
    case 'blogPost':
      for (const item of locales) paths.add(blogArchivePath(item))
      for (const state of states) addTargetPath(paths, state)
      break
    case 'practiceArea':
      addCollectionPaths(paths, 'practiceArea', states, locales)
      addLocalizedHomes(paths, locales)
      break
    case 'attorney':
      addCollectionPaths(paths, 'attorney', states, locales)
      addLocalizedHomes(paths, locales)
      for (const item of locales) {
        paths.add(localePath(item, item === 'es' ? 'sobre-nosotros' : 'about-us'))
      }
      for (const state of states) {
        for (const target of state.practiceAreas || []) addTargetPath(paths, target)
        for (const target of state.offices || []) addTargetPath(paths, target)
      }
      break
    case 'office':
      addCollectionPaths(paths, 'office', states, locales)
      addLocalizedHomes(paths, locales)
      for (const item of locales) paths.add(localePath(item, item === 'es' ? 'contacto' : 'contact'))
      break
    case 'practiceAreaArchive':
      for (const item of locales) paths.add(collectionPath('practiceArea', item))
      break
    case 'blogArchive':
      for (const item of locales) paths.add(blogArchivePath(item))
      break
    case 'translation.metadata':
      for (const state of states) {
        for (const target of state.translations || []) addTargetPath(paths, target)
      }
      break
    case 'settings':
      addLocalizedHomes(paths, locales)
      for (const state of states) addTargetPath(paths, state.homePage)
      revalidateLayout = true
      break
    case 'navigation':
    case 'footer':
      revalidateLayout = true
      break
  }

  return {
    documentType,
    operation,
    paths: [...paths].sort(),
    revalidateLayout,
  }
}

type ParsedWebhookBody = {
  isValidSignature: boolean | null
  body: SanityRevalidationPayload | null
}

export type RevalidationHandlerDependencies = {
  secret: string | undefined
  parseBody: (request: Request, secret: string) => Promise<ParsedWebhookBody>
  revalidatePath: (path: string, type?: 'layout' | 'page') => void
  revalidateTag: (tag: string, profile: 'max') => void
}

export function createRevalidationHandler(dependencies: RevalidationHandlerDependencies) {
  return async function handleRevalidation(request: Request): Promise<Response> {
    if (!dependencies.secret?.trim()) {
      return Response.json({ok: false, error: 'Webhook revalidation is not configured'}, {status: 500})
    }

    let parsed: ParsedWebhookBody
    try {
      parsed = await dependencies.parseBody(request, dependencies.secret)
    } catch {
      return Response.json({ok: false, error: 'Invalid webhook payload'}, {status: 400})
    }

    if (parsed.isValidSignature !== true) {
      return Response.json({ok: false, error: 'Invalid signature'}, {status: 401})
    }

    const plan = parsed.body ? createRevalidationPlan(parsed.body) : null
    if (!plan) {
      return Response.json({ok: false, error: 'Unsupported webhook payload'}, {status: 400})
    }

    dependencies.revalidateTag(SANITY_CACHE_TAG, 'max')
    for (const path of plan.paths) dependencies.revalidatePath(path)
    if (plan.revalidateLayout) dependencies.revalidatePath('/', 'layout')

    return Response.json({
      ok: true,
      documentType: plan.documentType,
      operation: plan.operation,
      paths: plan.paths,
      layout: plan.revalidateLayout,
    })
  }
}
