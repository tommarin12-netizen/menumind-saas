import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { menu, couverts, restaurant } = await req.json()

  // Extraire tous les plats du menu
  const plats: string[] = []
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
  for (const jour of jours) {
    const j = menu.jours?.[jour]
    if (!j) continue
    if (j.midi?.entree) plats.push(`${j.midi.entree} (entrée midi ${jour})`)
    if (j.midi?.plat) plats.push(`${j.midi.plat} (plat midi ${jour})`)
    if (j.midi?.dessert) plats.push(`${j.midi.dessert} (dessert midi ${jour})`)
    if (j.soir?.entree) plats.push(`${j.soir.entree} (entrée soir ${jour})`)
    if (j.soir?.plat) plats.push(`${j.soir.plat} (plat soir ${jour})`)
    if (j.soir?.dessert) plats.push(`${j.soir.dessert} (dessert soir ${jour})`)
  }

  const prompt = `Tu es un chef gestionnaire de restaurant. Génère la liste de courses pour la semaine.

Restaurant : ${restaurant}
Couverts moyens par service : ${couverts || 50}
Plats de la semaine :
${plats.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Génère une liste de courses consolidée, en regroupant les quantités identiques.
Retourne UNIQUEMENT ce JSON :
{
  "categories": [
    {
      "nom": "Viandes & Volailles",
      "emoji": "🥩",
      "items": [
        { "produit": "Agneau (gigot)", "quantite": "8 kg", "note": "Lundi soir + Mardi soir" }
      ]
    },
    { "nom": "Poissons & Fruits de mer", "emoji": "🐟", "items": [] },
    { "nom": "Légumes & Fruits", "emoji": "🥦", "items": [] },
    { "nom": "Produits laitiers & Œufs", "emoji": "🧀", "items": [] },
    { "nom": "Épicerie & Condiments", "emoji": "🫙", "items": [] },
    { "nom": "Herbes & Épices", "emoji": "🌿", "items": [] }
  ]
}
Les quantités sont adaptées pour ${couverts || 50} couverts par service.
Exclure les catégories vides. Retourne UNIQUEMENT le JSON.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Réponse invalide')
    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 })
  }
}
