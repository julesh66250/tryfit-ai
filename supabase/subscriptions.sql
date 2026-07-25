-- =============================================
-- TryFit AI — Abonnements & renouvellement des crédits
-- À exécuter dans l'éditeur SQL de Supabase, après schema.sql
-- =============================================

-- -----------------------------------------------
-- 1. Colonnes d'abonnement sur profiles
-- -----------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS billing_period TEXT,              -- 'monthly' | 'yearly'
  ADD COLUMN IF NOT EXISTS credits_renew_at TIMESTAMPTZ,     -- prochaine recharge des crédits
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS profiles_credits_renew_at_idx
  ON public.profiles (credits_renew_at)
  WHERE is_premium = TRUE;

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx
  ON public.profiles (stripe_customer_id);


-- -----------------------------------------------
-- 2. Nombre de crédits accordés par plan
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.plan_credits(plan_input TEXT)
RETURNS INTEGER AS $$
  SELECT CASE plan_input
    WHEN 'starter' THEN 50
    WHEN 'pro'     THEN 100
    ELSE 0
  END;
$$ LANGUAGE sql IMMUTABLE;


-- -----------------------------------------------
-- 3. Activer / renouveler un abonnement
--    Appelé par le webhook Stripe à chaque paiement réussi.
--    Remet le compteur au quota du plan (pas de report — cf. CGU).
-- -----------------------------------------------
--   expires_at : fin de la période payée, telle que renvoyée par Stripe
--                (current_period_end). C'est elle qui autorise les recharges.
CREATE OR REPLACE FUNCTION public.grant_subscription_credits(
  user_id_input UUID,
  plan_input TEXT,
  period_input TEXT DEFAULT 'monthly',
  next_renewal TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  amount   INTEGER;
  renew_at TIMESTAMPTZ;
  paid_until TIMESTAMPTZ;
BEGIN
  amount := public.plan_credits(plan_input);

  IF amount = 0 THEN
    RAISE EXCEPTION 'Plan inconnu : %', plan_input;
  END IF;

  -- Les crédits sont rechargés tous les mois, y compris sur un abonnement annuel
  renew_at := COALESCE(next_renewal, NOW() + INTERVAL '1 month');

  -- Sans info de Stripe, on ne couvre qu'une période : jamais de blanc-seing
  paid_until := COALESCE(
    expires_at,
    CASE period_input WHEN 'yearly' THEN NOW() + INTERVAL '1 year'
                      ELSE NOW() + INTERVAL '1 month' END
  );

  UPDATE public.profiles
  SET credits            = amount,
      is_premium         = TRUE,
      plan               = plan_input,
      billing_period     = period_input,
      credits_renew_at   = renew_at,
      premium_expires_at = paid_until,
      updated_at         = NOW()
  WHERE id = user_id_input;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (user_id_input, amount, 'subscription',
          'Crédits mensuels — plan ' || plan_input);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -----------------------------------------------
-- 4. Résilier un abonnement
--    Appelé par le webhook Stripe (annulation ou échec de paiement).
--    On ne retire pas les crédits déjà versés du mois en cours.
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_subscription(user_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET is_premium         = FALSE,
      plan               = 'free',
      billing_period     = NULL,
      credits_renew_at   = NULL,
      premium_expires_at = NULL,
      stripe_subscription_id = NULL,
      updated_at         = NOW()
  WHERE id = user_id_input;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (user_id_input, 0, 'subscription', 'Abonnement résilié');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -----------------------------------------------
-- 5. Expiration des abonnements non renouvelés
--    Si le webhook d'annulation de Stripe se perd, la date de fin de
--    période payée finit par tomber et l'abonnement s'éteint tout seul.
--    3 jours de tolérance : Stripe réessaie les paiements échoués.
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_lapsed_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  expired INTEGER;
BEGIN
  WITH lapsed AS (
    UPDATE public.profiles
    SET is_premium         = FALSE,
        plan               = 'free',
        billing_period     = NULL,
        credits_renew_at   = NULL,
        updated_at         = NOW()
    WHERE is_premium = TRUE
      AND premium_expires_at IS NOT NULL
      AND premium_expires_at < NOW() - INTERVAL '3 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO expired FROM lapsed;

  RETURN expired;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -----------------------------------------------
-- 6. Filet de sécurité : recharge automatique
--    Si un webhook de paiement Stripe se perd, ce job rattrape le coup.
--    Ne recharge que les abonnés dont la période payée court toujours :
--    en cas de doute on ne donne rien, plutôt que de donner à vie.
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.renew_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
  row_profile RECORD;
  next_date   TIMESTAMPTZ;
  renewed     INTEGER := 0;
BEGIN
  -- Éteindre d'abord les abonnements périmés
  PERFORM public.expire_lapsed_subscriptions();

  FOR row_profile IN
    SELECT id, plan, credits_renew_at
    FROM public.profiles
    WHERE is_premium = TRUE
      AND plan IN ('starter', 'pro')
      AND credits_renew_at IS NOT NULL
      AND credits_renew_at <= NOW()
      -- Verrou : la période payée doit encore courir
      AND premium_expires_at IS NOT NULL
      AND premium_expires_at > NOW() - INTERVAL '3 days'
    FOR UPDATE
  LOOP
    -- Avancer d'un mois autant de fois que nécessaire pour repasser dans le futur
    next_date := row_profile.credits_renew_at;
    WHILE next_date <= NOW() LOOP
      next_date := next_date + INTERVAL '1 month';
    END LOOP;

    UPDATE public.profiles
    SET credits          = public.plan_credits(row_profile.plan),
        credits_renew_at = next_date,
        updated_at       = NOW()
    WHERE id = row_profile.id;

    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (row_profile.id, public.plan_credits(row_profile.plan), 'subscription',
            'Recharge mensuelle automatique — plan ' || row_profile.plan);

    renewed := renewed + 1;
  END LOOP;

  RETURN renewed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -----------------------------------------------
-- 7. Planification quotidienne (pg_cron)
--    Tourne tous les jours à 3h du matin UTC.
--    renew_monthly_credits() éteint d'abord les abonnements périmés,
--    puis recharge ceux qui sont toujours payés.
-- -----------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Supprimer l'ancienne planification si elle existe (permet de relancer ce script)
SELECT cron.unschedule('renew-monthly-credits')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'renew-monthly-credits');

SELECT cron.schedule(
  'renew-monthly-credits',
  '0 3 * * *',
  $$SELECT public.renew_monthly_credits()$$
);


-- -----------------------------------------------
-- 8. Empêcher un utilisateur de modifier ses propres crédits
--    Sans ça, n'importe qui peut s'accorder 10 000 crédits depuis le navigateur.
-- -----------------------------------------------
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.protect_billing_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Les requêtes du navigateur arrivent avec le rôle "authenticated".
  -- Les fonctions SECURITY DEFINER (deduct_credit, webhooks Stripe, cron)
  -- s'exécutent en tant que "postgres" et passent donc outre ce garde-fou.
  IF current_user = 'authenticated' THEN
    NEW.credits                := OLD.credits;
    NEW.is_premium             := OLD.is_premium;
    NEW.plan                   := OLD.plan;
    NEW.billing_period         := OLD.billing_period;
    NEW.credits_renew_at       := OLD.credits_renew_at;
    NEW.stripe_customer_id     := OLD.stripe_customer_id;
    NEW.stripe_subscription_id := OLD.stripe_subscription_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_billing_columns_trigger ON public.profiles;

CREATE TRIGGER protect_billing_columns_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_billing_columns();
