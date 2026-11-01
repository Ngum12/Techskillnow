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

/**
 * The role of each sentence. Abstracts open with the aim. After that: recommendations; sentences that
 * describe how data were collected (unless they also report a result) are the method; results are findings.
 */
export function abstractRoles(text: string): { text: string; role: Role }[] {
  return sentences(text).map((s, i) => {
    let role: Role = "finding";
    if (i === 0) role = "aim";
    else if (NOTE.test(s)) role = "other";
    else if (RECOMMEND.test(s)) role = "recommendation";
    else if (METHOD.test(s) && !/\b(show|showed|shows|found|finds)\b|%/.test(s) && !FINDING.test(s.replace(METHOD, ""))) role = "method";
    return { text: s, role };
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
