'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Connexion en cours…')

  useEffect(() => {
    const supabase = createClient()
    const next = searchParams.get('next') ?? '/dashboard'

    // onAuthStateChange is the canonical way to detect when Supabase
    // has processed any auth flow (PKCE code, implicit hash, token_hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        subscription.unsubscribe()
        router.replace(next)
      }
    })

    // Case 1: PKCE flow → ?code=xxx
    const code = searchParams.get('code')
    if (code) {
      setStatus('Vérification du code…')
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          subscription.unsubscribe()
          router.replace('/login?error=lien_invalide')
        }
        // on success, onAuthStateChange fires → redirect
      })
    }

    // Case 2: token_hash (magic link via admin API ou email)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as 'magiclink' | 'email' | null
    if (token_hash && type) {
      setStatus('Vérification du lien…')
      supabase.auth.verifyOtp({ token_hash, type }).then(({ error }) => {
        if (error) {
          subscription.unsubscribe()
          router.replace('/login?error=lien_invalide')
        }
        // on success, onAuthStateChange fires → redirect
      })
    }

    // Case 3: Implicit flow → #access_token= in hash
    // Supabase JS detects this automatically via detectSessionInUrl
    // onAuthStateChange will fire when ready — no extra code needed

    // Fallback timeout after 8 seconds
    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        router.replace(next)
      } else {
        router.replace('/login?error=lien_invalide')
      }
      subscription.unsubscribe()
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f3ee' }}>
      <div style={{ textAlign: 'center', color: '#5a3d28' }}>
        <div style={{ fontSize: 32, marginBottom: 12, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚡</div>
        <div style={{ fontSize: 15 }}>{status}</div>
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
