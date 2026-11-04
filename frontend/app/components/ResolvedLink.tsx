'use client'

import Link from 'next/link'
import {forwardRef, type AnchorHTMLAttributes, type Ref} from 'react'

import {CalendlyPopupTrigger} from '@/app/components/blocks/CalendlyBookingClient'
import {calendlyOptionsFromAction} from '@/lib/calendly'
import type {Locale} from '@/lib/i18n'
import {linkResolver} from '@/sanity/lib/utils'
import {DereferencedLink} from '@/sanity/lib/types'

interface ResolvedLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  link: DereferencedLink
  locale?: Locale
}

const ResolvedLink = forwardRef<HTMLAnchorElement | HTMLButtonElement, ResolvedLinkProps>(function ResolvedLink(
  {link, children, className, locale = 'en', ...props},
  ref,
) {
  if (link.linkType === 'calendly') {
    const options = calendlyOptionsFromAction(link, locale)
    if (!options.length) {
      return <span className={className} aria-disabled="true">{children}</span>
    }

    return (
      <CalendlyPopupTrigger
        ref={ref as Ref<HTMLButtonElement>}
        className={className}
        options={options}
        locale={locale}
        privacyNotice={link.calendlyPrivacyNotice}
        fallbackLinkLabel={link.calendlyFallbackLinkLabel}
        aria-label={props['aria-label']}
      >
        {children}
      </CalendlyPopupTrigger>
    )
  }

  // resolveLink() is used to determine the type of link and return the appropriate URL.
  const resolvedLink = linkResolver(link)

  if (typeof resolvedLink === 'string') {
    return (
      <Link
        href={resolvedLink}
        target={link?.openInNewTab ? '_blank' : undefined}
        rel={link?.openInNewTab ? 'noopener noreferrer' : undefined}
        className={className}
        ref={ref as Ref<HTMLAnchorElement>}
        {...props}
      >
        {children}
      </Link>
    )
  }
  return <span className={className} aria-disabled="true">{children}</span>
})

ResolvedLink.displayName = 'ResolvedLink'

export default ResolvedLink
