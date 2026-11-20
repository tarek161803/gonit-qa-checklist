"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRIORITY_LABELS, PRIORITY_STYLES, TAG_CLASS, type Filter } from "./constants";

export interface FilterOption {
  value: Filter;
  label: string;
  count?: string | number;
}

function OptionLabel({ option }: { option: FilterOption }) {
  return (
    <>
      {option.value === "must" && <Flame className="text-primary" />}
      {option.label}
      {option.count !== undefined && <span className="text-muted-foreground tabular-nums">{option.count}</span>}
    </>
  );
}

export function FilterBar({ value, options, onChange }: { value: Filter; options: FilterOption[]; onChange: (f: Filter) => void }) {
  return (
    <div className="space-y-3">
      {/* Phones: a dropdown. Larger screens: tabs. */}
      <Select value={value} onValueChange={(v) => onChange(v as Filter)}>
        <SelectTrigger className="w-full sm:hidden" aria-label="Filter tests">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              <OptionLabel option={o} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Tabs value={value} onValueChange={(v) => onChange(v as Filter)} className="hidden sm:flex">
        <TabsList>
          {options.map((o) => (
            <TabsTrigger key={o.value} value={o.value}>
              <OptionLabel option={o} />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {PRIORITY_LABELS.map(([priority, label]) => (
          <span key={priority} className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn(TAG_CLASS, PRIORITY_STYLES[priority])}>
              {priority}
            </Badge>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
