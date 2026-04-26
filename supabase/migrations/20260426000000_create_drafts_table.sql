-- Create the drafts table
CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  draft_data JSONB NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read drafts (needed for sharing links)
CREATE POLICY "Drafts are viewable by everyone" 
ON public.drafts FOR SELECT 
USING (true);

-- Policy: Allow authenticated users to insert drafts
CREATE POLICY "Users can insert their own drafts" 
ON public.drafts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow authenticated users to update their own drafts
CREATE POLICY "Users can update their own drafts" 
ON public.drafts FOR UPDATE 
USING (auth.uid() = user_id);
