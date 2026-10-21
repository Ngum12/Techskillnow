/**
 * Titration engine: pure functions, no UI. All chemistry values come from /content/chem
 * (titrations.json, errors.json, settings.json) and are passed in.
 */

export type ChemSolution = { name: string; formula: string; molarMass: number };
export type TitrationSystem = {
  id: string;
  title: string;
  equation: string;
  burette: ChemSolution & { conc: number };
  flask: ChemSolution & { concRange: [number, number] };
  /** Stoichiometric coefficients of the burette and flask substances in the equation. */
  ratio: { burette: number; flask: number };
  indicator: string;
};
export type Indicator = {
  id: string;
  name: string;
  colours: Record<IndicatorState, string>;
  words: Record<IndicatorState, string>;
};
export type IndicatorState = "alkali" | "endPoint" | "excessAcid";

export type LabSettings = {
  apparatus: { buretteCapacity: number; pipetteVolume: number; dropVolume: number; fastFlowPerSecond: number; readingStep: number };
  realism: { runJitter: number; initialLevelRange: [number, number] };
  endPoint: { flashWindow: number; slowDownWarning: number; excessAcidAfter: number };
  concordance: { tolerance: number; minimum: number };
};

export type Effect = { buretteConcFactor?: number; flaskMolesFactor?: number; readingOffset?: number };
export type RinseOption = { id: string; label: string; effect: Effect; correct?: boolean; explain: string };
export type ErrorData = {
  rinse: Record<"burette" | "pipette" | "flask", RinseOption[]>;
  setup: Record<"funnel" | "jet", { label: string; ifNot: Effect; explain: string }>;
  parallax: Record<"above" | "below", { offset: number; explain: string }>;
};

export type PrepChoices = { burette: string; pipette: string; flask: string; funnelRemoved: boolean; jetFilled: boolean };
export const GOOD_PREP: PrepChoices = { burette: "acid", pipette: "alkali", flask: "water", funnelRemoved: true, jetFilled: true };

export type PrepResult = { buretteConcFactor: number; flaskMolesFactor: number; readingOffset: number; explanations: string[] };

/** A seeded random generator (mulberry32), so tests and replays are reproducible. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (v: number, dp: number) => Math.round(v * 10 ** dp) / 10 ** dp;

/** Exact end-point volume (cm³) of burette solution for a given flask concentration. */
export function exactEndPoint(sys: TitrationSystem, flaskConc: number, pipetteVolume: number, effects: Partial<PrepResult> = {}): number {
  const flaskMoles = flaskConc * (pipetteVolume / 1000) * (effects.flaskMolesFactor ?? 1);
  const buretteMoles = flaskMoles * (sys.ratio.burette / sys.ratio.flask);
  const buretteConc = sys.burette.conc * (effects.buretteConcFactor ?? 1);
  return (buretteMoles / buretteConc) * 1000;
}

/** Combines the effects of the learner's preparation choices; explanations are shown at the end. */
export function prepEffects(choices: PrepChoices, data: ErrorData): PrepResult {
  const out: PrepResult = { buretteConcFactor: 1, flaskMolesFactor: 1, readingOffset: 0, explanations: [] };
  const apply = (e: Effect) => {
    out.buretteConcFactor *= e.buretteConcFactor ?? 1;
    out.flaskMolesFactor *= e.flaskMolesFactor ?? 1;
    out.readingOffset += e.readingOffset ?? 0;
  };
  for (const item of ["burette", "pipette", "flask"] as const) {
    const opt = data.rinse[item].find((o) => o.id === choices[item]) ?? data.rinse[item][0];
    apply(opt.effect);
    if (!opt.correct || item === "flask") out.explanations.push(opt.explain);
  }
  if (!choices.funnelRemoved) {
    apply(data.setup.funnel.ifNot);
    out.explanations.push(data.setup.funnel.explain);
  }
  if (!choices.jetFilled) {
    apply(data.setup.jet.ifNot);
    out.explanations.push(data.setup.jet.explain);
  }
  return out;
}

export type Experiment = { systemId: string; flaskConc: number; seed: number };

/** Picks a system and a hidden flask concentration (3 significant figures) within its range. */
export function createExperiment(systems: TitrationSystem[], random: () => number, onlySystem?: string): Experiment {
  const pool = onlySystem ? systems.filter((s) => s.id === onlySystem) : systems;
  const sys = pool[Math.floor(random() * pool.length)] ?? systems[0];
  const [lo, hi] = sys.flask.concRange;
  const raw = lo + random() * (hi - lo);
  const flaskConc = Number(raw.toPrecision(3));
  return { systemId: sys.id, flaskConc, seed: Math.floor(random() * 2 ** 31) };
}

