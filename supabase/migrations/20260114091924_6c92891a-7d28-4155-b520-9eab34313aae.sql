-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE public.request_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected');
CREATE TYPE public.approver_type AS ENUM ('manager', 'admin');
CREATE TYPE public.approval_action AS ENUM ('approved', 'rejected');

-- ============================================
-- REQUEST TYPES TABLE
-- ============================================

CREATE TABLE public.request_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  form_schema JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.request_types ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active request types
CREATE POLICY "Anyone can view active request types"
  ON public.request_types FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can view all request types (including inactive)
CREATE POLICY "Admins can view all request types"
  ON public.request_types FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert request types
CREATE POLICY "Admins can insert request types"
  ON public.request_types FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update request types
CREATE POLICY "Admins can update request types"
  ON public.request_types FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete request types
CREATE POLICY "Admins can delete request types"
  ON public.request_types FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_request_types_updated_at
  BEFORE UPDATE ON public.request_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- APPROVAL STEPS TABLE
-- ============================================

CREATE TABLE public.approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type_id UUID NOT NULL REFERENCES public.request_types(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  approver_type public.approver_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_type_id, step_order)
);

ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view approval steps
CREATE POLICY "Anyone can view approval steps"
  ON public.approval_steps FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage approval steps
CREATE POLICY "Admins can insert approval steps"
  ON public.approval_steps FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update approval steps"
  ON public.approval_steps FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete approval steps"
  ON public.approval_steps FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- REQUESTS TABLE
-- ============================================

CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type_id UUID NOT NULL REFERENCES public.request_types(id),
  submitter_id UUID NOT NULL REFERENCES public.profiles(id),
  status public.request_status NOT NULL DEFAULT 'draft',
  description TEXT,
  start_date DATE,
  end_date DATE,
  form_data JSONB DEFAULT '{}'::jsonb,
  current_step INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON public.requests FOR SELECT
  TO authenticated
  USING (
    submitter_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Managers can view requests from direct reports
CREATE POLICY "Managers can view direct reports requests"
  ON public.requests FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager') AND
    submitter_id IN (
      SELECT p.id FROM public.profiles p
      JOIN public.profiles manager ON manager.id = p.manager_id
      WHERE manager.user_id = auth.uid()
    )
  );

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON public.requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can insert their own requests
CREATE POLICY "Users can insert own requests"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (
    submitter_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update their own draft requests
CREATE POLICY "Users can update own draft requests"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (
    submitter_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) AND status = 'draft'
  );

-- Managers can update requests they need to approve
CREATE POLICY "Managers can update requests for approval"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager') AND
    status = 'in_review' AND
    submitter_id IN (
      SELECT p.id FROM public.profiles p
      JOIN public.profiles manager ON manager.id = p.manager_id
      WHERE manager.user_id = auth.uid()
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all requests"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can delete their own draft requests
CREATE POLICY "Users can delete own draft requests"
  ON public.requests FOR DELETE
  TO authenticated
  USING (
    submitter_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) AND status = 'draft'
  );

-- Trigger for updated_at
CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- REQUEST APPROVALS TABLE
-- ============================================

CREATE TABLE public.request_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES public.profiles(id),
  action public.approval_action NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, step_order)
);

ALTER TABLE public.request_approvals ENABLE ROW LEVEL SECURITY;

-- Users can view approvals on their own requests
CREATE POLICY "Users can view approvals on own requests"
  ON public.request_approvals FOR SELECT
  TO authenticated
  USING (
    request_id IN (
      SELECT r.id FROM public.requests r
      JOIN public.profiles p ON p.id = r.submitter_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Approvers can view their own approvals
CREATE POLICY "Approvers can view own approvals"
  ON public.request_approvals FOR SELECT
  TO authenticated
  USING (
    approver_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can view all approvals
CREATE POLICY "Admins can view all approvals"
  ON public.request_approvals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Managers can insert approvals for their direct reports
CREATE POLICY "Managers can insert approvals"
  ON public.request_approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'manager') AND
    approver_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) AND
    request_id IN (
      SELECT r.id FROM public.requests r
      JOIN public.profiles submitter ON submitter.id = r.submitter_id
      JOIN public.profiles manager ON manager.id = submitter.manager_id
      WHERE manager.user_id = auth.uid()
    )
  );

