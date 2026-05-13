import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `Tu es un chef consultant expert en gestion de restaurant. Tu génères des menus de la semaine professionnels et optimisés.

Pour chaque demande, tu retournes UNIQUEMENT un JSON valide avec cette structure exacte :
{
  "analyse": "analyse globale du menu en 2-3 phrases (rentabilité, cohérence, adaptation)",
  "conseil": "conseil pratique de la semaine pour le restaurateur",
  "economie": "estimation des pertes évitées ex: ~150€ ou null si non estimable",
  "alertes": ["alerte 1 si besoin", "alerte 2"] ou [],
  "propositions": [
    {
      "produit": "nom du produit périssable exactement comme écrit par le restaurateur",
      "emoji": "emoji représentant ce produit",
      "nb_plats": 3,
      "plats": ["Nom du plat — Lundi midi", "Nom du plat — Mercredi soir"]
    }
  ],
  "jours": {
    "Lundi": {
      "midi": { "entree": "nom du plat", "plat": "nom du plat", "dessert": "nom du plat", "prix": "fourchette ex: 14-16€" },
      "soir": { "entree": "nom du plat", "plat": "nom du plat", "dessert": "nom du plat", "prix": "fourchette ex: 18-22€" }
    },
    "Mardi": { "midi": {}, "soir": {} },
    "Mercredi": { "midi": {}, "soir": {} },
    "Jeudi": { "midi": {}, "soir": {} },
    "Vendredi": { "midi": {}, "soir": {} }
  }
}

Règles :
- Le champ "propositions" liste CHAQUE produit périssable/stock mentionné par le restaurateur, avec tous les plats de la semaine qui l'utilisent
- Si aucun stock n'est mentionné, "propositions" = []
- Variété entre les jours (pas de répétitions)
- Cohérence avec le type de cuisine indiqué
- Tenir compte de la météo pour adapter les plats (chauds/légers)
- Respecter les allergènes à exclure
- Optimiser selon le budget matière
- Utiliser les stocks à écouler en priorité dans un maximum de plats
- Noms de plats professionnels et appétissants
- Retourne UNIQUEMENT le JSON, sans texte avant ou après`

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Vérifier l'authentification
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Vérifier que l'utilisateur a bien payé
  const { data: customer } = await supabase
    .from('customers')
    .select('has_access')
    .eq('user_id', user.id)
    .single()

  if (!customer?.has_access) {
    return NextResponse.json({ error: 'Accès non activé' }, { status: 403 })
  }

  const body = await req.json()
  const { restaurant, cuisine, stocks, meteo, couverts, budget, allergenes } = body

  const userPrompt = `Restaurant : ${restaurant}
Type de cuisine : ${cuisine}
${meteo ? `Météo de la semaine : ${meteo}` : ''}
${stocks ? `Stocks / produits à écouler : ${stocks}` : ''}
${couverts ? `Nombre de couverts / jour : ${couverts}` : ''}
${budget ? `Budget matière : ${budget}` : ''}
${allergenes ? `Allergènes à exclure : ${allergenes}` : ''}

Génère le menu de la semaine complet (Lundi à Vendredi, midi et soir).`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    // Extraire le JSON proprement (au cas où il y aurait du texte autour)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Réponse IA invalide')

    const menu = JSON.parse(jsonMatch[0])
    return NextResponse.json(menu)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur interne'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
