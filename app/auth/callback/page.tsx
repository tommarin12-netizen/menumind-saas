'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const next = searchParams.get('next') ?? '/dashboard'

    // Cas 1 : PKCE flow → ?code=xxx
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? '/login?error=lien_invalide' : next)
      })
      return
    }

    // Cas 2 : Implicit flow → #access_token=xxx dans le hash
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      // Supabase JS lit le hash automatiquement via onAuthStateChange
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          router.replace(next)
        } else {
          // Laisser un peu de temps à Supabase pour traiter le hash
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: d }) => {
              router.replace(d.session ? next : '/login?error=lien_invalide')
            })
          }, 1000)
        }
      })
      return
    }

    // Cas 3 : token_hash (magic link direct)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as 'magiclink' | 'email' | null
    if (token_hash && type) {
      supabase.auth.verifyOtp({ token_hash, type }).then(({ error }) => {
        router.replace(error ? '/login?error=lien_invalide' : next)
      })
      return
    }

    // Rien trouvé → login
    router.replace('/login?error=lien_invalide')
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f3ee' }}>
      <div style={{ textAlign: 'center', color: '#5a3d28' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
        <div style={{ fontSize: 15 }}>Connexion en cours…</div>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, color: '#9a7860' }}>Chargement…</span>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
