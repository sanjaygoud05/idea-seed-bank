
-- Clean up legacy request-tracker tables (unused in EcoTwin AI)
DROP TABLE IF EXISTS public.request_activity_log CASCADE;
DROP TABLE IF EXISTS public.request_approvals CASCADE;
DROP TABLE IF EXISTS public.approval_steps CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.request_types CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;

-- ============ COMPANIES ============
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  industry text NOT NULL,
  location text NOT NULL,
  employees integer NOT NULL DEFAULT 0,
  sustainability_target text,
  net_zero_target_year integer,
  annual_revenue_usd bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own company" ON public.companies FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all companies" ON public.companies FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX companies_user_id_idx ON public.companies(user_id);
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ UPLOADED DATA ============
CREATE TABLE public.uploaded_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  storage_path text,
  processing_status text NOT NULL DEFAULT 'queued',
  error_message text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploaded_data TO authenticated;
GRANT ALL ON public.uploaded_data TO service_role;
ALTER TABLE public.uploaded_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner accesses uploads" ON public.uploaded_data FOR ALL
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()));
CREATE POLICY "Admins view all uploads" ON public.uploaded_data FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ ENERGY RECORDS ============
CREATE TABLE public.energy_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  record_date date NOT NULL,
  electricity_kwh numeric NOT NULL DEFAULT 0,
  fuel_liters numeric NOT NULL DEFAULT 0,
  renewable_kwh numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.energy_records TO authenticated;
GRANT ALL ON public.energy_records TO service_role;
ALTER TABLE public.energy_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner accesses energy" ON public.energy_records FOR ALL
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()));
CREATE POLICY "Admins view energy" ON public.energy_records FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX energy_records_company_date_idx ON public.energy_records(company_id, record_date);

-- ============ EMISSION RECORDS ============
CREATE TABLE public.emission_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  emission_type text NOT NULL,
  scope text NOT NULL DEFAULT 'scope-2',
  carbon_tonnes numeric NOT NULL DEFAULT 0,
  calculation_date date NOT NULL DEFAULT CURRENT_DATE,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emission_records TO authenticated;
GRANT ALL ON public.emission_records TO service_role;
ALTER TABLE public.emission_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner accesses emissions" ON public.emission_records FOR ALL
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()));
CREATE POLICY "Admins view emissions" ON public.emission_records FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX emission_records_company_date_idx ON public.emission_records(company_id, calculation_date);

-- ============ AI INSIGHTS ============
CREATE TABLE public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  insight text NOT NULL,
  recommendation text,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  estimated_co2e_saving_tonnes numeric,
  estimated_annual_saving_usd numeric,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_insights TO authenticated;
GRANT ALL ON public.ai_insights TO service_role;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner accesses insights" ON public.ai_insights FOR ALL
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()));
CREATE POLICY "Admins view insights" ON public.ai_insights FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ DIGITAL TWIN ============
CREATE TABLE public.digital_twin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sustainability_score numeric NOT NULL DEFAULT 0,
  carbon_level numeric NOT NULL DEFAULT 0,
  energy_efficiency numeric NOT NULL DEFAULT 0,
  prediction text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.digital_twin TO authenticated;
GRANT ALL ON public.digital_twin TO service_role;
ALTER TABLE public.digital_twin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner accesses twin" ON public.digital_twin FOR ALL
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()));
CREATE POLICY "Admins view twin" ON public.digital_twin FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER digital_twin_updated_at BEFORE UPDATE ON public.digital_twin
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REPORTS ============
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  report_name text NOT NULL,
  report_type text NOT NULL DEFAULT 'internal',
  status text NOT NULL DEFAULT 'draft',
  storage_path text,
  period_label text,
  generated_date timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner accesses reports" ON public.reports FOR ALL
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()));
CREATE POLICY "Admins view reports" ON public.reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'info',
  status text NOT NULL DEFAULT 'unread',
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own notifications" ON public.notifications FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
