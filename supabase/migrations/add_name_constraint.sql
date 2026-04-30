-- Enforce max-length on drafts.name at the DB level (client-side 128-char cap is bypassable)
ALTER TABLE public.drafts
  ALTER COLUMN name TYPE VARCHAR(128);

NOTIFY pgrst, 'reload schema';
