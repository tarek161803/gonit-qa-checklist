"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Check, ChevronDown, CircleDashed, FileCode, FileDown, FileText, Flame, ListChecks, Monitor, Plus, RotateCcw, X } from "lucide-react";
import { SECTIONS, TOTAL_ITEMS, type ChecklistItem, type OnlyOn, type Priority } from "@/data/checklist";
import type { AppState, Meta, Platform, PlatformState, Result } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AndroidIcon, AppleIcon } from "@/components/platform-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Key kept from the versioned checklist so saved results carry over.
const KEY = "gonit-qa-v1.1.26-next-v1";

const emptyPlatform = (): PlatformState => ({ results: {}, notes: {}, meta: {} });

// The tester's name is remembered across runs and platforms; the date defaults to today.
const TESTER_KEY = "gonit-qa-tester";
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
const withMetaDefaults = (d: PlatformState, tester: string): PlatformState => ({
  ...d,
  meta: { ...d.meta, date: d.meta.date || today(), tester: d.meta.tester || tester },
});
const initialState = (): AppState => ({ platform: "mobile", mobile: emptyPlatform(), web: emptyPlatform(), collapsed: {} });

const META_FIELDS: { key: keyof Meta; label: string; type?: string; placeholder?: string }[] = [
  { key: "tester", label: "Tester" },
  { key: "date", label: "Date", type: "date" },
  { key: "build", label: "Build", placeholder: "e.g. 2.0.1 (build 42)" },
  { key: "device", label: "Device / OS", placeholder: "e.g. Pixel 7 (Android 16) or iPhone 15 (iOS 18)" },
];

type Filter = "all" | "must" | "untested" | "pass" | "fail";

const PRIORITY_STYLES: Record<Priority, string> = {
  P0: "border-destructive/30 bg-destructive/10 text-destructive",
  P1: "border-warning/30 bg-warning/10 text-warning",
  P2: "border-border bg-muted text-muted-foreground",
};

const TAG_CLASS = "h-4.5 gap-0.5 px-1.5 text-[10px] font-semibold";

const PLATFORM_TAGS: Record<OnlyOn, { label: string; style: string }> = {
  ios: { label: "iOS", style: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  android: { label: "Android", style: "border-success/30 bg-success/10 text-success" },
};

const MUST_STYLE = "border-primary/30 bg-primary/10 text-primary";

const PRIORITY_LABELS: [string, string, string][] = [
  ["P0", "Blocks release", PRIORITY_STYLES.P0],
  ["P1", "Must fix soon", PRIORITY_STYLES.P1],
  ["P2", "Minor / cosmetic", PRIORITY_STYLES.P2],
];

// Percentages of the total, to one decimal, that always add up to exactly 100.0
// (largest-remainder rounding in tenths of a percent).
const splitPercent = (counts: number[]) => {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const exact = counts.map((c) => (c / total) * 1000);
  const tenths = exact.map(Math.floor);
  let left = 1000 - tenths.reduce((a, b) => a + b, 0);
  exact
    .map((e, i) => [e - tenths[i], i] as const)
    .sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => left-- > 0 && tenths[i]++);
  return tenths.map((t) => t / 10);
};

