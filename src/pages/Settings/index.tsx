// TODO: persist settings via user preferences endpoint (Express + Prisma).
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl">
        <PageHeader title="Settings" description="Workspace preferences. Backend-persisted settings arrive later." />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Choose a theme for this device.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Label htmlFor="theme-toggle">Dark mode</Label>
            <Switch id="theme-toggle" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Placeholder — will be persisted via the backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Email digests" />
            <Row label="Anomaly alerts" defaultChecked />
            <Row label="Weekly recommendations" defaultChecked />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function Row({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
