import type { OnlyOn, Priority } from "@/data/checklist";

export type Filter = "all" | "must" | "untested" | "pass" | "fail";

export const TAG_CLASS = "h-4.5 gap-0.5 px-1.5 text-[10px] font-semibold";

export const PRIORITY_STYLES: Record<Priority, string> = {
  P0: "border-destructive/30 bg-destructive/10 text-destructive",
  P1: "border-warning/30 bg-warning/10 text-warning",
  P2: "border-border bg-muted text-muted-foreground",
};

export const PRIORITY_LABELS: [Priority, string][] = [
  ["P0", "Blocks release"],
  ["P1", "Must fix soon"],
  ["P2", "Minor / cosmetic"],
];

export const PLATFORM_TAGS: Record<OnlyOn, { label: string; style: string }> = {
  ios: { label: "iOS", style: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  android: { label: "Android", style: "border-success/30 bg-success/10 text-success" },
};

export const MUST_STYLE = "border-primary/30 bg-primary/10 text-primary";
