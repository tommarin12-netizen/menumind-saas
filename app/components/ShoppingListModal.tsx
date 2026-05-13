'use client'
import { useEffect, useState } from 'react'

type Item = { produit: string; quantite: string; note?: string }
type Category = { nom: string; emoji: string; items: Item[] }
type ShoppingList = { categories: Category[] }

interface Props {
  menu: unknown
  couverts: string
  restaurant: string
  onClose: () => void
}

export default function ShoppingListModal({ menu, couverts, restaurant, onClose }: Props) {
  const [list, setList] = useState<ShoppingList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checked, setChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/shopping-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu, couverts, restaurant }),
    })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setList(d) })
      .catch(() => setError('Erreur de connexion'))
      .finally(() => setLoading(false))
  }, [])

  function toggle(key: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const total = list?.categories.reduce((s, c) => s + c.items.length, 0) ?? 0

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="shop-modal">
        <div className="shop-head">
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>Liste de courses</div>
            <h2 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 400 }}>{restaurant}</h2>
            {total > 0 && <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 2 }}>{total} références · {couverts || 50} couverts/service</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => window.print()}>🖨 Imprimer</button>
            <button className="modal-close" style={{ position: 'static' }} onClick={onClose}>✕</button>
          </div>
        </div>

        {loading && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink3)' }}>
            <span className="dots"><span /><span /><span /></span>
            <div style={{ marginTop: 12, fontSize: 13 }}>Génération de la liste…</div>
          </div>
        )}

        {error && <div className="erreur" style={{ margin: 20 }}>{error}</div>}

        {list && (
          <div className="shop-body">
            {list.categories.filter(c => c.items.length > 0).map((cat, ci) => (
              <div key={ci} className="shop-cat">
                <div className="shop-cat-title">
                  <span>{cat.emoji}</span> {cat.nom}
                  <span className="shop-cat-count">{cat.items.length}</span>
                </div>
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${ii}`
                  const done = checked.has(key)
                  return (
                    <div key={ii} className={`shop-item${done ? ' done' : ''}`} onClick={() => toggle(key)}>
                      <div className={`shop-check${done ? ' checked' : ''}`}>{done ? '✓' : ''}</div>
                      <div style={{ flex: 1 }}>
                        <span className="shop-produit">{item.produit}</span>
                        {item.note && <span className="shop-note"> · {item.note}</span>}
                      </div>
                      <span className="shop-qte">{item.quantite}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
