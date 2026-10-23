import {CollectionDetail, detailMetadata} from '@/app/components/collections/CollectionRoute'
type Props = {params: Promise<{slug: string}>}
export const dynamic = 'force-dynamic'
export async function generateMetadata({params}: Props) {return detailMetadata('practiceArea', 'en', (await params).slug)}
export default async function Page({params}: Props) {return <CollectionDetail type="practiceArea" locale="en" slug={(await params).slug} />}
