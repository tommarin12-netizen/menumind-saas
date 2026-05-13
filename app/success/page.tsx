'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Status = 'waiting' | 'ready' | 'timeout'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<Status>('waiting')
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('')
  const [step, setStep] = useState(0) // 0=payment, 1=account, 2=email

  useEffect(() => {
    if (!sessionId) return
    // animate steps while waiting
    const s1 = setTimeout(() => setStep(1), 800)
    const s2 = setTimeout(() => setStep(2), 2200)

    let tries = 0
    const MAX = 48 // 2 min max

    const check = async () => {
      try {
        const res = await fetch(`/api/check-access?session_id=${sessionId}`)
        const data = await res.json()
        if (data.ready) {
          setEmail(data.email ?? '')
          setPlan(data.plan ?? '')
          setStatus('ready')
          setStep(3)
          return true
        }
      } catch {}
      return false
    }

    const go = () => {
      check().then(done => {
        if (done) return
        tries++
        if (tries >= MAX) { setStatus('timeout'); return }
        setTimeout(go, 2500)
      })
    }
    setTimeout(go, 1500) // first check after 1.5s

    return () => { clearTimeout(s1); clearTimeout(s2) }
  }, [sessionId])

  const STEPS = [
    { icon: '💳', label: 'Paiement confirmé', done: step >= 0 },
    { icon: '👤', label: 'Création de votre compte', done: step >= 2 },
    { icon: '📧', label: 'Envoi du lien de connexion', done: step >= 3 },
  ]

  const planLabel = plan === 'annual' ? 'Annuel' : plan === 'monthly' ? 'Mensuel' : ''
  const mailDomain = email ? email.split('@')[1] : ''
  const mailUrl = mailDomain ? `https://${mailDomain}` : 'https://mail.google.com'

  return (
    <>
      <div className="bg-scene">
        <div className="bg-orb orb1" /><div className="bg-orb orb2" /><div className="bg-orb orb3" />
      </div>

      <div className="success-wrap">
        <div className="success-card">

          {status === 'waiting' && (
            <>
              <div className="success-icon" style={{ animation: 'none', fontSize: 48 }}>
                <span style={{ animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⚙️</span>
              </div>
              <h1 className="success-title" style={{ fontSize: 'clamp(22px,3.5vw,32px)' }}>
                Activation en cours<span className="success-blink">…</span>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink3)', marginBottom: 28, lineHeight: 1.7 }}>
                Ça prend quelques secondes, ne fermez pas cette page.
              </p>
            </>
          )}

          {status === 'ready' && (
            <>
              <div className="success-icon">🎉</div>
              <h1 className="success-title">
                Bienvenue sur <em>MenuMind</em>&nbsp;!
              </h1>
              {planLabel && (
                <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#fff', background: 'linear-gradient(135deg,var(--accent),#e8874a)', padding: '4px 14px', borderRadius: 100, marginBottom: 18 }}>
                  Plan {planLabel} activé ✓
                </div>
              )}
            </>
          )}

          {status === 'timeout' && (
            <>
              <div className="success-icon">✅</div>
              <h1 className="success-title">Paiement <em>confirmé</em></h1>
            </>
          )}

          {/* Steps checklist */}
          <div className="success-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`success-step${s.done ? ' done' : ''}${i === step && status === 'waiting' ? ' active' : ''}`}>
                <div className="success-step-icon">
                  {s.done ? '✓' : i === step && status === 'waiting'
                    ? <span className="step-spinner" />
                    : <span style={{ opacity: .35 }}>{i + 1}</span>
                  }
                </div>
                <span className="success-step-label">{s.label}</span>
              </div>
            ))}
          </div>

          {(status === 'ready' || status === 'timeout') && (
            <>
              {email && (
                <div className="success-email-box">
                  <span style={{ fontSize: 20 }}>📧</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Lien envoyé à</div>
                    <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>{email}</div>
                  </div>
                </div>
              )}

              <a
                href={mailUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-gen"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: 10 }}
              >
                Ouvrir ma boîte mail →
              </a>

              <Link href="/login" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: 'var(--ink3)', textDecoration: 'underline', marginBottom: 20 }}>
                Ou se connecter manuellement
              </Link>

              <div className="success-spam-note">
                💡 Pensez à vérifier vos <strong>spams</strong> si vous ne voyez pas l&apos;email dans 2 minutes.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, color: '#9a7860' }}>Chargement…</span>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
