import Link from 'next/link'

import type {Locale} from '@/lib/i18n'

const COPYRIGHT_OWNER = 'OC Law Group'

export default function CopyrightFooter({locale}: {locale: Locale}) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-2">
      <p className="site-footer-copyright">
        Copyright &copy; {currentYear} {COPYRIGHT_OWNER}
      </p>
      <Link href="/privacy-policy/" hrefLang="en" className="underline underline-offset-4">
        {locale === 'es' ? 'Política de privacidad' : 'Privacy Policy'}
      </Link>
    </div>
  )
}
