"use client";

import { useState } from "react";
import { SECTIONS, TOTAL_ITEMS, type ChecklistItem } from "@/data/checklist";
import { useChecklistState } from "@/hooks/use-checklist-state";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { splitPercent } from "@/lib/percent";
import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./app-header";
import { BackToTop } from "./back-to-top";
import { ComingSoon } from "./coming-soon";
import type { Filter } from "./constants";
import { FilterBar, type FilterOption } from "./filter-bar";
import { SectionCard } from "./section-card";
import { StatCards } from "./stat-cards";
import { TestItem } from "./test-item";
import { TestRunCard } from "./test-run-card";

export function Checklist() {
  const { platform, data, collapsed, setResult, setNote, setMeta, setPlatform, toggleSection, expandSection, reset } = useChecklistState();
  const { showTop, activeSection } = useScrollSpy();
  const [filter, setFilter] = useState<Filter>("all");
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const platformName = platform === "web" ? "Web" : "Mobile";
  const comingSoon = platform === "web";

  // Count only current tests; results for removed or reworded tests stay in storage but are ignored.
  const values = SECTIONS.flatMap((sec) => sec.items.map((i) => data.results[i.id]));
  const passed = values.filter((r) => r === "pass").length;
  const failed = values.filter((r) => r === "fail").length;
  const tested = passed + failed;
  const percents = splitPercent([passed, failed, TOTAL_ITEMS - tested]) as [number, number, number];
  const testedPct = (percents[0] * 10 + percents[1] * 10) / 10;

  const stats = SECTIONS.map((sec) => ({
    passed: sec.items.filter((i) => data.results[i.id] === "pass").length,
    failed: sec.items.filter((i) => data.results[i.id] === "fail").length,
    total: sec.items.length,
  }));

  const mustItems = SECTIONS.flatMap((sec) => sec.items.filter((i) => i.mustTest));
  const mustDone = mustItems.filter((i) => data.results[i.id]).length;

  const filterOptions: FilterOption[] = [
    { value: "all", label: "All" },
    { value: "must", label: "Must Test", count: `${mustDone}/${mustItems.length}` },
    { value: "untested", label: "Untested", count: TOTAL_ITEMS - tested },
    { value: "pass", label: "Passed", count: passed },
    { value: "fail", label: "Failed", count: failed },
  ];

  const matches = (item: ChecklistItem) => {
    const r = data.results[item.id];
    if (filter === "must") return item.mustTest;
    return filter === "untested" ? !r : filter === "all" || r === filter;
  };
  const visibleSections = SECTIONS.map((sec, si) => ({ sec, si, items: sec.items.filter(matches) })).filter((s) => s.items.length);

  const jumpTo = (si: number | null) => {
    if (si === null) return window.scrollTo({ top: 0, behavior: "smooth" });
    setFilter("all");
    expandSection(si);
    requestAnimationFrame(() => document.getElementById(`section-${si}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <SidebarProvider>
      <AppSidebar
        platformName={platformName}
        comingSoon={comingSoon}
        stats={stats}
        passed={passed}
        failed={failed}
        testedPct={testedPct}
        activeSection={activeSection}
        onSelect={jumpTo}
      />
      <SidebarInset>
        <AppHeader
          platform={platform}
          platformName={platformName}
          data={data}
          comingSoon={comingSoon}
          onPlatformChange={setPlatform}
          onReset={reset}
        />

        <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-4 md:p-6 2xl:max-w-6xl">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Manual QA Checklist</h1>
              <Badge variant="secondary">{platformName}</Badge>
            </div>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Work through it from top to bottom: the sections follow the order a real user goes through the app, from a fresh
              install to deleting the account. Results and notes are saved in this browser.
            </p>
          </div>

          {comingSoon ? (
            <ComingSoon onGoToMobile={() => setPlatform("mobile")} />
          ) : (
            <>
              <StatCards passed={passed} failed={failed} percents={percents} />
              <TestRunCard meta={data.meta} onChange={setMeta} />
              <FilterBar value={filter} options={filterOptions} onChange={setFilter} />

              <div className="space-y-4">
                {visibleSections.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">No tests match this filter.</CardContent>
                  </Card>
                )}
                {visibleSections.map(({ sec, si, items }) => (
                  <SectionCard
                    key={si}
                    section={sec}
                    index={si}
                    stat={stats[si]}
                    // While filtering, every matching section stays open.
                    collapsed={filter === "all" && !!collapsed[si]}
                    onToggle={() => toggleSection(si)}
                  >
                    {items.map((item) => (
                      <TestItem
                        key={item.id}
                        item={item}
                        result={data.results[item.id]}
                        note={data.notes[item.id]}
                        editingNote={editingNote === item.id}
                        onResult={(value) => {
                          // A failure needs a reason: open the note field straight away.
                          if (setResult(item.id, value, si)) setEditingNote(item.id);
                        }}
                        onNoteChange={(value) => setNote(item.id, value)}
                        onEditNote={(open) => setEditingNote(open ? item.id : null)}
                      />
                    ))}
                  </SectionCard>
                ))}
              </div>
            </>
          )}
        </main>
        <BackToTop visible={showTop} />
      </SidebarInset>
    </SidebarProvider>
  );
}
