-- Create the drafts table
CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  draft_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own drafts or any public drafts
CREATE POLICY "Drafts are viewable by creator or if public" 
ON public.drafts FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

-- Policy: Allow authenticated users to insert drafts
CREATE POLICY "Users can insert their own drafts" 
ON public.drafts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow authenticated users to update their own drafts
CREATE POLICY "Users can update their own drafts" 
ON public.drafts FOR UPDATE 
USING (auth.uid() = user_id);
