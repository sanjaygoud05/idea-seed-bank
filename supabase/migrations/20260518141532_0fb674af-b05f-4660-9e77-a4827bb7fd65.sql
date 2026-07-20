CREATE OR REPLACE FUNCTION public.require_approval_record_for_manager_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  is_submitter boolean;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NULL;
  END IF;

  IF NEW.status NOT IN ('approved','rejected','change_requested') THEN
    RETURN NULL;
  END IF;

  is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  IF is_admin THEN
    RETURN NULL;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = NEW.submitter_id AND p.user_id = auth.uid()
  ) INTO is_submitter;
  IF is_submitter THEN
    RETURN NULL;
  END IF;

  -- For managers, require a matching approval row written in the same transaction
  IF NOT EXISTS (
    SELECT 1
    FROM public.request_approvals ra
    JOIN public.profiles p ON p.id = ra.approver_id
    WHERE ra.request_id = NEW.id
      AND ra.action::text = NEW.status::text
      AND p.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Status change requires a matching approval record in request_approvals';
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS require_approval_record_trigger ON public.requests;
CREATE CONSTRAINT TRIGGER require_approval_record_trigger
AFTER UPDATE ON public.requests
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.require_approval_record_for_manager_status_change();