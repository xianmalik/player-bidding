-- Add the is_public column to the existing drafts table
ALTER TABLE public.drafts ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true NOT NULL;

-- Drop old read policies to prevent conflicts
DROP POLICY IF EXISTS "Drafts are viewable by everyone" ON public.drafts;
DROP POLICY IF EXISTS "Drafts are viewable by creator or if public" ON public.drafts;

-- Create the new restrictive policy
CREATE POLICY "Drafts are viewable by creator or if public" 
ON public.drafts FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

-- Force Supabase to reload its schema cache
NOTIFY pgrst, 'reload schema';
