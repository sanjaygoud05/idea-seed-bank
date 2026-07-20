import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { getMyCompany, upsertMyCompany, type Company } from '@/services/company';

const schema = z.object({
  company_name: z.string().trim().min(1).max(200),
  industry: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(200),
  employees: z.coerce.number().int().min(0).max(10_000_000),
  sustainability_target: z.string().max(500).optional().or(z.literal('')),
  net_zero_target_year: z.coerce.number().int().min(2020).max(2100).optional().or(z.nan()),
  annual_revenue_usd: z.coerce.number().min(0).optional().or(z.nan()),
});

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: company, isLoading } = useQuery({ queryKey: ['my-company'], queryFn: getMyCompany });

  const [form, setForm] = useState({
    company_name: '', industry: '', location: '', employees: '',
    sustainability_target: '', net_zero_target_year: '', annual_revenue_usd: '',
  });

  useEffect(() => {
    if (company) {
      setForm({
        company_name: company.company_name,
        industry: company.industry,
        location: company.location,
        employees: String(company.employees ?? ''),
        sustainability_target: company.sustainability_target ?? '',
        net_zero_target_year: company.net_zero_target_year ? String(company.net_zero_target_year) : '',
        annual_revenue_usd: company.annual_revenue_usd ? String(company.annual_revenue_usd) : '',
      });
    }
  }, [company]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const v = parsed.data;
      return upsertMyCompany({
        id: company?.id,
        company_name: v.company_name,
        industry: v.industry,
        location: v.location,
        employees: v.employees,
        sustainability_target: v.sustainability_target || null,
        net_zero_target_year: Number.isFinite(v.net_zero_target_year as number) ? (v.net_zero_target_year as number) : null,
        annual_revenue_usd: Number.isFinite(v.annual_revenue_usd as number) ? (v.annual_revenue_usd as number) : null,
      });
    },
    onSuccess: (data: Company) => {
      qc.setQueryData(['my-company'], data);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Company profile saved');
      navigate('/dashboard');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl">
        <PageHeader
          title="Company Profile"
          description={company ? 'Update your organizational context.' : 'Create your company profile to start tracking emissions.'}
        />
        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{company ? 'Edit company' : 'New company'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
              >
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cn">Company name</Label>
                  <Input id="cn" value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="in">Industry</Label>
                  <Input id="in" value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lo">Location</Label>
                  <Input id="lo" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="em">Employees</Label>
                  <Input id="em" type="number" min={0} value={form.employees}
                    onChange={(e) => setForm({ ...form, employees: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ny">Net-zero target year</Label>
                  <Input id="ny" type="number" min={2020} max={2100} value={form.net_zero_target_year}
                    onChange={(e) => setForm({ ...form, net_zero_target_year: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ar">Annual revenue (USD)</Label>
                  <Input id="ar" type="number" min={0} value={form.annual_revenue_usd}
                    onChange={(e) => setForm({ ...form, annual_revenue_usd: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="st">Sustainability target</Label>
                  <Textarea id="st" rows={3} value={form.sustainability_target}
                    onChange={(e) => setForm({ ...form, sustainability_target: e.target.value })}
                    placeholder="e.g. Reduce operational emissions by 55% vs 2019 baseline" />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" disabled={save.isPending}>
                    {save.isPending ? 'Saving…' : company ? 'Save changes' : 'Create company'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
