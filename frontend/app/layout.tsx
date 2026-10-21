import './globals.css'

import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata} from 'next'
import {DM_Serif_Text, Mulish} from 'next/font/google'
import {draftMode, headers} from 'next/headers'
import {toPlainText} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'
import {Toaster} from 'sonner'

import DraftModeToast from '@/app/components/DraftModeToast'
import Footer from '@/app/components/Footer'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import NavbarWrapper from '@/components/NavbarWrapper'
import * as demo from '@/sanity/lib/demo'
import {sanityFetch, SanityLive} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {handleError} from '@/app/client-utils'
import {settingsId, SITE_ORIGIN, type Locale} from '@/lib/i18n'

async function requestLocale(): Promise<Locale> {
  return (await headers()).get('x-oclaw-locale') === 'es' ? 'es' : 'en'
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale()
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    params: {id: settingsId(locale)},
    // Metadata should never contain stega
    stega: false,
  })
  const title = settings?.title || demo.title
  const description = settings?.description || demo.description

  const ogImage = resolveOpenGraphImage(settings?.ogImage)
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    openGraph: {
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      images: ogImage ? [ogImage] : [],
    },
  }
}

const mulish = Mulish({
  variable: '--font-mulish',
  subsets: ['latin'],
  display: 'swap',
})

const dmSerifText = DM_Serif_Text({
  variable: '--font-dm-serif-text',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {isEnabled: isDraftMode} = await draftMode()
  const locale = await requestLocale()

  return (
    <html lang={locale} className={`${mulish.variable} ${dmSerifText.variable}`}>
      <body>
        <SmoothScrollProvider>
          <section className="min-h-screen pt-[var(--site-header-height)]">
            {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
            <Toaster />
            {isDraftMode && (
              <>
                <DraftModeToast />
                {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
                <VisualEditing />
              </>
            )}
            {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
            <SanityLive onError={handleError} />
            <NavbarWrapper locale={locale} />
            <main className="">{children}</main>
            <Footer locale={locale} />
          </section>
        </SmoothScrollProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
