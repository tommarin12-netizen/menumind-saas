import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { plat, cuisine, couverts, stocks } = await req.json()

  const prompt = `Tu es un chef cuisinier professionnel. Génère une recette détaillée pour le plat suivant.

Plat : ${plat}
Type de cuisine : ${cuisine}
Nombre de couverts : ${couverts || 4}
${stocks ? `Produits à utiliser en priorité : ${stocks}` : ''}

Retourne UNIQUEMENT ce JSON :
{
  "nom": "nom exact du plat",
  "temps_prep": "ex: 20 min",
  "temps_cuisson": "ex: 45 min",
  "difficulte": "Facile | Moyen | Difficile",
  "ingredients": [
    "quantité + ingrédient (ex: 800g de filet de bœuf)",
    "..."
  ],
  "etapes": [
    "Étape courte et précise.",
    "..."
  ],
  "conseil_chef": "Un conseil professionnel court et pratique.",
  "vin": "accord mets-vins conseillé (optionnel)"
}

Les quantités doivent être adaptées pour ${couverts || 4} couverts.
Retourne UNIQUEMENT le JSON.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Recette invalide')

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
