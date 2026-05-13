import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const SECRET = 'mm_creator_tom_2024'
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Simule exactement ce que fait le webhook Stripe après un paiement réussi.
 * Usage : POST /api/admin/simulate-payment
 * Body  : { token: "mm_creator_tom_2024", email: "test@example.com", plan: "monthly" }
 */
export async function POST(req: NextRequest) {
  const { token, email, plan = 'monthly' } = await req.json()

  if (token !== SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'https://menumind.fr'

  // 1. Créer ou récupérer le user
  let userId: string
  const { data: listData } = await supabase.auth.admin.listUsers()
  const existing = listData?.users?.find((u: { email?: string }) => u.email === email)

  if (existing) {
    userId = existing.id
    await supabase.from('customers').upsert({
      user_id: userId, email,
      stripe_customer_id: 'sim_test',
      stripe_payment_id: 'sim_test',
      has_access: true, plan,
    }, { onConflict: 'email' })
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email, email_confirm: true,
    })
    if (error || !newUser?.user) {
      return NextResponse.json({ error: error?.message }, { status: 500 })
    }
    userId = newUser.user.id
    await supabase.from('customers').insert({
      user_id: userId, email,
      stripe_customer_id: 'sim_test',
      stripe_payment_id: 'sim_test',
      has_access: true, plan,
    })
  }

  // 2. Générer un magic link
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${origin}/auth/callback?next=/dashboard` },
  })
  if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 })

  const loginUrl = linkData?.properties?.action_link ?? `${origin}/login`
  const planLabel = plan === 'annual' ? 'Annuel' : 'Mensuel'

  // 3. Envoyer l'email (même template que le vrai webhook)
  await resend.emails.send({
    from: `MenuMind <${process.env.RESEND_FROM_EMAIL}>`,
    to: email,
    subject: 'Bienvenue sur MenuMind - Votre acces est pret',
    html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f7f3ee;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,17,9,.08);">
    <div style="background:linear-gradient(135deg,#c75c32,#e8874a);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:400;font-style:italic;">Menu<strong style="font-style:normal;">Mind</strong></h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Votre assistant culinaire est prêt</p>
    </div>
    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 12px;font-size:22px;color:#1c1109;">Bienvenue !</h2>
      <p style="font-size:15px;color:#5a3d28;line-height:1.7;margin-bottom:28px;">
        Abonnement <strong>${planLabel}</strong> activé. Cliquez ci-dessous pour accéder à votre espace :
      </p>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${loginUrl}" style="display:inline-block;background:#c75c32;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 36px;border-radius:12px;">
          Accéder à MenuMind →
        </a>
      </div>
      <p style="font-size:12px;color:#9a7860;text-align:center;">Lien valable 24h.</p>
    </div>
  </div>
</body></html>`,
  })

  return NextResponse.json({ ok: true, email, plan, loginUrl })
}
