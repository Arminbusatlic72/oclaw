import BlogArchive, {getArchiveMetadata} from '@/app/components/BlogArchive'
type Props = {searchParams: Promise<{page?: string}>}
export const dynamic = 'force-dynamic'
export async function generateMetadata({searchParams}: Props) { return getArchiveMetadata('es', (await searchParams).page) }
export default async function Page({searchParams}: Props) { return <BlogArchive locale="es" rawPage={(await searchParams).page} /> }
