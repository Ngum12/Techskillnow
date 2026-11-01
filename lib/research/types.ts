/** Task shapes for the research-project course (Your Final Year Project). */

/** Goals in the practice search engine, done in order. */
export type SearchGoal =
  /** Any search with at least `minWords` meaningful words. */
  | { kind: "search"; minWords?: number; instruction: string; done: string }
  /** A search naming at least `facets` of: population, place, period, angle. */
  | { kind: "narrow"; facets: number; instruction: string; done: string }
  | { kind: "operator"; operator: "quotes" | "pdf" | "site"; instruction: string; done: string }
  /** Open `count` results; `academic` requires a thesis, journal article, report or book. */
  | { kind: "open"; academic: boolean; count?: number; instruction: string; done: string }
  /** Save `count` academic sources to "My sources". */
  | { kind: "save"; count: number; instruction: string; done: string };

export type GoogleSearchTask = {
  type: "googleSearch";
  engine: "google" | "scholar";
  goals: SearchGoal[];
  success: string;
};

/** Tap each card into the right bucket; every answer explains why. */
export type CardSortTask = {
  type: "cardSort";
  instruction: string;
  buckets: { id: string; label: string }[];
  cards: { text: string; detail?: string; answer: string; why: string }[];
  /** Cards that must be right the first time to pass (the rest can be corrected). */
  required: number;
  success: string;
};

/** Build a topic from broad to narrow: idea → population → place → angle → period. */
export type TopicFunnelTask = {
  type: "topicFunnel";
  instruction: string;
  fields: {
    id: string;
    label: string;
    ideas: string[];
    populations: string[];
    places: string[];
    angles: string[];
    periods: string[];
  }[];
  success: string;
};

/** Match each objective to the research question it answers, or mark it as not fitting. */
export type AlignmentTask = {
  type: "alignment";
  topic: string;
  problem: string;
  questions: string[];
  objectives: { text: string; question: number | null; why: string }[];
  success: string;
};

/** Read a source, then fill a reading note card. */
export type NoteCardTask = {
  type: "noteCard";
  instruction: string;
  sourceId: string;
  fields: { label: string; options: string[]; answer: number; why: string }[];
  success: string;
};

/** Build APA references by tapping the pieces in order, then choose the in-text citation. */
export type ReferenceBuilderTask = {
  type: "referenceBuilder";
  instruction: string;
  rounds: { label: string; pieces: string[]; intext: { options: string[]; answer: number; why: string } }[];
  success: string;
};

/** Count questionnaire answers into a frequency table with percentages. */
export type DataTallyTask = {
  type: "dataTally";
  instruction: string;
  question: string;
  options: string[];
  /** One answer (index into options) per respondent. */
  responses: number[];
  chart: { question: string; options: string[]; answer: number; why: string };
  success: string;
};

/** Page through a complete sample project, then find where things are. */
export type ProjectAnatomyTask = {
  type: "projectAnatomy";
  instruction: string;
  project: { title: string; student: string; matricule: string; degree: string; department: string; university: string; supervisor: string; date: string };
  /** `body`: the lines written on the page (the cover is drawn from `project`). */
  pages: { id: string; label: string; note: string; body: string[] }[];
  quiz: { question: string; answer: string; why: string }[];
  success: string;
};

/** The learner's own topic, checked and ready for the supervisor. */
export type TopicCardTask = { type: "topicCard"; instruction: string; success: string };

export type ResearchTask =
  | GoogleSearchTask
  | CardSortTask
  | TopicFunnelTask
  | AlignmentTask
  | NoteCardTask
  | ReferenceBuilderTask
  | DataTallyTask
  | ProjectAnatomyTask
  | TopicCardTask;
