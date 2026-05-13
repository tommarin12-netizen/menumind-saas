import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ ready: false })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const email = session.customer_details?.email
    if (!email) return NextResponse.json({ ready: false })

    const supabase = createAdminClient()
    const { data } = await supabase
      .from('customers')
      .select('has_access, plan')
      .eq('email', email)
      .single()

    return NextResponse.json({
      ready: data?.has_access === true,
      email,
      plan: data?.plan ?? null,
    })
  } catch {
    return NextResponse.json({ ready: false })
  }
}
