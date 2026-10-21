import type {FooterQueryResult} from '@/sanity.types'

export type FooterData = NonNullable<FooterQueryResult>
export type FooterBlock = NonNullable<FooterData['blocks']>[number]
export type FooterBrandBlock = Extract<FooterBlock, {_type: 'footerBrand'}>
export type FooterContactBlock = Extract<FooterBlock, {_type: 'footerContact'}>
export type FooterLinkGroupBlock = Extract<FooterBlock, {_type: 'footerLinkGroup'}>
export type FooterSocialBlock = Extract<FooterBlock, {_type: 'footerSocial'}>
export type FooterWorkingHoursBlock = Extract<FooterBlock, {_type: 'footerWorkingHours'}>

export type FooterLinkItem = {
  _key: string
  label: string
  link: FooterLinkGroupBlock['links'][number]['link']
}
