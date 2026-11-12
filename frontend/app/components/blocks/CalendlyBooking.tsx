import CalendlyBookingClient from '@/app/components/blocks/CalendlyBookingClient'
import {calendlyOptionsFromAction} from '@/lib/calendly'
import type {Locale} from '@/lib/i18n'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type Block = ExtractPageBuilderType<'calendlyBooking'>

export default function CalendlyBooking({block, locale = 'en'}: {block: Block; locale?: Locale}) {
  // A block's explicit configuration always takes precedence over the site fallback.
  const useDefault = block.displayMode === 'appointment' && !block.eventUrl && !block.officeBookingOptions?.length
  const options = calendlyOptionsFromAction(
    {
      calendlyEventUrl: useDefault ? process.env.CONTACT_CALENDLY_EVENT_URL : block.eventUrl,
      calendlyOfficeBookingOptions: block.officeBookingOptions,
    },
    locale,
  )

  // Content editors can prepare the block before the client supplies a URL.
  // In that state it intentionally has no public output.
  if (!options.length) return null

  return <CalendlyBookingClient
    heading={block.heading}
    description={block.description}
    displayMode={block.displayMode || 'inline'}
    buttonLabel={block.buttonLabel}
    privacyNotice={block.privacyNotice}
    fallbackLinkLabel={block.fallbackLinkLabel}
    embedHeight={Math.min(1200, Math.max(600, block.embedHeight || 760))}
    options={options}
    locale={locale}
  />
}
