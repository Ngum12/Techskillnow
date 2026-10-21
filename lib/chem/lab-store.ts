/**
 * The learner's lab state on this phone, carried between the titration steps: preparation choices
 * (applied silently), the current experiment, the latest results and the lab notebook.
 */
import type { Experiment, PrepChoices } from "./titration";

export type NotebookEntry = { text: string; attempts: number };
export type LabResult = { systemId: string; flaskConc: number; titres: number[]; chosen: number[]; mean: number; roughIndex: number };

const KEYS = { prep: "tsn_chem_prep", experiment: "tsn_chem_experiment", result: "tsn_chem_result", notebook: "tsn_chem_notebook" } as const;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const labStore = {
  prep: () => read<PrepChoices>(KEYS.prep),
  setPrep: (p: PrepChoices) => write(KEYS.prep, p),
  experiment: () => read<Experiment>(KEYS.experiment),
  setExperiment: (e: Experiment) => write(KEYS.experiment, e),
  result: () => read<LabResult>(KEYS.result),
  setResult: (r: LabResult) => write(KEYS.result, r),
  notebook: () => read<Record<string, NotebookEntry>>(KEYS.notebook) ?? {},
  saveEntry(id: string, text: string) {
    const all = labStore.notebook();
    write(KEYS.notebook, { ...all, [id]: { text, attempts: (all[id]?.attempts ?? 0) + 1 } });
  },
};
