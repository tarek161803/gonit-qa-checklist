"use client";

import { useEffect, useState } from "react";

/** Tracks whether the page is scrolled far enough for "back to top", and which [data-section] is under the header. */
export function useScrollSpy() {
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

  return { showTop, activeSection };
}
