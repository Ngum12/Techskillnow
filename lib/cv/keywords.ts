/**
 * Deterministic keyword matching between a job advert and a CV (no AI).
 * Light English/French stemming plus synonym groups, so "organising", "organized" and
 * "organisation" match, and "customer service" matches "service client".
 */

const STOP = new Set(
  (
    // English
    "a an and are as at be been but by can for from has have in is it its of on or our that the their this to was we were will with you your " +
    "who what when where which how all any each other such than then there these those into over under about after before more most very " +
    "must should would could may might also able good strong excellent ability including include etc per via " +
    "job jobs role position post vacancy candidate candidates applicant applicants apply application applications company organisation organization " +
    "required requirement requirements require preferred plus minimum year years work working team member members new please send " +
    // French
    "le la les un une des du de d l et ou en au aux a à est sont pour par sur dans avec sans ce cet cette ces son sa ses leur leurs nous vous il elle ils elles " +
    "qui que quoi dont où plus moins tres très bien bon bonne doit devra être avoir comme ainsi tout tous toute toutes " +
    "poste emploi offre candidat candidats candidate candidature candidatures entreprise exige exigé requis souhaité minimum an ans annee annees année années travail equipe membre"
  )
    .split(/\s+/)
    .map((w) => fold(w)),
);

/** Synonym groups: any phrase in a group matches any other. */
const GROUPS: string[][] = [
  ["customer service", "client service", "customer care", "service client", "service clientele", "relation client", "customer relations"],
  ["excel", "microsoft excel", "ms excel", "spreadsheet", "spreadsheets", "tableur"],
  ["microsoft office", "ms office", "word", "powerpoint", "office suite", "pack office", "bureautique"],
  ["computer", "computer skills", "computer literate", "informatique", "outils informatiques"],
  ["communication", "communicate", "communication skills", "communiquer"],
  ["teamwork", "team work", "team player", "work in a team", "travail en equipe", "esprit d equipe"],
  ["data collection", "collect data", "data entry", "collecte de donnees", "saisie de donnees", "enter data"],
  ["survey", "surveys", "questionnaire", "enquete", "enquetes", "interviews with households"],
  ["community", "communities", "communautaire", "communaute", "community mobilisation", "mobilisation communautaire"],
  ["field", "fieldwork", "field work", "terrain", "travail de terrain"],
  ["report", "reports", "reporting", "rapport", "rapports"],
  ["sales", "selling", "sell", "vente", "ventes", "commercial"],
  ["cash", "cash handling", "cashier", "caisse", "handling money", "manipulation d argent"],
  ["mobile money", "momo", "orange money"],
  ["accounting", "bookkeeping", "comptabilite", "accounts"],
  ["organised", "organized", "organisation skills", "organizational", "organise", "organize", "organisation", "sens de l organisation"],
  ["problem solving", "solve problems", "resolve complaints", "resolution de problemes", "handle complaints", "gestion des reclamations"],
  ["bilingual", "bilingue", "english and french", "french and english", "anglais et francais", "francais et anglais"],
  ["english", "anglais"],
  ["french", "francais"],
  ["volunteer", "volunteering", "benevole", "benevolat"],
  ["driving licence", "driving license", "driver s licence", "permis de conduire"],
  ["children", "child", "youth", "young people", "enfants", "jeunes"],
  ["health", "healthcare", "sante", "medical"],
  ["teaching", "tutoring", "teach", "tutor", "training", "trainer", "train", "enseignement", "cours de repetition", "repetiteur"],
  ["social media", "facebook", "whatsapp", "reseaux sociaux"],
  ["customer", "customers", "client", "clients"],
  ["secretary", "secretarial", "secretariat", "secretaire", "administrative", "administration", "admin"],
  ["logistics", "logistique", "stock", "inventory", "inventaire", "warehouse", "entrepot"],
  ["patient", "patients", "malades"],
  ["reception", "receptionist", "front desk", "welcome visitors", "welcome clients", "accueil"],
  ["filing", "file", "files", "filed", "records", "archives", "archiving", "classement", "archivage"],
  ["delivery", "deliveries", "deliver", "delivered", "livraison", "livraisons", "livrer"],
  ["deadline", "deadlines", "time management", "gestion du temps", "punctual", "ponctuel"],
];

