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

export type Task = MultipleChoiceTask | FixTextTask | ComposeTask | InboxTask | SignupTask;

export type Step = {
  title: string;
  illustration?: string;
  body: string[];
  mistake?: string;
  task?: Task;
  /** Alternative versions of the task. Each paid learner gets one, chosen from their code. */
  variants?: Task[];
};

export type AssessmentQuestion = {
  question: string;
  options: string[];
  answer: number;
  /** The step this question checks; used for spaced review. */
  step: number;
};

/** The real-world mission: an actual email the learner sends from their own Gmail. */
export type Mission = {
  intro: string;
  steps: string[];
  /** Words the subject must contain (any of). */
  subjectWords: string[];
  messages: {
    gmail: string;
    nickname: string;
    subject: string;
    pdf: string;
    fileName: string;
    greeting: string;
    closing: string;
    signature: string;
    length: string;
  };
};

export type Course = {
  id: string;
  locale: Locale;
  title: string;
  promise: string;
  /** Number of leading steps available without a code. */
  freeSteps: number;
  steps: Step[];
  /** Final test questions; `warmup` picks the few (by index) used in the optional warm-up at the start. */
  assessment: { passMark: number; warmup: number[]; questions: AssessmentQuestion[] };
  mission: Mission;
};
