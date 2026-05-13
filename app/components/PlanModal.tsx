'use client'
import { useState } from 'react'

type Plan = 'monthly' | 'annual'

interface Props {
  onClose: () => void
  onSelect: (plan: Plan) => void
  loading: Plan | null
}

const STEPS = [
  { emoji: '🥩', text: 'Le filet de bœuf commandé en trop…' },
  { emoji: '🥬', text: 'Les légumes qui flétrissent au frigo…' },
  { emoji: '🧀', text: 'Le fromage que personne n\'a commandé…' },
  { emoji: '💸', text: 'Tout ça, c\'est de l\'argent qui part à la poubelle.' },
]

export default function PlanModal({ onClose, onSelect, loading }: Props) {
  const [step, setStep] = useState(0)
  const [showPlans, setShowPlans] = useState(false)

  function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      setShowPlans(true)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        {!showPlans ? (
          <>
            <button className="modal-close" onClick={onClose}>✕</button>
            <div className="modal-story">
              <div className="modal-step-emoji">{STEPS[step].emoji}</div>
              <p className="modal-step-text">{STEPS[step].text}</p>
              <div className="modal-dots">
                {STEPS.map((_, i) => (
                  <span key={i} className={`modal-dot${i === step ? ' on' : ''}`} />
                ))}
              </div>
              <button className="modal-next" onClick={next}>
                {step < STEPS.length - 1 ? 'Suite →' : 'Voir la solution →'}
              </button>
              {step === 0 && (
                <p className="modal-skip" onClick={() => setShowPlans(true)}>
                  Passer directement aux tarifs
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <button className="modal-close" onClick={onClose}>✕</button>

            <div className="modal-roi-header">
              <div className="modal-roi-emoji">📉</div>
              <h2 className="modal-roi-title">
                Un resto de 80 couverts perd en moyenne<br />
                <em>200€ par semaine</em> en stocks mal gérés.
              </h2>
              <p className="modal-roi-sub">
                MenuMind se rentabilise en <strong>moins de 5 jours.</strong> Sérieusement.
              </p>
            </div>

            <div className="modal-plans">
              {/* Mensuel */}
              <div className="modal-plan">
                <div className="modal-plan-badge">Mensuel</div>
                <div className="modal-plan-price"><sup>€</sup>29<span>/mois</span></div>
                <p className="modal-plan-desc">Sans engagement.<br />Partez quand vous voulez.</p>
                <ul className="modal-plan-list">
                  <li>✓ Menus illimités</li>
                  <li>✓ 5 jours · Midi & Soir</li>
                  <li>✓ Conseil du chef inclus</li>
                </ul>
                <button
                  className="modal-btn-secondary"
                  onClick={() => onSelect('monthly')}
                  disabled={!!loading}
                >
                  {loading === 'monthly' ? 'Redirection…' : 'Choisir Mensuel'}
                </button>
              </div>

              {/* Annuel */}
              <div className="modal-plan pop">
                <div className="modal-plan-pop-label">⭐ Le plus rentable</div>
                <div className="modal-plan-badge hot">Annuel</div>
                <div className="modal-plan-price"><sup>€</sup>249<span>/an</span></div>
                <p className="modal-plan-desc">
                  Soit <strong>20,75€/mois.</strong><br />
                  Vous économisez <strong>99€</strong> vs mensuel.
                </p>
                <ul className="modal-plan-list">
                  <li>✓ Menus illimités</li>
                  <li>✓ 5 jours · Midi & Soir</li>
                  <li>✓ Conseil du chef inclus</li>
                  <li>✓ Priorité support</li>
                </ul>
                <div className="modal-roi-pill">
                  Rentabilisé dès la 1ère semaine 🚀
                </div>
                <button
                  className="modal-btn-primary"
                  onClick={() => onSelect('annual')}
                  disabled={!!loading}
                >
                  {loading === 'annual' ? 'Redirection…' : 'Choisir Annuel →'}
                </button>
              </div>
            </div>

            <p className="modal-footer-note">
              Paiement sécurisé · Résiliable à tout moment · Remboursement 7 jours si insatisfait
            </p>
          </>
        )}
      </div>
    </div>
  )
}
