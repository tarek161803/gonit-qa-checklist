import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { ChecklistSection } from "@/data/checklist";
import { cn } from "@/lib/utils";
import type { SectionStat } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  section: ChecklistSection;
  index: number;
  stat: SectionStat;
  collapsed: boolean;
  onToggle: () => void;
  /** The test rows (<li> elements). */
  children: ReactNode;
}

export function SectionCard({ section, index, stat, collapsed, onToggle, children }: Props) {
  const { passed, failed, total } = stat;
  const complete = passed + failed === total;

  return (
    <Card id={`section-${index}`} data-section={index} className="scroll-mt-20 gap-0 py-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40"
      >
        <span
          className={cn(
            "grid size-7 flex-none place-items-center rounded-full bg-muted font-mono text-xs font-semibold",
            complete && (failed ? "bg-destructive text-white" : "bg-success text-success-foreground"),
          )}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{section.title}</span>
          <span className="block text-sm text-muted-foreground">{section.desc}</span>
        </span>
        <span className="flex flex-none items-center gap-2">
          {failed > 0 && <Badge variant="destructive">{failed} failed</Badge>}
          <Badge variant="secondary" className="font-mono tabular-nums">
            {passed + failed}/{total}
          </Badge>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-300", collapsed && "-rotate-90")} />
        </span>
      </button>
      <Progress value={((passed + failed) / total) * 100} className="h-0.5 rounded-none" />
      {/* Animate height with the grid-rows 0fr ↔ 1fr trick; inert keeps hidden tests out of tab order. */}
      <div
        inert={collapsed}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none",
          collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
        )}
      >
        <ul className="min-h-0 divide-y overflow-hidden">{children}</ul>
      </div>
    </Card>
  );
}
