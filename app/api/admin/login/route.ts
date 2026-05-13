import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SECRET = 'mm_creator_tom_2024'
const CREATOR_EMAIL = 'tom.marin12@gmail.com'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const origin = process.env.NEXT_PUBLIC_APP_URL ||
    `${req.headers.get('x-forwarded-proto') ?? 'https'}://${req.headers.get('host')}`

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: CREATOR_EMAIL,
    options: { redirectTo: `${origin}/dashboard` },
  })

  if (error || !data?.properties?.action_link) {
    return NextResponse.json({ error: error?.message ?? 'Lien impossible' }, { status: 500 })
  }

  // Redirige directement vers le magic link — pas besoin d'email
  return NextResponse.redirect(data.properties.action_link)
}