/** Lowercase, strip accents and punctuation. */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`]/g, " ")
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();
}

const SUFFIXES = ["ational", "ations", "ation", "ating", "ated", "ements", "ement", "ments", "ment", "ingly", "ing", "ers", "er", "ies", "ied", "ed", "es", "ly", "s", "e"];

/** A light stemmer for English and French job vocabulary. */
export function stem(word: string): string {
  let w = word.replace(/iz/g, "is");
  if (w.length <= 3 || /^\d+$/.test(w)) return w;
  for (const suffix of SUFFIXES) {
    const minRest = suffix === "s" ? 3 : 4;
    if (w.endsWith(suffix) && w.length - suffix.length >= minRest) {
      w = w.slice(0, -suffix.length);
      break;
    }
  }
  return w;
}

export function stems(text: string): string[] {
  return fold(text).split(" ").filter(Boolean).map(stem);
}

const GROUP_SEQS: string[][][] = GROUPS.map((g) => g.map((phrase) => stems(phrase)));

function containsSeq(haystack: string[], needle: string[]): boolean {
  if (!needle.length || needle.length > haystack.length) return false;
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
}

/** All the stem sequences that count as this term (its synonym group, or just itself). */
function variantsOf(term: string): string[][] {
  const seq = stems(term);
  const group = GROUP_SEQS.find((g) => g.some((v) => v.join(" ") === seq.join(" ")));
  return group ?? [seq];
}

export function matches(term: string, textStems: string[]): boolean {
  return variantsOf(term).some((v) => containsSeq(textStems, v));
}

/** Picks the key terms of an advert someone pasted: synonym phrases first, then frequent meaningful words. */
export function extractTerms(text: string, max = 15): string[] {
  const textStems = stems(text);
  const terms: string[] = [];
  const covered = new Set<string>();
  GROUPS.forEach((group, i) => {
    const hit = GROUP_SEQS[i].findIndex((v) => containsSeq(textStems, v));
    if (hit >= 0) {
      terms.push(group[hit]);
      GROUP_SEQS[i][hit].forEach((s) => covered.add(s));
    }
  });
  const words = fold(text).split(" ").filter(Boolean);
  const counts = new Map<string, { surface: string; n: number; first: number }>();
  words.forEach((w, i) => {
    if (w.length < 4 || STOP.has(w) || /^\d+$/.test(w)) return;
    const s = stem(w);
    if (covered.has(s) || STOP.has(s)) return;
    const entry = counts.get(s) ?? { surface: w, n: 0, first: i };
    entry.n++;
    counts.set(s, entry);
  });
  const words2 = [...counts.values()].sort((a, b) => b.n - a.n || a.first - b.first).map((e) => e.surface);
  return [...terms, ...words2].slice(0, max);
}

export type MatchResult = { score: number; matched: { term: string; where: "top" | "rest" }[]; missing: string[] };

/**
 * Scores a CV against key terms. A term found in the top of the CV (profile, first five skills)
 * counts fully; elsewhere it counts 0.6, because recruiters read the top first.
 */
export function scoreCv(terms: string[], cv: { top: string; rest: string }): MatchResult {
  const top = stems(cv.top);
  const rest = stems(cv.rest);
  const matched: MatchResult["matched"] = [];
  const missing: string[] = [];
  let total = 0;
  for (const term of terms) {
    if (matches(term, top)) {
      matched.push({ term, where: "top" });
      total += 1;
    } else if (matches(term, rest)) {
      matched.push({ term, where: "rest" });
      total += 0.6;
    } else {
      missing.push(term);
    }
  }
  return { score: terms.length ? Math.round((total / terms.length) * 100) : 0, matched, missing };
}
