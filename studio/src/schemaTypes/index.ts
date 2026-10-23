import {page} from './documents/page'
import {blogPost} from './documents/blogPost'
import {blogArchive} from './singletons/blogArchive'
import {blogBody} from './objects/blogBody'
import {navigation} from './documents/navigation'
import {footer} from './documents/footer'
import {callToAction} from './objects/callToAction'
import {card} from './objects/card'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {heroSlider} from './blocks/heroSlider'
import {cardGrid} from './blocks/cardGrid'
import {processSteps} from './blocks/processSteps'
import {parallaxFeatures} from './blocks/parallaxFeatures'
import {whyChooseUs} from './blocks/whyChooseUs'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {seo} from './objects/seo'
import {footerBrand} from './footer/footerBrand'
import {footerContact} from './footer/footerContact'
import {footerLink} from './footer/footerLink'
import {footerLinkGroup} from './footer/footerLinkGroup'
import {footerSocial} from './footer/footerSocial'
import {footerWorkingHours} from './footer/footerWorkingHours'
import {practiceArea} from './documents/practiceArea'
import {attorney} from './documents/attorney'
import {office} from './documents/office'
import {practiceAreaArchive} from './singletons/practiceAreaArchive'
import {practiceAreasSection} from './blocks/practiceAreasSection'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  blogArchive,
  practiceAreaArchive,
  // Documents
  page,
  blogPost,
  practiceArea,
  attorney,
  office,
  navigation,
  footer,
  // Objects
  footerBrand,
  footerContact,
  footerLink,
  footerLinkGroup,
  footerSocial,
  footerWorkingHours,
  button,
  blockContent,
  blogBody,
  blockContentTextOnly,
  infoSection,
  callToAction,
  heroSlider,
  card,
  cardGrid,
  processSteps,
  parallaxFeatures,
  whyChooseUs,
  practiceAreasSection,
  link,
  seo,
]
