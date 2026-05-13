import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SECRET = 'mm_creator_tom_2024'
const CREATOR_EMAIL = 'tom.marin12@gmail.com'
const CREATOR_PASSWORD = 'MenuMindTom2024!'
const resend = new Resend(process.env.RESEND_API_KEY)

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

// POST /api/admin/login — simule un paiement Stripe (test sans débiter)
export async function POST(req: NextRequest) {
  const { token, email, plan = 'monthly' } = await req.json()
  if (token !== SECRET || !email) {
    return NextResponse.json({ error: 'Non autorisé ou email manquant' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'https://menumind-saas-fh4c.vercel.app'

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Créer ou récupérer le user
  let userId: string
  const { data: listData } = await supabase.auth.admin.listUsers()
  const existing = listData?.users?.find((u: { email?: string }) => u.email === email)

  if (existing) {
    userId = existing.id
    await supabase.from('customers').upsert({
      user_id: userId, email,
      stripe_customer_id: 'sim_test', stripe_payment_id: 'sim_test',
      has_access: true, plan,
    }, { onConflict: 'email' })
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({ email, email_confirm: true })
    if (error || !newUser?.user) return NextResponse.json({ error: error?.message }, { status: 500 })
    userId = newUser.user.id
    await supabase.from('customers').insert({
      user_id: userId, email,
      stripe_customer_id: 'sim_test', stripe_payment_id: 'sim_test',
      has_access: true, plan,
    })
  }

  // Générer un magic link
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink', email,
    options: { redirectTo: `${origin}/auth/callback?next=/dashboard` },
  })
  if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 })
  const loginUrl = linkData?.properties?.action_link ?? `${origin}/login`

  // Envoyer l'email
  await resend.emails.send({
    from: `MenuMind <${process.env.RESEND_FROM_EMAIL}>`,
    to: email,
    subject: 'Bienvenue sur MenuMind - Votre acces est pret',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:40px auto;padding:32px;background:#fff;border-radius:12px;">
      <h2 style="color:#c75c32;">Bienvenue sur MenuMind !</h2>
      <p>Abonnement <strong>${plan}</strong> activé.</p>
      <a href="${loginUrl}" style="display:inline-block;margin-top:16px;background:#c75c32;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Accéder à MenuMind →</a>
      <p style="margin-top:16px;font-size:12px;color:#999;">Lien valable 24h.</p>
    </div>`,
  })

  return NextResponse.json({ ok: true, email, plan, loginUrl })
}
