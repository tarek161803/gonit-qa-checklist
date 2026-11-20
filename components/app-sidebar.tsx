"use client";

import { useEffect } from "react";
import { CheckCircle2, CircleDashed, ClipboardCheck, XCircle } from "lucide-react";
import { SECTIONS } from "@/data/checklist";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export interface SectionStat {
  passed: number;
  failed: number;
  total: number;
}

interface Props {
  platformName: string;
  comingSoon?: boolean;
  stats: SectionStat[];
  passed: number;
  testedPct: number;
  failed: number;
  activeSection: number | null;
  onSelect: (si: number | null) => void;
}

export function AppSidebar({ platformName, comingSoon, stats, passed, failed, testedPct, activeSection, onSelect }: Props) {
  const { isMobile, setOpenMobile } = useSidebar();

  // Keep the active section visible in the sidebar's own scroll area. This sets scrollTop
  // directly: scrollIntoView here would cancel the page's smooth scroll after a jump.
  useEffect(() => {
    if (activeSection === null) return;
    const item = document.querySelector<HTMLElement>(`[data-nav-section="${activeSection}"]`);
    const list = item?.closest<HTMLElement>('[data-sidebar="content"]');
    if (!item || !list) return;
    const i = item.getBoundingClientRect();
    const l = list.getBoundingClientRect();
    if (i.top < l.top) list.scrollTop -= l.top - i.top + 8;
    else if (i.bottom > l.bottom) list.scrollTop += i.bottom - l.bottom + 8;
  }, [activeSection]);

  const select = (si: number | null) => {
    onSelect(si);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border/60 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => select(null)} className="gap-3 hover:bg-transparent active:bg-transparent">
              <div className="grid aspect-square size-8 flex-none place-items-center rounded-lg bg-primary text-primary-foreground">
                <ClipboardCheck className="size-4" />
              </div>
              <span className="flex-1 truncate text-left text-lg font-semibold tracking-tight">
                Gonit <span className="text-primary">QA</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {!comingSoon && (
        <SidebarGroup>
          <SidebarGroupLabel>Test Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SECTIONS.map((sec, si) => {
                const s = stats[si];
                const done = s.passed + s.failed === s.total;
                const Icon = s.failed ? XCircle : done ? CheckCircle2 : CircleDashed;
                const color = s.failed ? "text-destructive" : done ? "text-success" : "text-muted-foreground";
                return (
                  <SidebarMenuItem key={si}>
                    <SidebarMenuButton tooltip={sec.title} onClick={() => select(si)} isActive={activeSection === si} data-nav-section={si} className="pr-12">
                      <Icon className={color} />
                      <span>{sec.title}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {s.passed + s.failed}/{s.total}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className={cn("group-data-[collapsible=icon]:hidden", comingSoon && "hidden")}>
        <div className="rounded-lg border bg-background/60 p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium">{platformName} Progress</span>
            <span className="font-mono tabular-nums text-muted-foreground">{testedPct.toFixed(1)}%</span>
          </div>
          <Progress value={testedPct} className="h-1.5" />
          <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
            <span className="text-success">{passed} passed</span>
            <span className="text-destructive">{failed} failed</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
