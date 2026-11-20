import { Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({ onGoToMobile }: { onGoToMobile: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Monitor className="size-6" />
        </div>
        <Badge variant="secondary">Coming soon</Badge>
        <h2 className="text-lg font-semibold">The Web App Isn&apos;t Released Yet</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          The Web checklist will be available here once the Gonit web app launches. Switch to Mobile to keep testing.
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onGoToMobile}>
          Go to Mobile
        </Button>
      </CardContent>
    </Card>
  );
}
