import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {englishCanonicalPath} from './lib/i18n'

export function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl
  const englishPath = englishCanonicalPath(pathname)
  if (englishPath) {
    const destination = request.nextUrl.clone()
    destination.pathname = englishPath
    return NextResponse.redirect(destination, 308)
  }

  const headers = new Headers(request.headers)
  headers.set('x-oclaw-locale', pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en')
  headers.set('x-oclaw-path', pathname)
  return NextResponse.next({request: {headers}})
}

export const config = {
  matcher: ['/en/:path*', '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}
