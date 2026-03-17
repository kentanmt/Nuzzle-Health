
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text,
  email text NOT NULL,
  location text,
  join_waitlist boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pets table
CREATE TABLE public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  species text NOT NULL DEFAULT 'dog',
  breed text,
  age numeric,
  weight numeric,
  sex text,
  spayed_neutered boolean DEFAULT false,
  existing_conditions text[] DEFAULT '{}',
  medications text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own pets" ON public.pets
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pet records table (for uploaded PDFs)
CREATE TABLE public.pet_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  file_name text,
  file_url text,
  record_type text NOT NULL DEFAULT 'lab-report',
  record_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own records" ON public.pet_records
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage bucket for pet record PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('pet-records', 'pet-records', false, 20971520);

CREATE POLICY "Users can upload own records" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pet-records' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own records" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'pet-records' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own records" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'pet-records' AND (storage.foldername(name))[1] = auth.uid()::text);
