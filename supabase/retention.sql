-- =============================================
-- TryFit AI — Rétention de l'historique
-- À exécuter dans l'éditeur SQL de Supabase, après subscriptions.sql
--
-- Règles annoncées sur le site :
--   Gratuit  → 7 jours
--   Starter  → 30 jours
--   Pro      → illimité
-- =============================================

-- -----------------------------------------------
-- Durée de conservation par plan (en jours)
-- NULL = illimité
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.plan_retention_days(plan_input TEXT)
RETURNS INTEGER AS $$
  SELECT CASE plan_input
    WHEN 'starter' THEN 30
    WHEN 'pro'     THEN NULL   -- illimité
    ELSE 7                     -- gratuit
  END;
$$ LANGUAGE sql IMMUTABLE;


-- -----------------------------------------------
-- Purge des essayages expirés
-- Supprime l'image du bucket puis la ligne d'historique.
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_expired_generations()
RETURNS INTEGER AS $$
DECLARE
  row_gen  RECORD;
  obj_path TEXT;
  deleted  INTEGER := 0;
BEGIN
  FOR row_gen IN
    SELECT g.id, g.result_image_url
    FROM public.generations g
    JOIN public.profiles p ON p.id = g.user_id
    WHERE public.plan_retention_days(p.plan) IS NOT NULL
      AND g.created_at < NOW() - (public.plan_retention_days(p.plan) || ' days')::INTERVAL
  LOOP
    -- Extraire le chemin du fichier depuis l'URL publique
    -- (.../object/public/result-images/<user_id>/<fichier>)
    obj_path := substring(row_gen.result_image_url FROM '/result-images/(.*)$');

    IF obj_path IS NOT NULL THEN
      DELETE FROM storage.objects
      WHERE bucket_id = 'result-images' AND name = obj_path;
    END IF;

    DELETE FROM public.generations WHERE id = row_gen.id;
    deleted := deleted + 1;
  END LOOP;

  RETURN deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -----------------------------------------------
-- Filet de sécurité : purge des photos sources orphelines
-- L'API les efface déjà après chaque génération réussie.
-- Ceci rattrape les essayages qui ont échoué en cours de route.
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_orphan_uploads()
RETURNS INTEGER AS $$
DECLARE
  deleted INTEGER;
BEGIN
  WITH removed AS (
    DELETE FROM storage.objects
    WHERE bucket_id IN ('person-images', 'garment-images')
      AND created_at < NOW() - INTERVAL '24 hours'
    RETURNING 1
  )
  SELECT COUNT(*) INTO deleted FROM removed;

  RETURN deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -----------------------------------------------
-- Planification quotidienne (4h du matin UTC)
-- -----------------------------------------------
SELECT cron.unschedule('purge-expired-generations')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-expired-generations');

SELECT cron.schedule(
  'purge-expired-generations',
  '0 4 * * *',
  $$SELECT public.purge_expired_generations()$$
);

SELECT cron.unschedule('purge-orphan-uploads')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-orphan-uploads');

SELECT cron.schedule(
  'purge-orphan-uploads',
  '30 4 * * *',
  $$SELECT public.purge_orphan_uploads()$$
);
