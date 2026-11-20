"use client";

import type { Platform, PlatformState } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportMenu } from "./report-menu";
import { ResetDialog } from "./reset-dialog";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "mobile", label: "Mobile" },
  { value: "web", label: "Web" },
];

interface Props {
  platform: Platform;
  platformName: string;
  data: PlatformState;
  comingSoon: boolean;
  onPlatformChange: (p: Platform) => void;
  onReset: () => void;
}

export function AppHeader({ platform, platformName, data, comingSoon, onPlatformChange, onReset }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-vertical:h-4 data-vertical:self-center" />
      <Tabs value={platform} onValueChange={(v) => onPlatformChange(v as Platform)}>
        <TabsList>
          {PLATFORMS.map((p) => (
            <TabsTrigger key={p.value} value={p.value} className="px-3">
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        {!comingSoon && (
          <>
            <ResetDialog platformName={platformName} onReset={onReset} />
            <ReportMenu platform={platform} data={data} />
          </>
        )}
      </div>
    </header>
  );
}
