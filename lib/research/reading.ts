/**
 * Smart reading: label each sentence of an abstract as the aim, the method, a finding or a recommendation,
 * so learners see the four things to read instead of everything. Also classifies prompts typed into the
 * practice AI assistant as honest help, risky or misconduct. Pure functions: tested in tests/research.test.ts.
 */

export type Role = "aim" | "method" | "finding" | "recommendation" | "other";

export function sentences(text: string): string[] {
  return (text.match(/[^.!?]+(?:[.!?]+|$)/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

/** "The study recommends…", "calls for…" (not "the recommended dose"). */
const RECOMMEND = /\b(recommends|recommended that|recommendations?|calls? for|should)\b/i;
/** Notes for learners inside the practice abstracts ("Reports like this can be cited…"): not part of the study. */
const NOTE = /\b(can be cited|cite them|useful evidence|good sources|peer reviewed|use them to)\b/i;
/** How the study was done: instruments, samples, analysis. */
const METHOD = /\b(questionnaires?|survey(ed)?|interviews?|focus groups?|sampl(e|ing)|regression|data from|cross-sectional|registers|satellite|tracer study|court cases|analys(ed|is)|collected|reviews|textbook)\b/i;
/** What was found: results, numbers, comparisons. */
const FINDING = /\b(show(s|ed)?|found|finds|reveal(s|ed)?|most|only|majority|lower|higher|more|less|fell|increased|reduced|linked|main|strongest|barriers?|adequate|helped|lost|noticed|three times)\b|\d+%/i;

/** Sentences that state the aim: "This study examined…", "We investigate…", "The aim of this paper is…". */
const AIM = /\b(this( [a-z-]+)? (study|paper|article|research|project|review|report|dissertation|thesis|survey|work)|we (examine|examined|investigate|investigated|assess|assessed|explore|explored|analy[sz]ed?|study|studied|review|propose|present|report)|the (aim|purpose|objective)s? (of|was|is)|aim(s|ed)? (to|at)|sought to|set out to|the (study|paper|article) (studies|examines|explores|investigates|assesses))\b/i;
/** Headings in structured abstracts ("Methods:", "Results:") and the role of the sentences that follow. */
const HEADINGS: [RegExp, Role][] = [
  [/^(background|introduction|context|rationale)\s*[:.]/i, "other"],
  [/^(objectives?|aims?|purpose|goals?)\s*[:.]/i, "aim"],
  [/^(methods?|materials and methods|methodology|design|setting|participants|approach)\s*[:.]/i, "method"],
  [/^(results?|findings?|outcomes?)\s*[:.]/i, "finding"],
  [/^(conclusions?|recommendations?|implications?)\s*[:.]/i, "recommendation"],
];

function sentenceRole(s: string): Role {
  if (NOTE.test(s)) return "other";
  if (RECOMMEND.test(s)) return "recommendation";
  if (METHOD.test(s) && !/\b(show|showed|shows|found|finds|indicated|indicates|revealed|reveals|suggested|suggests)\b|%/.test(s) && !FINDING.test(s.replace(METHOD, ""))) return "method";
  return "finding";
}

/**
 * The role of each sentence. Structured abstracts follow their headings. Otherwise the aim is the first sentence
 * that states one (sentences before it are background); if none does, the first sentence is the aim. After the
 * aim: recommendations, methods (how data were collected, unless a result is reported), and findings.
 */
export function abstractRoles(text: string): { text: string; role: Role }[] {
  const all = sentences(text);
  let heading: Role | null = null;
  const firstAim = all.findIndex((s) => AIM.test(s));
  const aimAt = firstAim >= 0 ? firstAim : 0;
  return all.map((s, i) => {
    const h = HEADINGS.find(([re]) => re.test(s));
    if (h) heading = h[1];
    if (heading) {
      // Inside a "Results:" section a recommendation sentence is still a recommendation.
      const role: Role = heading === "finding" && RECOMMEND.test(s) ? "recommendation" : heading;
      return { text: s, role };
    }
    if (i < aimAt) return { text: s, role: "other" };
    if (i === aimAt) return { text: s, role: "aim" };
    return { text: s, role: sentenceRole(s) };
  });
}

/* ---------- Prompts to the practice AI assistant ---------- */

export type PromptKind = "honest" | "misconduct" | "risky";

/** Asking the AI to do the work, hide plagiarism, or invent data or sources. */
const MISCONDUCT =
  /\b(write|draft|generate|produce|do)\b.*\b(chapter|essay|project|dissertation|thesis|literature review|introduction|abstract|conclusion|discussion)\b|\b(give|send|sell|provide)\b.*\b(complete|full|whole|finished|ready-made)\b.*\b(project|chapters?|dissertation|thesis|essay|work)\b|\b(rewrite|paraphrase|reword|rephrase)\b.*\b(plagiarism|turnitin|detect(ed|ion)?|undetectable)\b|\b(invent|make up|fake|fabricate)\b.*\b(data|results|responses|references|sources|answers)\b|\bfill (in )?(the |my )?questionnaires?\b/i;
/** Asking the AI for sources: allowed, but every one must be checked (AI tools invent references). */
const RISKY = /\b(references|sources|citations|cite|bibliography|articles on|studies on|papers on)\b/i;

export function classifyPrompt(text: string): PromptKind {
  if (MISCONDUCT.test(text)) return "misconduct";
  if (RISKY.test(text)) return "risky";
  return "honest";
}
