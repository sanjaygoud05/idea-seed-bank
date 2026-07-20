-- ============================================
-- CarbonIQ - EcoTwin AI Database Schema
-- MVP-Ready Migration for New Supabase Project
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX profiles_id_idx ON public.profiles(id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================
-- COMPANIES TABLE
-- ============================================
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
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX companies_user_id_idx ON public.companies(user_id);

-- Unique constraint: one company per user
ALTER TABLE public.companies
  ADD CONSTRAINT unique_user_company UNIQUE(user_id);

-- Trigger for auto-updating updated_at
CREATE TRIGGER companies_updated_at 
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own company"
  ON public.companies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPLOADED DATA TABLE
-- ============================================
CREATE TABLE public.uploaded_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  storage_path text,
  processing_status text NOT NULL DEFAULT 'uploaded',
  error_message text,
  uploaded_at timestamptz NOT NULL DEFAULT NOW(),
  file_size_bytes bigint,
  mime_type text,
  extracted_text text,
  extracted_data jsonb,
  confidence_score numeric,
  processed_at timestamptz
);

-- Indexes
CREATE INDEX uploaded_data_company_id_idx ON public.uploaded_data(company_id);
CREATE INDEX uploaded_data_status_idx ON public.uploaded_data(processing_status);

-- RLS
ALTER TABLE public.uploaded_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company uploads"
  ON public.uploaded_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = uploaded_data.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company uploads"
  ON public.uploaded_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = uploaded_data.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company uploads"
  ON public.uploaded_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = uploaded_data.company_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = uploaded_data.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company uploads"
  ON public.uploaded_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = uploaded_data.company_id 
      AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- ENERGY RECORDS TABLE
-- ============================================
CREATE TABLE public.energy_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  record_date date NOT NULL,
  electricity_kwh numeric NOT NULL DEFAULT 0,
  fuel_liters numeric NOT NULL DEFAULT 0,
  renewable_kwh numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX energy_records_company_date_idx ON public.energy_records(company_id, record_date DESC);

-- RLS
ALTER TABLE public.energy_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company energy"
  ON public.energy_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = energy_records.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company energy"
  ON public.energy_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = energy_records.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company energy"
  ON public.energy_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = energy_records.company_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = energy_records.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company energy"
  ON public.energy_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = energy_records.company_id 
      AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- EMISSION RECORDS TABLE
-- ============================================
CREATE TABLE public.emission_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  emission_type text NOT NULL,
  scope text NOT NULL DEFAULT 'scope-2',
  carbon_tonnes numeric NOT NULL DEFAULT 0,
  calculation_date date NOT NULL DEFAULT CURRENT_DATE,
  source text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX emission_records_company_date_idx ON public.emission_records(company_id, calculation_date DESC);

-- RLS
ALTER TABLE public.emission_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company emissions"
  ON public.emission_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = emission_records.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company emissions"
  ON public.emission_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = emission_records.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company emissions"
  ON public.emission_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = emission_records.company_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = emission_records.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company emissions"
  ON public.emission_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = emission_records.company_id 
      AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- AI INSIGHTS TABLE
-- ============================================
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
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX ai_insights_company_idx ON public.ai_insights(company_id);
CREATE INDEX ai_insights_created_idx ON public.ai_insights(created_at DESC);

-- RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company insights"
  ON public.ai_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = ai_insights.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company insights"
  ON public.ai_insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = ai_insights.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company insights"
  ON public.ai_insights FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = ai_insights.company_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = ai_insights.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company insights"
  ON public.ai_insights FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = ai_insights.company_id 
      AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- DIGITAL TWIN TABLE
-- ============================================
CREATE TABLE public.digital_twin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sustainability_score numeric NOT NULL DEFAULT 0,
  carbon_level numeric NOT NULL DEFAULT 0,
  energy_efficiency numeric NOT NULL DEFAULT 0,
  prediction text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Indexes
CREATE INDEX digital_twin_company_idx ON public.digital_twin(company_id);

-- Trigger for auto-updating updated_at
CREATE TRIGGER digital_twin_updated_at 
  BEFORE UPDATE ON public.digital_twin
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.digital_twin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company twin"
  ON public.digital_twin FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = digital_twin.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company twin"
  ON public.digital_twin FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = digital_twin.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company twin"
  ON public.digital_twin FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = digital_twin.company_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = digital_twin.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company twin"
  ON public.digital_twin FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = digital_twin.company_id 
      AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  report_name text NOT NULL,
  report_type text NOT NULL DEFAULT 'internal',
  status text NOT NULL DEFAULT 'draft',
  storage_path text,
  period_label text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX reports_company_idx ON public.reports(company_id);
CREATE INDEX reports_status_idx ON public.reports(status);

-- Trigger for auto-updating updated_at
CREATE TRIGGER reports_updated_at 
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = reports.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company reports"
  ON public.reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = reports.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = reports.company_id 
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = reports.company_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company reports"
  ON public.reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = reports.company_id 
      AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'info',
  status text NOT NULL DEFAULT 'unread',
  link text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Insert storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Users can view own company documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload to own company folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- GRANTS
-- ============================================

-- Grant permissions on all tables to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service role for edge functions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
