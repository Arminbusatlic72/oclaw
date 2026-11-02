import type {Metadata} from 'next'

import ResourcesPage from '@/app/components/ResourcesPage'

export const metadata: Metadata = {
  title: 'Immigration Resources',
  description:
    'Free immigration guides from OC Law Group covering next steps after filing Forms I-485, I-360, I-589, and I-130.',
  alternates: {
    canonical: '/resources/',
    languages: {'en': '/resources/', 'es': '/es/recursos/', 'x-default': '/resources/'},
  },
}

export default function Page() {
  return <ResourcesPage locale="en" />
}
