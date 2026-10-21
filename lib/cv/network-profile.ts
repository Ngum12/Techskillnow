import type { CvData } from "./model";

/** "Profile strength" checks for the professional networking profile. */

export type NetworkCheck = "headlineRole" | "headlineSeek" | "headlineLength" | "aboutLength" | "aboutFirstPerson" | "experienceResults" | "skills" | "photo";

export const NETWORK_CHECKS: NetworkCheck[] = ["headlineRole", "headlineSeek", "headlineLength", "aboutLength", "aboutFirstPerson", "experienceResults", "skills", "photo"];

const wordCount = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
// Accent-safe word starts: (^|non-letter). Prefix matching lets "assistant" also match "assistante".
const startsAny = (words: string[]) => new RegExp(`(^|[^\\p{L}])(${words.join("|")})`, "iu");
/** Says what the person does or studied. */
const ROLE = startsAny([
  "graduate", "student", "assistant", "officer", "accountant", "agent", "teacher", "tutor", "developer", "technician", "secretary",
  "nurse", "marketer", "sales", "marketing", "accounting", "logistic", "administrat", "engineer", "volunteer", "manager", "cashier",
  "driver", "designer", "diplômé", "diplome", "étudiant", "etudiant", "comptab", "commercial", "enseignant", "technicien", "secrétaire",
  "secretaire", "infirmi", "bénévole", "benevole", "stagiaire", "chargé", "gestionnaire", "vendeu", "logisticien",
]);
/** Says what they are looking for. */
const SEEK = startsAny(["seeking", "looking for", "open to", "available for", "aspiring", "interested in", "en recherche", "recherche", "ouvert", "disponible pour", "à la recherche"]);
/** Written in the first person (whole words only). */
const FIRST_PERSON = /(^|[^\p{L}])(i|i'm|i've|my|me|je|j'|j’|mon|ma|mes)(?![\p{L}])/iu;

export function networkChecks(cv: CvData): Record<NetworkCheck, boolean> {
  const n = cv.network;
  const about = wordCount(n.about);
  return {
    headlineRole: ROLE.test(n.headline),
    headlineSeek: SEEK.test(n.headline),
    headlineLength: n.headline.trim().length >= 20 && n.headline.trim().length <= 120,
    aboutLength: about >= 40 && about <= 200,
    aboutFirstPerson: FIRST_PERSON.test(n.about),
    experienceResults: cv.experiences.some((e) => e.bullets.some((b) => /\d/.test(b))),
    skills: n.skills.filter((s) => s.trim()).length >= 5,
    photo: n.photo.length >= 3 && n.photo.every(Boolean),
  };
}

export function networkStrength(cv: CvData): number {
  const checks = networkChecks(cv);
  return Math.round((NETWORK_CHECKS.filter((c) => checks[c]).length / NETWORK_CHECKS.length) * 100);
}
