-- ============================================================
--  MenuMind SaaS — Schéma Supabase
--  À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

-- Table des clients (liée aux utilisateurs Supabase Auth)
CREATE TABLE IF NOT EXISTS public.customers (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT        UNIQUE NOT NULL,
  stripe_customer_id  TEXT,
  stripe_payment_id   TEXT,
  has_access          BOOLEAN     DEFAULT FALSE,
  plan                TEXT        DEFAULT 'lifetime',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire uniquement leur propre ligne
CREATE POLICY "users_read_own" ON public.customers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Le service role (backend) a accès complet
CREATE POLICY "service_role_all" ON public.customers
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Index ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS customers_user_id_idx  ON public.customers (user_id);
CREATE INDEX IF NOT EXISTS customers_email_idx    ON public.customers (email);
