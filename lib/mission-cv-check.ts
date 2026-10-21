import { hasClosing, hasGreeting } from "./rules";
import { fold } from "./cv/keywords";

/** A PDF attachment after the server has read it (content is never stored). */
export type CheckedAttachment = { filename: string; contentType?: string; pages?: number; text?: string };

export type CvMissionEmail = { from: string; subject: string; text: string; attachments: CheckedAttachment[] };

export type CvMissionIssue =
  | "gmail"
  | "subject"
  | "pdf"
  | "fileName"
  | "unreadable"
  | "pages"
  | "cvEmail"
  | "cvPhone"
  | "cvSections"
  | "greeting"
  | "closing"
  | "signature";

const PHONE = /(\+?237[\s.-]?)?6([\s.-]?\d){8}/;
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
/** Firstname_Lastname_CV.pdf (two or more names, any case, _ or - between). */
export const CV_FILE_NAME = /^[a-z]+([_-][a-z]+)+[_-]cv\.pdf$/i;

const SECTION_WORDS: Record<"education" | "skills" | "experience", RegExp> = {
  education: /\b(education|formation|etudes|diplomes?|qualifications?)\b/,
  skills: /\b(skills|competences|aptitudes)\b/,
  experience: /\b(experience|experiences|work history|parcours professionnel|stages?|volunteer|benevolat)\b/,
};

/**
 * Checks a real CV sent by email for the final mission.
 * The CV must be a readable PDF of at most 2 pages with contact details and the core sections.
 */
export function checkCvMission(email: CvMissionEmail, expectedGmail: string, roleWords: string[]): CvMissionIssue[] {
  const issues: CvMissionIssue[] = [];
  if (email.from.trim().toLowerCase() !== expectedGmail.trim().toLowerCase()) issues.push("gmail");

  const subject = fold(email.subject);
  if (!roleWords.some((w) => subject.includes(fold(w)))) issues.push("subject");

  const pdfs = email.attachments.filter((a) => a.contentType === "application/pdf" || a.filename.toLowerCase().endsWith(".pdf"));
  const cv = pdfs.find((a) => CV_FILE_NAME.test(a.filename.trim())) ?? pdfs[0];
  if (!cv) {
    issues.push("pdf");
  } else {
    if (!CV_FILE_NAME.test(cv.filename.trim())) issues.push("fileName");
    if (cv.pages === undefined || cv.text === undefined || !cv.text.trim()) {
      issues.push("unreadable");
    } else {
      if (cv.pages > 2) issues.push("pages");
      if (!EMAIL.test(cv.text)) issues.push("cvEmail");
      if (!PHONE.test(cv.text)) issues.push("cvPhone");
      const t = fold(cv.text);
      if (!SECTION_WORDS.education.test(t) || !SECTION_WORDS.skills.test(t) || !SECTION_WORDS.experience.test(t)) issues.push("cvSections");
    }
  }

  const body = email.text.replace(/\r/g, "");
  if (!hasGreeting(body)) issues.push("greeting");
  if (!hasClosing(body)) issues.push("closing");
  if (!PHONE.test(body)) issues.push("signature");
  return issues;
}
