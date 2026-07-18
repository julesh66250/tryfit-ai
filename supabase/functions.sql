-- Fonction pour déduire 1 crédit de façon sécurisée (côté serveur uniquement)
CREATE OR REPLACE FUNCTION public.deduct_credit(user_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits - 1,
      updated_at = NOW()
  WHERE id = user_id_input AND credits > 0;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (user_id_input, -1, 'usage', 'Essayage virtuel');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter des crédits (achat)
CREATE OR REPLACE FUNCTION public.add_credits(user_id_input UUID, amount_input INTEGER, description_input TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + amount_input,
      updated_at = NOW()
  WHERE id = user_id_input;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (user_id_input, amount_input, 'purchase', description_input);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
