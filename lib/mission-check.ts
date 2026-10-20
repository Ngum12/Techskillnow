import type { Mission } from "@/content/types";
import { hasClosing, hasGreeting, wordCount } from "./rules";

export type InboundEmail = {
  from: string;
  subject: string;
  text: string;
  attachments: { filename: string; contentType?: string }[];
};

const FUN_WORDS = ["sexy", "baby", "boss", "queen", "king", "sweet", "princess", "lover", "swag", "cute", "bad", "fine", "chou", "bebe"];
const GENERIC_FILE = /^(scan|img|image|dsc|document|doc|untitled|file|fichier|new|nouveau|cv|whatsapp)?[\s_\-()]*\d*[\s_\-()]*\d*\.pdf$/i;
const PHONE = /(\+?237[\s.-]?)?6([\s.-]?\d){8}/;

export type MissionIssue = keyof Mission["messages"];

/**
 * Checks a real email sent for the mission. Returns the keys of everything that failed
 * (stored as keys so feedback shows in whichever language the learner uses).
 */
export function checkMissionEmail(subjectWords: string[], expectedGmail: string, email: InboundEmail): MissionIssue[] {
  const failed: MissionIssue[] = [];
  const from = email.from.trim().toLowerCase();
  const local = from.split("@")[0] ?? "";

  if (from !== expectedGmail.trim().toLowerCase()) failed.push("gmail");
  if (FUN_WORDS.some((w) => local.includes(w))) failed.push("nickname");

  const subject = email.subject.toLowerCase();
  if (!subjectWords.some((w) => subject.includes(w.toLowerCase()))) failed.push("subject");

  const pdfs = email.attachments.filter((a) => a.contentType === "application/pdf" || a.filename.toLowerCase().endsWith(".pdf"));
  if (pdfs.length === 0) failed.push("pdf");
  else if (pdfs.every((a) => GENERIC_FILE.test(a.filename.trim()))) failed.push("fileName");

  const body = email.text.replace(/\r/g, "");
  if (!hasGreeting(body)) failed.push("greeting");
  if (!hasClosing(body)) failed.push("closing");
  if (!PHONE.test(body)) failed.push("signature");
  if (wordCount(body) < 30) failed.push("length");

  return failed;
}

/** Turns stored feedback (issue keys, or "note:" text from the admin) into messages. */
export function missionFeedback(mission: Mission, feedback: string[]): string[] {
  return feedback.map((f) => (f.startsWith("note:") ? f.slice(5) : (mission.messages[f as MissionIssue] ?? f)));
}

export function isGmail(address: string): boolean {
  return /^[a-z0-9.+_-]{3,64}@gmail\.com$/i.test(address.trim());
}
