/** Checks a titration results table the way an examiner does. */

export type RowKind = "initial" | "final" | "titre";
export type TableIssue = "missingRow" | "units" | "decimals" | "precision" | "reading" | "subtraction";

/** What a row heading describes, from its words. */
export function rowKind(heading: string): RowKind | null {
  const h = heading.toLowerCase();
  if (/final|end/.test(h)) return "final";
  if (/initial|start|first/.test(h)) return "initial";
  if (/titre|titer|volume (of|used|added|run)|used|added/.test(h)) return "titre";
  return null;
}

/** A heading carries a unit: "/ cm³", "(cm³)" or "in cm³" (cm3 accepted). */
export const hasUnit = (heading: string) => /cm\s*(³|3|\^3)/i.test(heading);

export type TableInput = { headings: string[]; values: string[][] };
export type TableExpected = { initial: number[]; final: number[] };

export function checkResultsTable(t: TableInput, expected: TableExpected): { issues: TableIssue[]; cells: Record<string, boolean> } {
  const issues = new Set<TableIssue>();
  const cells: Record<string, boolean> = {};
  const kinds = t.headings.map(rowKind);
  if (!(["initial", "final", "titre"] as RowKind[]).every((k) => kinds.includes(k))) issues.add("missingRow");
  if (t.headings.some((h) => !hasUnit(h))) issues.add("units");

  const row = (k: RowKind) => kinds.indexOf(k);
  const num = (s: string) => Number(s.trim().replace(",", "."));
  t.values.forEach((r, ri) =>
    r.forEach((v, ci) => {
      const text = v.trim();
      if (!/^\d+[.,]\d{2}$/.test(text)) {
        issues.add("decimals");
        cells[`${ri}:${ci}`] = false;
      } else if (!/[05]$/.test(text)) {
        issues.add("precision");
        cells[`${ri}:${ci}`] = false;
      }
    }),
  );
  for (const k of ["initial", "final"] as const) {
    const ri = row(k);
    if (ri < 0) continue;
    expected[k].forEach((want, ci) => {
      if (Math.abs(num(t.values[ri]?.[ci] ?? "") - want) > 0.001) {
        issues.add("reading");
        cells[`${ri}:${ci}`] = false;
      }
    });
  }
  const [ii, fi, ti] = [row("initial"), row("final"), row("titre")];
  if (ii >= 0 && fi >= 0 && ti >= 0) {
    t.values[ti]?.forEach((v, ci) => {
      if (Math.abs(num(v) - (num(t.values[fi][ci]) - num(t.values[ii][ci]))) > 0.001) {
        issues.add("subtraction");
        cells[`${ti}:${ci}`] = false;
      }
    });
  }
  return { issues: [...issues], cells };
}
