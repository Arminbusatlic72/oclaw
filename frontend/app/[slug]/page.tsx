import ContentRoute, {contentMetadata} from '@/app/components/ContentRoute'
import {sanityFetch} from '@/sanity/lib/live'
import {pagesSlugs} from '@/sanity/lib/queries'
type Props = {params: Promise<{slug: string}>}
export const dynamic = 'force-dynamic'
export async function generateStaticParams() {
  const {data} = await sanityFetch({query: pagesSlugs, params: {language: 'en'}, perspective: 'published', stega: false})
  return data
}
export async function generateMetadata({params}: Props) {return contentMetadata((await params).slug, 'en')}
export default async function Page({params}: Props) {return <ContentRoute slug={(await params).slug} locale="en" />}
