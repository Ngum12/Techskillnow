/**
 * The practice search engine for the research-project course: reads a query the way a supervisor would
 * (is there a population, a place, a period, an angle?), estimates how many results the real web would
 * give, and ranks the practice sources. Pure functions: tested in tests/research-search.test.ts.
 */

export type SourceKind = "journal" | "thesis" | "report" | "book" | "news" | "blog" | "encyclopedia" | "forum";

export type Source = {
  id: string;
  kind: SourceKind;
  /** Website name shown above the result, e.g. "Sawa University Repository". */
  site: string;
  url: string;
  title: string;
  snippet: string;
  year: number;
  /** "Surname, A. B." for each author; empty for unsigned pages. */
  authors: string[];
  field: string;
  keywords: string[];
  abstract: string;
  pdf?: boolean;
  /** Journal or publisher (for the reference lesson and the article page). */
  venue?: string;
  volume?: string;
  pages?: string;
  /** Thesis pages: degree and supervisor. */
  degree?: string;
  /** Scholar view: how often it is cited. */
  citedBy?: number;
};

/** Academic sources: the ones a project can build on. */
export const ACADEMIC: SourceKind[] = ["journal", "thesis", "report", "book"];
export const isAcademic = (s: Pick<Source, "kind">) => ACADEMIC.includes(s.kind);

/* ---------- Reading a query ---------- */

const PLACES = [
  "cameroon", "douala", "yaounde", "yaoundé", "buea", "bamenda", "limbe", "bafoussam", "garoua", "maroua", "ngaoundere", "ngaoundéré", "bertoua",
  "ebolowa", "kumba", "kribi", "dschang", "mbouda", "nkongsamba", "edea", "edéa", "kumbo", "wum", "mamfe", "tiko", "muyuka", "bonaberi", "akwa", "bastos",
  "littoral", "centre region", "south west", "southwest", "north west", "northwest", "far north", "adamawa", "east region", "west region", "fako", "mezam",
  "meme", "mfoundi", "wouri", "menoua", "council", "municipality", "subdivision", "sub-division", "district", "town", "city", "village", "rural", "urban",
];

const POPULATIONS = [
  "student", "students", "pupil", "pupils", "farmer", "farmers", "women", "woman", "trader", "traders", "nurse", "nurses", "patient", "patients", "sme", "smes",
  "small business", "small businesses", "enterprise", "enterprises", "youth", "youths", "teacher", "teachers", "customer", "customers", "employee", "employees",
  "staff", "worker", "workers", "mother", "mothers", "child", "children", "household", "households", "entrepreneur", "entrepreneurs", "motorcyclist",
  "motorcyclists", "bike rider", "bike riders", "civil servant", "civil servants", "bank", "banks", "microfinance", "hospital", "hospitals", "school", "schools",
  "secondary school", "university", "universities", "company", "companies", "firm", "firms", "cooperative", "cooperatives", "graduate", "graduates",
  "adolescent", "adolescents", "elderly", "parent", "parents", "council", "councils", "user", "users", "learner", "learners", "lecturer", "lecturers",
  "young people", "adult", "adults", "resident", "residents", "owner", "owners", "victim", "victims", "authorities", "client", "clients", "consumer",
  "consumers", "driver", "drivers", "vendor", "vendors", "midwife", "midwives", "doctor", "doctors", "retailer", "retailers",
];

const ANGLES = [
  "effect of", "effects of", "impact of", "influence of", "role of", "relationship between", "factors affecting", "factors influencing", "determinants of",
  "assessment of", "contribution of", "challenges of", "challenges faced", "causes of", "perception of", "perceptions of", "knowledge of", "attitude",
  "practice of", "practices of", "adoption of", "use of", "prevalence of", "evaluation of", "case study", "comparative", "correlation", "association between",
];

const STOP = new Set(
  "a an the of in on at to for and or with by from about into is are was were be how what why which who does do on its their this that as vs".split(" "),
);

/** Very light stemming: "farmers" and "farmer" match, "banking" and "bank" match. */
export function stem(w: string): string {
  let s = w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const suf of ["ies", "ing", "ion", "es", "s"]) {
    if (s.length > suf.length + 3 && s.endsWith(suf)) {
      s = suf === "ies" ? s.slice(0, -3) + "y" : s.slice(0, -suf.length);
      break;
    }
  }
  return s;
}

