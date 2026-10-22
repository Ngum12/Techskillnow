/**
 * A small maths expression language: what the keypad types and what generators write.
 * Parses "2x^3 - (x+1)(x-2)/3", "|x - 2| <= 5", "x = 1 or x = -2", "sqrt(x)", "sin(x)", "ln(x)", "e^x".
 * Light enough for cheap phones (no big CAS library); equivalence is checked numerically (see equiv.ts).
 */

export type Expr =
  | { t: "num"; v: number }
  | { t: "var"; name: string }
  | { t: "const"; name: "e" | "pi" }
  | { t: "neg"; a: Expr }
  | { t: "bin"; op: "+" | "-" | "*" | "/" | "^"; a: Expr; b: Expr }
  | { t: "fn"; name: FnName; a: Expr }
  | { t: "abs"; a: Expr };

export type FnName = "sqrt" | "sin" | "cos" | "tan" | "ln" | "log" | "exp";
export type RelOp = "=" | "<" | ">" | "<=" | ">=" | "!=";
/** a < b <= c … */
export type Chain = { parts: Expr[]; ops: RelOp[] };
/** Chains joined by "or" (a single chain, or a single expression with no relation, is the usual case). */
export type Statement = { or: Chain[] };

const FUNCS: FnName[] = ["sqrt", "sin", "cos", "tan", "ln", "log", "exp"];
const WORDS = ["sqrt", "sin", "cos", "tan", "ln", "log", "exp", "abs", "pi", "or", "and"];

type Tok = { k: "num"; v: number } | { k: "id"; v: string } | { k: "op"; v: string };

export class ParseError extends Error {}

function tokenize(src: string): Tok[] {
  const s = src
    .replace(/[−–]/g, "-")
    .replace(/×|·/g, "*")
    .replace(/÷/g, "/")
    .replace(/≤|=</g, "<=")
    .replace(/≥|=>/g, ">=")
    .replace(/≠/g, "!=")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const num = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);
    if (num) {
      out.push({ k: "num", v: Number(num[1]) });
      i += num[1].length;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      const word = WORDS.find((w) => s.startsWith(w, i) && !/[a-zA-Z]/.test(s[i + w.length] ?? "") ) ?? WORDS.find((w) => s.startsWith(w, i) && FUNCS.includes(w as FnName));
      if (word) {
        out.push({ k: "id", v: word });
        i += word.length;
      } else {
        out.push({ k: "id", v: c });
        i++;
      }
      continue;
    }
    const two = s.slice(i, i + 2);
    if (two === "<=" || two === ">=" || two === "**" || two === "!=") {
      out.push({ k: "op", v: two === "**" ? "^" : two });
      i += 2;
      continue;
    }
    if ("+-*/^()|,=<>[]".includes(c)) {
      out.push({ k: "op", v: c === "[" ? "(" : c === "]" ? ")" : c });
      i++;
      continue;
    }
    throw new ParseError(`Unexpected "${c}"`);
  }
  return out;
}

class Parser {
  private i = 0;
  private absDepth = 0;
  private toks: Tok[];
  constructor(toks: Tok[]) {
    this.toks = toks;
  }
  peek() {
    return this.toks[this.i];
  }
  next() {
    return this.toks[this.i++];
  }
  isOp(v: string) {
    const t = this.peek();
    return !!t && t.k === "op" && t.v === v;
  }
  isWord(v: string) {
    const t = this.peek();
    return !!t && t.k === "id" && t.v === v;
  }
  expect(v: string) {
    if (!this.isOp(v)) throw new ParseError(`Expected "${v}"`);
    this.next();
  }
  done() {
    return this.i >= this.toks.length;
  }

