import { SECTIONS } from "@/data/checklist";
import type { Meta, PlatformState, Platform } from "@/lib/types";

const cell = (s?: string) => (s?.trim() || "-").replace(/\|/g, "\\|").replace(/\n/g, " ");

export function generateFailedMarkdown(platform: Platform, data: PlatformState, meta: Meta) {
  const platformName = platform === "web" ? "Web" : "Mobile";
  const all = SECTIONS.flatMap((s) => s.items);
  const failed = all.filter((i) => data.results[i.id] === "fail");
  const passed = all.filter((i) => data.results[i.id] === "pass").length;

  const lines = [
    `# Gonit QA – Failed Test Report (${platformName})`,
    "",
    "| Tester | Date | Build | Device / OS |",
    "| --- | --- | --- | --- |",
    `| ${cell(meta.tester)} | ${cell(meta.date)} | ${cell(meta.build)} | ${cell(meta.device)} |`,
    "",
    `**Total:** ${all.length} · **Passed:** ${passed} · **Failed:** ${failed.length} · **Not tested:** ${all.length - passed - failed.length} · **Generated:** ${new Date().toLocaleString()}`,
    "",
  ];

  if (!failed.length) lines.push("No failed tests.", "");

  for (const sec of SECTIONS) {
    const items = sec.items.filter((i) => data.results[i.id] === "fail");
    if (!items.length) continue;
    lines.push(`## ${sec.title}`, "");
    for (const item of items) {
      const only = item.only ? ` \`${item.only === "ios" ? "iOS" : "Android"} only\`` : "";
      const must = item.mustTest ? " `MUST TEST`" : "";
      lines.push(`- **#${item.num}** \`${item.priority}\`${must}${only} ${item.text}`);
      const note = data.notes[item.id]?.trim();
      if (note) lines.push(`  - Note: ${note.replace(/\n/g, " ")}`);
    }
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = (meta.date || new Date().toISOString().slice(0, 10)).replace(/[^\d-]/g, "");
  a.href = url;
  a.download = `gonit-qa-failed-${platform}-${stamp}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