-- Admins can insert approvals
CREATE POLICY "Admins can insert approvals"
  ON public.request_approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND
    approver_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- REQUEST ACTIVITY LOG TABLE
-- ============================================

CREATE TABLE public.request_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.request_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view activity on their own requests
CREATE POLICY "Users can view activity on own requests"
  ON public.request_activity_log FOR SELECT
  TO authenticated
  USING (
    request_id IN (
      SELECT r.id FROM public.requests r
      JOIN public.profiles p ON p.id = r.submitter_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Managers can view activity on direct reports requests
CREATE POLICY "Managers can view activity on direct reports requests"
  ON public.request_activity_log FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager') AND
    request_id IN (
      SELECT r.id FROM public.requests r
      JOIN public.profiles submitter ON submitter.id = r.submitter_id
      JOIN public.profiles manager ON manager.id = submitter.manager_id
      WHERE manager.user_id = auth.uid()
    )
  );

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
  ON public.request_activity_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- ACTIVITY LOGGING TRIGGERS
-- ============================================

-- Function to log request status changes
CREATE OR REPLACE FUNCTION public.log_request_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.request_activity_log (request_id, actor_id, action, details)
    VALUES (
      NEW.id,
      (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
      'status_changed',
      jsonb_build_object('from', OLD.status, 'to', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for logging status changes
CREATE TRIGGER log_request_status_change_trigger
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_request_status_change();

-- Function to log new request creation
CREATE OR REPLACE FUNCTION public.log_request_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.request_activity_log (request_id, actor_id, action, details)
  VALUES (
    NEW.id,
    (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
    'created',
    jsonb_build_object('status', NEW.status)
  );
  RETURN NEW;
END;
$$;

-- Trigger for logging new requests
CREATE TRIGGER log_request_created_trigger
  AFTER INSERT ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_request_created();

-- Function to log approval actions
CREATE OR REPLACE FUNCTION public.log_approval_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.request_activity_log (request_id, actor_id, action, details)
  VALUES (
    NEW.request_id,
    NEW.approver_id,
    NEW.action::text,
    jsonb_build_object('step', NEW.step_order, 'comment', NEW.comment)
  );
  RETURN NEW;
END;
$$;

-- Trigger for logging approval actions
CREATE TRIGGER log_approval_action_trigger
  AFTER INSERT ON public.request_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_approval_action();

-- ============================================
-- DEMO DATA: REQUEST TYPES
-- ============================================

INSERT INTO public.request_types (name, description, category, form_schema) VALUES
(
  'Paid Time Off',
  'Request time off for vacation, personal days, or other leave',
  'HR',
  '[{"name": "leave_type", "type": "select", "label": "Leave Type", "required": true, "options": ["Vacation", "Personal", "Sick", "Other"]}, {"name": "reason", "type": "textarea", "label": "Reason", "required": false}]'::jsonb
),
(
  'Equipment Request',
  'Request new equipment such as laptop, monitor, or peripherals',
  'IT',
  '[{"name": "equipment_type", "type": "select", "label": "Equipment Type", "required": true, "options": ["Laptop", "Monitor", "Keyboard", "Mouse", "Headset", "Other"]}, {"name": "justification", "type": "textarea", "label": "Business Justification", "required": true}]'::jsonb
),
(
  'Remote Work',
  'Request to work remotely for a specific period',
  'HR',
  '[{"name": "work_location", "type": "text", "label": "Work Location", "required": true}, {"name": "reason", "type": "textarea", "label": "Reason for Request", "required": true}]'::jsonb
),
(
  'Training Request',
  'Request approval for training, courses, or certifications',
  'HR',
  '[{"name": "training_name", "type": "text", "label": "Training/Course Name", "required": true}, {"name": "provider", "type": "text", "label": "Training Provider", "required": true}, {"name": "cost", "type": "text", "label": "Estimated Cost", "required": true}, {"name": "benefit", "type": "textarea", "label": "Expected Benefit", "required": true}]'::jsonb
);

-- ============================================
-- DEMO DATA: APPROVAL STEPS
-- ============================================

-- All request types start with single-step manager approval
INSERT INTO public.approval_steps (request_type_id, step_order, approver_type)
SELECT id, 1, 'manager'::approver_type
FROM public.request_types;