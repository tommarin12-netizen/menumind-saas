# MenuMind SaaS — Onboarding

MenuMind est un SaaS de génération de menus de restaurant par IA, construit avec Next.js 14, Supabase, Stripe et l'API Anthropic (Claude Haiku).

## Stack technique

- **Framework** : Next.js 16 (App Router, TypeScript, Turbopack)
- **Auth & DB** : Supabase (`@supabase/ssr`) — magic links, table `customers` avec RLS
- **Paiements** : Stripe — abonnements mensuel (29€) et annuel (249€)
- **Emails** : Resend — email de bienvenue avec magic link post-paiement
- **IA** : Anthropic SDK — `claude-haiku-4-5` avec prompt caching sur le system prompt

## Flux automatisé

```
Client choisit un plan → Stripe Checkout → Webhook → Compte Supabase créé → Email Resend → Dashboard
```

## Structure des fichiers clés

```
app/
  page.tsx              ← Landing page (hero, features, 2 pricing cards)
  login/page.tsx        ← Connexion magic link
  success/page.tsx      ← Confirmation post-paiement
  dashboard/page.tsx    ← Générateur de menus (protégé)
  api/
    checkout/route.ts   ← Crée session Stripe (plan mensuel ou annuel)
    webhook/route.ts    ← Stripe → crée compte → envoie email
    generate/route.ts   ← Proxy Claude API (vérifie auth + has_access)
  components/
    SplashScreen.tsx    ← Intro 2s au premier chargement
lib/
  supabase/server.ts    ← Client serveur + admin (service role)
  supabase/client.ts    ← Client navigateur
  stripe.ts             ← Instance Stripe
supabase/
  schema.sql            ← Table customers + RLS (à exécuter dans Supabase)
proxy.ts                ← Protection routes /dashboard et /login (Next.js 16)
```

## Variables d'environnement requises

Voir `.env.local.example` — copier en `.env.local` et remplir :
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY` + `STRIPE_PRICE_ID_ANNUAL`
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Commandes

```bash
npm run dev    # Démarrer en local (http://localhost:3000)
npm run build  # Build de production
npm run lint   # Linter
```

## Déploiement

Voir `GUIDE_DEPLOIEMENT.md` pour le guide complet Supabase → Stripe → Resend → Vercel.

## Webhooks Stripe à configurer

Événements requis sur `/api/webhook` :
- `checkout.session.completed` — active l'accès après paiement
- `customer.subscription.deleted` — révoque l'accès après résiliation
