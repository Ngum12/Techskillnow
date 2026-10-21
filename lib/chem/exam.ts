/** Mark breakdown for the timed mock titration. Mark values come from /content/chem/settings.json. */
import type { BoxMark } from "./calc";
import { validReadingFormat } from "./titration";

export type ExamMarking = {
  titreMarks: { within: number; marks: number }[];
  concordanceMarks: number;
  recordingMarks: number;
  calculationMarkPerBox: number;
  passPercent: number;
};

export type MarkItem = { id: "accuracy" | "concordance" | "recording" | "calculation"; got: number; max: number };

export function markMock(input: {
  /** The titre a perfect student would get (no preparation errors). */
  perfectTitre: number;
  /** The learner's mean titre, or null if they did not finish. */
  mean: number | null;
  concordantChoice: boolean;
  /** Every reading typed, with the true burette level. */
  readings: { typed: string; actual: number }[];
  calc: BoxMark[];
  calcBoxes: number;
  marking: ExamMarking;
}): { items: MarkItem[]; total: number; max: number; percent: number; passed: boolean } {
  const m = input.marking;
  const bands = [...m.titreMarks].sort((a, b) => a.within - b.within);
  const accuracyMax = Math.max(0, ...bands.map((b) => b.marks));
  const diff = input.mean === null ? Infinity : Math.abs(input.mean - input.perfectTitre);
  const accuracy = bands.find((b) => diff <= b.within + 1e-9)?.marks ?? 0;

  // Recording: half the marks for the format (2 dp, ending 0 or 5), half for reading the scale correctly.
  const formatOk = input.readings.length > 0 && input.readings.every((r) => validReadingFormat(r.typed));
  const valuesOk = input.readings.length > 0 && input.readings.every((r) => Math.abs(Number(r.typed) - r.actual) <= 0.05 + 1e-9);
  const half = m.recordingMarks / 2;
  const recording = (formatOk ? Math.ceil(half) : 0) + (valuesOk ? Math.floor(half) : 0);

  const items: MarkItem[] = [
    { id: "accuracy", got: accuracy, max: accuracyMax },
    { id: "concordance", got: input.concordantChoice ? m.concordanceMarks : 0, max: m.concordanceMarks },
    { id: "recording", got: recording, max: m.recordingMarks },
    { id: "calculation", got: input.calc.filter((b) => b.ok).length * m.calculationMarkPerBox, max: input.calcBoxes * m.calculationMarkPerBox },
  ];
  const total = items.reduce((n, i) => n + i.got, 0);
  const max = items.reduce((n, i) => n + i.max, 0);
  const percent = max ? Math.round((total / max) * 100) : 0;
  return { items, total, max, percent, passed: percent >= m.passPercent };
}
