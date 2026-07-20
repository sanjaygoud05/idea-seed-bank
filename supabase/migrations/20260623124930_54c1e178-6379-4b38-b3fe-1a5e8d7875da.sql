
DROP TRIGGER IF EXISTS protect_profile_fields ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS log_approval ON public.request_approvals;
DROP TRIGGER IF EXISTS set_updated_at ON public.request_types;
DROP TRIGGER IF EXISTS enforce_manager_approval_record ON public.requests;
DROP TRIGGER IF EXISTS log_created ON public.requests;
DROP TRIGGER IF EXISTS log_status_change ON public.requests;
DROP TRIGGER IF EXISTS protect_request_fields ON public.requests;
DROP TRIGGER IF EXISTS set_updated_at ON public.requests;
-- Clear duplicate activity-log rows so the timeline isn't doubled
DELETE FROM public.request_activity_log a
USING public.request_activity_log b
WHERE a.ctid < b.ctid
  AND a.request_id = b.request_id
  AND a.actor_id IS NOT DISTINCT FROM b.actor_id
  AND a.action = b.action
  AND a.details::text = b.details::text
  AND a.created_at = b.created_at;
