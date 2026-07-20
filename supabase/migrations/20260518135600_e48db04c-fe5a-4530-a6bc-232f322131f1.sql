-- Restrict status transitions on user-update policies for requests
DROP POLICY IF EXISTS "Users can update own draft requests" ON public.requests;
CREATE POLICY "Users can update own draft requests"
ON public.requests
FOR UPDATE
TO authenticated
USING (
  (submitter_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
  AND status = 'draft'::request_status
)
WITH CHECK (
  (submitter_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
  AND status IN ('draft'::request_status, 'in_review'::request_status)
);

DROP POLICY IF EXISTS "Users can update own change_requested requests" ON public.requests;
CREATE POLICY "Users can update own change_requested requests"
ON public.requests
FOR UPDATE
TO authenticated
USING (
  (submitter_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
  AND status = 'change_requested'::request_status
)
WITH CHECK (
  (submitter_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
  AND status IN ('change_requested'::request_status, 'in_review'::request_status)
);