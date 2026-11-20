import { Check, CircleDashed, ListChecks, X } from "lucide-react";
import { TOTAL_ITEMS } from "@/data/checklist";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

interface Props {
  passed: number;
  failed: number;
  /** Pass / fail / remaining as percentages of all tests, adding up to 100. */
  percents: [number, number, number];
}

export function StatCards({ passed, failed, percents: [passPct, failPct, remainingPct] }: Props) {
  const tested = passed + failed;
  const cards = [
    { label: "Progress", value: `${Math.round((tested / TOTAL_ITEMS) * 100)}%`, hint: `${tested} of ${TOTAL_ITEMS} tested`, icon: ListChecks, tone: "text-primary", bar: true },
    { label: "Passed", value: passed, hint: `${passPct.toFixed(1)}% of all tests`, icon: Check, tone: "text-success" },
    { label: "Failed", value: failed, hint: `${failPct.toFixed(1)}% of all tests`, icon: X, tone: "text-destructive" },
    { label: "Remaining", value: TOTAL_ITEMS - tested, hint: `${remainingPct.toFixed(1)}% of all tests`, icon: CircleDashed, tone: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} size="sm">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              {c.label}
              <c.icon className={cn("size-4", c.tone)} />
            </CardDescription>
            <div className="font-mono text-2xl font-semibold tracking-tight tabular-nums">{c.value}</div>
          </CardHeader>
          <CardContent className="space-y-2">
            {c.bar && (
              <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                <span className="bg-success transition-all" style={{ width: `${(passed / TOTAL_ITEMS) * 100}%` }} />
                <span className="bg-destructive transition-all" style={{ width: `${(failed / TOTAL_ITEMS) * 100}%` }} />
              </div>
            )}
            <div className="text-xs text-muted-foreground">{c.hint}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
