-- Allow users to delete their own drafts (GDPR right-to-erasure)
CREATE POLICY "Users can delete their own drafts"
ON public.drafts FOR DELETE
USING (auth.uid() = user_id);

-- Drafts should be private by default (opt-in to public, not opt-out)
ALTER TABLE public.drafts
  ALTER COLUMN is_public SET DEFAULT false;

-- Prevent orphaned drafts with no owner
ALTER TABLE public.drafts
  ALTER COLUMN user_id SET NOT NULL;

NOTIFY pgrst, 'reload schema';