export default function Checklist() {
  const [state, setState] = useState<AppState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 600);
      // The active section is the last one whose top has scrolled under the header.
      let current: number | null = null;
      document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => {
        if (el.getBoundingClientRect().top <= 120) current = Number(el.dataset.section);
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      const tester = localStorage.getItem(TESTER_KEY) || "";
      // Older saves kept results under "android" / "ios"; carry the Android run over as Mobile.
      const next: AppState = saved
        ? { ...initialState(), ...saved, mobile: saved.mobile ?? saved.android ?? emptyPlatform(), platform: saved.platform === "web" ? "web" : "mobile" }
        : initialState();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
      setState({ ...next, mobile: withMetaDefaults(next.mobile, tester), web: withMetaDefaults(next.web, tester) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, loaded]);

  const p = state.platform;
  const data = state[p];
  const platformName = p === "web" ? "Web" : "Mobile";
  const comingSoon = p === "web";

  const updatePlatform = (fn: (d: PlatformState) => PlatformState) =>
    setState((s) => ({ ...s, [s.platform]: fn(s[s.platform]) }));

  const setResult = (id: string, value: Result, si: number) => {
    const turningOn = data.results[id] !== value;
    setState((s) => {
      const d = s[s.platform];
      const results = { ...d.results };
      if (results[id] === value) delete results[id];
      else results[id] = value;
      // Collapse a section once every test in it has passed.
      const allPassed = SECTIONS[si].items.every((i) => results[i.id] === "pass");
      return { ...s, [s.platform]: { ...d, results }, collapsed: allPassed ? { ...s.collapsed, [si]: true } : s.collapsed };
    });
    // A failure needs a reason: open the note field straight away.
    if (value === "fail" && turningOn && !data.notes[id]) setEditingNote(id);
  };

  const setNote = (id: string, value: string) => updatePlatform((d) => ({ ...d, notes: { ...d.notes, [id]: value } }));
  const setMeta = (key: keyof Meta, value: string) => {
    updatePlatform((d) => ({ ...d, meta: { ...d.meta, [key]: value } }));
    if (key === "tester") {
      try {
        localStorage.setItem(TESTER_KEY, value);
      } catch {}
    }
  };
  const toggleSection = (si: number) => setState((s) => ({ ...s, collapsed: { ...s.collapsed, [si]: !s.collapsed[si] } }));

  // Count only current tests; results for removed or reworded tests stay in storage but are ignored.
  const values = SECTIONS.flatMap((sec) => sec.items.map((i) => data.results[i.id]));
  const passed = values.filter((r) => r === "pass").length;
  const failed = values.filter((r) => r === "fail").length;
  const tested = passed + failed;

  const [passPct, failPct, remainingPct] = splitPercent([passed, failed, TOTAL_ITEMS - tested]);
  const testedPct = (passPct * 10 + failPct * 10) / 10;

  const stats = SECTIONS.map((sec) => ({
    passed: sec.items.filter((i) => data.results[i.id] === "pass").length,
    failed: sec.items.filter((i) => data.results[i.id] === "fail").length,
    total: sec.items.length,
  }));

  const mustItems = SECTIONS.flatMap((sec) => sec.items.filter((i) => i.mustTest));
  const mustTotal = mustItems.length;
  const mustDone = mustItems.filter((i) => data.results[i.id]).length;

  const matches = (item: ChecklistItem) => {
    const r = data.results[item.id];
    if (filter === "must") return item.mustTest;
    return filter === "untested" ? !r : filter === "all" || r === filter;
  };

  const reset = () => {
    updatePlatform((d) => ({ ...emptyPlatform(), meta: d.meta }));
  };

  const jumpTo = (si: number | null) => {
    if (si === null) return window.scrollTo({ top: 0, behavior: "smooth" });
    setFilter("all");
    setState((s) => ({ ...s, collapsed: { ...s.collapsed, [si]: false } }));
    requestAnimationFrame(() => document.getElementById(`section-${si}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const generateReport = async (format: "pdf" | "md") => {
    setGenerating(true);
    try {
      if (format === "pdf") {
        const { generateFailedReport } = await import("@/lib/failedReport");
        generateFailedReport(p, data, data.meta);
      } else {
        const { generateFailedMarkdown } = await import("@/lib/failedReportMarkdown");
        generateFailedMarkdown(p, data, data.meta);
      }
    } finally {
      setGenerating(false);
    }
  };

  const statCards = [
    { label: "Progress", value: `${Math.round((tested / TOTAL_ITEMS) * 100)}%`, hint: `${tested} of ${TOTAL_ITEMS} tested`, icon: ListChecks, tone: "text-primary", bar: true },
    { label: "Passed", value: passed, hint: `${passPct.toFixed(1)}% of all tests`, icon: Check, tone: "text-success" },
    { label: "Failed", value: failed, hint: `${failPct.toFixed(1)}% of all tests`, icon: X, tone: "text-destructive" },
    { label: "Remaining", value: TOTAL_ITEMS - tested, hint: `${remainingPct.toFixed(1)}% of all tests`, icon: CircleDashed, tone: "text-muted-foreground" },
  ];

  const visibleSections = SECTIONS.map((sec, si) => ({ sec, si, items: sec.items.filter(matches) })).filter((s) => s.items.length);

  return (
    <SidebarProvider>
      <AppSidebar platformName={platformName} comingSoon={comingSoon} stats={stats} passed={passed} failed={failed} testedPct={testedPct} activeSection={activeSection} onSelect={jumpTo} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 data-vertical:h-4 data-vertical:self-center" />
          <Tabs value={p} onValueChange={(v) => setState((s) => ({ ...s, platform: v as Platform }))}>
            <TabsList>
              {(["mobile", "web"] as Platform[]).map((pl) => (
                <TabsTrigger key={pl} value={pl} className="px-3">
                  {pl === "web" ? "Web" : "Mobile"}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            {!comingSoon && (
            <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <RotateCcw />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset {platformName} results?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This clears every Pass / Fail mark and note for {platformName}. The test run details are kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={reset}>Reset results</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" disabled={generating}>
                  <FileDown />
                  {generating ? "Generating…" : <><span className="hidden sm:inline">Failed report</span><span className="sm:hidden">Report</span></>}
                  <ChevronDown className="opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Download as</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => generateReport("pdf")}>
                  <FileText />
                  PDF
                  <DropdownMenuShortcut>.pdf</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => generateReport("md")}>
                  <FileCode />
                  Markdown
                  <DropdownMenuShortcut>.md</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-4 md:p-6">
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
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setState((s) => ({ ...s, platform: "mobile" }))}>
                  Go to Mobile
                </Button>
              </CardContent>
            </Card>
          ) : (
          <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statCards.map((c) => (
              <Card key={c.label} size="sm">
                <CardHeader>
                  <CardDescription className="flex items-center justify-between">
                    {c.label}
                    <c.icon className={cn("size-4", c.tone)} />
                  </CardDescription>
                  <div className="font-mono text-2xl font-semibold tracking-tight tabular-nums">{c.value}</div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {c.bar && (
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                      <span className="bg-success transition-all" style={{ width: `${(passed / TOTAL_ITEMS) * 100}%` }} />
                      <span className="bg-destructive transition-all" style={{ width: `${(failed / TOTAL_ITEMS) * 100}%` }} />
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">{c.hint}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Run</CardTitle>
              <CardDescription>These details are printed at the top of the failed report.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {META_FIELDS.map((f) => (
                <div key={f.key} className={cn("grid gap-1.5", f.key === "device" && "lg:col-span-2")}>
                  <Label htmlFor={`meta-${f.key}`} className="text-xs text-muted-foreground">{f.label}</Label>
                  <Input
                    id={`meta-${f.key}`}
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    value={data.meta[f.key] ?? ""}
                    onChange={(e) => setMeta(f.key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="must">
                    <Flame className="text-primary" />
                    Must Test <span className="text-muted-foreground tabular-nums">{mustDone}/{mustTotal}</span>
                  </TabsTrigger>
                  <TabsTrigger value="untested">Untested <span className="text-muted-foreground tabular-nums">{TOTAL_ITEMS - tested}</span></TabsTrigger>
                  <TabsTrigger value="pass">Passed <span className="text-muted-foreground tabular-nums">{passed}</span></TabsTrigger>
                  <TabsTrigger value="fail">Failed <span className="text-muted-foreground tabular-nums">{failed}</span></TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {PRIORITY_LABELS.map(([tag, label, style]) => (
                <span key={tag} className="flex items-center gap-1.5">
                  <Badge variant="outline" className={cn(TAG_CLASS, style)}>{tag}</Badge>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {visibleSections.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">No tests match this filter.</CardContent>
              </Card>
            )}
            {visibleSections.map(({ sec, si, items }) => {
              const { passed: secPassed, failed: secFailed, total } = stats[si];
              const complete = secPassed + secFailed === total;
              const filtering = filter !== "all";
              const collapsed = !filtering && !!state.collapsed[si];
              return (
                <Card key={si} id={`section-${si}`} data-section={si} className="scroll-mt-20 gap-0 py-0">
                  <button
                    type="button"
                    onClick={() => toggleSection(si)}
                    aria-expanded={!collapsed}
                    className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40"
                  >
                    <span
                      className={cn(
                        "grid size-7 flex-none place-items-center rounded-full bg-muted font-mono text-xs font-semibold",
                        complete && (secFailed ? "bg-destructive text-white" : "bg-success text-success-foreground"),
                      )}
                    >
                      {si + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{sec.title}</span>
                      <span className="block text-sm text-muted-foreground">{sec.desc}</span>
                    </span>
                    <span className="flex flex-none items-center gap-2">
                      {secFailed > 0 && <Badge variant="destructive">{secFailed} failed</Badge>}
                      <Badge variant="secondary" className="font-mono tabular-nums">
                        {secPassed + secFailed}/{total}
                      </Badge>
                      <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-300", collapsed && "-rotate-90")} />
                    </span>
                  </button>
                  <Progress value={((secPassed + secFailed) / total) * 100} className="h-0.5 rounded-none" />
                  {/* Animate height with the grid-rows 0fr ↔ 1fr trick; inert keeps hidden tests out of tab order. */}
                  <div
                    inert={collapsed}
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none",
                      collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
                    )}
                  >
                      <ul className="min-h-0 divide-y overflow-hidden">
                        {items.map((item) => {
                          const result = data.results[item.id];
                          return (
                            <li
                              key={item.id}
                              className={cn(
                                "border-l-2 border-l-transparent px-4 py-3 transition-colors",
                                result === "pass" && "border-l-success bg-success/5",
                                result === "fail" && "border-l-destructive bg-destructive/5",
                              )}
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                                <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm leading-relaxed sm:flex-row sm:items-start sm:gap-2 sm:pt-0.5">
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
                                  <p className="min-w-0">{item.text}</p>
                                </div>
                                <div className="flex h-8 flex-none self-start overflow-hidden rounded-lg border bg-background dark:bg-input/30" role="group" aria-label={`Result for test ${item.num}`}>
                                  {(["pass", "fail"] as const).map((value) => {
                                    const on = result === value;
                                    const Icon = value === "pass" ? Check : X;
                                    return (
                                      <Tooltip key={value}>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            aria-pressed={on}
                                            aria-label={value === "pass" ? "Pass" : "Fail"}
                                            onClick={() => setResult(item.id, value, si)}
                                            className={cn(
                                              "grid w-10 place-items-center text-muted-foreground transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                                              value === "fail" && "border-l",
                                              value === "pass"
                                                ? on ? "bg-success text-success-foreground" : "hover:bg-success/10 hover:text-success"
                                                : on ? "bg-destructive text-white" : "hover:bg-destructive/10 hover:text-destructive",
                                            )}
                                          >
                                            <Icon className="size-4" strokeWidth={on ? 3 : 2} />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>{value === "pass" ? "Pass" : "Fail"}</TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                                </div>
                              </div>
                              {data.notes[item.id] || editingNote === item.id ? (
                                <Input
                                  autoFocus={editingNote === item.id}
                                  className="mt-2 h-7 rounded-md bg-background/60 text-xs shadow-none"
                                  placeholder="Note / ticket"
                                  value={data.notes[item.id] ?? ""}
                                  onChange={(e) => setNote(item.id, e.target.value)}
                                  onBlur={() => setEditingNote(null)}
                                  onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && e.currentTarget.blur()}
                                />
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="mt-1 -ml-2 text-muted-foreground"
                                  onClick={() => setEditingNote(item.id)}
                                >
                                  <Plus />
                                  Add note
                                </Button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                  </div>
                </Card>
              );
            })}
          </div>
          </>
          )}
        </main>
        <Button
          size="icon"
          variant="outline"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={cn(
            "fixed right-4 bottom-4 z-30 rounded-full bg-background/90 shadow-md backdrop-blur transition-all md:right-6 md:bottom-6",
            showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
          )}
        >
          <ArrowUp />
        </Button>
      </SidebarInset>
    </SidebarProvider>
  );
}
