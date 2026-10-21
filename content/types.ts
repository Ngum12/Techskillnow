export type Locale = "en" | "fr";

/** A rule checked against a piece of text the learner wrote. */
export type TextRule =
  | { kind: "notEmpty"; message: string }
  | { kind: "includesAny"; words: string[]; message: string }
  | { kind: "excludesAll"; words: string[]; message: string }
  | { kind: "minWords"; n: number; message: string }
  | { kind: "maxWords"; n: number; message: string }
  | { kind: "changed"; message: string }
  | { kind: "regex"; pattern: string; flags?: string; message: string };

export type ComposeField = "to" | "cc" | "subject" | "body";

/** A rule checked against the whole mock email. */
export type ComposeRule =
  | { kind: "validEmail"; field: "to" | "cc"; optional?: boolean; message: string }
  | { kind: "equals"; field: "to" | "cc"; value: string; message: string }
  | { kind: "attachment"; file?: string; message: string }
  | { kind: "noAttachment"; file: string; message: string }
  | { kind: "greeting"; message: string }
  | { kind: "closing"; message: string }
  | ({ field: ComposeField } & TextRule);

export type MultipleChoiceTask = {
  type: "multipleChoice";
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  /** Optional hint per wrong option, indexed like options. */
  hints?: (string | null)[];
};

export type FixTextTask = {
  type: "fixText";
  instruction: string;
  initial: string;
  multiline?: boolean;
  rules: TextRule[];
  success: string;
};

export type ComposeTask = {
  type: "compose";
  instruction: string;
  /** Context shown above the form, e.g. the job advert. */
  context?: string;
  initial?: Partial<Record<ComposeField, string>>;
  files: string[];
  rules: ComposeRule[];
  success: string;
};

export type InboxEmail = {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
};

export type InboxAction = "open" | "archive" | "spam";

export type InboxGoal = {
  action: InboxAction;
  target: string;
  instruction: string;
  /** Shown when the learner does this goal's action on the wrong email. */
  wrong: string;
  done: string;
};

export type InboxTask = {
  type: "inbox";
  emails: InboxEmail[];
  goals: InboxGoal[];
  success: string;
};

export type SignupTask = {
  type: "signup";
  instruction: string;
  success: string;
};

/* ---------- Course 2+ ("Get the Job") simulations ---------- */

/** A sample CV shown in simulations (not the learner's own). */
export type SampleCv = {
  layout: "messy" | "clean";
  name: string;
  contact: string;
  sections: { heading: string; lines: string[] }[];
};

export type RecruiterScanTask = {
  type: "recruiterScan";
  instruction: string;
  seconds: number;
  rounds: { label: string; cv: SampleCv; questions: { question: string; options: string[]; answer: number }[] }[];
  /** Shown after both rounds, comparing the scores. */
  lesson: string;
};

export type AdvertLabel = "must" | "nice" | "deadline" | "documents" | "apply";
/** Plain text, or a tappable phrase with its correct label (null = not important) and the reason. */
export type AdvertPart = string | { text: string; label: AdvertLabel | null; why: string };
export type JobAdvert = { org: string; title: string; location: string; paragraphs: AdvertPart[][] };

export type AdvertHighlightTask = {
  type: "advertHighlight";
  instruction: string;
  advert: JobAdvert;
  /** Percentage of tappable phrases that must be labelled correctly. */
  passPercent: number;
  success: string;
};

export type MinerQuestion = {
  id: string;
  ask: string;
  examples: string;
  /** Used to suggest a CV title, e.g. "Volunteer". */
  titleHint: string;
  followUps: { key: "what" | "where" | "when" | "result"; ask: string; placeholder: string }[];
};

export type ExperienceMinerTask = { type: "experienceMiner"; intro: string; questions: MinerQuestion[]; success: string };

export type SectionOrderTask = {
  type: "sectionOrder";
  rounds: { persona: string; instruction: string; sections: { id: string; label: string; why: string }[]; answer: string[] }[];
  success: string;
};

export type CvHeaderTask = { type: "cvHeader"; instruction: string; localNorm: string; internationalNorm: string; success: string };

export type CvProfileTask = {
  type: "cvProfile";
  fix: { instruction: string; initial: string; rules: TextRule[] };
  own: { instruction: string; example: string; rules: TextRule[] };
  success: string;
};

export type BulletBuilderTask = {
  type: "bulletBuilder";
  instruction: string;
  verbs: string[];
  example: { verb: string; task: string; result: string; before: string };
  required: number;
  success: string;
};

