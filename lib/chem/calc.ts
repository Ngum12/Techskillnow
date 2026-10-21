/** Titration calculations in step boxes, marked separately with error carried forward (ECF). */

const SUPERSCRIPT: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+" };

/**
 * Reads a number as learners type it: 0.00245, 2.45e-3, 2.45 x 10^-3, 2.45×10⁻³, 2,45 (comma), 1/2.
 * Returns null when it is not a number.
 */
export function parseNumber(input: string): number | null {
  let s = input
    .trim()
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => SUPERSCRIPT[c])
    .replace(/−/g, "-")
    .replace(/\s+/g, "")
    .replace(/(mol|dm|cm|g|\/|-)*(dm-?3|cm-?3|dm³|cm³)$/i, "")
    .replace(/mol$/i, "");
  if (!s) return null;
  s = s.replace(/^(-?\d+),(\d+)/, "$1.$2");
  const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (frac) return Number(frac[2]) === 0 ? null : Number(frac[1]) / Number(frac[2]);
  const sci = s.match(/^(-?\d*\.?\d+)(?:[x×*]10\^?\(?([-+]?\d+)\)?|e([-+]?\d+))$/i);
  if (sci) return Number(sci[1]) * 10 ** Number(sci[2] ?? sci[3]);
  return /^-?\d*\.?\d+$/.test(s) ? Number(s) : null;
}

export type CalcBoxId = "molesKnown" | "ratio" | "molesUnknown" | "conc" | "massConc";
export const CALC_BOXES: CalcBoxId[] = ["molesKnown", "ratio", "molesUnknown", "conc", "massConc"];

export type CalcData = {
  /** Mean titre of the burette solution (cm³). */
  titre: number;
  /** Concentration of the burette solution (mol dm⁻³). */
  knownConc: number;
  /** Volume of the flask solution (cm³). */
  pipetteVolume: number;
  ratio: { burette: number; flask: number };
  /** Molar mass of the flask substance, when a mass concentration is asked. */
  molarMass?: number;
};

/** The correct value of every box from the data alone. */
export function correctChain(d: CalcData): Record<CalcBoxId, number> {
  const molesKnown = (d.knownConc * d.titre) / 1000;
  const ratio = d.ratio.flask / d.ratio.burette;
  const molesUnknown = molesKnown * ratio;
  const conc = (molesUnknown * 1000) / d.pipetteVolume;
  return { molesKnown, ratio, molesUnknown, conc, massConc: conc * (d.molarMass ?? 0) };
}

export type BoxMark = { id: CalcBoxId; value: number | null; expected: number; correct: number; ok: boolean; ecf: boolean };

const close = (a: number, b: number, rel: number) => Math.abs(a - b) <= Math.abs(b) * rel + 1e-12;

/**
 * Marks each box. A box is right if it matches the value worked out from the learner's own
 * earlier answers (ECF), so a slip in step 1 does not cost the later method marks.
 */
export function markCalculation(d: CalcData, answers: Partial<Record<CalcBoxId, string>>, relTolerance = 0.01): BoxMark[] {
  const right = correctChain(d);
  const val = (id: CalcBoxId) => parseNumber(answers[id] ?? "");
  const used = (id: CalcBoxId) => val(id) ?? right[id];
  const expected: Record<CalcBoxId, number> = {
    molesKnown: right.molesKnown,
    ratio: right.ratio,
    molesUnknown: used("molesKnown") * used("ratio"),
    conc: (used("molesUnknown") * 1000) / d.pipetteVolume,
    massConc: used("conc") * (d.molarMass ?? 0),
  };
  const boxes = CALC_BOXES.filter((id) => id !== "massConc" || d.molarMass);
  return boxes.map((id) => {
    const v = val(id);
    const ok = v !== null && close(v, expected[id], relTolerance);
    return { id, value: v, expected: expected[id], correct: right[id], ok, ecf: ok && !close(v!, right[id], relTolerance) };
  });
}

/** 3 significant figures, the usual precision for a titration answer. */
export function sig3(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  return abs >= 0.001 && abs < 10000 ? String(Number(n.toPrecision(3))) : n.toExponential(2);
}
