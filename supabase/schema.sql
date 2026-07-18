-- =============================================
-- TryFit AI - Schéma base de données Supabase
-- =============================================

-- Extension pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------
-- TABLE: profiles
-- Étend les utilisateurs Supabase Auth
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 1 NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  premium_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------
-- TABLE: generations
-- Chaque essayage virtuel généré par un utilisateur
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person_image_url TEXT NOT NULL,
  garment_image_url TEXT NOT NULL,
  garment_source_url TEXT, -- lien internet si fourni
  result_image_url TEXT,
  garment_type TEXT NOT NULL, -- t-shirt, pull, veste, etc.
  status TEXT DEFAULT 'pending' NOT NULL, -- pending | processing | completed | failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------
-- TABLE: credit_transactions
-- Historique de tous les mouvements de crédits
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positif = ajout, négatif = utilisation
  type TEXT NOT NULL, -- 'free_signup' | 'purchase' | 'subscription' | 'usage'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles : chaque user ne voit que le sien
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Generations : chaque user ne voit que les siennes
CREATE POLICY "generations_select_own" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "generations_insert_own" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "generations_delete_own" ON public.generations
  FOR DELETE USING (auth.uid() = user_id);

-- Credit transactions : lecture seule côté user
CREATE POLICY "credits_select_own" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- -----------------------------------------------
-- FONCTION: créer le profil automatiquement
-- Déclenché à chaque inscription
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );

  -- Donner 1 crédit gratuit à l'inscription
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 1, 'free_signup', 'Crédit offert à l''inscription');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------
-- STORAGE BUCKETS
-- -----------------------------------------------

-- Bucket pour les photos des utilisateurs
INSERT INTO storage.buckets (id, name, public)
VALUES ('person-images', 'person-images', false)
ON CONFLICT DO NOTHING;

-- Bucket pour les photos de vêtements
INSERT INTO storage.buckets (id, name, public)
VALUES ('garment-images', 'garment-images', false)
ON CONFLICT DO NOTHING;

-- Bucket pour les résultats générés
INSERT INTO storage.buckets (id, name, public)
VALUES ('result-images', 'result-images', true)
ON CONFLICT DO NOTHING;

-- Policies storage : chaque user gère son propre dossier
CREATE POLICY "user_upload_person" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'person-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "user_read_person" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'person-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "user_upload_garment" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'garment-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "user_read_garment" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'garment-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "public_read_results" ON storage.objects
  FOR SELECT USING (bucket_id = 'result-images');

CREATE POLICY "user_upload_results" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'result-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
