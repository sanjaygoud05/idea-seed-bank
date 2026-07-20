CREATE OR REPLACE FUNCTION public.protect_request_fields_for_managers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins and the submitter themselves are unaffected here
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- If the actor is a manager (not the submitter), lock down non-workflow columns
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
$$;

DROP TRIGGER IF EXISTS protect_request_fields_for_managers_trigger ON public.requests;
CREATE TRIGGER protect_request_fields_for_managers_trigger
BEFORE UPDATE ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.protect_request_fields_for_managers();