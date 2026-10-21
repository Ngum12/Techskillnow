import { createHash } from "node:crypto";
import { hasClosing, hasGreeting } from "./rules";
import { fold } from "./cv/keywords";
import { CV_FILE_NAME, type CheckedAttachment } from "./mission-cv-check";
import { hasAvailability } from "./cv/inbox-week";

/**
 * Final mission of "Applications That Get Answers".
 * Stage 1: a full application by email (short body, CV + cover letter as PDFs).
 * Stage 2: the learner answers the automatic reply ("missing document" or "interview invitation").
 */

export type AppEmail = { from: string; subject: string; text: string; attachments: CheckedAttachment[] };
export type ReplyKind = "missing_document" | "interview";

export type AppIssue =
  | "gmail"
  | "subject"
  | "bodyGreeting"
  | "bodyPurpose"
  | "bodyClosing"
  | "bodySignature"
  | "bodyLength"
  | "twoPdfs"
  | "cvFileName"
  | "letterFileName"
  | "unreadable"
  | "cvPages"
  | "letterRole"
  | "letterOrg"
  | "letterLength"
  | "letterGreeting"
  | "letterClosing"
  | "letterSignature";

export type ReplyIssue = "reply_gmail" | "reply_greeting" | "reply_closing" | "reply_attachment" | "reply_attachmentName" | "reply_availability" | "reply_thanks";

/** Firstname_Lastname_Cover_Letter.pdf, or the French Prenom_Nom_Lettre_de_motivation.pdf. */
export const LETTER_FILE_NAME = /^[a-z]+([_-][a-z]+)*[_-](cover[_-]?letter|motivation[_-]letter|lettre[_-]de[_-]motivation|lettre)\.pdf$/i;
const PHONE = /(\+?237[\s.-]?)?6([\s.-]?\d){8}/;
const PURPOSE = /\b(apply|applying|application|candidature|postuler|postule|attached|ci-joint)/i;
const THANKS = /\b(thank|thanks|grateful|merci|remercie)/i;
const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
const isPdf = (a: CheckedAttachment) => a.contentType === "application/pdf" || a.filename.toLowerCase().endsWith(".pdf");

/** The last lines of a letter carry a signature: the learner's name (any part) or a phone number. */
function signed(text: string, name: string): boolean {
  const tail = text.trim().split(/\n/).slice(-6).join(" ");
  const parts = fold(name).split(" ").filter((p) => p.length >= 3);
  return PHONE.test(tail) || parts.some((p) => fold(tail).includes(p));
}

export function checkApplicationMission(
  email: AppEmail,
  cfg: { gmail: string; name: string; roleWords: string[]; orgWords: string[]; maxLetterWords?: number; maxBodyWords?: number },
): AppIssue[] {
  const issues: AppIssue[] = [];
  const maxLetter = cfg.maxLetterWords ?? 350;
  const maxBody = cfg.maxBodyWords ?? 150;
  if (email.from.trim().toLowerCase() !== cfg.gmail.trim().toLowerCase()) issues.push("gmail");
  const subject = fold(email.subject);
  if (!cfg.roleWords.some((w) => subject.includes(fold(w)))) issues.push("subject");

  const body = email.text.replace(/\r/g, "");
  if (!hasGreeting(body)) issues.push("bodyGreeting");
  if (!PURPOSE.test(body) && !cfg.roleWords.some((w) => fold(body).includes(fold(w)))) issues.push("bodyPurpose");
  if (!hasClosing(body)) issues.push("bodyClosing");
  if (!PHONE.test(body)) issues.push("bodySignature");
  if (words(body) > maxBody) issues.push("bodyLength");

  const pdfs = email.attachments.filter(isPdf);
  if (pdfs.length < 2) {
    issues.push("twoPdfs");
  }
  // Identify the CV and the letter by file name first, then by content.
  const cv = pdfs.find((a) => CV_FILE_NAME.test(a.filename.trim())) ?? pdfs.find((a) => /\b(education|formation|skills|competences)\b/.test(fold(a.text ?? "")));
  const letter = pdfs.find((a) => LETTER_FILE_NAME.test(a.filename.trim())) ?? pdfs.find((a) => a !== cv);
  if (pdfs.length >= 1 && !pdfs.some((a) => CV_FILE_NAME.test(a.filename.trim()))) issues.push("cvFileName");
  if (pdfs.length >= 2 && !pdfs.some((a) => LETTER_FILE_NAME.test(a.filename.trim()))) issues.push("letterFileName");

  const unreadable = [cv, letter].some((a) => a && (a.pages === undefined || !a.text?.trim()));
  if (unreadable) issues.push("unreadable");
  if (cv?.pages !== undefined && cv.pages > 2) issues.push("cvPages");
  if (letter?.text?.trim()) {
    const t = letter.text;
    const ft = fold(t);
    if (!cfg.roleWords.some((w) => ft.includes(fold(w)))) issues.push("letterRole");
    if (!cfg.orgWords.some((w) => ft.includes(fold(w)))) issues.push("letterOrg");
    if (words(t) > maxLetter) issues.push("letterLength");
    if (!hasGreeting(t) && !/(^|\n)\s*(dear|madame|monsieur)\b/i.test(t)) issues.push("letterGreeting");
    if (!hasClosing(t)) issues.push("letterClosing");
    if (!signed(t, cfg.name)) issues.push("letterSignature");
  }
  return issues;
}

/** Words a sensible file name for the requested diploma would contain. */
const DIPLOMA_FILE = /(diploma|certificate|degree|transcript|hnd|bts|bsc|licence|bachelor|master|gce|bac|diplome|diplôme|attestation|releve)/i;

export function checkReplyMission(kind: ReplyKind, email: AppEmail, gmail: string): ReplyIssue[] {
  const issues: ReplyIssue[] = [];
  const body = email.text.replace(/\r/g, "");
  // Ignore the quoted original message below the learner's answer.
  const answer = body.split(/\n(?:on .+wrote:|le .+a écrit\s*:|-{2,}\s*(?:original|message))/i)[0];
  if (email.from.trim().toLowerCase() !== gmail.trim().toLowerCase()) issues.push("reply_gmail");
  if (!hasGreeting(answer)) issues.push("reply_greeting");
  if (!hasClosing(answer)) issues.push("reply_closing");
  if (kind === "missing_document") {
    const files = email.attachments.filter((a) => !CV_FILE_NAME.test(a.filename) && !LETTER_FILE_NAME.test(a.filename));
    if (!files.length) issues.push("reply_attachment");
    else if (!files.some((a) => DIPLOMA_FILE.test(a.filename))) issues.push("reply_attachmentName");
  } else {
    if (!hasAvailability(answer)) issues.push("reply_availability");
    if (!THANKS.test(answer)) issues.push("reply_thanks");
  }
  return issues;
}

/** Stable per learner: half get "missing document", half "interview invitation". */
export function pickReplyKind(code: string): ReplyKind {
  return createHash("sha256").update(`reply:${code}`).digest()[0] % 2 === 0 ? "missing_document" : "interview";
}

/** A short reference such as "NYF-48213", stable per learner. */
export function missionReference(prefix: string, code: string): string {
  const n = createHash("sha256").update(`ref:${code}`).digest().readUInt32BE(0);
  return `${prefix}-${10000 + (n % 90000)}`;
}

export function fillTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
