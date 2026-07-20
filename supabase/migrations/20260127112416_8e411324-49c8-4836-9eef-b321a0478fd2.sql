-- Drop the problematic policy
DROP POLICY IF EXISTS "Managers can view direct reports" ON public.profiles;

-- Create a security definer function to check if user is manager of employee
CREATE OR REPLACE FUNCTION public.get_manager_profile_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Create a new policy that avoids recursion
CREATE POLICY "Managers can view direct reports"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'manager'::app_role) 
  AND manager_id = public.get_manager_profile_id(auth.uid())
);