import { jsPDF } from "jspdf";
import { SECTIONS } from "@/data/checklist";
import type { Meta, PlatformState, Platform } from "@/lib/types";

// jsPDF's built-in Helvetica only covers Latin-1, so swap common Unicode punctuation.
const ascii = (s: string) =>
  s
    .replace(/[–—]/g, "-")
    .replace(/→/g, "->")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "?");

export function generateFailedReport(platform: Platform, data: PlatformState, meta: Meta) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const width = pageW - margin * 2;
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const write = (text: string, size: number, opts: { bold?: boolean; color?: [number, number, number]; indent?: number; gap?: number } = {}) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? [29, 35, 48]));
    const lines: string[] = doc.splitTextToSize(ascii(text), width - (opts.indent ?? 0));
    const lh = size * 1.35;
    for (const line of lines) {
      ensure(lh);
      doc.text(line, margin + (opts.indent ?? 0), y + size);
      y += lh;
    }
    y += opts.gap ?? 0;
  };

  const platformName = platform === "web" ? "Web" : "Mobile";
  const all = SECTIONS.flatMap((s) => s.items);
  const failed = all.filter((i) => data.results[i.id] === "fail");
  const passed = all.filter((i) => data.results[i.id] === "pass").length;

  write(`Gonit QA - Failed Test Report (${platformName})`, 18, { bold: true, gap: 6 });
  write(
    `Tester: ${meta.tester || "-"}   Date: ${meta.date || "-"}   Build: ${meta.build || "-"}   Device: ${meta.device || "-"}`,
    10,
    { color: [103, 112, 133], gap: 2 },
  );
  write(
    `Total: ${all.length}   Passed: ${passed}   Failed: ${failed.length}   Not tested: ${all.length - passed - failed.length}   Generated: ${new Date().toLocaleString()}`,
    10,
    { color: [103, 112, 133], gap: 14 },
  );

  if (!failed.length) {
    write("No failed tests.", 12);
  }

  for (const sec of SECTIONS) {
    const items = sec.items.filter((i) => data.results[i.id] === "fail");
    if (!items.length) continue;
    ensure(40);
    doc.setDrawColor(226, 229, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 8;
    write(sec.title, 13, { bold: true, gap: 4 });
    for (const item of items) {
      ensure(30);
      write(`#${item.num}  [${item.priority}]${item.mustTest ? " [MUST TEST]" : ""}${item.only ? ` [${item.only === "ios" ? "iOS" : "Android"} only]` : ""}  ${item.text}`, 11, { color: [185, 28, 28], indent: 8, gap: 2 });
      const note = data.notes[item.id]?.trim();
      if (note) write(`Note: ${note}`, 10, { indent: 20, color: [55, 65, 81], gap: 2 });
      y += 6;
    }
    y += 4;
  }

  const stamp = (meta.date || new Date().toISOString().slice(0, 10)).replace(/[^\d-]/g, "");
  doc.save(`gonit-qa-failed-${platform}-${stamp}.pdf`);
}
