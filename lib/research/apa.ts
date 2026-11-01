/**
 * APA 7 references for the practice sources, as text pieces with italics marked, so the same reference can
 * be shown on an article page ("How to cite") and checked in the referencing lesson.
 */
import type { Source } from "./search";

export type RefPiece = { text: string; italic?: boolean };

/** "Ngwa, P. T." · "Ngwa, P. T., & Fotso, A." · "A., B., & C." */
export function apaAuthors(authors: string[]): string {
  if (authors.length <= 1) return authors[0] ?? "";
  return `${authors.slice(0, -1).join(", ")}, & ${authors[authors.length - 1]}`;
}

/** In-text citation: (Ebot, 2023) · (Ngwa & Fotso, 2022) · (Ngwa et al., 2022). */
export function apaInText(s: Pick<Source, "authors" | "year" | "site">): string {
  const surname = (a: string) => a.split(",")[0];
  const a = s.authors;
  const who = !a.length ? s.site : a.length === 1 ? surname(a[0]) : a.length === 2 ? `${surname(a[0])} & ${surname(a[1])}` : `${surname(a[0])} et al.`;
  return `(${who}, ${s.year})`;
}

const end = (t: string) => (/[.?!]$/.test(t) ? t : `${t}.`);

export function apaReference(s: Source): RefPiece[] {
  const who = s.authors.length ? apaAuthors(s.authors) : s.site;
  const lead = `${end(who)} (${s.year}). `;
  switch (s.kind) {
    case "journal": {
      const [vol, issue] = (s.volume ?? "").split(/[()]/);
      return [
        { text: `${lead}${end(s.title)} ` },
        { text: s.venue ?? s.site, italic: true },
        ...(vol ? [{ text: ", " }, { text: vol, italic: true }, { text: `${issue ? `(${issue})` : ""}${s.pages ? `, ${s.pages}` : ""}.` }] : [{ text: "." }]),
      ];
    }
    case "thesis": {
      const university = s.site.replace(/ (Repository|Theses)$/, "");
      return [{ text: lead }, { text: s.title, italic: true }, { text: ` [Bachelor's project, ${university}]. ${s.site}.` }];
    }
    case "book":
    case "report":
      return [{ text: lead }, { text: s.title, italic: true }, { text: `. ${s.venue ?? s.site}.` }];
    default:
      return [{ text: `${lead}${end(s.title)} ` }, { text: s.site, italic: true }, { text: "." }];
  }
}

export const plainReference = (s: Source) => apaReference(s).map((p) => p.text).join("");
