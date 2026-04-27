CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  draft_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL
);

ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drafts are viewable by creator or if public"
ON public.drafts FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own drafts"
ON public.drafts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
ON public.drafts FOR UPDATE
USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
