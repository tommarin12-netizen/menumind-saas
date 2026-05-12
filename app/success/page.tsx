import Link from 'next/link'

export default function SuccessPage() {
  return (
    <>
      <div className="bg-scene">
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />
      </div>
      <div className="success-wrap">
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h1 className="success-title">Bienvenue sur <em>MenuMind</em> !</h1>
          <p className="success-desc">
            Votre paiement a été confirmé. Vous allez recevoir un email d&apos;ici quelques secondes
            avec votre lien de connexion.
          </p>
          <p style={{ fontSize: 14, color: 'var(--ink3)', marginBottom: 28, lineHeight: 1.7 }}>
            📧 Vérifiez aussi vos <strong>spams</strong> si vous ne le recevez pas dans 2 minutes.
          </p>
          <Link href="/login" className="btn-accent" style={{ display: 'inline-block', fontSize: 15, padding: '13px 32px', borderRadius: 'var(--r12)' }}>
            Se connecter →
          </Link>
        </div>
      </div>
    </>
  )
}