  statement(): Statement {
    const or = [this.chain()];
    while (this.isWord("or") || this.isOp(",")) {
      this.next();
      or.push(this.chain());
    }
    if (!this.done()) throw new ParseError("Unexpected input");
    return { or };
  }
  chain(): Chain {
    const parts = [this.expr()];
    const ops: RelOp[] = [];
    for (;;) {
      const t = this.peek();
      if (t && t.k === "op" && ["=", "<", ">", "<=", ">=", "!="].includes(t.v)) {
        this.next();
        ops.push(t.v as RelOp);
        parts.push(this.expr());
      } else break;
    }
    return { parts, ops };
  }
  expr(): Expr {
    let a = this.term();
    while (this.isOp("+") || this.isOp("-")) {
      const op = this.next().v as "+" | "-";
      a = { t: "bin", op, a, b: this.term() };
    }
    return a;
  }
  /** Can the next token start a factor written straight after another (implicit multiplication)? */
  startsFactor(): boolean {
    const t = this.peek();
    if (!t) return false;
    if (t.k === "num") return false;
    if (t.k === "id") return t.v !== "or" && t.v !== "and";
    return t.v === "(" || (t.v === "|" && this.absDepth === 0);
  }
  term(): Expr {
    let a = this.unary();
    for (;;) {
      if (this.isOp("*") || this.isOp("/")) {
        const op = this.next().v as "*" | "/";
        a = { t: "bin", op, a, b: this.unary() };
      } else if (this.startsFactor()) {
        a = { t: "bin", op: "*", a, b: this.power() };
      } else break;
    }
    return a;
  }
  unary(): Expr {
    if (this.isOp("-")) {
      this.next();
      return { t: "neg", a: this.unary() };
    }
    if (this.isOp("+")) {
      this.next();
      return this.unary();
    }
    return this.power();
  }
  power(): Expr {
    const base = this.primary();
    if (this.isOp("^")) {
      this.next();
      return { t: "bin", op: "^", a: base, b: this.unary() };
    }
    return base;
  }
  primary(): Expr {
    const t = this.next();
    if (!t) throw new ParseError("Unexpected end");
    if (t.k === "num") return { t: "num", v: t.v };
    if (t.k === "id") {
      if (t.v === "pi") return { t: "const", name: "pi" };
      if (t.v === "e") return { t: "const", name: "e" };
      if (t.v === "abs") {
        this.expect("(");
        const a = this.expr();
        this.expect(")");
        return { t: "abs", a };
      }
      if (FUNCS.includes(t.v as FnName)) {
        // sin(x), sqrt(x), or sqrt x / sin x (argument binds tightly).
        const a = this.isOp("(") ? this.paren() : this.power();
        return { t: "fn", name: t.v as FnName, a };
      }
      if (t.v === "or" || t.v === "and") throw new ParseError("Unexpected word");
      return { t: "var", name: t.v };
    }
    if (t.v === "(") {
      this.i--;
      return this.paren();
    }
    if (t.v === "|") {
      this.absDepth++;
      const a = this.expr();
      this.absDepth--;
      this.expect("|");
      return { t: "abs", a };
    }
    throw new ParseError(`Unexpected "${t.v}"`);
  }
  paren(): Expr {
    this.expect("(");
    const saved = this.absDepth;
    this.absDepth = 0;
    const a = this.expr();
    this.absDepth = saved;
    this.expect(")");
    return a;
  }
}

/** Parses a statement: an expression, a relation chain, or relations joined by "or". */
export function parseStatement(src: string): Statement {
  const toks = tokenize(src);
  if (!toks.length) throw new ParseError("Empty");
  return new Parser(toks).statement();
}

/** Parses a single expression (no relation). */
export function parseExpr(src: string): Expr {
  const s = parseStatement(src);
  if (s.or.length !== 1 || s.or[0].ops.length) throw new ParseError("Expected an expression");
  return s.or[0].parts[0];
}

export function tryParse(src: string): Statement | null {
  try {
    return parseStatement(src);
  } catch {
    return null;
  }
}

/* ---------- Evaluation ---------- */

export type Env = Record<string, number>;

