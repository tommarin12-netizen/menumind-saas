import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/god-mode']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!PROTECTED.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Supabase stocke le token dans un cookie sb-<project>-auth-token
  const hasSession = req.cookies.getAll().some(c =>
    c.name.includes('-auth-token') && c.value.length > 10
  )

  if (!hasSession) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/god-mode/:path*'],
}
