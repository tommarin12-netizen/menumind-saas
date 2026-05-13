import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — MenuMind',
  description: 'Comment MenuMind collecte, utilise et protège vos données personnelles.',
}

export default function ConfidentialitePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 400, color: 'var(--ink)', textDecoration: 'none' }}>
          Menu<strong>Mind</strong>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: 'var(--ink3)', textDecoration: 'none' }}>← Retour</Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 32px 80px' }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 36, fontWeight: 400, marginBottom: 8 }}>
          Politique de <em>confidentialité</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 48 }}>Dernière mise à jour : mai 2025</p>

        <Section title="1. Responsable du traitement">
          MenuMind est édité par un auto-entrepreneur immatriculé en France. Pour toute question relative à vos données : <strong>contact@menumind.fr</strong>
        </Section>

        <Section title="2. Données collectées">
          Nous collectons uniquement les données nécessaires au fonctionnement du service :
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li><strong>Adresse email</strong> — pour la création de compte et l&apos;envoi des accès</li>
            <li><strong>Données de paiement</strong> — traitées exclusivement par Stripe (nous ne stockons jamais vos coordonnées bancaires)</li>
            <li><strong>Menus générés</strong> — sauvegardés pour votre historique personnel</li>
            <li><strong>Notes de recettes</strong> — agrégées anonymement pour améliorer le service</li>
          </ul>
        </Section>

        <Section title="3. Utilisation des données">
          Vos données sont utilisées exclusivement pour :
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li>Fournir et maintenir le service MenuMind</li>
            <li>Vous envoyer votre lien de connexion et les emails liés à votre abonnement</li>
            <li>Améliorer la qualité des menus et recettes générés</li>
          </ul>
          <strong>Nous ne vendons jamais vos données à des tiers.</strong>
        </Section>

        <Section title="4. Sous-traitants">
          Nous utilisons les services suivants, chacun soumis à sa propre politique de confidentialité :
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li><strong>Supabase</strong> — hébergement de la base de données (UE)</li>
            <li><strong>Stripe</strong> — traitement des paiements</li>
            <li><strong>Anthropic</strong> — génération de contenu par IA (les données sont traitées mais non conservées par Anthropic)</li>
            <li><strong>Resend</strong> — envoi d&apos;emails transactionnels</li>
          </ul>
        </Section>

        <Section title="5. Durée de conservation">
          Vos données sont conservées le temps de votre abonnement actif, puis supprimées dans un délai de 12 mois après la résiliation, sauf obligation légale contraire.
        </Section>

        <Section title="6. Vos droits (RGPD)">
          Conformément au RGPD, vous disposez des droits suivants sur vos données :
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li><strong>Accès</strong> — obtenir une copie de vos données</li>
            <li><strong>Rectification</strong> — corriger des données inexactes</li>
            <li><strong>Suppression</strong> — demander l&apos;effacement de vos données</li>
            <li><strong>Portabilité</strong> — recevoir vos données dans un format lisible</li>
            <li><strong>Opposition</strong> — vous opposer à certains traitements</li>
          </ul>
          Pour exercer ces droits : <strong>contact@menumind.fr</strong>. Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> (cnil.fr).
        </Section>

        <Section title="7. Cookies">
          MenuMind utilise uniquement des cookies techniques strictement nécessaires au fonctionnement de l&apos;authentification. Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
        </Section>

        <Section title="8. Sécurité">
          Vos données sont transmises via HTTPS et stockées de manière chiffrée. L&apos;accès est limité aux seules personnes ayant besoin d&apos;y accéder pour fournir le service.
        </Section>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', textAlign: 'center', fontSize: 12, color: 'var(--ink3)' }}>
        <Link href="/cgu" style={{ color: 'var(--ink3)', marginRight: 16 }}>CGU</Link>
        <Link href="/" style={{ color: 'var(--ink3)' }}>menumind.fr</Link>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>{title}</h2>
      <div style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.8 }}>{children}</div>
    </div>
  )
}
