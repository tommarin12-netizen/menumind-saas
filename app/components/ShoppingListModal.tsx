'use client'
import { useEffect, useState } from 'react'
import Icon3D from './Icon3D'

type Item = { produit: string; quantite: string; note?: string }
type Category = { nom: string; emoji: string; items: Item[] }
type Meta = { couverts_par_service: number; nb_services: number; total_couverts: number }
type ShoppingList = { categories: Category[]; meta?: Meta }

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
  const [showNotes, setShowNotes] = useState(false)

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
  const done = checked.size

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="shop-modal">

        {/* Header */}
        <div className="shop-head">
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>
              <Icon3D anim="bounce" size="1.2em">🛒</Icon3D> Liste de courses
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 400 }}>{restaurant}</h2>
            {list?.meta && (
              <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span><Icon3D anim="bounce" size="1em">👥</Icon3D> <strong style={{ color: 'var(--ink2)' }}>{list.meta.couverts_par_service}</strong> cvts/service</span>
                <span><Icon3D anim="float" size="1em">📅</Icon3D> <strong style={{ color: 'var(--ink2)' }}>{list.meta.nb_services}</strong> services</span>
                <span>= <strong style={{ color: 'var(--accent)' }}>{list.meta.total_couverts}</strong> couverts total</span>
              </div>
            )}
            {total > 0 && (
              <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{total} références · {done > 0 && <span style={{ color: 'var(--green)', fontWeight: 600 }}>{done}/{total} cochés</span>}</span>
                <button
                  onClick={() => setShowNotes(n => !n)}
                  style={{ fontSize: 10, background: 'rgba(255,255,255,.5)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: 'var(--ink3)' }}
                >
                  {showNotes ? 'Masquer détails' : 'Voir calculs'}
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => window.print()}>🖨 Imprimer</button>
            <button className="modal-close" style={{ position: 'static' }} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Calcul badge */}
        {list?.meta && (
          <div style={{ margin: '0 16px 4px', padding: '8px 14px', background: 'rgba(154,106,16,.08)', border: '1px solid rgba(154,106,16,.18)', borderRadius: 10, fontSize: 12, color: 'var(--amber)' }}>
            <Icon3D anim="float" size="1.1em">⚖️</Icon3D> Quantités calculées pour <strong>{list.meta.couverts_par_service} couverts × {list.meta.nb_services} services</strong> + 10% de marge
          </div>
        )}

        {loading && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink3)' }}>
            <span className="dots"><span /><span /><span /></span>
            <div style={{ marginTop: 12, fontSize: 13 }}>Calcul des quantités pour {couverts || '50'} couverts…</div>
          </div>
        )}

        {error && <div className="erreur" style={{ margin: 20 }}>{error}</div>}

        {list && (
          <div className="shop-body">
            {list.categories.filter(c => c.items.length > 0).map((cat, ci) => (
              <div key={ci} className="shop-cat">
                <div className="shop-cat-title">
                  <Icon3D anim="float" size="1.2em">{cat.emoji}</Icon3D> {cat.nom}
                  <span className="shop-cat-count">{cat.items.length}</span>
                </div>
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${ii}`
                  const isDone = checked.has(key)
                  return (
                    <div key={ii} className={`shop-item${isDone ? ' done' : ''}`} onClick={() => toggle(key)}>
                      <div className={`shop-check${isDone ? ' checked' : ''}`}>{isDone ? '✓' : ''}</div>
                      <div style={{ flex: 1 }}>
                        <span className="shop-produit">{item.produit}</span>
                        {showNotes && item.note && (
                          <div className="shop-note" style={{ display: 'block', marginTop: 2 }}>{item.note}</div>
                        )}
                      </div>
                      <span className="shop-qte">{item.quantite}</span>
                    </div>
                  )
                })}
              </div>
            ))}

            {done > 0 && (
              <button
                onClick={() => setChecked(new Set())}
                style={{ width: '100%', marginTop: 8, padding: '10px', fontSize: 12, color: 'var(--ink3)', background: 'none', border: '1px dashed var(--border2)', borderRadius: 10, cursor: 'pointer' }}
              >
                Tout décocher
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
