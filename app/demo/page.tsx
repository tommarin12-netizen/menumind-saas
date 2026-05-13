'use client'
import { useState } from 'react'
import Link from 'next/link'

const DEMO_MENU = {
  analyse: "Votre menu de la semaine est optimisé pour écouler vos stocks d'agneau et de courgettes. Les plats chauds dominent en accord avec la météo froide annoncée. Le coût matière estimé reste sous les 30% du CA.",
  conseil: "Misez sur un plat du jour ardoise pour créer la surprise et adapter l'offre aux arrivages du marché sans retravailler tout le menu.",
  economie: "~180€ de pertes évitées",
  jours: {
    Lundi: {
      midi: { entree: 'Velouté de butternut & châtaignes', plat: 'Gigot d\'agneau confit, flageolets maison', dessert: 'Tarte tatin pommes-caramel beurre salé', prix: '18€' },
      soir: { entree: 'Carpaccio de betterave & chèvre frais', plat: 'Côtelettes d\'agneau, gratin dauphinois', dessert: 'Fondant chocolat noir', prix: '24€' },
    },
    Mardi: {
      midi: { entree: 'Soupe de légumes du marché', plat: 'Parmentier d\'agneau aux courgettes', dessert: 'Crème caramel maison', prix: '16€' },
      soir: { entree: 'Tartare de saumon mariné', plat: 'Agneau en croûte d\'herbes, ratatouille', dessert: 'Île flottante vanille', prix: '26€' },
    },
    Mercredi: {
      midi: { entree: 'Salade de lentilles tièdes au lard', plat: 'Blanquette de veau légumes d\'hiver', dessert: 'Mousse au chocolat', prix: '17€' },
      soir: { entree: 'Velouté de champignons & truffe', plat: 'Magret de canard, sauce orange & gingembre', dessert: 'Tarte aux noix', prix: '28€' },
    },
    Jeudi: {
      midi: { entree: 'Œuf parfait, crème de comté', plat: 'Dos de cabillaud, purée chou-fleur', dessert: 'Financier amandes', prix: '17€' },
      soir: { entree: 'Foie gras poêlé, brioche toastée', plat: 'Filet de bœuf, béarnaise & frites maison', dessert: 'Paris-Brest', prix: '32€' },
    },
    Vendredi: {
      midi: { entree: 'Terrine de légumes du jardin', plat: 'Risotto aux courgettes & parmesan', dessert: 'Sorbet fruits rouges', prix: '16€' },
      soir: { entree: 'Ceviche de daurade, avocat', plat: 'Bouillabaisse provençale & rouille', dessert: 'Mille-feuille vanille', prix: '30€' },
    },
  },
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

export default function DemoPage() {
  const [form, setForm] = useState({
    restaurant: '', cuisine: 'Française', stocks: '',
    meteo: '', couverts: '', budget: '', allergenes: '',
  })
  const [showResult, setShowResult] = useState(false)
  const [jourActif, setJourActif] = useState('Lundi')
  const [svcActif, setSvcActif] = useState<'midi' | 'soir'>('midi')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function generer() {
    if (!form.restaurant) return
    setShowResult(true)
    // Immediately show the upgrade modal on top of blurred result
    setTimeout(() => setShowUpgrade(true), 600)
  }

  async function handleBuy(plan: 'monthly' | 'annual') {
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoadingPlan(null)
    }
  }

  const svc = DEMO_MENU.jours[jourActif as keyof typeof DEMO_MENU.jours]?.[svcActif]

  return (
    <>
      <div className="bg-scene">
        <div className="bg-orb orb1" /><div className="bg-orb orb2" /><div className="bg-orb orb3" />
      </div>

      <nav className="nav">
        <Link href="/" className="logo" style={{ textDecoration: 'none' }}>Menu<em>Mind</em></Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--ink3)', background: 'var(--surface2)', border: '1px dashed var(--border2)', padding: '4px 12px', borderRadius: 100 }}>
            👀 Mode aperçu
          </span>
          <button className="btn-accent" onClick={() => setShowUpgrade(true)}>Débloquer →</button>
        </div>
      </nav>

      {!showResult ? (
        <div className="dash-content">
          <div className="demo-badge">
            <span>👀</span> Vous êtes en mode aperçu gratuit — remplissez le formulaire pour voir comment ça marche
          </div>
          <h1 className="dash-title">Générer mon <em>menu</em></h1>
          <p className="dash-sub">Testez l&apos;interface. Le résultat sera dévoilé… partiellement 😏</p>

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
            </div>

            <button className="btn-gen" onClick={generer} disabled={!form.restaurant}>
              Voir le résultat →
            </button>
            <p className="form-note">Aperçu gratuit · Résultat démo · Vos données ne sont pas sauvegardées</p>
          </div>
        </div>
      ) : (
        <div className="res-page" style={{ position: 'relative' }}>

          {/* Blurred content */}
          <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', opacity: .85 }}>
            <div className="res-top">
              <div>
                <div className="res-h">Menu <em>composé</em></div>
                <div className="res-sub">{form.restaurant || 'Votre restaurant'} · Cuisine {form.cuisine}</div>
              </div>
            </div>

            <div className="analyse-card">
              <div className="card-label">Analyse</div>
              <div className="analyse-text">{DEMO_MENU.analyse}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--green-soft)', border: '1px solid rgba(45,106,79,.15)', borderRadius: 'var(--r12)', padding: '14px 18px', marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📉</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>{DEMO_MENU.economie}</div>
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>de pertes estimées évitées</div>
              </div>
            </div>

            <div className="divider" />
            <div className="res-sec-label">Menu de la semaine</div>
            <div className="tabs-jours">
              {JOURS.map(j => <button key={j} className={`tj${jourActif === j ? ' on' : ''}`}>{j}</button>)}
            </div>
            <div className="tabs-svc">
              <button className="ts on">Déjeuner</button>
              <button className="ts">Dîner</button>
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
            <div className="conseil-card">
              <div className="conseil-label">Conseil de la semaine</div>
              <div className="conseil-text">{DEMO_MENU.conseil}</div>
            </div>
          </div>

          {/* Lock overlay */}
          <div className="demo-lock-overlay">
            <div className="demo-lock-card">
              <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
              <h2 className="demo-lock-title">Votre menu est prêt !</h2>
              <p className="demo-lock-sub">
                Débloquez les <strong>5 jours complets</strong>, l&apos;analyse personnalisée
                et le conseil du chef avec un abonnement MenuMind.
              </p>
              <div className="demo-lock-roi">
                💸 Un resto de 80 couverts perd ~<strong>200€/semaine</strong> en stocks.<br />
                MenuMind se rentabilise en <strong>moins de 5 jours</strong>.
              </div>
              <div className="demo-lock-plans">
                <button
                  className="demo-plan-btn"
                  onClick={() => handleBuy('monthly')}
                  disabled={!!loadingPlan}
                >
                  {loadingPlan === 'monthly' ? 'Redirection…' : (<><strong>29€/mois</strong><span>Sans engagement</span></>)}
                </button>
                <button
                  className="demo-plan-btn pop"
                  onClick={() => handleBuy('annual')}
                  disabled={!!loadingPlan}
                >
                  {loadingPlan === 'annual' ? 'Redirection…' : (<><strong>249€/an</strong><span>⭐ Le plus rentable · 20,75€/mois</span></>)}
                </button>
              </div>
              <button
                className="demo-lock-back"
                onClick={() => { setShowResult(false); setShowUpgrade(false) }}
              >
                ← Modifier mon formulaire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating upgrade nudge when browsing blurred content without the overlay */}
      {showResult && !showUpgrade && (
        <div className="demo-float-btn" onClick={() => setShowUpgrade(true)}>
          🔓 Débloquer mon menu →
        </div>
      )}
    </>
  )
}
