'use client'
import { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('mm_splash')) return
    sessionStorage.setItem('mm_splash', '1')
    setVisible(true)

    const t1 = setTimeout(() => setHiding(true), 1500)
    const t2 = setTimeout(() => setVisible(false), 1950)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div className={`splash${hiding ? ' splash-out' : ''}`}>
      <div className="splash-inner">
        <span className="splash-logo">Menu<em>Mind</em></span>
        <div className="splash-bar" />
      </div>
    </div>
  )
}
