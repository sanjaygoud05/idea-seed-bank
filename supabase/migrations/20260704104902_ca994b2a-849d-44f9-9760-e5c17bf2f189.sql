
DO $$
DECLARE
  v_demo_user uuid;
  v_demo_profile uuid;
  v_approver_profile uuid;
  v_rt_budget uuid;
  v_rt_equipment uuid;
  v_rt_timeoff uuid;
  v_rt_access uuid;
BEGIN
  SELECT id INTO v_demo_user FROM auth.users WHERE email = 'demo@conduit.app';

  IF v_demo_user IS NULL THEN
    v_demo_user := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_demo_user, 'authenticated', 'authenticated',
      'demo@conduit.app', extensions.crypt('demo1234', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Alex","last_name":"Demo"}'::jsonb,
      '', '', '', ''
    );
  ELSE
    UPDATE auth.users
      SET encrypted_password = extensions.crypt('demo1234', extensions.gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now())
      WHERE id = v_demo_user;
  END IF;

  SELECT id INTO v_demo_profile FROM public.profiles WHERE user_id = v_demo_user;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_demo_user, 'admin'), (v_demo_user, 'manager'), (v_demo_user, 'employee')
  ON CONFLICT (user_id, role) DO NOTHING;

  SELECT id INTO v_approver_profile
    FROM public.profiles
    WHERE id <> v_demo_profile
    LIMIT 1;
  IF v_approver_profile IS NULL THEN
    v_approver_profile := v_demo_profile;
  END IF;

  SELECT id INTO v_rt_budget    FROM public.request_types WHERE name = 'Budget Approval'   ORDER BY created_at LIMIT 1;
  SELECT id INTO v_rt_equipment FROM public.request_types WHERE name = 'Equipment Request' ORDER BY created_at LIMIT 1;
  SELECT id INTO v_rt_timeoff   FROM public.request_types WHERE name ILIKE 'Time Off%' OR name ILIKE 'Paid Time%' ORDER BY created_at LIMIT 1;
  SELECT id INTO v_rt_access    FROM public.request_types WHERE name = 'Access Request'    ORDER BY created_at LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.requests WHERE submitter_id = v_demo_profile) THEN
    INSERT INTO public.requests
      (request_type_id, submitter_id, status, description, start_date, end_date, form_data, created_at, updated_at)
    VALUES
      (v_rt_budget, v_demo_profile, 'approved',
       'Q3 Marketing Budget', NULL, NULL,
       '{"amount":18000,"purpose":"Q3 paid campaigns, content production, and event sponsorships for the Marketing team."}'::jsonb,
       now() - interval '21 days', now() - interval '18 days'),
      (v_rt_equipment, v_demo_profile, 'approved',
       'New Hire Laptop', NULL, NULL,
       '{"item":"MacBook Pro 14\" M3","justification":"Standard issue laptop for incoming Engineering hire starting next Monday."}'::jsonb,
       now() - interval '12 days', now() - interval '10 days'),
      (v_rt_budget, v_demo_profile, 'submitted',
       'Conference Travel', NULL, NULL,
       '{"amount":3200,"purpose":"SaaStr Annual in San Francisco — flights, hotel, and conference pass for the Sales team."}'::jsonb,
       now() - interval '2 days', now() - interval '2 days'),
      (v_rt_timeoff, v_demo_profile, 'rejected',
       'Extended Leave Request',
       (now() + interval '10 days')::date, (now() + interval '28 days')::date,
       '{"reason":"Personal","notes":"Requested three weeks off — declined due to overlap with quarterly close in Finance."}'::jsonb,
       now() - interval '9 days', now() - interval '7 days'),
      (v_rt_access, v_demo_profile, 'in_review',
       'Analytics Warehouse Access', NULL, NULL,
       '{"system":"Snowflake — Analytics Warehouse","level":"Read"}'::jsonb,
       now() - interval '1 day', now() - interval '1 day');

    INSERT INTO public.request_approvals (request_id, approver_id, step_order, action, comment)
    SELECT r.id, v_approver_profile, 1,
           CASE r.status WHEN 'approved' THEN 'approved'::approval_action
                         WHEN 'rejected' THEN 'rejected'::approval_action END,
           CASE r.status WHEN 'approved' THEN 'Approved — within budget.'
                         WHEN 'rejected' THEN 'Declined — timing conflicts with quarterly close.' END
      FROM public.requests r
     WHERE r.submitter_id = v_demo_profile
       AND r.status IN ('approved','rejected');
  END IF;
END $$;
