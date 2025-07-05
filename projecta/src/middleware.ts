import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware executado', request.nextUrl.pathname)
  // Rotas que requerem autenticação
  // const protectedRoutes = ['/apk']

  // // Rotas que são apenas para usuários não autenticados
  // const authRoutes = ['/auth/login', '/auth/register']

  // const { pathname } = request.nextUrl

  // // Verificar se é uma rota protegida
  // const isProtectedRoute = protectedRoutes.some(route =>
  //   pathname.startsWith(route)
  // )

  // // Verificar se é uma rota de autenticação
  // const isAuthRoute = authRoutes.some(route =>
  //   pathname.startsWith(route)
  // )

  // Para rotas protegidas e de auth, deixaremos o JavaScript do lado cliente
  // fazer a verificação, pois o middleware não tem acesso ao estado do Firebase Auth

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/apk/:path*',
    '/auth/:path*'
  ]
}
