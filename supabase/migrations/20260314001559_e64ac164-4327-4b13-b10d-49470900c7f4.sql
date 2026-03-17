ALTER TABLE public.parsed_lab_results 
ADD COLUMN IF NOT EXISTS weight_value numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS weight_unit text DEFAULT 'lbs',
ADD COLUMN IF NOT EXISTS vaccinations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS care_recommendations jsonb DEFAULT '[]'::jsonb;