export function evaluate(e: Expr, env: Env): number {
  switch (e.t) {
    case "num":
      return e.v;
    case "var":
      return e.name in env ? env[e.name] : NaN;
    case "const":
      return e.name === "e" ? Math.E : Math.PI;
    case "neg":
      return -evaluate(e.a, env);
    case "abs":
      return Math.abs(evaluate(e.a, env));
    case "fn": {
      const a = evaluate(e.a, env);
      switch (e.name) {
        case "sqrt":
          return a < 0 ? NaN : Math.sqrt(a);
        case "sin":
          return Math.sin(a);
        case "cos":
          return Math.cos(a);
        case "tan":
          return Math.tan(a);
        case "ln":
          return a <= 0 ? NaN : Math.log(a);
        case "log":
          return a <= 0 ? NaN : Math.log10(a);
        case "exp":
          return Math.exp(a);
      }
      return NaN;
    }
    case "bin": {
      const a = evaluate(e.a, env);
      const b = evaluate(e.b, env);
      switch (e.op) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "*":
          return a * b;
        case "/":
          return b === 0 ? NaN : a / b;
        case "^": {
          // Odd roots of negatives, e.g. (-8)^(1/3), are real.
          if (a < 0 && !Number.isInteger(b)) {
            const inv = 1 / b;
            if (Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) % 2 !== 0) return -Math.pow(-a, b);
            return NaN;
          }
          return Math.pow(a, b);
        }
      }
    }
  }
}

/** True/false value of one relation chain at a point (NaN-safe: false when undefined). */
export function holds(c: Chain, env: Env, eps = 1e-9): boolean {
  const v = c.parts.map((p) => evaluate(p, env));
  if (v.some((x) => !Number.isFinite(x))) return false;
  return c.ops.every((op, i) => {
    const a = v[i];
    const b = v[i + 1];
    const tol = eps * Math.max(1, Math.abs(a), Math.abs(b));
    switch (op) {
      case "=":
        return Math.abs(a - b) <= tol;
      case "<":
        return a < b - tol;
      case ">":
        return a > b + tol;
      case "<=":
        return a <= b + tol;
      case ">=":
        return a >= b - tol;
      case "!=":
        return Math.abs(a - b) > tol;
    }
  });
}

export const statementHolds = (s: Statement, env: Env) => s.or.some((c) => holds(c, env));

/* ---------- Inspection ---------- */

export function variables(e: Expr, out = new Set<string>()): Set<string> {
  if (e.t === "var") out.add(e.name);
  if (e.t === "neg" || e.t === "abs" || e.t === "fn") variables(e.a, out);
  if (e.t === "bin") (variables(e.a, out), variables(e.b, out));
  return out;
}

export function statementVariables(s: Statement): Set<string> {
  const out = new Set<string>();
  s.or.forEach((c) => c.parts.forEach((p) => variables(p, out)));
  return out;
}

/** Every number written in the expression (with its sign when negated), for sampling near boundaries. */
export function constants(e: Expr, out: number[] = []): number[] {
  if (e.t === "num") out.push(e.v);
  if (e.t === "neg" && e.a.t === "num") out.push(-e.a.v);
  if (e.t === "neg" || e.t === "abs" || e.t === "fn") constants(e.a, out);
  if (e.t === "bin") {
    if (e.op === "/" && e.a.t === "num" && e.b.t === "num") out.push(e.a.v / e.b.v);
    // "-1/2" is read as (−1)/2.
    if (e.op === "/" && e.a.t === "neg" && e.a.a.t === "num" && e.b.t === "num") out.push(-e.a.a.v / e.b.v);
    constants(e.a, out);
    constants(e.b, out);
  }
  return out;
}

export const isRelation = (s: Statement) => s.or.length > 1 || s.or[0].ops.length > 0;

/* ---------- LaTeX ---------- */

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, neg: 2.5, "^": 3 };
const prec = (e: Expr) => (e.t === "bin" ? PREC[e.op] : e.t === "neg" ? PREC.neg : 4);
const wrap = (s: string) => `\\left(${s}\\right)`;

/** Can `b` be written straight after `a` without a × sign (2x, 3(x+1), (x+1)(x−2), x²y)? */
function juxtapose(a: Expr, b: Expr): boolean {
  const startsWithDigit = (e: Expr): boolean => e.t === "num" || (e.t === "bin" && (e.op === "*" || e.op === "^") && startsWithDigit(e.a));
  if (startsWithDigit(b)) return false;
  return a.t !== "neg";
}

