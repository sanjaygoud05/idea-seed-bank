
-- Fix 1: Prevent users from modifying sensitive profile fields (manager_id, status, email, custom_fields, user_id)
-- Use a BEFORE UPDATE trigger to preserve sensitive columns when non-admins update their own profile
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admins can change anything
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- For non-admins, preserve sensitive fields
  NEW.user_id      := OLD.user_id;
  NEW.email        := OLD.email;
  NEW.manager_id   := OLD.manager_id;
  NEW.status       := OLD.status;
  NEW.custom_fields := OLD.custom_fields;
  NEW.created_at   := OLD.created_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_sensitive_profile_fields_trigger ON public.profiles;
CREATE TRIGGER protect_sensitive_profile_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_sensitive_profile_fields();

-- Fix 2: Add WITH CHECK to the managers update policy on requests to restrict allowed target statuses
DROP POLICY IF EXISTS "Managers can update requests for approval" ON public.requests;

CREATE POLICY "Managers can update requests for approval"
ON public.requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND status = 'in_review'::request_status
  AND submitter_id IN (
    SELECT p.id FROM profiles p
    JOIN profiles manager ON manager.id = p.manager_id
    WHERE manager.user_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role)
  AND status IN ('approved'::request_status, 'rejected'::request_status, 'change_requested'::request_status)
  AND submitter_id IN (
    SELECT p.id FROM profiles p
    JOIN profiles manager ON manager.id = p.manager_id
    WHERE manager.user_id = auth.uid()
  )
);
