import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { plan } = await req.json()
  const isAnnual = plan === 'annual'

  const priceId = isAnnual
    ? process.env.STRIPE_PRICE_ID_ANNUAL!
    : process.env.STRIPE_PRICE_ID_MONTHLY!

  // Utilise l'URL de la requête comme fallback si NEXT_PUBLIC_APP_URL est absent
  const origin = process.env.NEXT_PUBLIC_APP_URL ||
    `${req.headers.get('x-forwarded-proto') ?? 'https'}://${req.headers.get('host')}`

  if (!priceId) {
    return NextResponse.json({ error: `STRIPE_PRICE_ID_${isAnnual ? 'ANNUAL' : 'MONTHLY'} manquant` }, { status: 500 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      billing_address_collection: 'auto',
      locale: 'fr',
      metadata: { product: 'menumind', plan: isAnnual ? 'annual' : 'monthly' },
    })
    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur Stripe inconnue'
    console.error('Stripe error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
