import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SECRET = 'mm_creator_tom_2024'
const CREATOR_EMAIL = 'tom.marin12@gmail.com'
const CREATOR_PASSWORD = 'MenuMindTom2024!'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Env vars manquantes', url: !!url, key: !!key }, { status: 500 })
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Récupère ou crée le user
  let userId: string
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) return NextResponse.json({ error: `listUsers: ${listErr.message}` }, { status: 500 })

  const existing = listData?.users?.find(u => u.email === CREATOR_EMAIL)

  if (existing) {
    userId = existing.id
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: CREATOR_EMAIL,
      email_confirm: true,
      password: CREATOR_PASSWORD,
    })
    if (createErr || !newUser?.user) {
      return NextResponse.json({ error: `createUser: ${createErr?.message}` }, { status: 500 })
    }
    userId = newUser.user.id
  }

  // Met à jour le password (dans tous les cas, même si le user existait)
  const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
    password: CREATOR_PASSWORD,
    email_confirm: true,
  })
  if (updateErr) return NextResponse.json({ error: `updateUser: ${updateErr.message}` }, { status: 500 })

  // Upsert accès premium
  await supabase.from('customers').upsert({
    user_id: userId,
    email: CREATOR_EMAIL,
    stripe_customer_id: 'creator_free',
    stripe_payment_id: 'creator_free',
    has_access: true,
    plan: 'annual',
  }, { onConflict: 'email' })

  // Redirige vers la page de connexion automatique
  const host = req.headers.get('host') ?? ''
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const origin = host && !host.includes('localhost')
    ? `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://menumind-saas-fh4c.vercel.app')

  return NextResponse.redirect(`${origin}/god-mode`)
}