export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/(site|filetype):\S+/g, " ")
    .split(/[^a-zà-ÿ0-9-]+/i)
    .filter((w) => w && !STOP.has(w) && w !== "-")
    .map(stem);
}

const hasPhrase = (q: string, list: string[]) => list.find((p) => new RegExp(`(^|[^a-zà-ÿ])${p.replace(/[-]/g, "\\-")}([^a-zà-ÿ]|$)`, "i").test(q));

export type Facet = "place" | "population" | "time" | "angle";

export type QueryReading = {
  query: string;
  /** Meaningful words (stop words and operators left out). */
  words: number;
  facets: Record<Facet, string | null>;
  operators: { quotes: boolean; pdf: boolean; site: string | null; minus: boolean };
  /** How focused the search is: a topic needs at least three of the four facets. */
  level: "empty" | "broad" | "focused" | "researchable";
  /** Which facets are missing, in the order a supervisor would ask for them. */
  missing: Facet[];
};

export function readQuery(raw: string): QueryReading {
  const q = raw.trim().toLowerCase();
  const year = q.match(/\b(19|20)\d{2}\b/);
  const period = q.match(/\b(since|between|from|period|during|covid|last \d+ years)\b/);
  const facets: Record<Facet, string | null> = {
    place: hasPhrase(q, PLACES) ?? null,
    population: hasPhrase(q, POPULATIONS) ?? null,
    time: year?.[0] ?? period?.[0] ?? null,
    angle: hasPhrase(q, ANGLES) ?? null,
  };
  const words = tokens(q).length;
  const count = Object.values(facets).filter(Boolean).length;
  const level = !q ? "empty" : count >= 3 ? "researchable" : count >= 1 && words >= 3 ? "focused" : "broad";
  const missing = (["population", "place", "angle", "time"] as Facet[]).filter((f) => !facets[f]);
  return {
    query: raw.trim(),
    words,
    facets,
    operators: { quotes: /"[^"]+"/.test(q), pdf: /filetype:pdf/.test(q), site: q.match(/site:(\S+)/)?.[1] ?? null, minus: /(^|\s)-\w/.test(q) },
    level,
    missing,
  };
}

/** A stable number from a string, so the same search always shows the same counts. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Roughly how many results the real Google would report: huge for one or two words, much smaller as the
 * search names a population, a place and a period. It teaches the effect of narrowing, not exact numbers.
 */
export function estimateResults(r: QueryReading, scholar = false): number {
  if (!r.query) return 0;
  let n = scholar ? 2_400_000 : 1_900_000_000;
  // Each extra word halves the count; each part of a topic (who, where, angle, when) cuts it further.
  n /= Math.pow(scholar ? 1.6 : 2, Math.max(0, r.words - 1));
  for (const f of Object.values(r.facets)) if (f) n /= scholar ? 1.8 : 2.5;
  if (r.operators.quotes) n /= 40;
  if (r.operators.pdf) n /= 12;
  if (r.operators.site) n /= 60;
  const jitter = 0.7 + (hash(r.query) % 600) / 1000;
  return Math.max(scholar ? 3 : 9, Math.round(n * jitter));
}

/* ---------- Ranking ---------- */

export type Hit = { source: Source; score: number };

export function search(sources: Source[], raw: string, opts: { scholar?: boolean } = {}): Hit[] {
  const r = readQuery(raw);
  const q = tokens(raw);
  if (!q.length) return [];
  const phrases = [...raw.toLowerCase().matchAll(/"([^"]+)"/g)].map((m) => m[1].trim()).filter(Boolean);
  const hits: Hit[] = [];
  for (const s of sources) {
    if (opts.scholar && !isAcademic(s)) continue;
    if (r.operators.pdf && !s.pdf) continue;
    if (r.operators.site && !`${s.url} ${s.site}`.toLowerCase().includes(r.operators.site.replace(/^www\./, ""))) continue;
    const hay = `${s.title} ${s.snippet} ${s.abstract}`.toLowerCase();
    if (phrases.some((p) => !hay.includes(p))) continue;
    const kw = new Set(s.keywords.flatMap((k) => tokens(k)));
    const title = new Set(tokens(s.title));
    const body = new Set(tokens(`${s.snippet} ${s.abstract}`));
    let score = 0;
    let matched = 0;
    for (const w of q) {
      const m = (kw.has(w) ? 3 : 0) + (title.has(w) ? 2 : 0) + (body.has(w) ? 1 : 0);
      if (m) matched++;
      score += m;
    }
    // Most of the search words must appear somewhere, as on the real engine.
    if (matched < Math.max(1, Math.ceil(q.length * 0.5))) continue;
    if (opts.scholar) score += Math.log10((s.citedBy ?? 0) + 1);
    hits.push({ source: s, score: score + matched * 2 });
  }
  return hits.sort((a, b) => b.score - a.score || b.source.year - a.source.year);
}

