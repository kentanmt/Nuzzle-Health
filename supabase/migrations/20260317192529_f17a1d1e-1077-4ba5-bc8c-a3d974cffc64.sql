
ALTER TABLE public.waitlist_signups
ADD COLUMN utm_source text,
ADD COLUMN utm_medium text,
ADD COLUMN utm_campaign text,
ADD COLUMN utm_content text,
ADD COLUMN utm_term text,
ADD COLUMN referrer text,
ADD COLUMN landing_page text;
