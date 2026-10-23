import {CollectionArchive, archiveMetadata} from '@/app/components/collections/CollectionRoute'
export const dynamic = 'force-dynamic'
export async function generateMetadata() {return archiveMetadata('attorney', 'en')}
export default function Page() {return <CollectionArchive type="attorney" locale="en" />}
