import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const host = req.headers.get('host') ?? ''
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const origin = host && !host.includes('localhost')
    ? `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? '')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=lien_invalide`)
}
