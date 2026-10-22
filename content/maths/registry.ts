/**
 * Maths topics whose question generators run in the learner's browser. Each topic is loaded only when
 * one of its lessons opens. To add a topic: create /content/maths/<topic>/generators.ts and add a line here.
 */
import type { ExamGenerator, Generator } from "@/lib/maths/types";

type TopicModule = { generators: Generator[]; examGenerators: ExamGenerator[] };

export const topics: Record<string, () => Promise<TopicModule>> = {
  algebra: () => import("./algebra/generators"),
};
