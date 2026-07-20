-- Create function to allow authenticated users to switch their own role (for testing)
CREATE OR REPLACE FUNCTION public.set_user_role(_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update existing role or insert new one
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), _role)
  ON CONFLICT (user_id, role) 
  DO NOTHING;
  
  -- Remove other roles so user has only the selected role
  DELETE FROM public.user_roles 
  WHERE user_id = auth.uid() AND role != _role;
END;
$$;