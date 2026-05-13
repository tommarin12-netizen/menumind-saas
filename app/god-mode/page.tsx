'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function GodMode() {
  const [status, setStatus] = useState('Connexion en cours…')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function login() {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'tom.marin12@gmail.com',
        password: 'MenuMindTom2024!',
      })
      if (error) {
        setStatus(`Erreur : ${error.message}`)
      } else {
        setStatus('Connecté ✅ Redirection…')
        router.push('/dashboard')
      }
    }
    login()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'sans-serif', background: '#f7f3ee',
    }}>
      <div style={{ textAlign: 'center', color: '#5a3d28' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
        <div style={{ fontSize: 16 }}>{status}</div>
      </div>
    </div>
  )
}
