import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


// Implementarei já a seguir, esse comentario é só para lembrar
export function middleware(request: NextRequest) {
  console.log('Middleware executado', request.nextUrl.pathname)
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/apk/:path*',
    '/auth/:path*'
  ]
}