/** Pages that exist for any search on the real web (an encyclopedia entry, a blog, a forum thread). */
export function genericResults(raw: string): Source[] {
  const topic = raw.replace(/"|(site|filetype):\S+/g, "").replace(/\s+/g, " ").trim();
  if (!topic) return [];
  const t = topic.charAt(0).toUpperCase() + topic.slice(1);
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const base = { authors: [], field: "general", keywords: tokens(topic) };
  return [
    {
      ...base,
      id: `gen-enc-${slug}`,
      kind: "encyclopedia",
      site: "Open Encyclopedia",
      url: `open-encyclopedia.org › wiki › ${slug}`,
      title: `${t} – Open Encyclopedia`,
      snippet: `${t} is a broad subject studied in many fields. This article gives an overview, its history, the main debates and links to further reading.`,
      abstract: `An overview of ${topic}: definitions, history and the main debates. Encyclopedia pages are written by volunteers and change often. Use them to understand a subject, then go to the academic sources they cite.`,
      year: 2025,
    },
    {
      ...base,
      id: `gen-blog-${slug}`,
      kind: "blog",
      site: "StudyTips237",
      url: `studytips237.com › ${slug}`,
      title: `Everything you need to know about ${topic} (2025 guide)`,
      snippet: `Looking for ${topic}? In this easy guide we explain everything in simple words, plus 10 topics you can copy for your project!`,
      abstract: `A blog post with no author, no date of research and no references. It lists ready-made project topics to copy. Blogs like this can give ideas, but they are not sources you cite, and copied topics are rarely original.`,
      year: 2024,
    },
    {
      ...base,
      id: `gen-forum-${slug}`,
      kind: "forum",
      site: "AskStudents Forum",
      url: `askstudents.net › thread › ${slug}`,
      title: `Please help: project topic on ${topic}?`,
      snippet: `"I am in final year and my supervisor rejected my topic on ${topic}, he said it is too broad. What can I do?" – 14 replies`,
      abstract: `A forum thread: a student whose topic was rejected as too broad. Replies suggest adding a place, a group of people and a time period. Useful advice, but forum posts are opinions, not evidence.`,
      year: 2023,
    },
  ];
}

/** Searches the narrowing coach suggests next: the same idea with one missing facet filled in. */
export function narrowerSearches(raw: string, field?: string): string[] {
  const r = readQuery(raw);
  const base = raw.replace(/\s+/g, " ").trim();
  if (!base) return [];
  const out: string[] = [];
  const add = (s: string) => !out.includes(s) && out.push(s);
  if (!r.facets.angle) add(`factors affecting ${base}`);
  if (!r.facets.population) add(`${base} among ${field === "health" ? "women" : field === "agriculture" ? "farmers" : field === "business" ? "small businesses" : "students"}`);
  if (!r.facets.place) add(`${base} in Douala`);
  if (!r.facets.place) add(`${base} in Buea`);
  if (!r.facets.time) add(`${base} 2019-2024`);
  if (!r.operators.pdf && r.level === "researchable") add(`${base} filetype:pdf`);
  return out.slice(0, 6);
}

/** Search suggestions while typing: matching phrases from the practice sources, then common completions. */
export function suggestions(sources: Source[], raw: string, max = 6): string[] {
  const q = raw.toLowerCase().trimStart();
  if (q.length < 2) return [];
  const out: string[] = [];
  const add = (s: string) => {
    const v = s.toLowerCase();
    if (v.startsWith(q) && v !== q && !out.includes(v)) out.push(v);
  };
  for (const s of sources) for (const k of s.keywords) add(k);
  for (const tail of [" in cameroon", " pdf", " project topics", " thesis", " in douala", " literature review"]) add(q.trimEnd() + tail);
  return out.slice(0, max);
}

/** "About 1,240,000 results" style number. */
export const groupDigits = (n: number) => n.toLocaleString("en-US");
