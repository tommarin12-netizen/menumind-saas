import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/** Parse "~80/j", "80", "80 couverts", "lundi 50, jeudi 120" → nombre entier */
function parseCouverts(raw: string): number {
  if (!raw) return 50
  const digits = raw.match(/\d+/)
  return digits ? Math.max(1, parseInt(digits[0], 10)) : 50
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { menu, couverts, restaurant } = await req.json()

  const nbCouverts = parseCouverts(couverts)
  const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

  // Compter les services actifs et construire la liste des plats avec service + couverts
  type PlatInfo = { plat: string; service: string; jour: string; couverts: number }
  const plats: PlatInfo[] = []
  let totalMidi = 0
  let totalSoir = 0

  for (const jour of JOURS) {
    const j = menu.jours?.[jour]
    if (!j) continue
    const hasMidi = !!(j.midi?.plat)
    const hasSoir = !!(j.soir?.plat)
    if (hasMidi) {
      totalMidi++
      if (j.midi.entree) plats.push({ plat: j.midi.entree, service: 'déjeuner', jour, couverts: nbCouverts })
      if (j.midi.plat)   plats.push({ plat: j.midi.plat,   service: 'déjeuner', jour, couverts: nbCouverts })
      if (j.midi.dessert) plats.push({ plat: j.midi.dessert, service: 'déjeuner', jour, couverts: nbCouverts })
    }
    if (hasSoir) {
      totalSoir++
      if (j.soir.entree) plats.push({ plat: j.soir.entree, service: 'dîner', jour, couverts: nbCouverts })
      if (j.soir.plat)   plats.push({ plat: j.soir.plat,   service: 'dîner', jour, couverts: nbCouverts })
      if (j.soir.dessert) plats.push({ plat: j.soir.dessert, service: 'dîner', jour, couverts: nbCouverts })
    }
  }

  const totalServices = totalMidi + totalSoir
  const totalCouverts = totalServices * nbCouverts

  const platsList = plats
    .map(p => `- ${p.plat} (${p.service} ${p.jour}, ${p.couverts} couverts)`)
    .join('\n')

  const prompt = `Tu es un chef gestionnaire de restaurant rigoureux. Génère la liste de courses exacte pour la semaine.

Restaurant : ${restaurant}
Couverts par service : ${nbCouverts} personnes
Services déjeuner : ${totalMidi} | Services dîner : ${totalSoir}
Total services : ${totalServices} | Total couverts semaine : ${totalCouverts}

Liste complète des plats à servir cette semaine :
${platsList}

RÈGLES DE CALCUL STRICTES :
1. Pour chaque ingrédient, COMPTE dans combien de plats il apparaît et MULTIPLIE par le nombre de couverts de ces services
2. Exemple : si le beurre est utilisé dans 3 plats à ${nbCouverts} couverts chacun → quantité = 3 × ${nbCouverts} × portion unitaire
3. Consolide les ingrédients communs à plusieurs plats en une seule ligne
4. Arrondis toujours AU-DESSUS (jamais en dessous) pour ne pas manquer
5. Les portions standard en restauration : viande/poisson 180-220g/pers, légumes d'accompagnement 150g/pers, féculents 80g/pers, crème/sauce 60-80ml/pers
6. Ajoute 10% de marge sur toutes les quantités (pertes, erreurs de découpe)
7. Exprime les quantités en unités professionnelles : kg, L, unités, bottes, sachets

Retourne UNIQUEMENT ce JSON :
{
  "meta": {
    "couverts_par_service": ${nbCouverts},
    "nb_services": ${totalServices},
    "total_couverts": ${totalCouverts}
  },
  "categories": [
    {
      "nom": "Viandes & Volailles",
      "emoji": "🥩",
      "items": [
        { "produit": "Filet de bœuf", "quantite": "12 kg", "note": "Lundi midi + Jeudi soir, ${nbCouverts} cvts × 2 services + 10%" }
      ]
    },
    { "nom": "Poissons & Fruits de mer", "emoji": "🐟", "items": [] },
    { "nom": "Légumes & Fruits", "emoji": "🥦", "items": [] },
    { "nom": "Produits laitiers & Œufs", "emoji": "🧀", "items": [] },
    { "nom": "Épicerie sèche & Condiments", "emoji": "🫙", "items": [] },
    { "nom": "Herbes fraîches & Épices", "emoji": "🌿", "items": [] },
    { "nom": "Boissons & Divers", "emoji": "🧴", "items": [] }
  ]
}

Exclure les catégories vides. Le champ "note" doit toujours expliquer le calcul. Retourne UNIQUEMENT le JSON.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2500,
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
