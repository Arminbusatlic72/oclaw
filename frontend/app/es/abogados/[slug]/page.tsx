import {CollectionDetail, detailMetadata} from '@/app/components/collections/CollectionRoute'
type Props = {params: Promise<{slug: string}>}
export const dynamic = 'force-dynamic'
export async function generateMetadata({params}: Props) {return detailMetadata('attorney', 'es', (await params).slug)}
export default async function Page({params}: Props) {return <CollectionDetail type="attorney" locale="es" slug={(await params).slug} />}
