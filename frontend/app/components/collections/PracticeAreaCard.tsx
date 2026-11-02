import Link from 'next/link'
import Image from '@/app/components/SanityImage'
import {
  BadgeCheck,
  Baby,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  FileHeart,
  FileCheck,
  Fingerprint,
  Globe,
  HandHelping,
  Handshake,
  Heart,
  HeartHandshake,
  House,
  IdCard,
  KeyRound,
  Landmark,
  Languages,
  MapPinned,
  Plane,
  Network,
  ScrollText,
  Scale,
  Shield,
  Stamp,
  GraduationCap,
  UserRound,
  UserCheck,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import {collectionPath} from '@/lib/collections'
import type {Locale} from '@/lib/i18n'

const iconLibrary = {
  briefcase: BriefcaseBusiness,
  people: UsersRound,
  family: Handshake,
  shield: Shield,
  globe: Globe,
  plane: Plane,
  home: House,
  landmark: Landmark,
  document: FileCheck,
  helpingHand: HandHelping,
  person: UserRound,
  scales: Scale,
  building: Building2,
  badge: BadgeCheck,
  stamp: Stamp,
  fingerprint: Fingerprint,
  idCard: IdCard,
  gavel: Scale,
  education: GraduationCap,
  child: Baby,
  humanRights: HeartHandshake,
  investment: CircleDollarSign,
  map: MapPinned,
  personCheck: UserCheck,
  community: Network,
  languages: Languages,
  wallet: WalletCards,
  scrollText: ScrollText,
  legalGuide: BookOpenCheck,
  key: KeyRound,
  relief: Heart,
  familyPetition: FileHeart,
}

export type PracticeAreaCardData = {_id: string; title: string | null; slug: string | null; shortDescription?: string | null; iconName?: string | null; icon?: {asset?: {_ref?: string} | null; alt?: string | null} | null}
export default function PracticeAreaCard({area, locale}: {area: PracticeAreaCardData; locale: Locale}) {
  if (!area.slug) return null
  const href = collectionPath('practiceArea', locale, area.slug)
  const LibraryIcon = area.iconName && area.iconName in iconLibrary ? iconLibrary[area.iconName as keyof typeof iconLibrary] : null
  const content = <><span className="practice-card-icon">{LibraryIcon ? <LibraryIcon size={48} strokeWidth={1.3} aria-hidden="true" /> : area.icon?.asset?._ref ? <Image id={area.icon.asset._ref} alt={area.icon.alt || ''} width={64} className="h-14 w-14 object-contain" /> : <Scale size={48} strokeWidth={1.3} aria-hidden="true" />}</span><h3>{area.title}</h3>{area.shortDescription && <p>{area.shortDescription}</p>}</>
  return <article className="practice-card"><Link href={href} className="practice-card-link">{content}</Link></article>
}
