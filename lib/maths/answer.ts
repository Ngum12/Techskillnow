/** Final-answer checking: any equivalent form, unless the question asks for a specific form. */
import { evaluate, isRelation, normaliseAnswer, parseExpr, statementVariables, tryParse, type Expr, type Statement } from "./expr";
import { exprEquivalent, sameSolutionSet } from "./equiv";
import type { AnswerSpec } from "./types";

/** `mis`: a misconception recognised from the form of the answer (e.g. a range written with x). */
export type AnswerResult = { ok: boolean; reason?: "unreadable" | "form" | "wrong" | "notSolved"; mis?: string };

/** A number typed by the learner: "3", "-3/4", "0.75", "2^3"… (any constant expression). */
export function numberValue(input: string): number | null {
  const s = tryParse(input.replace(/^\s*[a-z]\s*=\s*/i, ""));
  if (!s || isRelation(s)) return null;
  const v = evaluate(s.or[0].parts[0], {});
  return Number.isFinite(v) ? v : null;
}

const closeNum = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

/* ---------- Forms ---------- */

/** The terms of a sum, with their signs: a − b + c → [a, −b, c]. */
function sumTerms(e: Expr, sign = 1, out: { e: Expr; sign: number }[] = []) {
  if (e.t === "bin" && (e.op === "+" || e.op === "-")) {
    sumTerms(e.a, sign, out);
    sumTerms(e.b, e.op === "-" ? -sign : sign, out);
  } else if (e.t === "neg") sumTerms(e.a, -sign, out);
  else out.push({ e, sign });
  return out;
}

/** Degree of a monomial like 3x², −x, (2/3)x³, 5; null if it is not a monomial. */
function monomialDegree(e: Expr): number | null {
  switch (e.t) {
    case "num":
    case "const":
      return 0;
    case "var":
      return 1;
    case "neg":
      return monomialDegree(e.a);
    case "bin":
      if (e.op === "*") {
        const a = monomialDegree(e.a);
        const b = monomialDegree(e.b);
        return a === null || b === null ? null : a + b;
      }
      if (e.op === "/") return monomialDegree(e.a) !== null && monomialDegree(e.b) === 0 ? monomialDegree(e.a) : null;
      if (e.op === "^") {
        const base = monomialDegree(e.a);
        return base !== null && e.b.t === "num" && Number.isInteger(e.b.v) && e.b.v >= 0 ? base * e.b.v : null;
      }
      return null;
    default:
      return null;
  }
}

/** Written as a sum of terms with no brackets to expand and no like terms left to collect. */
export function isExpanded(e: Expr): boolean {
  const degrees = sumTerms(e).map((t) => monomialDegree(t.e));
  return degrees.every((d) => d !== null) && new Set(degrees).size === degrees.length;
}

function isPolynomial(e: Expr): boolean {
  return sumTerms(e).every((t) => monomialDegree(t.e) !== null);
}

function polyDegree(e: Expr): number {
  return Math.max(...sumTerms(e).map((t) => monomialDegree(t.e) ?? 0));
}

/** A product of at least two non-constant polynomial factors (or a power of one), with a number in front allowed. */
export function isFactorised(e: Expr): boolean {
  const factors: Expr[] = [];
  const collect = (x: Expr): void => {
    if (x.t === "neg") return collect(x.a);
    if (x.t === "bin" && x.op === "*") {
      collect(x.a);
      collect(x.b);
      return;
    }
    if (x.t === "bin" && x.op === "^" && x.b.t === "num" && Number.isInteger(x.b.v) && x.b.v >= 2) {
      for (let i = 0; i < x.b.v; i++) factors.push(x.a);
      return;
    }
    factors.push(x);
  };
  collect(e);
  const nonConstant = factors.filter((f) => isPolynomial(f) && polyDegree(f) >= 1);
  const constantsOk = factors.every((f) => nonConstant.includes(f) || monomialDegree(f) === 0);
  return constantsOk && nonConstant.length >= 2;
}

/** One term with at most one number and each letter once: 6x^5, -x^2, 3. */
export function isMonomialSimplified(e: Expr): boolean {
  let numbers = 0;
  const letters: string[] = [];
  const walk = (x: Expr): boolean => {
    if (x.t === "neg") return walk(x.a);
    if (x.t === "num") return ++numbers <= 1;
    if (x.t === "var") return (letters.push(x.name), true);
    if (x.t === "bin" && x.op === "^" && x.a.t === "var" && x.b.t === "num") return (letters.push(x.a.name), true);
    if (x.t === "bin" && x.op === "^" && x.a.t === "var" && x.b.t === "neg" && x.b.a.t === "num") return (letters.push(x.a.name), true);
    if (x.t === "bin" && x.op === "*") return walk(x.a) && walk(x.b);
    if (x.t === "bin" && x.op === "/" && x.b.t === "num") return walk(x.a) && ++numbers <= 2;
    return false;
  };
  return walk(e) && new Set(letters).size === letters.length;
}

/** "x = 2 or x = −3", "x < −1 or x > 3", "−1 ≤ x < 4": the variable stands alone. */
function isSolvedForm(s: Statement, v: string): boolean {
  return s.or.every((c) => {
    const isVar = (e: Expr) => e.t === "var" && e.name === v;
    const isConst = (e: Expr) => !hasVar(e);
    if (c.parts.length === 2) return (isVar(c.parts[0]) && isConst(c.parts[1])) || (isConst(c.parts[0]) && isVar(c.parts[1]));
    if (c.parts.length === 3) return isConst(c.parts[0]) && isVar(c.parts[1]) && isConst(c.parts[2]);
    return false;
  });
}

