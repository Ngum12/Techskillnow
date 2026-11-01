/**
 * Checks for the learner's own topic card, the way a supervisor reads a topic proposal: a focused title,
 * a real problem, questions and objectives that match one to one, and a few search keywords.
 */
import { readQuery } from "./search";

export type TopicCard = { title: string; problem: string; questions: string[]; objectives: string[]; keywords: string };

export type TopicIssue = "titleBroad" | "titleLength" | "problemShort" | "questionsCount" | "questionForm" | "objectivesCount" | "objectiveVerb" | "keywords";

export type Stage = "idea" | "population" | "place" | "angle" | "period";

/** The funnel's choices as a title: "Factors affecting loan repayment among microfinance clients in Fako (2019–2024)". */
export function composeTopic(p: Partial<Record<Stage, string>>): string {
  const idea = p.idea?.trim() ?? "";
  if (!idea) return "";
  const angle = p.angle?.trim();
  let t = angle ? `${angle.charAt(0).toUpperCase()}${angle.slice(1)} ${idea}` : idea.charAt(0).toUpperCase() + idea.slice(1);
  if (p.population?.trim()) t += ` among ${p.population.trim()}`;
  if (p.place?.trim()) t += ` in ${p.place.trim()}`;
  if (p.period?.trim()) t += ` (${p.period.trim()})`;
  return t;
}

const QUESTION_START = /^(what|how|to what extent|which|why|is|are|does|do|in what ways|who|when|where)\b/i;
const OBJECTIVE_START = /^to (assess|examine|determine|identify|evaluate|investigate|analy[sz]e|establish|describe|compare|explore|measure|find out|design|develop|propose|test)\b/i;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function checkTopicCard(c: TopicCard): TopicIssue[] {
  const issues: TopicIssue[] = [];
  const facets = Object.values(readQuery(c.title).facets).filter(Boolean).length;
  if (facets < 3) issues.push("titleBroad");
  if (words(c.title) < 6 || words(c.title) > 30) issues.push("titleLength");
  if (words(c.problem) < 25) issues.push("problemShort");
  const qs = c.questions.map((q) => q.trim()).filter(Boolean);
  const os = c.objectives.map((o) => o.trim()).filter(Boolean);
  if (qs.length < 2 || qs.length > 4) issues.push("questionsCount");
  if (qs.some((q) => !q.endsWith("?") || !QUESTION_START.test(q))) issues.push("questionForm");
  if (os.length !== qs.length) issues.push("objectivesCount");
  if (os.some((o) => !OBJECTIVE_START.test(o))) issues.push("objectiveVerb");
  const kw = c.keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean);
  if (kw.length < 3 || kw.length > 6) issues.push("keywords");
  return issues;
}

/** The card as plain text, to copy or send to a supervisor. */
export function topicCardText(c: TopicCard, labels: { title: string; problem: string; questions: string; objectives: string; keywords: string }): string {
  const list = (xs: string[], p: string) => xs.filter((x) => x.trim()).map((x, i) => `${p}${i + 1}. ${x.trim()}`).join("\n");
  return [
    `${labels.title}: ${c.title.trim()}`,
    "",
    `${labels.problem}:`,
    c.problem.trim(),
    "",
    `${labels.questions}:`,
    list(c.questions, "RQ"),
    "",
    `${labels.objectives}:`,
    list(c.objectives, "O"),
    "",
    `${labels.keywords}: ${c.keywords.trim()}`,
  ].join("\n");
}
