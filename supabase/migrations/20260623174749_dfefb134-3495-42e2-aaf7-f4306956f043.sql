
-- 1) App settings table to hold the demo-seeding flag
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read settings" ON public.app_settings;
CREATE POLICY "Authenticated can read settings"
  ON public.app_settings FOR SELECT TO authenticated USING (true);

INSERT INTO public.app_settings (key, value)
VALUES ('demo_seeded', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2) Seed function: idempotent via demo_seeded flag.
-- Creates 4 request types, 3 sample auth users (1 manager + 2 employees), 8 sample requests.
CREATE OR REPLACE FUNCTION public.seed_demo_data(admin_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_seeded boolean;
  v_admin_profile uuid;
  v_manager_user uuid := gen_random_uuid();
  v_emp1_user uuid := gen_random_uuid();
  v_emp2_user uuid := gen_random_uuid();
  v_manager_profile uuid;
  v_emp1_profile uuid;
  v_emp2_profile uuid;
  v_rt_equipment uuid;
  v_rt_timeoff uuid;
  v_rt_budget uuid;
  v_rt_access uuid;
BEGIN
  SELECT (value::text)::boolean INTO v_seeded
    FROM public.app_settings WHERE key = 'demo_seeded';
  IF v_seeded THEN RETURN; END IF;

  SELECT id INTO v_admin_profile FROM public.profiles WHERE user_id = admin_user_id;
  IF v_admin_profile IS NULL THEN RETURN; END IF;

  -- 4 request types
  INSERT INTO public.request_types (name, description, category, requires_dates, form_schema)
  VALUES ('Equipment Request', 'Request new hardware or equipment for work', 'IT', false,
    '[{"id":"item","label":"Item","type":"text","required":true,"placeholder":"e.g. MacBook Pro 16\""},
      {"id":"justification","label":"Justification","type":"textarea","required":true}]'::jsonb)
  RETURNING id INTO v_rt_equipment;

  INSERT INTO public.request_types (name, description, category, requires_dates, form_schema)
  VALUES ('Time Off Request', 'Request paid time off, sick leave, or personal days', 'HR', true,
    '[{"id":"reason","label":"Reason","type":"select","required":true,"options":["Vacation","Sick","Personal","Bereavement"]},
      {"id":"notes","label":"Notes","type":"textarea","required":false}]'::jsonb)
  RETURNING id INTO v_rt_timeoff;

  INSERT INTO public.request_types (name, description, category, requires_dates, form_schema)
  VALUES ('Budget Approval', 'Request budget approval for projects or purchases', 'Finance', false,
    '[{"id":"amount","label":"Amount (USD)","type":"number","required":true},
      {"id":"purpose","label":"Purpose","type":"textarea","required":true}]'::jsonb)
  RETURNING id INTO v_rt_budget;

  INSERT INTO public.request_types (name, description, category, requires_dates, form_schema)
  VALUES ('Access Request', 'Request access to internal systems and tools', 'IT', false,
    '[{"id":"system","label":"System","type":"text","required":true},
      {"id":"level","label":"Access Level","type":"select","required":true,"options":["Read","Write","Admin"]}]'::jsonb)
  RETURNING id INTO v_rt_access;

  -- 3 sample auth users. handle_new_user trigger will create their profiles + employee role.
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, email_change, email_change_token_new, recovery_token
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000', v_manager_user, 'authenticated', 'authenticated',
     'sarah.chen@demo.local', crypt('DemoPass!2024', gen_salt('bf')),
     now(), now() - interval '60 days', now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"first_name":"Sarah","last_name":"Chen"}'::jsonb,
     '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', v_emp1_user, 'authenticated', 'authenticated',
     'marcus.johnson@demo.local', crypt('DemoPass!2024', gen_salt('bf')),
     now(), now() - interval '45 days', now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"first_name":"Marcus","last_name":"Johnson"}'::jsonb,
     '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', v_emp2_user, 'authenticated', 'authenticated',
     'priya.patel@demo.local', crypt('DemoPass!2024', gen_salt('bf')),
     now(), now() - interval '30 days', now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"first_name":"Priya","last_name":"Patel"}'::jsonb,
     '', '', '', '');

  SELECT id INTO v_manager_profile FROM public.profiles WHERE user_id = v_manager_user;
  SELECT id INTO v_emp1_profile FROM public.profiles WHERE user_id = v_emp1_user;
  SELECT id INTO v_emp2_profile FROM public.profiles WHERE user_id = v_emp2_user;

  -- Promote Sarah to manager
  DELETE FROM public.user_roles WHERE user_id = v_manager_user;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_manager_user, 'manager');

  -- Reporting hierarchy
  UPDATE public.profiles
    SET manager_id = v_manager_profile
    WHERE id IN (v_emp1_profile, v_emp2_profile);

  -- 8 sample requests across statuses & dates
  INSERT INTO public.requests
    (request_type_id, submitter_id, status, description, start_date, end_date, form_data, created_at, updated_at)
  VALUES
    (v_rt_equipment, v_emp1_profile, 'approved',
     'New MacBook Pro for development work', NULL, NULL,
     '{"item":"MacBook Pro 16\" M3","justification":"Current laptop is 4 years old and slowing build times significantly."}'::jsonb,
     now() - interval '14 days', now() - interval '12 days'),

    (v_rt_timeoff, v_emp2_profile, 'approved',
     'Family vacation to Portugal',
     (now() + interval '20 days')::date, (now() + interval '27 days')::date,
     '{"reason":"Vacation","notes":"Pre-booked flights, coverage arranged with team."}'::jsonb,
     now() - interval '10 days', now() - interval '8 days'),

    (v_rt_budget, v_emp1_profile, 'submitted',
     'Q2 conference attendance and travel', NULL, NULL,
     '{"amount":2400,"purpose":"Attending React Summit in Amsterdam for team upskilling."}'::jsonb,
     now() - interval '3 days', now() - interval '3 days'),

    (v_rt_access, v_emp2_profile, 'in_review',
     'Production database read access for analytics work', NULL, NULL,
     '{"system":"Production Postgres","level":"Read"}'::jsonb,
     now() - interval '2 days', now() - interval '1 day'),

    (v_rt_timeoff, v_emp1_profile, 'rejected',
     'Personal day next Friday',
     (now() + interval '5 days')::date, (now() + interval '5 days')::date,
     '{"reason":"Personal"}'::jsonb,
     now() - interval '6 days', now() - interval '5 days'),

    (v_rt_equipment, v_emp2_profile, 'submitted',
     'Standing desk converter', NULL, NULL,
     '{"item":"Varidesk Pro Plus 36","justification":"Ergonomic recommendation from recent health check."}'::jsonb,
     now() - interval '1 day', now() - interval '1 day'),

    (v_rt_budget, v_admin_profile, 'approved',
     'Team offsite venue deposit', NULL, NULL,
     '{"amount":5000,"purpose":"Quarterly team building offsite, venue deposit due this month."}'::jsonb,
     now() - interval '20 days', now() - interval '18 days'),

    (v_rt_access, v_emp1_profile, 'change_requested',
     'Admin access to staging environment', NULL, NULL,
     '{"system":"Staging Kubernetes","level":"Admin"}'::jsonb,
     now() - interval '4 days', now() - interval '3 days');

  UPDATE public.app_settings
    SET value = 'true'::jsonb, updated_at = now()
    WHERE key = 'demo_seeded';
END;
$$;

-- 3) Update handle_new_user: first user becomes admin and triggers demo seed.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_first_admin boolean;
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
    INTO v_is_first_admin;

  IF v_is_first_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    PERFORM public.seed_demo_data(NEW.id);
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee');
  END IF;

  RETURN NEW;
END;
$$;
