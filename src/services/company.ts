import { supabase } from '@/integrations/supabase/client';

export type Company = {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  location: string;
  employees: number;
  sustainability_target: string | null;
  net_zero_target_year: number | null;
  annual_revenue_usd: number | null;
  created_at: string;
  updated_at: string;
};

export async function getMyCompany(): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Company | null;
}

export async function upsertMyCompany(input: {
  id?: string;
  company_name: string;
  industry: string;
  location: string;
  employees: number;
  sustainability_target?: string | null;
  net_zero_target_year?: number | null;
  annual_revenue_usd?: number | null;
}): Promise<Company> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const payload = { ...input, user_id: userData.user.id };
  const query = input.id
    ? supabase.from('companies').update(payload).eq('id', input.id).select().single()
    : supabase.from('companies').insert(payload).select().single();

  const { data, error } = await query;
  if (error) throw error;
  return data as Company;
}

export async function listEmissions(companyId: string) {
  const { data, error } = await supabase
    .from('emission_records')
    .select('*')
    .eq('company_id', companyId)
    .order('calculation_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listEnergy(companyId: string) {
  const { data, error } = await supabase
    .from('energy_records')
    .select('*')
    .eq('company_id', companyId)
    .order('record_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listInsights(companyId: string) {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}
