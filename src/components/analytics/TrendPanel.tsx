import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Placeholder — TODO: wire to backend analytics service (GraphQL query).
export function TrendPanel({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
