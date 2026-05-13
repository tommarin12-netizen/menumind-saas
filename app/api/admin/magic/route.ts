import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SECRET         = 'mm_creator_tom_2024'
const CREATOR_EMAIL  = 'tom.marin12@gmail.com'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${req.headers.get('x-forwarded-proto') ?? 'https'}://${req.headers.get('host')}`

  // 1. Créer ou récupérer le user
  let userId: string
  const { data: listData } = await supabase.auth.admin.listUsers()
  const existing = listData?.users?.find((u: { email?: string }) => u.email === CREATOR_EMAIL)

  if (existing) {
    userId = existing.id
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: CREATOR_EMAIL,
      email_confirm: true,
    })
    if (error || !newUser?.user) {
      return NextResponse.json({ error: `createUser: ${error?.message}` }, { status: 500 })
    }
    userId = newUser.user.id
  }

  // 2. S'assurer que has_access = true
  await supabase.from('customers').upsert({
    user_id: userId,
    email: CREATOR_EMAIL,
    stripe_customer_id: 'creator_free',
    stripe_payment_id: 'creator_free',
    has_access: true,
    plan: 'annual',
  }, { onConflict: 'email' })

  // 3. Générer un magic link de connexion directe
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: CREATOR_EMAIL,
    options: { redirectTo: `${origin}/auth/callback?next=/dashboard` },
  })

  if (linkErr || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: `generateLink: ${linkErr?.message}` }, { status: 500 })
  }

  return NextResponse.json({ url: linkData.properties.action_link })
}
