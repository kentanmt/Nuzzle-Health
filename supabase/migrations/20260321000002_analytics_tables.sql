-- ============================================================
-- Triage sessions — captures every symptom checker run,
-- including anonymous users (user_id is nullable)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.triage_sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  species      TEXT,
  breed        TEXT,
  age          TEXT,
  pet_name     TEXT,
  symptoms     JSONB       NOT NULL DEFAULT '[]'::jsonb,
  urgency_level TEXT,
  result       JSONB,
  zip_code     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.triage_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can log a session
CREATE POLICY "Anyone can insert triage sessions"
  ON public.triage_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Any authenticated user can read all sessions (admin use)
CREATE POLICY "Authenticated users can read triage sessions"
  ON public.triage_sessions FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- Pet health scores — persists every AI-generated health score
-- and insight set, enabling longitudinal tracking per pet
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pet_health_scores (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id                UUID        REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id               UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score         INTEGER,
  category              TEXT,
  change_from_previous  INTEGER,
  breakdown             JSONB,
  insights              JSONB,
  lab_visit_count       INTEGER,
  generated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pet_health_scores ENABLE ROW LEVEL SECURITY;

-- Users can fully manage their own pet's scores
CREATE POLICY "Users can manage own health scores"
  ON public.pet_health_scores FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin read-all
CREATE POLICY "Authenticated users can read all health scores"
  ON public.pet_health_scores FOR SELECT
  TO authenticated
  USING (true);
