
DROP POLICY IF EXISTS "Managers can update requests for approval" ON public.requests;
CREATE POLICY "Managers can update requests for approval" ON public.requests
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND status IN ('submitted'::request_status, 'in_review'::request_status)
  AND submitter_id IN (
    SELECT p.id FROM profiles p
    JOIN profiles manager ON manager.id = p.manager_id
    WHERE manager.user_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role)
  AND status IN (
    'submitted'::request_status,
    'in_review'::request_status,
    'approved'::request_status,
    'rejected'::request_status,
    'change_requested'::request_status
  )
  AND submitter_id IN (
    SELECT p.id FROM profiles p
    JOIN profiles manager ON manager.id = p.manager_id
    WHERE manager.user_id = auth.uid()
  )
);
