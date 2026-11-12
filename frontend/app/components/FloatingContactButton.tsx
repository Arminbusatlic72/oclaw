'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {MessageCircle} from 'lucide-react'

import {dictionary, localePath, type Locale} from '@/lib/i18n'
import styles from './FloatingContactButton.module.css'

export default function FloatingContactButton({locale}: {locale: Locale}) {
  const pathname = usePathname()
  const href = localePath(locale, locale === 'es' ? 'contacto' : 'contact')

  if (pathname?.replace(/\/+$/, '') === href.replace(/\/+$/, '')) return null

  return (
    <Link href={href} className={`${styles.button} floating-contact-button`} aria-label={dictionary[locale].contactUs}>
      <MessageCircle aria-hidden="true" size={20} strokeWidth={1.75} />
      <span>{dictionary[locale].contactUs}</span>
    </Link>
  )
}
