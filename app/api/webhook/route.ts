import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── Paiement réussi : activer l'accès ───────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_details?.email
    if (!email) return NextResponse.json({ ok: true })

    const plan = (session.metadata?.plan ?? 'monthly') as string
    const subscriptionId = session.subscription as string

    // Créer ou récupérer l'utilisateur Supabase
    let userId: string
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email).catch(() => ({ data: null }))

    if (existingUser?.user) {
      userId = existingUser.user.id
      await supabase.from('customers').upsert({
        user_id: userId,
        email,
        stripe_customer_id: session.customer as string,
        stripe_payment_id: subscriptionId,
        has_access: true,
        plan,
      }, { onConflict: 'email' })
    } else {
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      })
      if (error || !newUser.user) {
        console.error('Erreur création utilisateur:', error)
        return NextResponse.json({ error: 'Création utilisateur échouée' }, { status: 500 })
      }
      userId = newUser.user.id
      await supabase.from('customers').insert({
        user_id: userId,
        email,
        stripe_customer_id: session.customer as string,
        stripe_payment_id: subscriptionId,
        has_access: true,
        plan,
      })
    }

    // Magic link de connexion
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard` },
    })
    const hashedToken = linkData?.properties?.hashed_token
    const loginUrl = hashedToken
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/dashboard`
      : `${process.env.NEXT_PUBLIC_APP_URL}/login`
    const planLabel = plan === 'annual' ? 'Annuel' : 'Mensuel'

    await resend.emails.send({
      from: `MenuMind <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: 'Bienvenue sur MenuMind - Votre acces est pret',
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f3ee;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,17,9,.08);">
    <div style="background:linear-gradient(135deg,#c75c32,#e8874a);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:400;font-style:italic;">Menu<strong style="font-style:normal;">Mind</strong></h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Votre assistant culinaire est pr&ecirc;t</p>
    </div>
    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 12px;font-size:22px;color:#1c1109;font-weight:500;">Bienvenue !</h2>
      <p style="margin:0 0 8px;font-size:15px;color:#5a3d28;line-height:1.7;">
        Merci pour votre abonnement <strong>${planLabel}</strong>. Votre acc&egrave;s &agrave; <strong>MenuMind</strong> est activ&eacute;.
      </p>
      <p style="margin:0 0 28px;font-size:15px;color:#5a3d28;line-height:1.7;">
        Cliquez sur le bouton ci-dessous pour acc&eacute;der &agrave; votre espace :
      </p>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${loginUrl}" style="display:inline-block;background:#c75c32;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 36px;border-radius:12px;box-shadow:0 4px 16px rgba(199,92,50,.3);">
          Acc&eacute;der &agrave; MenuMind &rarr;
        </a>
      </div>
      <p style="margin:0 0 4px;font-size:12px;color:#9a7860;text-align:center;">
        Ce lien est valable 24h. Si vous ne l&apos;avez pas demand&eacute;, ignorez cet email.
      </p>
    </div>
    <div style="background:#f0e9e0;padding:18px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9a7860;">
        Une question ? Répondez directement à cet email.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })
  }

  // ── Abonnement résilié : révoquer l'accès ───────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    await supabase
      .from('customers')
      .update({ has_access: false })
      .eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ ok: true })
}
