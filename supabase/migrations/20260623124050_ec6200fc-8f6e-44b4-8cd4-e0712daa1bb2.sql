
-- 1. Auto-create profile + role on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.requests;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.request_types;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.request_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Protect sensitive profile fields from non-admin edits
DROP TRIGGER IF EXISTS protect_profile_fields ON public.profiles;
CREATE TRIGGER protect_profile_fields BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_sensitive_profile_fields();

-- 4. Protect request body fields from manager tampering
DROP TRIGGER IF EXISTS protect_request_fields ON public.requests;
CREATE TRIGGER protect_request_fields BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.protect_request_fields_for_managers();

-- 5. Require approval record when a manager changes status
DROP TRIGGER IF EXISTS enforce_manager_approval_record ON public.requests;
CREATE TRIGGER enforce_manager_approval_record AFTER UPDATE OF status ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.require_approval_record_for_manager_status_change();

-- 6. Activity log triggers
DROP TRIGGER IF EXISTS log_created ON public.requests;
CREATE TRIGGER log_created AFTER INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.log_request_created();

DROP TRIGGER IF EXISTS log_status_change ON public.requests;
CREATE TRIGGER log_status_change AFTER UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.log_request_status_change();

DROP TRIGGER IF EXISTS log_approval ON public.request_approvals;
CREATE TRIGGER log_approval AFTER INSERT ON public.request_approvals
  FOR EACH ROW EXECUTE FUNCTION public.log_approval_action();

-- 7. Backfill missing profiles + employee role for existing auth users
INSERT INTO public.profiles (user_id, email, first_name, last_name)
SELECT u.id, u.email,
       COALESCE(u.raw_user_meta_data->>'first_name',''),
       COALESCE(u.raw_user_meta_data->>'last_name','')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'employee'::app_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.id IS NULL;
