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

  // Crée le user s'il n'existe pas
  let userId: string
  const { data: existing } = await supabase.auth.admin.getUserByEmail(CREATOR_EMAIL).catch(() => ({ data: null }))

  if (existing?.user) {
    userId = existing.user.id
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: CREATOR_EMAIL,
      email_confirm: true,
    })
    if (createErr || !newUser?.user) {
      return NextResponse.json({ error: `Création user: ${createErr?.message}` }, { status: 500 })
    }
    userId = newUser.user.id
  }

  // Upsert customers
  await supabase.from('customers').upsert({
    user_id: userId,
    email: CREATOR_EMAIL,
    stripe_customer_id: 'creator_free',
    stripe_payment_id: 'creator_free',
    has_access: true,
    plan: 'annual',
  }, { onConflict: 'email' })

  // Génère le magic link
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: CREATOR_EMAIL,
    options: { redirectTo: `${origin}/dashboard` },
  })

  if (error || !data?.properties?.action_link) {
    return NextResponse.json({ error: `generateLink: ${error?.message}` }, { status: 500 })
  }

  const link = data.properties.action_link

  // Affiche le lien cliquable (pas de redirect pour éviter les problèmes)
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>MenuMind Admin</title>
    <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f7f3ee;}
    .box{background:#fff;border-radius:16px;padding:40px;max-width:500px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.1);}
    h2{margin:0 0 16px;color:#1c1109;}p{color:#9a7860;font-size:14px;margin-bottom:24px;}
    a{display:inline-block;background:#c75c32;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;}
    </style></head><body><div class="box">
    <h2>✅ Compte créateur prêt</h2>
    <p>Clique sur le bouton ci-dessous pour accéder au dashboard.<br>Lien valable 1h.</p>
    <a href="${link}">Accéder à MenuMind →</a>
    </div></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
