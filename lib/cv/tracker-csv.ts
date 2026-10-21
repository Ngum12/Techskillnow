import type { CvTrackerRow } from "./model";

const cell = (v: string) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** The application tracker as CSV (UTF-8 with BOM so Excel shows accents correctly). */
export function trackerCsv(rows: CvTrackerRow[], headers: string[], statusLabel: (s: string) => string): string {
  const lines = [headers, ...rows.map((r) => [r.org, r.role, r.deadline, r.documents, statusLabel(r.status), r.followUp, r.date, r.reference])];
  return "﻿" + lines.map((l) => l.map((v) => cell(String(v ?? ""))).join(",")).join("\r\n");
}
