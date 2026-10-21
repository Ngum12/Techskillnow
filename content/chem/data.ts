/**
 * Typed access to the editable chemistry data in this folder. Edit the .json files, not this one.
 * Section C (salt analysis) will add its own JSON files here and a loader beside these.
 */
import settingsJson from "./settings.json" with { type: "json" };
import titrationsJson from "./titrations.json" with { type: "json" };
import errorsJson from "./errors.json" with { type: "json" };
import markingJson from "./marking-points.json" with { type: "json" };
import apparatusJson from "./apparatus.json" with { type: "json" };
import type { ErrorData, Indicator, LabSettings, TitrationSystem } from "../../lib/chem/titration";
import type { Checkpoint } from "../../lib/chem/marking";

export type ExamSettings = {
  minutes: number;
  titreMarks: { within: number; marks: number }[];
  concordanceMarks: number;
  recordingMarks: number;
  calculationMarkPerBox: number;
  passPercent: number;
};
export type ChemSettings = LabSettings & {
  labels: { practicalPaper: string; describeAnswer: string };
  calculation: { relativeTolerance: number };
  exam: ExamSettings;
};
export type Scenario = { id: string; situation: string; effect: Effect3; reasons: string[]; answer: number };
export type MethodChallenge = { id: string; lines: string[]; faulty: number; fix: string; effect: Effect3; reasons: string[]; answer: number };
export type Effect3 = "higher" | "lower" | "none";
export type Apparatus = { items: { id: string; name: string; use: string }[]; tasks: { task: string; answer: string; why: string }[] };

export const chemSettings = settingsJson as ChemSettings;
export const systems = titrationsJson.systems as TitrationSystem[];
export const indicators = titrationsJson.indicators as Indicator[];
export const errorData = errorsJson as unknown as ErrorData & { scenarios: Scenario[]; methodChallenges: MethodChallenge[] };
export const checkpoints = markingJson.checkpoints as Checkpoint[];
export const apparatus = apparatusJson as Apparatus;
