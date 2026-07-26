-- =============================================
-- TryFit AI — Correctif : autoriser la mise à jour des essayages
--
-- La table generations avait des règles pour SELECT, INSERT et DELETE,
-- mais aucune pour UPDATE. Avec RLS activé, une opération sans règle est
-- bloquée sans erreur : l'API ne pouvait donc jamais marquer un essayage
-- comme terminé ni enregistrer l'image du résultat.
-- =============================================

DROP POLICY IF EXISTS "generations_update_own" ON public.generations;

CREATE POLICY "generations_update_own" ON public.generations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- -----------------------------------------------
-- Nettoyage des essayages restés bloqués « en cours »
-- (ceux d'avant le correctif, qui ne se termineront jamais)
-- -----------------------------------------------
UPDATE public.generations
SET status = 'failed',
    error_message = 'Interrompu avant le correctif de sécurité'
WHERE status IN ('pending', 'processing')
  AND created_at < NOW() - INTERVAL '10 minutes';
