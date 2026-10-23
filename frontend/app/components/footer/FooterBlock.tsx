import type {Locale} from '@/lib/i18n'
import FooterBrand from './FooterBrand'
import FooterContact from './FooterContact'
import FooterLinkGroup from './FooterLinkGroup'
import FooterSocial from './FooterSocial'
import FooterWorkingHours from './FooterWorkingHours'
import type {FooterBlock as FooterBlockType} from './types'

export default function FooterBlock({block, locale}: {block: FooterBlockType; locale: Locale}) {
  switch (block._type) {
    case 'footerBrand':
      return <FooterBrand block={block} locale={locale} />
    case 'footerContact':
      return <FooterContact block={block} locale={locale} />
    case 'footerWorkingHours':
      return <FooterWorkingHours block={block} />
    case 'footerSocial':
      return <FooterSocial block={block} />
    case 'footerLinkGroup':
      return <FooterLinkGroup block={block} />
    default:
      return null
  }
}
