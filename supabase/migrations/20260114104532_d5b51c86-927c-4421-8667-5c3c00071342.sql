-- Update RLS policy for request_types to allow anon role (needed for DEV_MODE viewing)
DROP POLICY IF EXISTS "Anyone can view active request types" ON request_types;
CREATE POLICY "Anyone can view active request types" ON request_types
  FOR SELECT TO anon, authenticated
  USING (is_active = true);