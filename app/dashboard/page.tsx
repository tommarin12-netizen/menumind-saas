'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Jour = { midi: Service; soir: Service }
type Service = { entree: string; plat: string; dessert: string; prix?: string }
type MenuData = {
  analyse: string
  conseil?: string
  economie?: string
  alertes?: string[]
  jours: { [k: string]: Jour }
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

export default function Dashboard() {
  const [form, setForm] = useState({
    restaurant: '', cuisine: 'Française', stocks: '',
    meteo: '', couverts: '', budget: '', allergenes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [jourActif, setJourActif] = useState('Lundi')
  const [svcActif, setSvcActif] = useState<'midi' | 'soir'>('midi')
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email ?? '')
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function generer() {
    if (!form.restaurant) { setError('Veuillez indiquer le nom de votre restaurant.'); return }
    setError('')
    setLoading(true)
    setMenu(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const { error: e } = await res.json().catch(() => ({}))
        throw new Error(e || 'Erreur serveur')
      }
      const data: MenuData = await res.json()
      setMenu(data)
      setJourActif('Lundi')
      setSvcActif('midi')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  function nouveau() {
    setMenu(null)
    setError('')
  }

  const svc = menu && jourActif ? menu.jours[jourActif]?.[svcActif] : null

  return (
    <>
      <div className="bg-scene">
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />
      </div>

      <nav className="dash-nav">
        <span className="logo">Menu<em>Mind</em></span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {userEmail && (
            <span style={{ fontSize: 12, color: 'var(--ink3)' }}>{userEmail}</span>
          )}
          <button className="btn-ghost" onClick={logout}>Déconnexion</button>
        </div>
      </nav>

      {!menu ? (
        <div className="dash-content">
          <h1 className="dash-title">Générer mon <em>menu</em></h1>
          <p className="dash-sub">Remplissez les informations de votre restaurant pour obtenir votre planning de la semaine.</p>

          <div className="form-wrap">
            <div className="form-grid">
              <div className="f-group full">
                <label className="f-label">Nom du restaurant *</label>
                <input className="inp" value={form.restaurant} onChange={e => set('restaurant', e.target.value)} placeholder="Le Petit Bistrot" />
              </div>
              <div className="f-group">
                <label className="f-label">Type de cuisine</label>
                <select className="inp" value={form.cuisine} onChange={e => set('cuisine', e.target.value)}>
                  <option>Française</option>
                  <option>Italienne</option>
                  <option>Méditerranéenne</option>
                  <option>Asiatique</option>
                  <option>Végétarienne</option>
                  <option>Burger / Street food</option>
                  <option>Brasserie</option>
                  <option>Gastronomique</option>
                </select>
              </div>
              <div className="f-group">
                <label className="f-label">Météo de la semaine</label>
                <input className="inp" value={form.meteo} onChange={e => set('meteo', e.target.value)} placeholder="Froid 8°C, pluie…" />
              </div>
              <div className="f-group full">
                <label className="f-label">Stocks / produits à écouler</label>
                <input className="inp" value={form.stocks} onChange={e => set('stocks', e.target.value)} placeholder="Agneau, courgettes, fromage de chèvre…" />
              </div>
              <div className="f-group">
                <label className="f-label">Couverts / jour</label>
                <input className="inp" value={form.couverts} onChange={e => set('couverts', e.target.value)} placeholder="~80/j, jeudi 120…" />
              </div>
              <div className="f-group">
                <label className="f-label">Budget matière</label>
                <input className="inp" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="28% CA, max 8€…" />
              </div>
              <div className="f-group full">
                <label className="f-label">Allergènes à exclure</label>
                <input className="inp" value={form.allergenes} onChange={e => set('allergenes', e.target.value)} placeholder="Gluten, noix, lactose…" />
              </div>
            </div>

            {error && <div className="erreur" style={{ marginTop: 16 }}>{error}</div>}

            <button className="btn-gen" onClick={generer} disabled={loading}>
              {loading ? (
                <><span className="dots"><span /><span /><span /></span> Génération en cours…</>
              ) : (
                'Générer mon menu de la semaine →'
              )}
            </button>
            <p className="form-note">5 jours · Déjeuner & Dîner · Conseil du chef inclus</p>
          </div>
        </div>
      ) : (
        <div className="res-page">
          <div className="res-top">
            <div>
              <div className="res-h">Menu <em>composé</em></div>
              <div className="res-sub">{form.restaurant} · Cuisine {form.cuisine}</div>
            </div>
            <button className="btn-ghost" onClick={nouveau} style={{ fontSize: 12 }}>← Modifier</button>
          </div>

          <div className="analyse-card">
            <div className="card-label">Analyse IA</div>
            <div className="analyse-text">{menu.analyse}</div>
          </div>

          {menu.economie && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--green-soft)', border: '1px solid rgba(45,106,79,.15)', borderRadius: 'var(--r12)', padding: '14px 18px', marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📉</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>{menu.economie}</div>
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>de pertes estimées évitées</div>
              </div>
            </div>
          )}

          {menu.alertes && menu.alertes.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="res-sec-label">Points d&apos;attention</div>
              {menu.alertes.map((a, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--amber)', background: 'var(--amber-soft)', border: '1px solid rgba(154,106,16,.15)', borderRadius: 'var(--r8)', padding: '8px 12px', marginBottom: 6 }}>
                  ⚠️ {a}
                </div>
              ))}
            </div>
          )}

          <div className="divider" />
          <div className="res-sec-label">Menu de la semaine</div>

          <div className="tabs-jours">
            {JOURS.map(j => (
              <button key={j} className={`tj${jourActif === j ? ' on' : ''}`} onClick={() => setJourActif(j)}>{j}</button>
            ))}
          </div>
          <div className="tabs-svc">
            <button className={`ts${svcActif === 'midi' ? ' on' : ''}`} onClick={() => setSvcActif('midi')}>Déjeuner</button>
            <button className={`ts${svcActif === 'soir' ? ' on' : ''}`} onClick={() => setSvcActif('soir')}>Dîner</button>
          </div>

          {svc && (
            <div className="menu-card">
              <div className="menu-head">
                <span className="menu-jour">{jourActif}</span>
                {svc.prix && <span className="menu-prix">{svc.prix}</span>}
              </div>
              <div className="cours-row">
                <div className="cours-num">1</div>
                <div><div className="cours-nom">{svc.entree}</div><div className="cours-cat">Entrée</div></div>
              </div>
              <div className="cours-row">
                <div className="cours-num">2</div>
                <div><div className="cours-nom">{svc.plat}</div><div className="cours-cat">Plat principal</div></div>
              </div>
              <div className="cours-row">
                <div className="cours-num">3</div>
                <div><div className="cours-nom">{svc.dessert}</div><div className="cours-cat">Dessert</div></div>
              </div>
            </div>
          )}

          {menu.conseil && (
            <div className="conseil-card">
              <div className="conseil-label">Conseil de la semaine</div>
              <div className="conseil-text">{menu.conseil}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            <button className="btn-new" onClick={nouveau}>Nouveau menu →</button>
          </div>
        </div>
      )}
    </>
  )
}
