import {page} from './documents/page'
import {navigation} from './documents/navigation'
import {callToAction} from './objects/callToAction'
import {card} from './objects/card'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {heroSlider} from './blocks/heroSlider'
import {cardGrid} from './blocks/cardGrid'
import {processSteps} from './blocks/processSteps'
import {parallaxFeatures} from './blocks/parallaxFeatures'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  page,
  navigation,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  heroSlider,
  card,
  cardGrid,
  processSteps,
  parallaxFeatures,
  link,
]
