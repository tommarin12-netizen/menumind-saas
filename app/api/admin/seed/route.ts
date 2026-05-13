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

  // Récupère ou crée le user Supabase
  let userId: string

  const { data: existing } = await supabase.auth.admin
    .getUserByEmail(CREATOR_EMAIL)
    .catch(() => ({ data: null }))

  if (existing?.user) {
    userId = existing.user.id
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: CREATOR_EMAIL,
      email_confirm: true,
    })
    if (error || !newUser?.user) {
      return NextResponse.json({ error: error?.message ?? 'Création impossible' }, { status: 500 })
    }
    userId = newUser.user.id
  }

  // Upsert dans customers avec accès premium
  const { error: upsertErr } = await supabase.from('customers').upsert({
    user_id: userId,
    email: CREATOR_EMAIL,
    stripe_customer_id: 'creator_free',
    stripe_payment_id: 'creator_free',
    has_access: true,
    plan: 'annual',
  }, { onConflict: 'email' })

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    message: `✅ Compte créateur activé pour ${CREATOR_EMAIL}`,
    userId,
  })
}
