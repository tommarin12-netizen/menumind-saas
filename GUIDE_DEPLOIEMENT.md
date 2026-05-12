# Guide de déploiement — MenuMind SaaS

Ce guide vous permet de mettre en ligne MenuMind en moins d'une heure, sans connaissances techniques avancées.

---

## Vue d'ensemble du flux

```
Client achète → Stripe → Webhook → Compte créé automatiquement → Email envoyé → Client se connecte
```

---

## Étape 1 — Supabase (base de données & authentification)

1. Créez un compte gratuit sur [supabase.com](https://supabase.com)
2. Cliquez **New project** — choisissez un nom, une région (Europe West), un mot de passe fort
3. Une fois le projet créé, allez dans **SQL Editor** et exécutez le contenu de `supabase/schema.sql`
4. Récupérez vos clés dans **Settings > API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret !) → `SUPABASE_SERVICE_ROLE_KEY`
5. Dans **Authentication > URL Configuration**, ajoutez votre domaine Vercel dans **Redirect URLs** :
   ```
   https://votre-domaine.vercel.app/**
   https://votre-domaine.com/**
   ```

---

## Étape 2 — Stripe (paiements)

1. Créez un compte sur [stripe.com](https://stripe.com) (activez votre compte avec vos infos bancaires pour recevoir des paiements réels)
2. Dans le dashboard Stripe, allez dans **Produits > Créer un produit** :
   - Nom : `MenuMind — Accès à vie`
   - Prix : `97 €`, paiement unique
   - Copiez l'**ID du prix** (commence par `price_`) → `STRIPE_PRICE_ID`
3. Récupérez vos clés dans **Développeurs > Clés API** :
   - `Clé publiable` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Clé secrète` → `STRIPE_SECRET_KEY`
4. Configurez le webhook dans **Développeurs > Webhooks > Ajouter un endpoint** :
   - URL : `https://votre-domaine.com/api/webhook`
   - Événements à écouter : `checkout.session.completed`
   - Copiez le **Secret de signature** → `STRIPE_WEBHOOK_SECRET`

> ⚠️ Le webhook ne fonctionnera qu'une fois votre app déployée. Pour tester en local, utilisez la [Stripe CLI](https://stripe.com/docs/stripe-cli) : `stripe listen --forward-to localhost:3000/api/webhook`

---

## Étape 3 — Resend (emails transactionnels)

1. Créez un compte sur [resend.com](https://resend.com)
2. Dans **Domains**, ajoutez votre domaine et suivez les instructions pour ajouter les enregistrements DNS
3. Une fois le domaine vérifié, allez dans **API Keys > Create API Key** → `RESEND_API_KEY`
4. Définissez votre adresse d'expéditeur :
   ```
   RESEND_FROM_EMAIL=MenuMind <noreply@votre-domaine.com>
   ```

> 💡 Sans domaine personnalisé, vous pouvez utiliser `onboarding@resend.dev` pour les tests.

---

## Étape 4 — Anthropic (intelligence artificielle)

1. Créez un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Allez dans **Settings > API Keys > Create Key**
3. Copiez la clé → `ANTHROPIC_API_KEY`
4. Ajoutez des crédits dans **Billing** (le modèle Haiku coûte ~$0.001 par menu généré)

---

## Étape 5 — Déploiement sur Vercel

1. Poussez votre code sur GitHub :
   ```bash
   git init
   git add .
   git commit -m "Initial MenuMind SaaS"
   git remote add origin https://github.com/votre-compte/menumind-saas.git
   git push -u origin main
   ```
   > Vérifiez que `.env.local` est bien dans `.gitignore` (il l'est par défaut avec Next.js)

2. Connectez-vous sur [vercel.com](https://vercel.com) avec votre compte GitHub
3. Cliquez **Add New > Project** et importez votre dépôt
4. Dans **Environment Variables**, ajoutez toutes les variables de `.env.local.example` avec vos vraies valeurs
5. Cliquez **Deploy** — Vercel construit et déploie automatiquement

6. Une fois déployé, mettez à jour `NEXT_PUBLIC_APP_URL` avec votre vrai domaine Vercel :
   ```
   NEXT_PUBLIC_APP_URL=https://menumind-saas.vercel.app
   ```
   Puis faites un **Redeploy** depuis le dashboard Vercel.

---

## Étape 6 — Test du flux complet

1. **Test paiement** : allez sur votre site, cliquez "Obtenir MenuMind", utilisez la carte test Stripe `4242 4242 4242 4242` (date future, n'importe quel CVC)
2. **Vérifiez le webhook** : dans Stripe > Développeurs > Webhooks > votre endpoint, vous devriez voir un événement `checkout.session.completed` avec statut `200`
3. **Vérifiez l'email** : un email de bienvenue avec un lien de connexion doit arriver dans votre boîte
4. **Vérifiez Supabase** : dans **Authentication > Users**, un utilisateur doit apparaître ; dans **Table Editor > customers**, la ligne doit avoir `has_access = true`
5. **Test connexion** : cliquez sur le lien dans l'email → vous devez atterrir sur `/dashboard`
6. **Test génération** : remplissez le formulaire et générez un menu

---

## En cas de problème

| Symptôme | Cause probable | Solution |
|---|---|---|
| Webhook status `400` | Secret webhook incorrect | Vérifiez `STRIPE_WEBHOOK_SECRET` |
| Email non reçu | Domaine Resend non vérifié | Vérifiez les DNS Resend |
| Dashboard inaccessible | URL de redirection Supabase manquante | Ajoutez le domaine dans Supabase Auth |
| Erreur `has_access` | Webhook non déclenché | Vérifiez les logs Stripe > Webhooks |
| Erreur génération IA | Crédits Anthropic épuisés | Rechargez votre compte Anthropic |

---

## Domaine personnalisé (optionnel)

1. Dans Vercel > votre projet > **Settings > Domains**, ajoutez votre domaine
2. Configurez les DNS chez votre registrar selon les instructions Vercel
3. Mettez à jour `NEXT_PUBLIC_APP_URL` et l'URL du webhook Stripe avec votre vrai domaine
4. Mettez à jour les Redirect URLs dans Supabase Auth

---

## Checklist finale

- [ ] Schema SQL exécuté dans Supabase
- [ ] Redirect URLs configurées dans Supabase Auth
- [ ] Produit Stripe créé à 97 €
- [ ] Webhook Stripe configuré sur `/api/webhook`
- [ ] Domaine Resend vérifié
- [ ] Toutes les variables d'environnement ajoutées dans Vercel
- [ ] `NEXT_PUBLIC_APP_URL` pointe vers le bon domaine
- [ ] Test du flux complet effectué avec carte test Stripe
