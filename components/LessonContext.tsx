"use client";
import { createContext, useContext } from "react";

export type LessonContextValue = {
  courseId: string;
  step: number;
  paid: boolean;
  tutorEnabled: boolean;
  /** Logs a practice attempt (paid learners only; fire and forget). */
  reportAttempt: (passed: boolean, failed: string[]) => void;
};

const noop: LessonContextValue = { courseId: "", step: 0, paid: false, tutorEnabled: false, reportAttempt: () => {} };
const LessonContext = createContext<LessonContextValue>(noop);

export const LessonProvider = LessonContext.Provider;

export function useLesson() {
  return useContext(LessonContext);
}
