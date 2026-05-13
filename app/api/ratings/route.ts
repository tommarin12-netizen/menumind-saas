import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Sauvegarder une note (utilisateur connecté)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { dish_name, stars, cuisine } = await req.json()
  if (!dish_name || !stars) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  const { error } = await supabase.from('recipe_ratings').upsert({
    user_id: user.id,
    dish_name,
    stars,
    cuisine,
  }, { onConflict: 'user_id,dish_name' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Stats publiques (pour la landing page)
export async function GET() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('recipe_ratings')
    .select('dish_name, stars, cuisine')
    .order('created_at', { ascending: false })

  if (error || !data) return NextResponse.json({ avg: 0, total: 0, top: [] })

  const total = data.length
  const avg = total ? Math.round((data.reduce((s: number, r: { stars: number }) => s + r.stars, 0) / total) * 10) / 10 : 0

  // Top plats : moyenne pondérée par nb de notes
  const byDish: Record<string, { sum: number; count: number }> = {}
  for (const r of data) {
    if (!byDish[r.dish_name]) byDish[r.dish_name] = { sum: 0, count: 0 }
    byDish[r.dish_name].sum += r.stars
    byDish[r.dish_name].count++
  }
  const top = Object.entries(byDish)
    .filter(([, v]) => v.count >= 1)
    .map(([name, v]) => ({ name, avg: Math.round((v.sum / v.count) * 10) / 10, count: v.count }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count)
    .slice(0, 5)

  return NextResponse.json({ avg, total, top })
}
