
-- Allow service-role / backend operations (no auth.uid()) to bypass field protection.
-- End-user actions still go through the existing admin check.
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- No user context => backend/service call; allow.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

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
$function$;

-- Same for request body protection
CREATE OR REPLACE FUNCTION public.protect_request_fields_for_managers()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'manager'::app_role)
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles p
       WHERE p.id = OLD.submitter_id AND p.user_id = auth.uid()
     )
  THEN
    NEW.submitter_id    := OLD.submitter_id;
    NEW.request_type_id := OLD.request_type_id;
    NEW.form_data       := OLD.form_data;
    NEW.description     := OLD.description;
    NEW.start_date      := OLD.start_date;
    NEW.end_date        := OLD.end_date;
    NEW.created_at      := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$function$;

-- Same for manager status-change enforcement (backend ops shouldn't be blocked)
CREATE OR REPLACE FUNCTION public.require_approval_record_for_manager_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_admin boolean;
  is_submitter boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
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
$function$;

-- Now apply the hierarchy
UPDATE public.profiles SET manager_id='36cfd768-72fb-436b-b706-d45e3d3e5d85'
  WHERE id='f1ec9ae9-0cab-4805-9034-622bbe078071';
UPDATE public.profiles SET manager_id='f1ec9ae9-0cab-4805-9034-622bbe078071'
  WHERE id IN ('92177ab4-e550-4b73-ae83-664cf7d81db5','888e214b-f11e-409e-b29a-a3564db53d37');
