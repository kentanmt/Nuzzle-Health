-- Allow any authenticated user to read waitlist_signups
-- (admin-only enforcement is handled client-side via VITE_ADMIN_EMAIL check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'waitlist_signups'
      AND policyname = 'Authenticated users can read waitlist signups'
  ) THEN
    CREATE POLICY "Authenticated users can read waitlist signups"
      ON public.waitlist_signups
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;
