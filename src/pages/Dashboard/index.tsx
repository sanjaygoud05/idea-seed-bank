import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DashboardOverviewGrid } from '@/components/dashboard/DashboardOverviewGrid';
import { ChartCard } from '@/components/common/ChartCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, BarChart3, Sparkles } from 'lucide-react';
import { getMyCompany, listEmissions, listEnergy, listInsights, listNotifications } from '@/services/company';
import { NotificationCard } from '@/components/notifications/NotificationCard';

export default function DashboardPage() {
  const company = useQuery({ queryKey: ['my-company'], queryFn: getMyCompany });
  const companyId = company.data?.id;

  const emissions = useQuery({
    queryKey: ['dashboard', 'emissions', companyId],
    queryFn: () => listEmissions(companyId!),
    enabled: !!companyId,
  });
  const energy = useQuery({
    queryKey: ['dashboard', 'energy', companyId],
    queryFn: () => listEnergy(companyId!),
    enabled: !!companyId,
  });
  const insights = useQuery({
    queryKey: ['dashboard', 'insights', companyId],
    queryFn: () => listInsights(companyId!),
    enabled: !!companyId,
  });
  const notifs = useQuery({ queryKey: ['dashboard', 'notifs'], queryFn: listNotifications });

  if (company.isLoading) {
    return (
      <AppLayout>
        <LoadingSkeleton rows={4} />
      </AppLayout>
    );
  }

  if (!company.data) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <PageHeader title="Sustainability Dashboard" description="Real-time view of emissions, energy, water and waste." />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Set up your company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create your company profile to start tracking emissions and unlock insights.
              </p>
              <Button asChild>
                <Link to="/company"><Building2 className="h-4 w-4 mr-2" />Create company profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const totalCo2e = Math.round((emissions.data ?? []).reduce((s, r: any) => s + Number(r.carbon_tonnes ?? 0), 0));
  const totalKwh = (energy.data ?? []).reduce((s, r: any) => s + Number(r.electricity_kwh ?? 0), 0);
  const totalEnergyMwh = Math.round(totalKwh / 1000);
  const renewablePct = totalKwh > 0
    ? Math.round(((energy.data ?? []).reduce((s, r: any) => s + Number(r.renewable_kwh ?? 0), 0) / totalKwh) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        <PageHeader
          title={`Welcome, ${company.data.company_name}`}
          description="Real-time view of your sustainability performance."
        />

        <DashboardOverviewGrid
          totalCo2e={totalCo2e}
          totalEnergyMwh={totalEnergyMwh}
          totalWaterM3={0}
          totalWasteKg={renewablePct}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Latest AI insights" description="Model-generated recommendations for your company.">
            {insights.isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (insights.data ?? []).length === 0 ? (
              <EmptyState icon={Sparkles} title="No insights yet" description="Insights appear once data is ingested and analyzed." />
            ) : (
              <ul className="space-y-3">
                {(insights.data ?? []).slice(0, 3).map((i: any) => (
                  <li key={i.id} className="rounded-md border border-border p-3">
                    <p className="text-sm font-medium">{i.insight}</p>
                    {i.recommendation && <p className="text-xs text-muted-foreground mt-1">{i.recommendation}</p>}
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>

          <ChartCard title="Recent alerts" description="Notifications from your workspace.">
            {notifs.isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (notifs.data ?? []).length === 0 ? (
              <EmptyState icon={BarChart3} title="You're all caught up" description="No new alerts." />
            ) : (
              <div className="space-y-3">
                {(notifs.data ?? []).slice(0, 4).map((n: any) => (
                  <NotificationCard
                    key={n.id}
                    notification={{
                      id: n.id,
                      title: n.title,
                      message: n.message,
                      kind: (n.category as any) ?? 'info',
                      read: n.status === 'read',
                      createdAt: n.created_at,
                    }}
                  />
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </AppLayout>
  );
}
