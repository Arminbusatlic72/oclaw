import type {Metadata} from 'next'

import ResourcesPage from '@/app/components/ResourcesPage'

export const metadata: Metadata = {
  title: 'Recursos de inmigración',
  description:
    'Guías gratuitas de inmigración de OC Law Group sobre los próximos pasos después de presentar los formularios I-485, I-360, I-589 e I-130.',
  alternates: {
    canonical: '/es/recursos/',
    languages: {'en': '/resources/', 'es': '/es/recursos/', 'x-default': '/resources/'},
  },
}

export default function Page() {
  return <ResourcesPage locale="es" />
}
