-- Allow users to update their own requests when status is 'change_requested'
CREATE POLICY "Users can update own change_requested requests" 
ON public.requests 
FOR UPDATE 
USING (
  submitter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  AND status = 'change_requested'
);