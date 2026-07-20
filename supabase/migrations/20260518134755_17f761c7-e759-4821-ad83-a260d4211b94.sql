
DROP POLICY IF EXISTS "Managers can view direct reports" ON public.profiles;
CREATE POLICY "Managers can view direct reports"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND manager_id = get_manager_profile_id(auth.uid())
);

DROP POLICY IF EXISTS "Users can update own change_requested requests" ON public.requests;
CREATE POLICY "Users can update own change_requested requests"
ON public.requests
FOR UPDATE
TO authenticated
USING (
  submitter_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
  AND status = 'change_requested'::request_status
);