export function toLatex(e: Expr): string {
  switch (e.t) {
    case "num":
      return String(e.v);
    case "var":
      return e.name;
    case "const":
      return e.name === "pi" ? "\\pi" : "e";
    case "neg": {
      const s = toLatex(e.a);
      return `-${prec(e.a) <= 2 && e.a.t !== "num" && !(e.a.t === "bin" && (e.a.op === "*" || e.a.op === "/")) ? wrap(s) : s}`;
    }
    case "abs":
      return `\\left|${toLatex(e.a)}\\right|`;
    case "fn": {
      const a = toLatex(e.a);
      if (e.name === "sqrt") return `\\sqrt{${a}}`;
      if (e.name === "exp") return `e^{${a}}`;
      return `\\${e.name}${e.a.t === "var" || e.a.t === "num" ? ` ${a}` : wrap(a)}`;
    }
    case "bin": {
      const p = PREC[e.op];
      if (e.op === "/") return `\\frac{${toLatex(e.a)}}{${toLatex(e.b)}}`;
      if (e.op === "^") {
        const base = prec(e.a) < 4 || e.a.t === "fn" ? wrap(toLatex(e.a)) : toLatex(e.a);
        return `${base}^{${toLatex(e.b)}}`;
      }
      const L = prec(e.a) < p ? wrap(toLatex(e.a)) : toLatex(e.a);
      if (e.op === "*") {
        const R = prec(e.b) <= p && !(e.b.t === "bin" && e.b.op === "^") ? wrap(toLatex(e.b)) : toLatex(e.b);
        return juxtapose(e.a, e.b) ? `${L}${R}` : `${L} \\times ${R}`;
      }
      // a − (b + c) needs brackets; a + (−b) is written a − b.
      if (e.b.t === "neg") return `${L} ${e.op === "+" ? "-" : "+"} ${toLatex(e.b.a)}`;
      const R = prec(e.b) <= p && e.op === "-" ? wrap(toLatex(e.b)) : toLatex(e.b);
      return `${L} ${e.op} ${R}`;
    }
  }
}

const REL_TEX: Record<RelOp, string> = { "=": "=", "<": "<", ">": ">", "<=": "\\le", ">=": "\\ge", "!=": "\\ne" };

export function statementLatex(s: Statement): string {
  return s.or.map((c) => c.parts.map((p, i) => (i ? ` ${REL_TEX[c.ops[i - 1]]} ` : "") + toLatex(p)).join("")).join("\\quad\\text{or}\\quad ");
}

/** LaTeX for whatever the learner has typed so far (falls back to plain text while incomplete). */
export function previewLatex(src: string): string | null {
  const s = tryParse(normaliseAnswer(src));
  return s ? statementLatex(s) : null;
}

const INF = /^[+]?(∞|inf|infinity)$/i;
const NEG_INF = /^(-|−)(∞|inf|infinity)$/i;

/** One interval such as [2, ∞), (−∞, 3] or (1, 4] as an inequality in `v`. */
function intervalToRelation(open: string, a: string, b: string, close: string, v: string): string {
  const lo = NEG_INF.test(a.trim()) ? null : a.trim();
  const hi = INF.test(b.trim()) ? null : b.trim();
  const l = open === "[" ? "<=" : "<";
  const r = close === "]" ? "<=" : "<";
  if (lo === null && hi === null) return `${v} = ${v}`;
  if (lo === null) return `${v} ${r} ${hi}`;
  if (hi === null) return `${v} ${l === "<=" ? ">=" : ">"} ${lo}`;
  return `${lo} ${l} ${v} ${r} ${hi}`;
}

/**
 * What learners type for answers about functions, made readable by the parser:
 * f(x), g(x), f⁻¹(x), fg(x) → y (for ranges); interval notation and ∪ → inequalities joined by "or";
 * "x ∈ …" is dropped before an interval.
 */
export function normaliseAnswer(text: string, variable = "x"): string {
  let s = text.replace(/\b([a-z]{1,2})\s*(\^\s*\(?\s*[-−]\s*1\s*\)?|⁻¹)?\s*\(\s*x\s*\)/gi, (m, name: string) => (["x", "e", "ln"].includes(name.toLowerCase()) ? m : "y"));
  if (/[[\]∞∪]/.test(s)) {
    s = s.replace(/[a-z]\s*∈\s*/gi, "");
    s = s.replace(/([[(])\s*([^,[\]()]+?)\s*,\s*([^,[\]()]+?)\s*([\])])/g, (_m, o: string, a: string, b: string, c: string) => intervalToRelation(o, a, b, c, variable));
    s = s.replace(/∪/g, " or ");
  }
  return s;
}
