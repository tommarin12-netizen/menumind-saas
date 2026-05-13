'use client'
import { useEffect, useState } from 'react'

type Recipe = {
  nom: string
  temps_prep: string
  temps_cuisson: string
  difficulte: string
  ingredients: string[]
  etapes: string[]
  conseil_chef: string
  vin?: string
}

interface Props {
  plat: string
  cuisine: string
  couverts: string
  stocks: string
  onClose: () => void
}

export default function RecipeModal({ plat, cuisine, couverts, stocks, onClose }: Props) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userStars, setUserStars] = useState(0)
  const [hoverStars, setHoverStars] = useState(0)
  const [rated, setRated] = useState(false)

  async function submitRating(stars: number) {
    setUserStars(stars)
    setRated(true)
    await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dish_name: plat, stars, cuisine }),
    })
  }

  useEffect(() => {
    fetch('/api/recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plat, cuisine, couverts, stocks }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setRecipe(data)
      })
      .catch(() => setError('Erreur de connexion'))
      .finally(() => setLoading(false))
  }, [])

  function printRecipe() {
    if (!recipe) return

    const win = window.open('', '_blank', 'width=820,height=1000')
    if (!win) return

    win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Recette — ${recipe.nom}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Georgia,serif;padding:44px 48px;color:#1c1109;background:#fff;font-size:14px;}
    .header{border-bottom:2px solid #1c1109;padding-bottom:18px;margin-bottom:24px;}
    .tag{font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#c75c32;margin-bottom:6px;}
    h1{font-size:30px;font-weight:400;letter-spacing:-.5px;line-height:1.2;margin-bottom:10px;}
    .chips{display:flex;gap:20px;flex-wrap:wrap;}
    .chip{font-family:Arial,sans-serif;font-size:12px;color:#9a7860;display:flex;align-items:center;gap:5px;}
    .chip strong{color:#1c1109;font-size:13px;}
    .grid{display:grid;grid-template-columns:1fr 1.7fr;gap:40px;margin-bottom:28px;}
    h2{font-family:Arial,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9a7860;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e8ddd4;}
    ul{list-style:none;}
    ul li{font-size:13px;color:#5a3d28;padding:5px 9px;background:#f7f3ee;border-radius:4px;margin-bottom:4px;line-height:1.4;}
    ol{list-style:none;}
    ol li{display:flex;gap:10px;font-size:13px;color:#5a3d28;margin-bottom:12px;line-height:1.65;}
    .num{width:22px;height:22px;background:#c75c32;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:2px;print-color-adjust:exact;-webkit-print-color-adjust:exact;}
    .conseil{background:#f0faf5;border:1px solid #b7d9c9;border-radius:8px;padding:14px 18px;margin-bottom:16px;font-size:13px;color:#2d6a4f;line-height:1.65;}
    .conseil strong{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;}
    .vin{font-size:13px;color:#9a7860;font-style:italic;padding:10px 0;border-top:1px solid #e8ddd4;margin-bottom:16px;}
    .footer{margin-top:32px;padding-top:14px;border-top:1px solid #e8ddd4;font-family:Arial,sans-serif;font-size:11px;color:#9a7860;display:flex;justify-content:space-between;}
    @media print{
      body{padding:24px 28px;}
      @page{margin:15mm;}
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="tag">Recette · MenuMind</div>
    <h1>${recipe.nom}</h1>
    <div class="chips">
      <div class="chip">⏱ <strong>${recipe.temps_prep}</strong> préparation</div>
      <div class="chip">🔥 <strong>${recipe.temps_cuisson}</strong> cuisson</div>
      <div class="chip">📊 <strong>${recipe.difficulte}</strong></div>
      ${couverts ? `<div class="chip">👥 <strong>${couverts}</strong> couverts</div>` : ''}
    </div>
  </div>

  <div class="grid">
    <div>
      <h2>Ingrédients</h2>
      <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
    <div>
      <h2>Préparation</h2>
      <ol>${recipe.etapes.map((e, idx) => `<li><span class="num">${idx + 1}</span><span>${e}</span></li>`).join('')}</ol>
    </div>
  </div>

  ${recipe.conseil_chef ? `<div class="conseil"><strong>👨‍🍳 Conseil du chef</strong>${recipe.conseil_chef}</div>` : ''}
  ${recipe.vin ? `<div class="vin">🍷 ${recipe.vin}</div>` : ''}

  <div class="footer">
    <span>Généré par <strong>MenuMind</strong></span>
    <span>${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
  </div>

  <script>
    window.onload = function() {
      window.focus();
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`)
    win.document.close()
  }

  const marmitonUrl = `https://www.marmiton.org/recettes/recherche.aspx?qs=${encodeURIComponent(plat)}`

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="recipe-modal print-recipe-hide">
          <div className="recipe-modal-head">
            <div>
              <div className="recipe-tag">Recette</div>
              <h2 className="recipe-title">{plat}</h2>
            </div>
            <button className="modal-close" style={{ position: 'static' }} onClick={onClose}>✕</button>
          </div>

          {loading && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink3)' }}>
              <span className="dots"><span /><span /><span /></span>
              <div style={{ marginTop: 12, fontSize: 13 }}>Génération de la recette…</div>
            </div>
          )}

          {error && (
            <div className="erreur">{error}</div>
          )}

          {recipe && (
            <>
              {/* Infos rapides */}
              <div className="recipe-infos">
                <div className="recipe-info"><span>⏱</span><div><strong>{recipe.temps_prep}</strong><div>Préparation</div></div></div>
                <div className="recipe-info"><span>🔥</span><div><strong>{recipe.temps_cuisson}</strong><div>Cuisson</div></div></div>
                <div className="recipe-info"><span>📊</span><div><strong>{recipe.difficulte}</strong><div>Difficulté</div></div></div>
                {couverts && <div className="recipe-info"><span>👥</span><div><strong>{couverts}</strong><div>Couverts</div></div></div>}
              </div>

              <div className="recipe-body">
                {/* Ingrédients */}
                <div className="recipe-section">
                  <div className="recipe-sec-title">Ingrédients</div>
                  <ul className="recipe-ingredients">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>

                {/* Étapes */}
                <div className="recipe-section">
                  <div className="recipe-sec-title">Préparation</div>
                  <ol className="recipe-steps">
                    {recipe.etapes.map((step, i) => (
                      <li key={i}>
                        <span className="step-num">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Conseil chef */}
              {recipe.conseil_chef && (
                <div className="recipe-conseil">
                  <span>👨‍🍳</span>
                  <div>
                    <strong>Conseil du chef</strong>
                    <p>{recipe.conseil_chef}</p>
                  </div>
                </div>
              )}

              {/* Accord vin */}
              {recipe.vin && (
                <div className="recipe-vin">
                  <span>🍷</span> {recipe.vin}
                </div>
              )}

              {/* Notation */}
              <div className="recipe-rating-row">
                {rated ? (
                  <div className="rating-thanks">
                    {'★'.repeat(userStars)}{'☆'.repeat(5 - userStars)} Merci pour votre avis !
                  </div>
                ) : (
                  <>
                    <span className="rating-label">Noter cette recette :</span>
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          className={`star-btn${(hoverStars || userStars) >= s ? ' lit' : ''}`}
                          onMouseEnter={() => setHoverStars(s)}
                          onMouseLeave={() => setHoverStars(0)}
                          onClick={() => submitRating(s)}
                        >★</button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="recipe-actions">
                <button className="btn-gen" style={{ flex: 1, marginTop: 0 }} onClick={printRecipe}>
                  📄 Télécharger en PDF
                </button>
                <a
                  href={marmitonUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost"
                  style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <img src="https://www.marmiton.org/favicon.ico" width={14} height={14} alt="" style={{ borderRadius: 2 }} />
                  Voir sur Marmiton
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Vue impression de la recette */}
      {recipe && (
        <div className="print-recipe-only">
          <div className="pr-header">
            <h1>{recipe.nom}</h1>
            <div className="pr-meta">
              Préparation : {recipe.temps_prep} · Cuisson : {recipe.temps_cuisson} · {recipe.difficulte}
              {couverts ? ` · ${couverts} couverts` : ''}
            </div>
          </div>
          <div className="pr-body">
            <div>
              <h2>Ingrédients</h2>
              <ul>{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
            </div>
            <div>
              <h2>Préparation</h2>
              <ol>{recipe.etapes.map((step, i) => <li key={i}>{step}</li>)}</ol>
            </div>
          </div>
          {recipe.conseil_chef && <div className="pr-conseil">👨‍🍳 {recipe.conseil_chef}</div>}
          {recipe.vin && <div className="pr-vin">🍷 {recipe.vin}</div>}
          <div className="pr-footer">Généré par MenuMind · menumind.fr</div>
        </div>
      )}
    </>
  )
}
