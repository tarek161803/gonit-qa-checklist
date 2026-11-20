import { Fragment } from "react";
import { Check, X } from "lucide-react";
import type { Result } from "@/lib/types";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "pass", label: "Pass", icon: Check, hover: "hover:text-success", on: "bg-success text-success-foreground" },
  { value: "fail", label: "Fail", icon: X, hover: "hover:text-destructive", on: "bg-destructive text-white dark:bg-red-600" },
] as const;

/** Pass | Fail segmented control. Clicking the selected result clears it. */
export function ResultToggle({ num, result, onChange }: { num: number; result?: Result; onChange: (value: Result) => void }) {
  return (
    <div role="group" aria-label={`Result for test ${num}`} className="inline-flex h-8 flex-none items-center self-start rounded-lg bg-muted p-[3px]">
      {OPTIONS.map((o, i) => {
        const on = result === o.value;
        return (
          <Fragment key={o.value}>
            {i > 0 && <span aria-hidden className="mx-0.5 h-4 w-px bg-border dark:bg-input" />}
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={cn(
                "inline-flex h-full min-w-16 items-center justify-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                on ? cn(o.on, "shadow-sm") : cn("text-muted-foreground hover:bg-background dark:hover:bg-input/40", o.hover),
              )}
            >
              <o.icon className="size-3.5" strokeWidth={on ? 3 : 2.25} />
              {o.label}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
