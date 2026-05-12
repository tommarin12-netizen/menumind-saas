import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { plan } = await req.json()
  const isAnnual = plan === 'annual'

  const priceId = isAnnual
    ? process.env.STRIPE_PRICE_ID_ANNUAL!
    : process.env.STRIPE_PRICE_ID_MONTHLY!

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    billing_address_collection: 'auto',
    locale: 'fr',
    metadata: { product: 'menumind', plan: isAnnual ? 'annual' : 'monthly' },
  })

  return NextResponse.json({ url: session.url })
}
