import type { Meta } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELDS: { key: keyof Meta; label: string; type?: string; placeholder?: string }[] = [
  { key: "tester", label: "Tester" },
  { key: "date", label: "Date", type: "date" },
  { key: "build", label: "Build", placeholder: "e.g. 2.0.1 (42)" },
  { key: "device", label: "Device / OS", placeholder: "e.g. Pixel 9 (16)" },
];

export function TestRunCard({ meta, onChange }: { meta: Meta; onChange: (key: keyof Meta, value: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Run</CardTitle>
        <CardDescription>These details are printed at the top of the failed report.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="grid gap-1.5">
            <Label htmlFor={`meta-${f.key}`} className="text-xs text-muted-foreground">
              {f.label}
            </Label>
            <Input
              id={`meta-${f.key}`}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              value={meta[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
