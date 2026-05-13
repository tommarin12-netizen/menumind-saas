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
    window.print()
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
