'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-scene">
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />
      </div>

      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">Menu<em>Mind</em></div>

          {sent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 40 }}>📧</div>
              <p className="login-sub">
                Un lien de connexion a été envoyé à <strong>{email}</strong>.
                Consultez votre boîte mail et cliquez sur le lien.
              </p>
              <button
                className="btn-login"
                style={{ marginTop: 8, background: 'var(--surface2)', color: 'var(--ink)', border: '1px solid var(--border2)' }}
                onClick={() => setSent(false)}
              >
                ← Changer d&apos;email
              </button>
            </>
          ) : (
            <>
              <p className="login-sub">Connectez-vous avec votre email d&apos;achat</p>
              {error && <div className="login-err">{error}</div>}
              <form onSubmit={handleLogin}>
                <label className="login-label">Adresse email</label>
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoFocus
                />
                <button className="btn-login" type="submit" disabled={loading || !email}>
                  {loading ? (
                    <span className="dots"><span /><span /><span /></span>
                  ) : (
                    'Envoyer le lien →'
                  )}
                </button>
              </form>
              <div className="login-footer">
                Pas encore client ?{' '}
                <Link href="/#pricing">Obtenir MenuMind</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, color: '#9a7860' }}>Chargement…</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
