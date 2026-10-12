import Navbar from '@/components/Navbar'
import {getNavigation} from '@/lib/queries/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'

/** Server component wrapper that fetches Sanity navigation data. */
export default async function NavbarWrapper() {
  const [navigation, settingsResult] = await Promise.all([
    getNavigation(),
    sanityFetch({query: settingsQuery}),
  ])

  return <Navbar data={navigation} siteTitle={settingsResult.data?.title} />
}
