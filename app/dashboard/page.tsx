'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RecipeModal from '@/app/components/RecipeModal'
import ShoppingListModal from '@/app/components/ShoppingListModal'
import Icon3D from '@/app/components/Icon3D'
import { getProduitsSaison, getMoisLabel } from '@/lib/saison'

type Jour = { midi: Service; soir: Service }
type Service = { entree: string; plat: string; dessert: string; cout_matiere?: string; prix_vente?: string; prix?: string }
type Proposition = { produit: string; emoji: string; nb_plats: number; plats: string[] }
type Couts = { cout_moyen_entree: string; cout_moyen_plat: string; cout_moyen_dessert: string; marge_brute_estimee: string; conseil_rentabilite: string }
type MenuData = {
  analyse: string
  conseil?: string
  economie?: string
  alertes?: string[]
  propositions?: Proposition[]
  couts?: Couts
  jours: { [k: string]: Jour }
}
type HistoryItem = {
  id: string
  restaurant: string
  cuisine: string
  created_at: string
  menu: MenuData
  params: Record<string, string>
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const PROFILE_KEY = 'mm_restaurant_profile'

export default function Dashboard() {
  const [form, setForm] = useState({
    restaurant: '', cuisine: 'Française', stocks: '',
    meteo: '', couverts: '', budget: '', allergenes: '',
    nb_midi: '5', nb_soir: '5',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [jourActif, setJourActif] = useState('Lundi')
  const [svcActif, setSvcActif] = useState<'midi' | 'soir'>('midi')
  const [userEmail, setUserEmail] = useState('')
  const [firstVisit, setFirstVisit] = useState(false)
  const [activeTab, setActiveTab] = useState<'generer' | 'historique'>('generer')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)
  const [recipeTarget, setRecipeTarget] = useState<string | null>(null)
  const [showShopping, setShowShopping] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [showPrintMenu, setShowPrintMenu] = useState(false)
  const saisonProduits = getProduitsSaison()
  const moisLabel = getMoisLabel()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? '')
        const key = `mm_welcomed_${data.user.id}`
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, '1')
          setFirstVisit(true)
        }
      }
    })
    // Charger le profil sauvegardé
    const saved = localStorage.getItem(PROFILE_KEY)
    if (saved) {
      try {
        const profile = JSON.parse(saved)
        setForm(f => ({ ...f, ...profile }))
        setProfileSaved(true)
      } catch {}
    }
  }, [])

  async function loadHistory() {
    setHistoryLoading(true)
    const res = await fetch('/api/history')
    if (res.ok) setHistory(await res.json())
    setHistoryLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'historique') loadHistory()
  }, [activeTab])

  async function deleteMenu(id: string) {
    await fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setHistory(prev => prev.filter(h => h.id !== id))
    setConfirmDeleteId(null)
    if (expandedId === id) setExpandedId(null)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      restaurant: form.restaurant,
      cuisine: form.cuisine,
      couverts: form.couverts,
      budget: form.budget,
      allergenes: form.allergenes,
    }))
    setProfileSaved(true)
  }

  function clearProfile() {
    localStorage.removeItem(PROFILE_KEY)
    setProfileSaved(false)
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

      // Sauvegarder dans l'historique + profil auto
      saveProfile()
      setShareUrl(null)
      const histRes = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant: form.restaurant, cuisine: form.cuisine, params: form, menu: data }),
      })
      if (histRes.ok) {
        const histData = await histRes.json()
        if (histData.id) {
          setShareUrl(`${window.location.origin}/menu/${histData.id}`)
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  function nouveau() { setMenu(null); setError('') }
  function printMenu() { window.print() }

  const svc = menu && jourActif ? menu.jours[jourActif]?.[svcActif] : null

  return (
    <>
      <div className="bg-scene">
        <div className="bg-orb orb1" /><div className="bg-orb orb2" /><div className="bg-orb orb3" />
      </div>

      <nav className="dash-nav">
        <span className="logo">Menu<em>Mind</em></span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {userEmail && <span style={{ fontSize: 12, color: 'var(--ink3)' }}>{userEmail}</span>}
          <button className="btn-ghost" onClick={logout}>Déconnexion</button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="dash-tabs">
        <div className="dash-tabs-inner">
          <button className={`dash-tab${activeTab === 'generer' ? ' on' : ''}`} onClick={() => setActiveTab('generer')}>
            <Icon3D anim="pulse" size="1em">✨</Icon3D> Générer un menu
          </button>
          <button className={`dash-tab${activeTab === 'historique' ? ' on' : ''}`} onClick={() => setActiveTab('historique')}>
            <Icon3D anim="float" size="1em">📋</Icon3D> Historique
          </button>
        </div>
      </div>

      {firstVisit && activeTab === 'generer' && (
        <div className="welcome-banner">
          <button className="welcome-close" onClick={() => setFirstVisit(false)}>✕</button>
          <div className="welcome-inner">
            <span style={{ fontSize: 32 }}>👋</span>
            <div>
              <div className="welcome-title">Bienvenue sur MenuMind !</div>
              <div className="welcome-sub">Remplissez le formulaire ci-dessous et générez votre premier menu de la semaine en 30 secondes.</div>
            </div>
          </div>
          <div className="welcome-steps">
            <div className="ws"><span>1</span>Renseignez votre restaurant</div>
            <div className="ws"><span>2</span>Indiquez vos stocks à écouler</div>
            <div className="ws"><span>3</span>Cliquez sur Générer 🚀</div>
          </div>
        </div>
      )}

      {/* ── ONGLET GÉNÉRER ── */}
      {activeTab === 'generer' && !menu && (
        <div className="dash-content">
          {/* Widget produits de saison */}
          {saisonProduits.length > 0 && (
            <div className="saison-widget">
              <div className="saison-title"><Icon3D anim="wiggle" size="1.1em">🌱</Icon3D> En saison en {moisLabel}</div>
              <div className="saison-items">
                {saisonProduits.map((p, i) => (
                  <div key={i} className="saison-item" onClick={() => {
                    const stocks = form.stocks ? `${form.stocks}, ${p.produit}` : p.produit
                    set('stocks', stocks)
                  }} title="Cliquer pour ajouter aux stocks">
                    <Icon3D anim="float" size="1.3em">{p.emoji}</Icon3D> {p.produit}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 6 }}>Cliquez sur un produit pour l&apos;ajouter à vos stocks</div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h1 className="dash-title">Générer mon <em>menu</em></h1>
            {profileSaved && (
              <span className="profile-badge" onClick={clearProfile} title="Cliquer pour effacer">
                ✓ Profil sauvegardé · Effacer
              </span>
            )}
          </div>
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
                  <option>Française</option><option>Italienne</option><option>Méditerranéenne</option>
                  <option>Asiatique</option><option>Végétarienne</option><option>Burger / Street food</option>
                  <option>Brasserie</option><option>Gastronomique</option>
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

              {/* Sélection services */}
              <div className="f-group full">
                <label className="f-label">Nombre de services à générer</label>
                <div className="services-row">
                  <div className="service-picker">
                    <span className="service-icon">☀️</span>
                    <span className="service-label">Déjeuners</span>
                    <div className="service-btns">
                      {['0','1','2','3','4','5'].map(n => (
                        <button key={n} type="button"
                          className={`svc-n${form.nb_midi === n ? ' on' : ''}`}
                          onClick={() => set('nb_midi', n)}>{n}</button>
                      ))}
                    </div>
                  </div>
                  <div className="service-picker">
                    <span className="service-icon">🌙</span>
                    <span className="service-label">Dîners</span>
                    <div className="service-btns">
                      {['0','1','2','3','4','5'].map(n => (
                        <button key={n} type="button"
                          className={`svc-n${form.nb_soir === n ? ' on' : ''}`}
                          onClick={() => set('nb_soir', n)}>{n}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {error && <div className="erreur" style={{ marginTop: 16 }}>{error}</div>}
            <button className="btn-gen" onClick={generer} disabled={loading}>
              {loading ? <><span className="dots"><span /><span /><span /></span> Génération en cours…</> : 'Générer mon menu de la semaine →'}
            </button>
            <p className="form-note">5 jours · Déjeuner & Dîner · Conseil du chef inclus</p>
          </div>
        </div>
      )}

      {/* ── RÉSULTATS ── */}
      {activeTab === 'generer' && menu && (
        <div className="res-page">
          <div className="res-top">
            <div>
              <div className="res-h">Menu <em>composé</em></div>
              <div className="res-sub">{form.restaurant} · Cuisine {form.cuisine}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn-ghost print-hide" style={{ fontSize: 12 }} onClick={() => setShowShopping(true)}><Icon3D anim="bounce" size="1.1em">🛒</Icon3D> Courses</button>
              <button className="btn-ghost print-hide" style={{ fontSize: 12 }} onClick={() => setShowPrintMenu(true)}><Icon3D anim="float" size="1.1em">📄</Icon3D> Menu carte</button>
              {shareUrl && (
                <button className="btn-ghost print-hide" style={{ fontSize: 12, color: shareCopied ? 'var(--green)' : undefined }} onClick={() => {
                  navigator.clipboard.writeText(shareUrl)
                  setShareCopied(true)
                  setTimeout(() => setShareCopied(false), 2000)
                }}>
                  {shareCopied ? '✓ Copié !' : '🔗 Partager'}
                </button>
              )}
              <button className="btn-ghost print-hide" onClick={nouveau} style={{ fontSize: 12 }}>← Modifier</button>
            </div>
          </div>

          <div className="analyse-card">
            <div className="card-label">Analyse</div>
            <div className="analyse-text">{menu.analyse}</div>
          </div>

          {menu.economie && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--green-soft)', border: '1px solid rgba(45,106,79,.15)', borderRadius: 'var(--r12)', padding: '14px 18px', marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📉</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>{menu.economie}</div>
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>de pertes estimées évitées cette semaine</div>
              </div>
            </div>
          )}

          {menu.couts && (
            <div className="couts-card">
              <div className="couts-title"><Icon3D anim="pulse" size="1.1em">💰</Icon3D> Estimation coût matière</div>
              <div className="couts-grid">
                <div className="cout-item"><div className="cout-label">Entrée</div><div className="cout-val">{menu.couts.cout_moyen_entree}</div></div>
                <div className="cout-item"><div className="cout-label">Plat</div><div className="cout-val">{menu.couts.cout_moyen_plat}</div></div>
                <div className="cout-item"><div className="cout-label">Dessert</div><div className="cout-val">{menu.couts.cout_moyen_dessert}</div></div>
                <div className="cout-item hot"><div className="cout-label">Marge brute</div><div className="cout-val">{menu.couts.marge_brute_estimee}</div></div>
              </div>
              {menu.couts.conseil_rentabilite && (
                <div className="couts-conseil"><Icon3D anim="float" size="1em">💡</Icon3D> {menu.couts.conseil_rentabilite}</div>
              )}
            </div>
          )}

          {menu.propositions && menu.propositions.length > 0 && (
            <div className="prop-section">
              <div className="prop-header">
                <span className="prop-title"><Icon3D anim="spin" size="1.1em">🧊</Icon3D> Produits périssables écoulés cette semaine</span>
                <span className="prop-badge">{menu.propositions.length} produit{menu.propositions.length > 1 ? 's' : ''} utilisé{menu.propositions.length > 1 ? 's' : ''}</span>
              </div>
              <div className="prop-grid">
                {menu.propositions.map((p, i) => (
                  <div key={i} className="prop-card">
                    <div className="prop-card-top">
                      <Icon3D anim="float" size="2em" className="prop-emoji">{p.emoji}</Icon3D>
                      <div>
                        <div className="prop-produit">{p.produit}</div>
                        <div className="prop-count">Intégré dans <strong>{p.nb_plats} plat{p.nb_plats > 1 ? 's' : ''}</strong></div>
                      </div>
                    </div>
                    <ul className="prop-plats">
                      {p.plats.map((plat, j) => <li key={j}>↳ {plat}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {menu.alertes && menu.alertes.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="res-sec-label">Points d&apos;attention</div>
              {menu.alertes.map((a, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--amber)', background: 'var(--amber-soft)', border: '1px solid rgba(154,106,16,.15)', borderRadius: 'var(--r8)', padding: '8px 12px', marginBottom: 6 }}><Icon3D anim="wiggle" size="1em">⚠️</Icon3D> {a}</div>
              ))}
            </div>
          )}

          <div className="divider" />
          <div className="res-sec-label">Menu de la semaine</div>

          <div className="tabs-jours print-hide">
            {JOURS.map(j => <button key={j} className={`tj${jourActif === j ? ' on' : ''}`} onClick={() => setJourActif(j)}>{j}</button>)}
          </div>
          <div className="tabs-svc print-hide">
            <button className={`ts${svcActif === 'midi' ? ' on' : ''}`} onClick={() => setSvcActif('midi')}>Déjeuner</button>
            <button className={`ts${svcActif === 'soir' ? ' on' : ''}`} onClick={() => setSvcActif('soir')}>Dîner</button>
          </div>

          {/* Vue écran : 1 jour à la fois */}
          {svc && (
            <div className="menu-card print-hide">
              <div className="menu-head">
                <span className="menu-jour">{jourActif} · {svcActif === 'midi' ? <><Icon3D anim="pulse" size="1em">☀️</Icon3D> Déjeuner</> : <><Icon3D anim="float" size="1em">🌙</Icon3D> Dîner</>}</span>
                <div className="menu-prix-row">
                  {(svc.cout_matiere || svc.prix) && (
                    <span className="menu-cout">
                      <Icon3D anim="float" size="1em">🧾</Icon3D> {svc.cout_matiere ?? svc.prix}
                      <span className="menu-prix-label">coût matière</span>
                    </span>
                  )}
                  {svc.prix_vente && (
                    <span className="menu-prix">
                      {svc.prix_vente}
                      <span className="menu-prix-label">prix de vente</span>
                    </span>
                  )}
                </div>
              </div>
              {[
                { nom: svc.entree, cat: 'Entrée' },
                { nom: svc.plat, cat: 'Plat principal' },
                { nom: svc.dessert, cat: 'Dessert' },
              ].map((cours, i) => (
                <div key={i} className="cours-row">
                  <div className="cours-num">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="cours-nom">{cours.nom}</div>
                    <div className="cours-cat">{cours.cat}</div>
                  </div>
                  <button className="recette-btn" onClick={() => setRecipeTarget(cours.nom)}>
                    Recette →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Vue impression : tous les jours */}
          <div className="print-only">
            <h2 style={{ fontFamily: 'serif', marginBottom: 16 }}>Menu de la semaine — {form.restaurant}</h2>
            {JOURS.map(jour => {
              const midi = menu.jours[jour]?.midi
              const soir = menu.jours[jour]?.soir
              return (
                <div key={jour} className="print-jour">
                  <div className="print-jour-title">{jour}</div>
                  <div className="print-services">
                    {midi && <div className="print-svc">
                      <div className="print-svc-label">Déjeuner {midi.prix && `· ${midi.prix}`}</div>
                      <div>Entrée : {midi.entree}</div>
                      <div>Plat : {midi.plat}</div>
                      <div>Dessert : {midi.dessert}</div>
                    </div>}
                    {soir && <div className="print-svc">
                      <div className="print-svc-label">Dîner {soir.prix && `· ${soir.prix}`}</div>
                      <div>Entrée : {soir.entree}</div>
                      <div>Plat : {soir.plat}</div>
                      <div>Dessert : {soir.dessert}</div>
                    </div>}
                  </div>
                </div>
              )
            })}
            {menu.conseil && <div className="print-conseil">💡 {menu.conseil}</div>}
          </div>

          {menu.conseil && (
            <div className="conseil-card print-hide">
              <div className="conseil-label">Conseil de la semaine</div>
              <div className="conseil-text">{menu.conseil}</div>
            </div>
          )}

          <div className="print-hide" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            <button className="btn-new" onClick={nouveau}>Nouveau menu →</button>
          </div>
        </div>
      )}

      {recipeTarget && (
        <RecipeModal plat={recipeTarget} cuisine={form.cuisine} couverts={form.couverts} stocks={form.stocks} onClose={() => setRecipeTarget(null)} />
      )}

      {showShopping && menu && (
        <ShoppingListModal menu={menu} couverts={form.couverts} restaurant={form.restaurant} onClose={() => setShowShopping(false)} />
      )}

      {/* PDF Menu carte overlay */}
      {showPrintMenu && menu && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPrintMenu(false)}>
          <div className="menu-carte-box">
            <div className="menu-carte-head">
              <div>
                <div className="menu-carte-resto">{form.restaurant}</div>
                <div className="menu-carte-sub">Cuisine {form.cuisine} · Menu de la semaine</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-gen" style={{ marginTop: 0, padding: '10px 20px', fontSize: 13 }} onClick={() => window.print()}><Icon3D anim="float" size="1em">📄</Icon3D> Télécharger PDF</button>
                <button className="modal-close" style={{ position: 'static' }} onClick={() => setShowPrintMenu(false)}>✕</button>
              </div>
            </div>
            <div className="menu-carte-body">
              {['Lundi','Mardi','Mercredi','Jeudi','Vendredi'].map(jour => {
                const j = menu.jours?.[jour]
                if (!j?.midi?.plat && !j?.soir?.plat) return null
                return (
                  <div key={jour} className="carte-jour">
                    <div className="carte-jour-nom">{jour}</div>
                    <div className="carte-services">
                      {j?.midi?.plat && (
                        <div className="carte-svc">
                          <div className="carte-svc-label">☀️ Déjeuner {j.midi.prix && <span>· {j.midi.prix}</span>}</div>
                          <div className="carte-plat"><em>Entrée</em> {j.midi.entree}</div>
                          <div className="carte-plat"><em>Plat</em> {j.midi.plat}</div>
                          <div className="carte-plat"><em>Dessert</em> {j.midi.dessert}</div>
                        </div>
                      )}
                      {j?.soir?.plat && (
                        <div className="carte-svc">
                          <div className="carte-svc-label">🌙 Dîner {j.soir.prix && <span>· {j.soir.prix}</span>}</div>
                          <div className="carte-plat"><em>Entrée</em> {j.soir.entree}</div>
                          <div className="carte-plat"><em>Plat</em> {j.soir.plat}</div>
                          <div className="carte-plat"><em>Dessert</em> {j.soir.dessert}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {menu.conseil && (
              <div className="carte-conseil">💡 {menu.conseil}</div>
            )}
          </div>
        </div>
      )}

      {/* ── ONGLET HISTORIQUE ── */}
      {activeTab === 'historique' && (
        <div className="dash-content">
          <h1 className="dash-title">Mon <em>historique</em></h1>
          <p className="dash-sub">Retrouvez tous vos menus générés.</p>

          {historyLoading && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--ink3)' }}>
              <span className="dots"><span /><span /><span /></span>
            </div>
          )}

          {!historyLoading && history.length === 0 && (
            <div className="hist-empty">
              <Icon3D anim="bounce" size={40}>📋</Icon3D>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Aucun menu sauvegardé</div>
              <div style={{ fontSize: 13, color: 'var(--ink3)' }}>Vos menus apparaîtront ici après chaque génération.</div>
              <button className="btn-accent" style={{ marginTop: 20, fontSize: 13, padding: '10px 24px', borderRadius: 'var(--r8)', border: 'none', cursor: 'pointer' }} onClick={() => setActiveTab('generer')}>
                Générer mon premier menu →
              </button>
            </div>
          )}

          {!historyLoading && history.length > 0 && (
            <div className="hist-list">
              {history.map(item => {
                const date = new Date(item.created_at)
                // Format court : "mer. 13 mai · 14:52"
                const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
                const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const isOpen = expandedId === item.id

                // Plats aperçu (3 premiers midis)
                const apercu = JOURS
                  .map(j => item.menu?.jours?.[j]?.midi?.plat)
                  .filter(Boolean)
                  .slice(0, 3)

                // Économie : garder seulement le montant avant la parenthèse "~280€ (détail...)"
                const economieCourt = item.menu?.economie
                  ? item.menu.economie.replace(/\s*\(.*\)/, '').trim()
                  : null

                function ouvrirMenu() {
                  setMenu(item.menu)
                  setJourActif('Lundi')
                  setSvcActif('midi')
                  if (item.params) setForm(f => ({ ...f, ...item.params }))
                  setShareUrl(`${window.location.origin}/menu/${item.id}`)
                  setShareCopied(false)
                  setActiveTab('generer')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }

                return (
                  <div key={item.id} className={`hist-card${isOpen ? ' open' : ''}`}>

                    {/* ── En-tête ── */}
                    <div className="hist-card-head" onClick={() => setExpandedId(isOpen ? null : item.id)}>

                      {/* Colonne info (gauche) */}
                      <div className="hist-info">
                        <div className="hist-row-top">
                          <span className="hist-resto">{item.restaurant}</span>
                          {economieCourt && (
                            <span className="hist-eco">{economieCourt} épargnés</span>
                          )}
                        </div>
                        <div className="hist-meta">{item.cuisine} · {dateStr} · {timeStr}</div>
                        {apercu.length > 0 && (
                          <div className="hist-apercu">{apercu.join(' · ')}</div>
                        )}
                      </div>

                      {/* Colonne actions (droite) */}
                      <div className="hist-actions" onClick={e => e.stopPropagation()}>
                        {confirmDeleteId === item.id ? (
                          <div className="hist-confirm-delete">
                            <span>Supprimer&nbsp;?</span>
                            <button className="hist-del-yes" onClick={() => deleteMenu(item.id)}>Oui</button>
                            <button className="hist-del-no" onClick={() => setConfirmDeleteId(null)}>Non</button>
                          </div>
                        ) : (
                          <>
                            <button
                              className="btn-accent hist-btn-open"
                              onClick={ouvrirMenu}
                            >Ouvrir →</button>
                            <button
                              className="hist-btn-del"
                              title="Supprimer"
                              onClick={() => setConfirmDeleteId(item.id)}
                            >🗑</button>
                          </>
                        )}
                        <span className="hist-chevron" onClick={e => { e.stopPropagation(); setExpandedId(isOpen ? null : item.id) }}>
                          {isOpen ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* ── Détails expandables ── */}
                    {isOpen && (
                      <div className="hist-body">
                        {item.menu?.analyse && (
                          <div className="hist-analyse">{item.menu.analyse}</div>
                        )}
                        <div className="hist-jours">
                          {JOURS.map(jour => {
                            const midi = item.menu?.jours?.[jour]?.midi
                            const soir = item.menu?.jours?.[jour]?.soir
                            return (midi?.plat || soir?.plat) ? (
                              <div key={jour} className="hist-jour-pill">
                                <strong>{jour}</strong>
                                {midi?.plat && <span> ☀️ {midi.plat}</span>}
                                {soir?.plat && <span> 🌙 {soir.plat}</span>}
                              </div>
                            ) : null
                          })}
                        </div>
                        <div className="hist-body-actions">
                          <button className="btn-gen" style={{ flex: 1, marginTop: 0 }} onClick={ouvrirMenu}>
                            Ouvrir ce menu →
                          </button>
                          <button className="btn-ghost" onClick={() => {
                            if (item.params) setForm(f => ({ ...f, ...item.params }))
                            setMenu(null)
                            setActiveTab('generer')
                          }}>↺ Régénérer</button>
                          <button className="btn-ghost" onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/menu/${item.id}`)
                          }}>🔗 Copier le lien</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </>
  )
}
