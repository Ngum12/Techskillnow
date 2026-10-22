/**
 * Recognises common errors so feedback can name them. Two kinds of rule:
 * - rewrite rules: apply the wrong "rule" to the expression (e.g. (a + b)² → a² + b²) and see if the learner's line matches;
 * - known wrong answers produced by the question's generator (e.g. f(a) instead of f(−a)).
 * The hint text for each rule id lives in the topic's misconceptions.json.
 */
import { tryParse, type Chain, type Expr, type RelOp, type Statement } from "./expr";
import { exprEquivalent, sameSolutionSet, constantMultiple, sideDiff, isSingleEquation } from "./equiv";
import { checkAnswer } from "./answer";
import type { Question } from "./types";

type Rewrite = (e: Expr) => Expr | null;
const add = (a: Expr, b: Expr): Expr => ({ t: "bin", op: "+", a, b });
const sub = (a: Expr, b: Expr): Expr => ({ t: "bin", op: "-", a, b });
const sq = (a: Expr): Expr => ({ t: "bin", op: "^", a, b: { t: "num", v: 2 } });

/** The terms of a sum with their signs: b + c − d → [+b, +c, −d]. */
function signedTerms(e: Expr, sign = 1, out: { e: Expr; sign: number }[] = []) {
  if (e.t === "bin" && (e.op === "+" || e.op === "-")) {
    signedTerms(e.a, sign, out);
    signedTerms(e.b, e.op === "-" ? -sign : sign, out);
  } else out.push({ e, sign });
  return out;
}

/** Applies a local rewrite everywhere it matches (all at once). */
function everywhere(e: Expr, r: Rewrite): Expr {
  const inner: Expr =
    e.t === "bin" ? { ...e, a: everywhere(e.a, r), b: everywhere(e.b, r) } : e.t === "neg" || e.t === "abs" || e.t === "fn" ? { ...e, a: everywhere(e.a, r) } : e;
  return r(inner) ?? inner;
}

const same = (a: Expr, b: Expr) => JSON.stringify(a) === JSON.stringify(b);

/** The wrong rules, by id. */
export const REWRITES: Record<string, Rewrite> = {
  // (a + b)² = a² + b²
  squareOfSum: (e) => {
    if (e.t === "bin" && e.op === "^" && e.b.t === "num" && e.b.v === 2 && e.a.t === "bin" && (e.a.op === "+" || e.a.op === "-")) {
      return e.a.op === "+" ? add(sq(e.a.a), sq(e.a.b)) : sub(sq(e.a.a), sq(e.a.b));
    }
    return null;
  },
  // a − (b + c − d) = a − b + c − d (the minus only reaches the first term in the bracket)
  negDistribution: (e) => {
    if (e.t === "bin" && e.op === "-" && e.b.t === "bin" && (e.b.op === "+" || e.b.op === "-")) {
      const [first, ...rest] = signedTerms(e.b);
      return rest.reduce<Expr>((acc, t) => (t.sign > 0 ? add(acc, t.e) : sub(acc, t.e)), first.sign > 0 ? sub(e.a, first.e) : add(e.a, first.e));
    }
    return null;
  },
  // (x + 3)/x = 3: cancelling a term instead of a factor
  cancelTerms: (e) => {
    if (e.t === "bin" && e.op === "/" && e.a.t === "bin" && (e.a.op === "+" || e.a.op === "-")) {
      if (same(e.a.a, e.b)) return e.a.op === "+" ? e.a.b : { t: "neg", a: e.a.b };
      if (same(e.a.b, e.b)) return e.a.a;
    }
    return null;
  },
  // |a + b| = |a| + |b|
  modulusSum: (e) => {
    if (e.t === "abs" && e.a.t === "bin" && (e.a.op === "+" || e.a.op === "-")) {
      return { t: "bin", op: e.a.op, a: { t: "abs", a: e.a.a }, b: { t: "abs", a: e.a.b } };
    }
    return null;
  },
};

const FLIP: Record<RelOp, RelOp> = { "=": "=", "<": ">", ">": "<", "<=": ">=", ">=": "<=" };
const flipped = (s: Statement): Statement => ({ or: s.or.map((c): Chain => ({ parts: c.parts, ops: c.ops.map((o) => FLIP[o]) })) });

/**
 * Which misconception (if any) explains this wrong line or answer.
 * `answerIndex` is set when checking a final answer box rather than a line of working.
 */
export function detectMisconception(q: Question, input: string, answerIndex?: number): string | null {
  // 1. Known wrong answers from the generator.
  for (const bug of q.bugs ?? []) {
    if (answerIndex !== undefined && (bug.answer ?? 0) !== answerIndex) continue;
    const spec = q.answers[bug.answer ?? 0]?.spec;
    if (!spec) continue;
    const probe = spec.kind === "solutions" || spec.kind === "relation" ? { ...spec, ...(spec.kind === "solutions" ? { values: bug.value.split(";") } : { value: bug.value }) } : { ...spec, value: bug.value };
    if (checkAnswer(probe as typeof spec, input).ok) return bug.misconception;
  }
  const line = tryParse(input.replace(/^\s*=/, ""));
  if (!line || !q.work) return null;
  const start = tryParse(q.work.start);
  if (!start) return null;

  // 2. Wrong rules applied to the starting expression or equation.
  for (const [id, rule] of Object.entries(REWRITES)) {
    if (q.work.mode === "expr" && line.or.length === 1 && !line.or[0].ops.length) {
      const wrong = everywhere(start.or[0].parts[0], rule);
      if (!same(wrong, start.or[0].parts[0]) && exprEquivalent(wrong, line.or[0].parts[0])) return id;
    }
    if (q.work.mode === "equation" && isSingleEquation(start) && isSingleEquation(line)) {
      const wrong = { parts: start.or[0].parts.map((p) => everywhere(p, rule)), ops: start.or[0].ops };
      if (constantMultiple(sideDiff(wrong), sideDiff(line.or[0]))) return id;
    }
  }

  // 3. Inequalities: the sign was not reversed after multiplying or dividing by a negative.
  if (q.work.mode === "relation" && sameSolutionSet(start, flipped(line)) && !sameSolutionSet(start, line)) return "inequalityFlip";
  return null;
}
