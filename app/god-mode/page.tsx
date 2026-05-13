'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GodMode() {
  const [status, setStatus] = useState('Activation en cours…')
  const router = useRouter()

  useEffect(() => {
    // Appelle l'endpoint admin qui crée/met à jour le compte + génère un magic link
    fetch('/api/admin/magic?token=mm_creator_tom_2024')
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          setStatus('Compte activé ✅ Redirection…')
          window.location.href = data.url
        } else {
          setStatus(`Erreur : ${data.error ?? 'inconnue'}`)
        }
      })
      .catch(() => setStatus('Erreur réseau'))
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
