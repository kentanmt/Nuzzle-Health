
CREATE TABLE public.parsed_lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_record_id uuid NOT NULL REFERENCES public.pet_records(id) ON DELETE CASCADE,
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  vet_name text,
  lab_source text,
  test_date date,
  markers jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_text text,
  parsed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.parsed_lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own parsed labs"
  ON public.parsed_lab_results FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
