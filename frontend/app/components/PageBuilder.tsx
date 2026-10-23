import BlockRenderer from '@/app/components/BlockRenderer'
import type {GetPageQueryResult} from '@/sanity.types'

export default function PageBuilder({page}: {page: GetPageQueryResult}) {
  if (!page) return null
  return <div>{page.pageBuilder?.map((block, index) => <BlockRenderer key={block._key} block={block} index={index} pageId={page._id} pageType={page._type} locale={page.language === 'es' ? 'es' : 'en'} />)}</div>
}
