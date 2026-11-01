/**
 * Live research search: real papers from OpenAlex (an open index of research papers), turned into the same
 * Source shape as the practice results, so the coach, the reading guide and "My sources" work on real papers.
 * Pure functions: the server route calls OpenAlex; tested in tests/research-live.test.ts.
 */
import type { Source, SourceKind } from "./search";

export type LiveScope = "all" | "africa" | "cm";

export const OPENALEX = "https://api.openalex.org/works";
const FIELDS = "id,display_name,publication_year,authorships,primary_location,cited_by_count,abstract_inverted_index,type,biblio,open_access,doi";

/**
 * The words sent to OpenAlex: Google operators removed (they mean nothing there), and commas and colons
 * removed because they separate filters in OpenAlex URLs. Quoted phrases are kept.
 */
export function liveQuery(raw: string): { text: string; openAccess: boolean } {
  const openAccess = /filetype:pdf/i.test(raw);
  const text = raw
    .replace(/(site|filetype):\S+/gi, " ")
    .replace(/[,:;|()[\]{}<>\\]/g, " ")
    .replace(/[•·]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  return { text, openAccess };
}

export function openAlexUrl(raw: string, opts: { scope?: LiveScope; key?: string; perPage?: number } = {}): string | null {
  const { text, openAccess } = liveQuery(raw);
  if (text.replace(/"/g, "").trim().length < 2) return null;
  const filters = [`title_and_abstract.search:${text}`];
  if (opts.scope === "cm") filters.push("authorships.countries:CM");
  if (opts.scope === "africa") filters.push("institutions.continent:africa");
  // filetype:pdf on Google ≈ papers with a free full text here.
  if (openAccess) filters.push("open_access.is_oa:true");
  const params = new URLSearchParams({ filter: filters.join(","), per_page: String(opts.perPage ?? 10), select: FIELDS });
  if (opts.key) params.set("api_key", opts.key);
  return `${OPENALEX}?${params.toString()}`;
}

/** OpenAlex stores abstracts as word → positions; rebuild the text. */
export function invertedToText(index: Record<string, number[]> | null | undefined): string {
  if (!index) return "";
  const words: string[] = [];
  for (const [w, positions] of Object.entries(index)) for (const p of positions) words[p] = w;
  return words
    .filter((w) => w !== undefined)
    .join(" ")
    .replace(/\s+([.,;:!?)])/g, "$1")
    .replace(/^abstract\s*[:.\-–]?\s*/i, "")
    .trim();
}

/** "Peter T. Ngwa" → "Ngwa, P. T." (APA style); a single name stays as it is. */
export function apaName(displayName: string): string {
  // "N. M. (Ndiseh) Fekun": a full first name in brackets is dropped.
  const parts = displayName.replace(/\([^)]*\)/g, " ").replace(/[,;]/g, " ").replace(/\s+/g, " ").trim().split(" ");
  if (parts.length < 2) return displayName.trim();
  const surname = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((p) => p.replace(/\./g, ""))
    .filter(Boolean)
    .map((p) => p.split("-").map((x) => `${x.charAt(0).toUpperCase()}.`).join("-"))
    .join(" ");
  return `${surname}, ${initials}`;
}

const KIND: Record<string, SourceKind> = {
  article: "journal",
  review: "journal",
  letter: "journal",
  dissertation: "thesis",
  book: "book",
  "book-chapter": "book",
  report: "report",
  preprint: "journal",
};

/** "https://doi.org/10.1002/isd2.12117" → "doi.org › 10.1002 › isd2.12117", like a Google result line. */
function breadcrumb(url: string): string {
  try {
    const u = new URL(url);
    return [u.hostname.replace(/^www\./, ""), ...u.pathname.split("/").filter(Boolean).slice(0, 3)].join(" › ");
  } catch {
    return url;
  }
}

type Work = {
  id?: string;
  display_name?: string | null;
  publication_year?: number | null;
  type?: string | null;
  doi?: string | null;
  cited_by_count?: number | null;
  authorships?: { author?: { display_name?: string | null } | null }[] | null;
  primary_location?: { landing_page_url?: string | null; source?: { display_name?: string | null } | null } | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  biblio?: { volume?: string | null; issue?: string | null; first_page?: string | null; last_page?: string | null } | null;
  open_access?: { is_oa?: boolean | null; oa_url?: string | null } | null;
};

export type LiveSource = Source & { link: string; oaUrl?: string; live: true };

export function toSource(w: Work): LiveSource | null {
  const title = (w.display_name ?? "").replace(/<[^>]+>/g, "").trim();
  const id = (w.id ?? "").split("/").pop();
  if (!title || !id) return null;
  const link = w.doi ?? w.primary_location?.landing_page_url ?? `https://openalex.org/${id}`;
  const abstract = invertedToText(w.abstract_inverted_index).slice(0, 1800);
  const venue = w.primary_location?.source?.display_name ?? undefined;
  const b = w.biblio ?? {};
  const authors = (w.authorships ?? []).map((a) => a.author?.display_name).filter((n): n is string => !!n).slice(0, 6).map(apaName);
  const kind = KIND[w.type ?? ""] ?? "journal";
  return {
    id: `live-${id}`,
    kind,
    site: venue ?? breadcrumb(link).split(" › ")[0],
    url: breadcrumb(link),
    title,
    snippet: abstract ? `${abstract.slice(0, 230).replace(/\s\S*$/, "")}…` : "",
    abstract,
    year: w.publication_year ?? 0,
    authors,
    field: "live",
    keywords: [],
    pdf: !!w.open_access?.is_oa,
    venue,
    volume: b.volume ? `${b.volume}${b.issue ? `(${b.issue})` : ""}` : undefined,
    pages: b.first_page ? `${b.first_page}${b.last_page ? `–${b.last_page}` : ""}` : undefined,
    degree: kind === "thesis" ? "Thesis" : undefined,
    citedBy: w.cited_by_count ?? 0,
    link,
    oaUrl: w.open_access?.oa_url ?? undefined,
    live: true,
  };
}

export function toSources(body: { results?: Work[] } | null | undefined): LiveSource[] {
  return (body?.results ?? []).map(toSource).filter((s): s is LiveSource => !!s);
}
