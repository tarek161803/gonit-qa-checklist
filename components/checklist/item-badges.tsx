import { Flame } from "lucide-react";
import type { ChecklistItem } from "@/data/checklist";
import { cn } from "@/lib/utils";
import { AndroidIcon, AppleIcon } from "@/components/platform-icons";
import { Badge } from "@/components/ui/badge";
import { MUST_STYLE, PLATFORM_TAGS, PRIORITY_STYLES, TAG_CLASS } from "./constants";

/** Test number plus its priority, Must Test and platform-only badges. */
export function ItemBadges({ item }: { item: ChecklistItem }) {
  return (
    <div className="flex h-[1.625em] flex-none items-center gap-1">
      <span className="mr-0.5 w-7 font-mono text-xs text-muted-foreground tabular-nums">#{item.num}</span>
      <Badge variant="outline" className={cn(TAG_CLASS, PRIORITY_STYLES[item.priority])}>
        {item.priority}
      </Badge>
      {item.mustTest && (
        <Badge variant="outline" className={cn(TAG_CLASS, MUST_STYLE)}>
          <Flame className="size-2.5!" />
          Must Test
        </Badge>
      )}
      {item.only && (
        <Badge variant="outline" className={cn(TAG_CLASS, PLATFORM_TAGS[item.only].style)}>
          {item.only === "ios" ? <AppleIcon className="size-2.5!" /> : <AndroidIcon className="size-2.5!" />}
          {PLATFORM_TAGS[item.only].label}
        </Badge>
      )}
    </div>
  );
}
