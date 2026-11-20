"use client";

import { useState } from "react";
import { ChevronDown, FileCode, FileDown, FileText } from "lucide-react";
import type { Platform, PlatformState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ReportMenu({ platform, data }: { platform: Platform; data: PlatformState }) {
  const [generating, setGenerating] = useState(false);

  const generate = async (format: "pdf" | "md") => {
    setGenerating(true);
    try {
      if (format === "pdf") {
        const { generateFailedReport } = await import("@/lib/failedReport");
        generateFailedReport(platform, data, data.meta);
      } else {
        const { generateFailedMarkdown } = await import("@/lib/failedReportMarkdown");
        generateFailedMarkdown(platform, data, data.meta);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={generating}>
          <FileDown />
          {generating ? (
            "Generating…"
          ) : (
            <>
              <span className="hidden sm:inline">Failed report</span>
              <span className="sm:hidden">Report</span>
            </>
          )}
          <ChevronDown className="opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Download as</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => generate("pdf")}>
          <FileText />
          PDF
          <DropdownMenuShortcut>.pdf</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => generate("md")}>
          <FileCode />
          Markdown
          <DropdownMenuShortcut>.md</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