export type CvEducationSkillsTask = { type: "cvEducationSkills"; instruction: string; honesty: string; minSkills: number; success: string };

/** One line of the bad CV: plain text or tappable errors (by error id). */
export type RedPenLine = { style?: "title" | "heading" | "fancy" | "small"; parts: (string | { text: string; error: string })[] };

export type RedPenTask = {
  type: "redPen";
  instruction: string;
  lines: RedPenLine[];
  errors: { id: string; label: string; why: string }[];
  passPercent: number;
  success: string;
};

export type CvExportTask = { type: "cvExport"; instruction: string; success: string };

export type KeywordAdvert = { id: string; org: string; title: string; text: string; terms: string[] };

export type KeywordMatchTask = { type: "keywordMatch"; instruction: string; adverts: KeywordAdvert[]; allowPaste: boolean; success: string };

export type TailorTask = { type: "tailor"; instruction: string; adverts: KeywordAdvert[]; success: string };

export type CoverLetterTask = {
  type: "coverLetter";
  instruction: string;
  advert: { org: string; role: string; contact: string; text: string };
  maxWords: number;
  success: string;
};

export type PortalTask = {
  type: "portal";
  portalName: string;
  org: string;
  role: string;
  motivationQuestion: string;
  wordLimit: number;
  maxFileMb: number;
  /** File extensions accepted for uploads, e.g. ["pdf"]. */
  allowedTypes: string[];
  refPrefix: string;
  /** Other emails already in the inbox when the confirmation arrives. */
  inbox: InboxEmail[];
  success: string;
};

export type InterviewTask = {
  type: "interview";
  instruction: string;
  seconds: number;
  cards: { question: string; tip: string; model: string }[];
  required: number;
  success: string;
};

/** Display-only: the advert for the final mission, shown on the last lesson step. */
export type MissionBriefTask = { type: "missionBrief"; advert: { org: string; title: string; text: string }; points: string[] };

export type Task =
  | MultipleChoiceTask
  | FixTextTask
  | ComposeTask
  | InboxTask
  | SignupTask
  | RecruiterScanTask
  | AdvertHighlightTask
  | ExperienceMinerTask
  | SectionOrderTask
  | CvHeaderTask
  | CvProfileTask
  | BulletBuilderTask
  | CvEducationSkillsTask
  | RedPenTask
  | CvExportTask
  | KeywordMatchTask
  | TailorTask
  | CoverLetterTask
  | PortalTask
  | InterviewTask
  | MissionBriefTask;

/** Which part of the learner's CV a step fills (used by "My CV" to jump back to it). */
export type CvSection = "experience" | "header" | "profile" | "bullets" | "education" | "export";

export type Step = {
  title: string;
  illustration?: string;
  body: string[];
  mistake?: string;
  task?: Task;
  /** Alternative versions of the task. Each paid learner gets one, chosen from their code. */
  variants?: Task[];
  cvSection?: CvSection;
};

export type AssessmentQuestion = {
  question: string;
  options: string[];
  answer: number;
  /** The step this question checks; used for spaced review. */
  step: number;
};

/**
 * The real-world mission: an actual email the learner sends from their own Gmail.
 * "email" checks a job application email (course 1); "cv" also opens and checks the attached CV.
 */
export type Mission = {
  kind: "email" | "cv";
  intro: string;
  steps: string[];
  /** Words the subject must contain (any of): "application" for email, the role for cv. */
  subjectWords: string[];
  /** The advert the CV must be tailored to ("cv" missions). */
  advert?: { org: string; title: string; text: string };
  /** Suggested subject line; {name} is replaced with the learner's name. */
  subjectExample?: string;
  /** Feedback per failed check, keyed by issue id. */
  messages: Record<string, string>;
};

export type Course = {
  id: string;
  locale: Locale;
  title: string;
  promise: string;
  /** Price in FCFA. */
  price: number;
  /** Series label, e.g. "Get the Job · 1 of 4". */
  series?: string;
  /** Courses that build the learner's shared CV show "My CV" and save the draft. */
  usesCv?: boolean;
  /** Number of leading steps available without a code. */
  freeSteps: number;
  steps: Step[];
  /** Final test questions; `warmup` picks the few (by index) used in the optional warm-up at the start. */
  assessment: { passMark: number; warmup: number[]; questions: AssessmentQuestion[] };
  mission: Mission;
};
