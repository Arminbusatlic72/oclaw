import BlogArchive, {getArchiveMetadata} from '@/app/components/BlogArchive'
type Props = {searchParams: Promise<{page?: string; search?: string; category?: string; tag?: string}>}
export const dynamic = 'force-dynamic'
export async function generateMetadata({searchParams}: Props) { return getArchiveMetadata('es', (await searchParams).page) }
export default async function Page({searchParams}: Props) { const params = await searchParams; return <BlogArchive locale="es" rawPage={params.page} search={params.search} category={params.category} tag={params.tag} /> }
