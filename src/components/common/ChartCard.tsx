import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function ChartCard({
  title,
  description,
  action,
  children,
}: ChartCardProps) {
  return (
    <Card
      className="
        group
        rounded-2xl
        border
        border-emerald-100/60
        bg-white/80
        backdrop-blur-xl
        shadow-sm
        transition-all
        duration-300
        hover:shadow-lg
        hover:-translate-y-1
      "
    >
      <CardHeader
        className="
          flex
          flex-row
          items-start
          justify-between
          gap-4
          space-y-0
          pb-4
        "
      >
        <div className="space-y-1">

          <CardTitle
            className="
              text-base
              font-semibold
              text-foreground
              group-hover:text-emerald-600
              transition-colors
            "
          >
            {title}
          </CardTitle>


          {description && (
            <CardDescription
              className="
                text-sm
                text-muted-foreground
              "
            >
              {description}
            </CardDescription>
          )}

        </div>


        {action}

      </CardHeader>


      <CardContent>
        {children}
      </CardContent>

    </Card>
  );
}