function hasVar(e: Expr): boolean {
  if (e.t === "var") return true;
  if (e.t === "neg" || e.t === "abs" || e.t === "fn") return hasVar(e.a);
  if (e.t === "bin") return hasVar(e.a) || hasVar(e.b);
  return false;
}

/** (ax + b) or (ax + b)^n, possibly times a number. */
function isLinearPowerProduct(e: Expr): boolean {
  if (e.t === "bin" && e.op === "*") return isLinearPowerProduct(e.a) && isLinearPowerProduct(e.b);
  if (!hasVar(e)) return true;
  if (e.t === "bin" && e.op === "^") return e.b.t === "num" && Number.isInteger(e.b.v) && e.b.v >= 1 && isLinearPowerProduct(e.a);
  return isPolynomial(e) && polyDegree(e) === 1;
}

/** A sum of a polynomial part and terms number / (linear factor)ⁿ: the partial-fraction form. */
export function isPartialFractions(e: Expr): boolean {
  let fractions = 0;
  for (const { e: term } of sumTerms(e)) {
    if (monomialDegree(term) !== null) continue;
    let t = term;
    if (t.t === "bin" && t.op === "*" && !hasVar(t.a) && t.b.t === "bin" && t.b.op === "/") t = t.b;
    if (t.t === "bin" && t.op === "/" && !hasVar(t.a) && hasVar(t.b) && isLinearPowerProduct(t.b)) {
      fractions++;
      continue;
    }
    return false;
  }
  return fractions >= 1;
}

/* ---------- Checking ---------- */

export function checkAnswer(spec: AnswerSpec, input: string): AnswerResult {
  const text = input.trim();
  if (!text) return { ok: false, reason: "unreadable" };
  switch (spec.kind) {
    case "choice":
      return { ok: Number(text) === spec.answer };
    case "number": {
      const v = numberValue(text);
      if (v === null) return { ok: false, reason: "unreadable" };
      return closeNum(v, numberValue(spec.value)!) ? { ok: true } : { ok: false, reason: "wrong" };
    }
    case "expr": {
      // "x = …", "f(x) = …", "fg(x) = …", "f⁻¹(x) = …" in front of the answer are all fine.
      const s = tryParse(normaliseAnswer(text).replace(/^\s*([a-z]\s*)?=/i, ""));
      if (!s || isRelation(s)) return { ok: false, reason: "unreadable" };
      const e = s.or[0].parts[0];
      if (!exprEquivalent(e, parseExpr(spec.value))) return { ok: false, reason: "wrong" };
      if (spec.form === "expanded" && !isExpanded(e)) return { ok: false, reason: "form" };
      if (spec.form === "factorised" && !isFactorised(e)) return { ok: false, reason: "form" };
      if (spec.form === "monomial" && !isMonomialSimplified(e)) return { ok: false, reason: "form" };
      if (spec.form === "partial" && !isPartialFractions(e)) return { ok: false, reason: "form" };
      return { ok: true };
    }
    case "factorOf": {
      // Any linear factor of the polynomial is right: (x − r) where f(r) = 0.
      const s = tryParse(text);
      if (!s || isRelation(s)) return { ok: false, reason: "unreadable" };
      const e = s.or[0].parts[0];
      const [y0, y1, y2] = [0, 1, 2].map((x) => evaluate(e, { x }));
      const a = y1 - y0;
      if (![y0, y1, y2].every(Number.isFinite) || Math.abs(y2 - y1 - a) > 1e-9 || Math.abs(a) < 1e-12) return { ok: false, reason: "form" };
      const root = -y0 / a;
      const f = parseExpr(spec.value);
      return Math.abs(evaluate(f, { x: root })) < 1e-7 ? { ok: true } : { ok: false, reason: "wrong" };
    }
    case "solutions": {
      const v = spec.variable ?? "x";
      const s = tryParse(text);
      if (!s) return { ok: false, reason: "unreadable" };
      const want = tryParse(spec.values.map((x) => `${v} = ${x}`).join(" or "))!;
      if (!sameSolutionSet(s, want)) return { ok: false, reason: "wrong" };
      return isSolvedForm(s, v) ? { ok: true } : { ok: false, reason: "notSolved" };
    }
    case "range": {
      // A range is about the outputs: f(x) ≥ 2 (or y ≥ 2), not x ≥ 2.
      const n = normaliseAnswer(text, "y");
      const s = tryParse(n);
      if (!s) return { ok: false, reason: "unreadable" };
      const vars = statementVariables(s);
      const want = tryParse(spec.value.replace(/y/g, "x"))!;
      const asX = tryParse(n.replace(/y/g, "x"))!;
      if (!sameSolutionSet(asX, want)) return { ok: false, reason: "wrong" };
      if (vars.has("x") && !vars.has("y")) return { ok: false, reason: "wrong", mis: "rangeInX" };
      return isSolvedForm(asX, "x") ? { ok: true } : { ok: false, reason: "notSolved" };
    }
    case "relation": {
      const s = tryParse(normaliseAnswer(text));
      if (!s) return { ok: false, reason: "unreadable" };
      if (!sameSolutionSet(s, tryParse(spec.value)!)) return { ok: false, reason: "wrong" };
      return isSolvedForm(s, "x") ? { ok: true } : { ok: false, reason: "notSolved" };
    }
  }
}
