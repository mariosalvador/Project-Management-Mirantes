import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const privateRoutes = [
  '/apk'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  if (privateRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/auth/') && token) {
    return NextResponse.redirect(new URL('/apk', request.url))
  }

  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/apk', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ]
}
