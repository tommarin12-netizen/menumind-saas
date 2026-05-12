'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null)

  async function handleBuy(plan: 'monthly' | 'annual') {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(null)
    }
  }

  const FEATURES = [
    'Génération illimitée de menus',
    '5 jours · Midi & Dîner',
    'Analyse + conseil du chef',
    'Adapté météo, budget, allergènes',
    'Support par email',
  ]

  return (
    <>
      <div className="bg-scene">
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />
      </div>

      <nav className="nav">
        <span className="logo">Menu<em>Mind</em></span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/login" className="btn-ghost">Se connecter</Link>
          <button className="btn-accent" onClick={() => handleBuy('annual')}>Essayer →</button>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Agent pour restaurateurs
        </div>
        <h1>
          Votre menu de la semaine,<br />
          en <em>30 secondes</em>
        </h1>
        <p className="hero-p">
          MenuMind analyse votre type de cuisine, la météo, vos stocks et votre budget
          pour générer un menu complet — entrée, plat, dessert — midi et soir, 5 jours sur 5.
        </p>
        <button className="btn-cta" onClick={() => handleBuy('annual')} disabled={!!loading}>
          {loading ? 'Redirection…' : 'Commencer maintenant →'}
        </button>
        <p style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 14 }}>
          Sans engagement · Résiliable à tout moment
        </p>
      </div>

      <div className="stats-wrap">
        <div className="stats-inner">
          {[
            { n: '30s', l: 'pour générer un menu complet' },
            { n: '5j', l: 'de menus, midi & soir' },
            { n: '–40%', l: 'de pertes alimentaires estimées' },
            { n: '100%', l: 'adapté à votre restaurant' },
          ].map((s) => (
            <div className="stat-item" key={s.n}>
              <div className="stat-n">{s.n}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <p className="sec-label">Fonctionnalités</p>
        <h2 className="sec-title">Tout ce dont vous avez <em>besoin</em></h2>
        <p className="sec-sub">Conçu par des passionnés de restauration, optimisé pour vous.</p>
        <div className="feats">
          {[
            { icon: '🌦️', t: 'Adapté à la météo', d: "Menu chaud en hiver, léger en été. MenuMind tient compte des conditions climatiques pour adapter les plats." },
            { icon: '💰', t: 'Contrôle du budget', d: 'Définissez votre coût matière et MenuMind optimise chaque plat pour rester dans vos marges.' },
            { icon: '🌿', t: 'Gestion des allergènes', d: 'Spécifiez les allergènes à exclure. Le menu généré en tient compte automatiquement.' },
            { icon: '📊', t: 'Analyse incluse', d: "Chaque menu est accompagné d'une analyse de rentabilité et d'un conseil du chef personnalisé." },
            { icon: '🍽️', t: 'Midi & Soir séparés', d: 'Deux services, deux ambiances. MenuMind génère entrée, plat et dessert pour chaque service.' },
            { icon: '⚡', t: 'Résultat en 30 secondes', d: "Pas d'attente. Votre planning de la semaine est prêt en quelques secondes." },
          ].map((f) => (
            <div className="feat" key={f.t}>
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-t">{f.t}</div>
              <div className="feat-d">{f.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section" id="pricing">
        <p className="sec-label">Tarifs</p>
        <h2 className="sec-title">Simple et <em>transparent</em></h2>
        <p className="sec-sub">Sans engagement. Résiliez quand vous voulez.</p>

        <div className="pricing-grid">
          {/* Mensuel */}
          <div className="pricing-card">
            <div className="pricing-top">
              <div className="pricing-badge-pill">Mensuel</div>
              <div className="pricing-price"><sup>€</sup>29</div>
              <div className="pricing-period">par mois · facturé mensuellement</div>
              <div className="pricing-equiv">&nbsp;</div>
            </div>
            <ul className="pricing-features">
              {FEATURES.map((f) => (
                <li key={f}><span className="check">✓</span>{f}</li>
              ))}
            </ul>
            <button
              className="btn-cta-full"
              onClick={() => handleBuy('monthly')}
              disabled={!!loading}
            >
              {loading === 'monthly' ? 'Redirection…' : 'Choisir Mensuel'}
            </button>
            <p className="pricing-note">Paiement sécurisé par Stripe</p>
          </div>

          {/* Annuel */}
          <div className="pricing-card pop">
            <div className="pricing-top">
              <div>
                <div className="pricing-badge-pill hot">Annuel</div>
                <span className="pricing-savings">−28% · économisez 99€</span>
              </div>
              <div className="pricing-price"><sup>€</sup>249</div>
              <div className="pricing-period">par an · facturé annuellement</div>
              <div className="pricing-equiv">soit 20,75€/mois</div>
            </div>
            <ul className="pricing-features">
              {FEATURES.map((f) => (
                <li key={f}><span className="check">✓</span>{f}</li>
              ))}
              <li><span className="check">✓</span><strong>Priorité support</strong></li>
            </ul>
            <button
              className="btn-cta-full pop"
              onClick={() => handleBuy('annual')}
              disabled={!!loading}
            >
              {loading === 'annual' ? 'Redirection…' : 'Choisir Annuel →'}
            </button>
            <p className="pricing-note">Paiement sécurisé · Remboursement 7 jours</p>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 12, color: 'var(--ink3)' }}>
          © {new Date().getFullYear()} MenuMind ·{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Se connecter</Link>
        </p>
      </footer>
    </>
  )
}
