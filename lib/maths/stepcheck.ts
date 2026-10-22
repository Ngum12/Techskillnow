/**
 * StepChecker: the learner writes their working one line at a time. Each line must be a valid step
 * from the question (equivalent expression, equation with the same solutions, inequality with the same
 * solution set). Any correct method is accepted; the last line must also be the final answer.
 */
import { isRelation, tryParse } from "./expr";
import { equationStepValid, exprEquivalent, isEquationList, sameSolutionSet } from "./equiv";
import { checkAnswer } from "./answer";
import { detectMisconception } from "./misconceptions";
import type { Question } from "./types";

export type LineStatus = "unreadable" | "wrong" | "valid" | "final";
export type LineResult = { status: LineStatus; misconception?: string | null; reason?: string };

export function checkLine(q: Question, input: string): LineResult {
  if (!q.work) return { status: "unreadable" };
  const line = tryParse(input.replace(/^\s*=/, ""));
  const start = tryParse(q.work.start);
  if (!line || !start) return { status: "unreadable" };

  let valid = false;
  switch (q.work.mode) {
    case "expr":
      valid = !isRelation(line) && exprEquivalent(start.or[0].parts[0], line.or[0].parts[0]);
      break;
    case "equation":
      valid = isEquationList(line) && (equationStepValid(start, line) || sameSolutionSet(start, line));
      break;
    case "relation":
      valid = isRelation(line) && sameSolutionSet(start, line);
      break;
  }
  if (!valid) return { status: "wrong", misconception: detectMisconception(q, input) };
  const final = checkAnswer(q.answers[0].spec, input);
  return final.ok ? { status: "final" } : { status: "valid", reason: final.reason };
}
