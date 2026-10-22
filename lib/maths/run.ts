/** Runs generators with a seed: the same seed always gives the same question. */
import { makeRng } from "./rng";
import { tidyLatex as tidy } from "./build";
import type { ExamGenerator, ExamQuestion, Generator, Question } from "./types";

export function runGenerator(g: Generator, seed: number): Question {
  const q = g.generate(makeRng(seed));
  // Everything the learner reads is tidied; the values used for checking are left as they are.
  return {
    ...q,
    prompt: tidy(q.prompt),
    solution: q.solution.map((l) => ({ ...l, latex: tidy(l.latex), note: l.note && tidy(l.note) })),
    signs: q.signs && {
      critical: q.signs.critical,
      factors: q.signs.factors.map((f) => ({ ...f, latex: tidy(f.latex) })),
      result: { ...q.signs.result, latex: tidy(q.signs.result.latex) },
    },
    generator: g.id,
    skill: g.skill,
    seed,
  };
}

export function runExam(g: ExamGenerator, seed: number): ExamQuestion {
  const q = g.generate(makeRng(seed));
  return {
    ...q,
    intro: tidy(q.intro),
    parts: q.parts.map((p) => ({ ...p, prompt: tidy(p.prompt), solution: p.solution.map((l) => ({ ...l, latex: tidy(l.latex), note: l.note && tidy(l.note) })) })),
    generator: g.id,
    seed,
  };
}
