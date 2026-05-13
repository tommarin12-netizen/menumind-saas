import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token_hash = searchParams.get('token_hash')
  const type = (searchParams.get('type') ?? 'magiclink') as 'magiclink' | 'email'
  const next = searchParams.get('next') ?? '/dashboard'

  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host = req.headers.get('host') ?? ''
  const origin = `${proto}://${host}`

  if (!token_hash) {
    return NextResponse.redirect(`${origin}/login?error=lien_invalide`)
  }

  // Prépare la réponse de redirection AVANT de vérifier,
  // pour pouvoir setter les cookies de session dessus
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    console.error('verifyOtp error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=lien_invalide`)
  }

  return response
}
