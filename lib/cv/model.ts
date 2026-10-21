/** The learner's CV: one per learner profile, shared by every "Get the Job" course. */

export type CvExperience = { id: string; title: string; org: string; place: string; start: string; end: string; bullets: string[] };
export type CvEducation = { id: string; degree: string; school: string; place: string; start: string; end: string; details: string };
export type SkillLevel = "basic" | "good" | "veryGood" | "expert";
export type CvSkill = { id: string; name: string; level: SkillLevel };
export type LanguageLevel = "native" | "fluent" | "good" | "basic";
export type CvLanguage = { id: string; name: string; level: LanguageLevel };
/** Raw answers from the experience interview, kept so the learner sees "before" vs "after". */
export type CvRawExperience = { id: string; question: string; what: string; where: string; when: string; result: string };
export type CvTrackerRow = { id: string; org: string; role: string; date: string; reference: string; status: string };

export type CvSectionId = "profile" | "experience" | "education" | "skills" | "languages" | "interests";

export type CvData = {
  header: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    linkedin: string;
    /** Local norms (date of birth, marital status) are the learner's choice. */
    showDob: boolean;
    dob: string;
    showMarital: boolean;
    marital: string;
  };
  profile: string;
  experiences: CvExperience[];
  raw: CvRawExperience[];
  education: CvEducation[];
  skills: CvSkill[];
  languages: CvLanguage[];
  interests: string;
  layout: "fresher" | "experienced";
  /** Tailored versions per advert id: profile text and skill order (skill ids). */
  tailored: Record<string, { profile: string; skills: string[] }>;
  tracker: CvTrackerRow[];
};

export const SKILL_LEVELS: SkillLevel[] = ["basic", "good", "veryGood", "expert"];
export const LANGUAGE_LEVELS: LanguageLevel[] = ["native", "fluent", "good", "basic"];

export function emptyCv(): CvData {
  return {
    header: { fullName: "", email: "", phone: "", city: "", linkedin: "", showDob: false, dob: "", showMarital: false, marital: "" },
    profile: "",
    experiences: [],
    raw: [],
    education: [],
    skills: [],
    languages: [],
    interests: "",
    layout: "fresher",
    tailored: {},
    tracker: [],
  };
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ---------- Parsing untrusted input (server and client) ---------- */

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.slice(0, max) : "");
const bool = (v: unknown) => v === true;
const id = (v: unknown) => (typeof v === "string" && /^[a-z0-9]{1,16}$/i.test(v) ? v : newId());
const list = <T>(v: unknown, max: number, map: (x: Record<string, unknown>) => T): T[] =>
  (Array.isArray(v) ? v : []).slice(0, max).filter((x) => x && typeof x === "object").map((x) => map(x as Record<string, unknown>));
const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T => (options.includes(v as T) ? (v as T) : fallback);

/** Turns any JSON into a valid, size-limited CvData. Unknown fields are dropped. */
export function parseCv(input: unknown): CvData {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const h = (o.header && typeof o.header === "object" ? o.header : {}) as Record<string, unknown>;
  const tailoredIn = (o.tailored && typeof o.tailored === "object" ? o.tailored : {}) as Record<string, unknown>;
  const tailored: CvData["tailored"] = {};
  for (const [key, value] of Object.entries(tailoredIn).slice(0, 10)) {
    if (!/^[a-z0-9-]{1,40}$/i.test(key) || !value || typeof value !== "object") continue;
    const v = value as Record<string, unknown>;
    tailored[key] = { profile: str(v.profile, 800), skills: (Array.isArray(v.skills) ? v.skills : []).slice(0, 30).map((s) => str(s, 16)) };
  }
  return {
    header: {
      fullName: str(h.fullName, 80),
      email: str(h.email, 120),
      phone: str(h.phone, 30),
      city: str(h.city, 60),
      linkedin: str(h.linkedin, 150),
      showDob: bool(h.showDob),
      dob: str(h.dob, 30),
      showMarital: bool(h.showMarital),
      marital: str(h.marital, 30),
    },
    profile: str(o.profile, 800),
    experiences: list(o.experiences, 12, (x) => ({
      id: id(x.id),
      title: str(x.title, 80),
      org: str(x.org, 100),
      place: str(x.place, 60),
      start: str(x.start, 20),
      end: str(x.end, 20),
      bullets: (Array.isArray(x.bullets) ? x.bullets : []).slice(0, 6).map((b) => str(b, 260)),
    })),
    raw: list(o.raw, 20, (x) => ({
      id: id(x.id),
      question: str(x.question, 40),
      what: str(x.what, 300),
      where: str(x.where, 100),
      when: str(x.when, 40),
      result: str(x.result, 200),
    })),
    education: list(o.education, 8, (x) => ({
      id: id(x.id),
      degree: str(x.degree, 100),
      school: str(x.school, 100),
      place: str(x.place, 60),
      start: str(x.start, 20),
      end: str(x.end, 20),
      details: str(x.details, 200),
    })),
    skills: list(o.skills, 20, (x) => ({ id: id(x.id), name: str(x.name, 60), level: oneOf(x.level, SKILL_LEVELS, "good") })),
    languages: list(o.languages, 8, (x) => ({ id: id(x.id), name: str(x.name, 30), level: oneOf(x.level, LANGUAGE_LEVELS, "good") })),
    interests: str(o.interests, 200),
    layout: oneOf(o.layout, ["fresher", "experienced"] as const, "fresher"),
    tailored,
    tracker: list(o.tracker, 50, (x) => ({
      id: id(x.id),
      org: str(x.org, 100),
      role: str(x.role, 100),
      date: str(x.date, 20),
      reference: str(x.reference, 40),
      status: str(x.status, 30),
    })),
  };
}

