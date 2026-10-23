import {CollectionDetail, detailMetadata} from '@/app/components/collections/CollectionRoute'
type Props = {params: Promise<{slug: string}>}
export const dynamic = 'force-dynamic'
export async function generateMetadata({params}: Props) {return detailMetadata('attorney', 'en', (await params).slug)}
export default async function Page({params}: Props) {return <CollectionDetail type="attorney" locale="en" slug={(await params).slug} />}
