/** Runs generators with a seed: the same seed always gives the same question. */
import { makeRng } from "./rng";
import type { ExamGenerator, ExamQuestion, Generator, Question } from "./types";

export function runGenerator(g: Generator, seed: number): Question {
  return { ...g.generate(makeRng(seed)), generator: g.id, skill: g.skill, seed };
}

export function runExam(g: ExamGenerator, seed: number): ExamQuestion {
  return { ...g.generate(makeRng(seed)), generator: g.id, seed };
}