/* ---------- Derived views ---------- */

/** Section order: freshers lead with education, experienced candidates with experience. */
export function sectionOrder(cv: CvData): CvSectionId[] {
  return cv.layout === "experienced"
    ? ["profile", "experience", "education", "skills", "languages", "interests"]
    : ["profile", "education", "experience", "skills", "languages", "interests"];
}

/** The CV with a tailored profile and skill order applied, if one exists for this advert. */
export function withTailoring(cv: CvData, advertId?: string): CvData {
  const t = advertId ? cv.tailored[advertId] : undefined;
  if (!t) return cv;
  const byId = new Map(cv.skills.map((s) => [s.id, s]));
  const ordered = t.skills.map((sid) => byId.get(sid)).filter((s): s is CvSkill => !!s);
  const rest = cv.skills.filter((s) => !t.skills.includes(s.id));
  return { ...cv, profile: t.profile || cv.profile, skills: [...ordered, ...rest] };
}

export type CvGap = "name" | "email" | "phone" | "profile" | "experienceOrEducation" | "skills" | "languages";

/** What is still missing before the CV can be exported. */
export function cvGaps(cv: CvData): CvGap[] {
  const gaps: CvGap[] = [];
  if (cv.header.fullName.trim().split(/\s+/).length < 2) gaps.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(cv.header.email.trim())) gaps.push("email");
  if (cv.header.phone.replace(/\D/g, "").length < 9) gaps.push("phone");
  if (cv.profile.trim().split(/\s+/).length < 12) gaps.push("profile");
  if (!cv.education.some((e) => e.degree.trim()) && !cv.experiences.some((e) => e.title.trim())) gaps.push("experienceOrEducation");
  if (cv.skills.filter((s) => s.name.trim()).length < 3) gaps.push("skills");
  if (cv.languages.filter((l) => l.name.trim()).length < 1) gaps.push("languages");
  return gaps;
}

/** Firstname_Lastname_CV.pdf, ASCII only. */
export function cvFileName(fullName: string, suffix = "CV"): string {
  const parts = fullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z\s-]/g, " ")
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
  return `${parts.length ? parts.join("_") : "My"}_${suffix}.pdf`;
}

/**
 * The CV as text in two parts, for keyword scoring: "top" is what a recruiter reads first
 * (profile and the first five skills); "rest" is everything else.
 */
export function cvText(cv: CvData): { top: string; rest: string } {
  const skills = cv.skills.filter((s) => s.name.trim());
  return {
    top: [cv.profile, ...skills.slice(0, 5).map((s) => s.name)].join("\n"),
    rest: [
      ...skills.slice(5).map((s) => s.name),
      ...cv.experiences.flatMap((e) => [e.title, e.org, ...e.bullets]),
      ...cv.education.flatMap((e) => [e.degree, e.school, e.details]),
      ...cv.languages.map((l) => l.name),
      cv.interests,
    ].join("\n"),
  };
}

export function isEmptyCv(cv: CvData): boolean {
  return (
    !cv.header.fullName && !cv.profile && cv.experiences.length === 0 && cv.education.length === 0 && cv.skills.length === 0 && cv.raw.length === 0
  );
}
