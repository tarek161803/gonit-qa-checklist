"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "@/data/checklist";
import type { AppState, Meta, Platform, PlatformState, Result } from "@/lib/types";

// Key kept from the versioned checklist so saved results carry over.
const KEY = "gonit-qa-v1.1.26-next-v1";

// The tester's name is remembered across runs and platforms; the date defaults to today.
const TESTER_KEY = "gonit-qa-tester";
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

const emptyPlatform = (): PlatformState => ({ results: {}, notes: {}, meta: {} });
const initialState = (): AppState => ({ platform: "mobile", mobile: emptyPlatform(), web: emptyPlatform(), collapsed: {} });
const withMetaDefaults = (d: PlatformState, tester: string): PlatformState => ({
  ...d,
  meta: { ...d.meta, date: d.meta.date || today(), tester: d.meta.tester || tester },
});

/** Checklist state for both platforms, persisted to localStorage. */
export function useChecklistState() {
  const [state, setState] = useState<AppState>(initialState);
  const [loaded, setLoaded] = useState(false);

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

  const platform = state.platform;
  const data = state[platform];

  const updatePlatform = (fn: (d: PlatformState) => PlatformState) =>
    setState((s) => ({ ...s, [s.platform]: fn(s[s.platform]) }));

  /** Toggles a result. Returns true when a test was just marked Fail and has no note yet. */
  const setResult = (id: string, value: Result, si: number) => {
    setState((s) => {
      const d = s[s.platform];
      const results = { ...d.results };
      if (results[id] === value) delete results[id];
      else results[id] = value;
      // Collapse a section once every test in it has passed.
      const allPassed = SECTIONS[si].items.every((i) => results[i.id] === "pass");
      return { ...s, [s.platform]: { ...d, results }, collapsed: allPassed ? { ...s.collapsed, [si]: true } : s.collapsed };
    });
    return value === "fail" && data.results[id] !== value && !data.notes[id];
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

  const setPlatform = (p: Platform) => setState((s) => ({ ...s, platform: p }));
  const toggleSection = (si: number) => setState((s) => ({ ...s, collapsed: { ...s.collapsed, [si]: !s.collapsed[si] } }));
  const expandSection = (si: number) => setState((s) => ({ ...s, collapsed: { ...s.collapsed, [si]: false } }));
  const reset = () => updatePlatform((d) => ({ ...emptyPlatform(), meta: d.meta }));

  return {
    platform,
    data,
    collapsed: state.collapsed,
    setResult,
    setNote,
    setMeta,
    setPlatform,
    toggleSection,
    expandSection,
    reset,
  };
}
