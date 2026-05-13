import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CGU — MenuMind',
  description: "Conditions générales d'utilisation de MenuMind.",
}

export default function CGUPage() {
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
          Conditions Générales d&apos;<em>Utilisation</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 48 }}>Dernière mise à jour : mai 2025</p>

        <Section title="1. Objet">
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation du service MenuMind, accessible à l&apos;adresse menumind.fr, édité par un auto-entrepreneur immatriculé en France.
        </Section>

        <Section title="2. Accès au service">
          MenuMind est un service par abonnement payant destiné aux professionnels de la restauration. L&apos;accès est réservé aux personnes majeures agissant dans un cadre professionnel. L&apos;inscription requiert une adresse email valide et le paiement d&apos;un abonnement mensuel ou annuel.
        </Section>

        <Section title="3. Description du service">
          MenuMind permet de générer automatiquement des menus de restaurant à l&apos;aide de l&apos;intelligence artificielle, d&apos;obtenir des recettes détaillées, des listes de courses et des estimations de coûts. Les contenus générés sont indicatifs et ne sauraient engager la responsabilité de l&apos;éditeur quant à leur exactitude.
        </Section>

        <Section title="4. Abonnement et paiement">
          Le paiement est traité par Stripe, prestataire de paiement sécurisé. L&apos;abonnement est sans engagement pour la formule mensuelle et annuel pour la formule annuelle. Vous pouvez résilier à tout moment depuis votre espace client. Aucun remboursement n&apos;est accordé pour la période en cours, sauf pendant les 7 premiers jours suivant le premier achat.
        </Section>

        <Section title="5. Propriété intellectuelle">
          Le code, le design et les contenus de MenuMind sont la propriété exclusive de l&apos;éditeur. Les menus et recettes générés par l&apos;IA pour l&apos;utilisateur lui appartiennent et peuvent être utilisés librement dans son activité professionnelle.
        </Section>

        <Section title="6. Données personnelles">
          Les données collectées (email, menus générés) sont utilisées uniquement pour fournir le service. Elles ne sont jamais revendues à des tiers. Voir notre <Link href="/confidentialite" style={{ color: 'var(--accent)' }}>Politique de confidentialité</Link> pour plus de détails.
        </Section>

        <Section title="7. Limitation de responsabilité">
          MenuMind est fourni &quot;en l&apos;état&quot;. L&apos;éditeur ne peut être tenu responsable des pertes financières, erreurs de calcul de coûts ou inadaptations des recettes générées. L&apos;utilisateur reste seul responsable de l&apos;utilisation des contenus dans son établissement.
        </Section>

        <Section title="8. Modification des CGU">
          L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email en cas de modification substantielle. La poursuite de l&apos;utilisation du service vaut acceptation des nouvelles conditions.
        </Section>

        <Section title="9. Droit applicable">
          Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents. Pour toute réclamation : contact@menumind.fr
        </Section>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', textAlign: 'center', fontSize: 12, color: 'var(--ink3)' }}>
        <Link href="/confidentialite" style={{ color: 'var(--ink3)', marginRight: 16 }}>Politique de confidentialité</Link>
        <Link href="/" style={{ color: 'var(--ink3)' }}>menumind.fr</Link>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>{title}</h2>
      <p style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.8 }}>{children}</p>
    </div>
  )
}
