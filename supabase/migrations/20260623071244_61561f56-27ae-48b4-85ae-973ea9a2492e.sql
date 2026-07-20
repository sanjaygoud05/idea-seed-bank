
-- 1) Revoke anon access from all public tables (app is auth-only).
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.approval_steps FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.profiles FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.request_activity_log FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.request_approvals FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.request_types FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.requests FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.user_roles FROM anon;

-- 2) Lock down trigger-only / internal SECURITY DEFINER functions.
--    These are only invoked by triggers; clients should never call them.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_approval_action() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_request_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_request_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_request_fields_for_managers() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_sensitive_profile_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.require_approval_record_for_manager_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 3) Role-check helpers are used inside RLS policies. Revoke anon, keep authenticated.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_manager_of(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_manager_profile_id(uuid) FROM PUBLIC, anon;
