import Link from 'next/link'

import {studioUrl} from '@/sanity/lib/api'
import type {Locale} from '@/lib/i18n'

const copy = {
  en: {
    eyebrow: 'Homepage setup required',
    title: 'Configure the English homepage in Sanity Studio',
    settings: 'Create the English Site Settings document (`siteSettings`).',
    reference: 'Select a published English page in its Homepage field.',
    unavailable:
      'The configured homepage could not be loaded. Verify that the referenced page is published and uses English.',
    action: 'Open Sanity Studio',
  },
  es: {
    eyebrow: 'Se requiere configurar la página de inicio',
    title: 'Configura la página de inicio en español en Sanity Studio',
    settings: 'Crea el documento de ajustes en español (`siteSettings-es`).',
    reference: 'Selecciona una página publicada en español en el campo Página de inicio.',
    unavailable:
      'No se pudo cargar la página de inicio configurada. Verifica que la página referenciada esté publicada y use español.',
    action: 'Abrir Sanity Studio',
  },
} as const

export default function HomepageSetupRequired({
  locale,
  hasSettings,
  hasHomepageReference,
}: {
  locale: Locale
  hasSettings: boolean
  hasHomepageReference: boolean
}) {
  const text = copy[locale]
  const instructions = !hasSettings
    ? [text.settings, text.reference]
    : !hasHomepageReference
      ? [text.reference]
      : [text.unavailable]

  return (
    <section className="container my-10 lg:my-16">
      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-8 text-slate-900 shadow-sm dark:border-amber-800 dark:bg-amber-950/30 dark:text-slate-100">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">
          {text.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{text.title}</h1>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-slate-700 dark:text-slate-200">
          {instructions.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ol>
        <Link
          href={studioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {text.action}
        </Link>
      </div>
    </section>
  )
}