export type Run = {
  /** Volume that must actually reach the flask for the end point (cm³). */
  endPoint: number;
  /** Burette reading before titrating (exact level, cm³). */
  initialLevel: number;
  /** Offset between the volume delivered and the fall in burette level (funnel drips, air bubble). */
  readingOffset: number;
};

/** One titration of the experiment: small random variation between runs, plus the learner's preparation errors. */
export function createRun(exp: Experiment, sys: TitrationSystem, settings: LabSettings, prep: PrepResult, runIndex: number): Run {
  const r = rng(exp.seed + runIndex * 7919);
  const exact = exactEndPoint(sys, exp.flaskConc, settings.apparatus.pipetteVolume, prep);
  const jitter = (r() * 2 - 1) * settings.realism.runJitter;
  const [lo, hi] = settings.realism.initialLevelRange;
  const step = settings.apparatus.readingStep;
  const initialLevel = round(Math.round((lo + r() * (hi - lo)) / step) * step, 2);
  return { endPoint: exact + jitter, initialLevel, readingOffset: prep.readingOffset };
}

/** Burette level shown for a volume delivered. Funnel/bubble offsets build up over the first 2 cm³. */
export function levelAfter(run: Run, delivered: number): number {
  const share = Math.min(1, delivered / 2);
  return run.initialLevel + delivered + run.readingOffset * share;
}

/** Rounds a burette reading to the nearest 0.05 cm³ (2 decimal places ending in 0 or 5). */
export function roundReading(v: number, step = 0.05): number {
  return round(Math.round(v / step) * step, 2);
}

export const formatReading = (v: number) => roundReading(v).toFixed(2);

/** True if a typed reading has 2 decimal places ending in 0 or 5. */
export function validReadingFormat(text: string): boolean {
  return /^\d{1,2}\.\d[05]$/.test(text.trim());
}

/**
 * Colour state of the flask. Before the end point the alkali colour stays, except a local flash
 * near the end point that fades when swirled. Past the end point the change is permanent;
 * with an indicator that has a distinct excess-acid colour (methyl orange), a clear overshoot turns it.
 */
export function flaskState(delivered: number, endPoint: number, settings: LabSettings): IndicatorState {
  if (delivered < endPoint) return "alkali";
  if (delivered >= endPoint + settings.endPoint.excessAcidAfter) return "excessAcid";
  return "endPoint";
}

/** A local flash appears for drops added close to the end point (and fades on swirling). */
export function showsFlash(delivered: number, endPoint: number, settings: LabSettings): boolean {
  return delivered < endPoint && endPoint - delivered <= settings.endPoint.flashWindow;
}

/* ---------- Concordance ---------- */

export const titreOf = (initial: number, final: number) => round(final - initial, 2);

/** True when all the titres agree within the tolerance (default 0.10 cm³). */
export function areConcordant(titres: number[], tolerance = 0.1): boolean {
  if (titres.length < 2) return false;
  return Math.max(...titres) - Math.min(...titres) <= tolerance + 1e-9;
}

/** The largest group of titres that agree within the tolerance (indexes), best for averaging. */
export function bestConcordantSet(titres: number[], tolerance = 0.1): number[] {
  let best: number[] = [];
  titres.forEach((t) => {
    const group = titres.map((x, i) => [x, i] as const).filter(([x]) => x >= t - 1e-9 && x <= t + tolerance + 1e-9).map(([, i]) => i);
    if (group.length > best.length) best = group;
  });
  return best.length >= 2 ? best : [];
}

export type ChoiceIssue = "tooFew" | "includesRough" | "notConcordant" | "missedConcordant";

/** Checks the titres the learner chose to average (index 0 may be the rough titration). */
export function checkChosenTitres(titres: number[], chosen: number[], opts: { roughIndex?: number; tolerance?: number; minimum?: number } = {}): ChoiceIssue[] {
  const tol = opts.tolerance ?? 0.1;
  const issues: ChoiceIssue[] = [];
  if (opts.roughIndex !== undefined && chosen.includes(opts.roughIndex)) issues.push("includesRough");
  if (chosen.length < (opts.minimum ?? 2)) issues.push("tooFew");
  else if (!areConcordant(chosen.map((i) => titres[i]), tol)) issues.push("notConcordant");
  const accurate = titres.map((_, i) => i).filter((i) => i !== opts.roughIndex);
  const left = accurate.filter((i) => !chosen.includes(i));
  // A concordant titre left out of an otherwise valid set.
  if (!issues.length && left.some((i) => areConcordant([...chosen, i].map((j) => titres[j]), tol))) issues.push("missedConcordant");
  return issues;
}

/** Mean titre to 2 decimal places. */
export function meanTitre(titres: number[]): number {
  return round(titres.reduce((a, b) => a + b, 0) / titres.length, 2);
}
