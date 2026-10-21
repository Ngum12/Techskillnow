import type { WeekEventKind } from "@/content/types";
import { hasGreeting } from "../rules";

/** Scoring for "the week after you apply": the right action, on time, on every message. */

export type WeekReply = { text: string; attachments: string[] };
export type WeekAction = { eventId: string; type: "reply" | "report" | "archive"; at: number; reply?: WeekReply };
export type WeekEvent = { id: string; at: number; kind: WeekEventKind; application: "A" | "B" | null; deadlineHours?: number };
export type WeekIssue =
  | "noAction"
  | "wrongAction"
  | "late"
  | "missingAttachment"
  | "noAvailability"
  | "notGracious"
  | "repliedToScam"
  | "noGreeting";

export const STATUS_FOR: Record<Exclude<WeekEventKind, "scam">, string> = {
  ack: "acknowledged",
  missingDocument: "documentsSent",
  interview: "interview",
  rejection: "rejected",
};

const DAY = /\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b|\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|tomorrow|demain)\b|\b\d{1,2}(st|nd|rd|th)?\s+(nov|november|novembre|dec|december|décembre|decembre)\b|\b\d{1,2}[/.-]\d{1,2}\b/i;
const TIME = /\b\d{1,2}\s?(:|h)\s?\d{2}\b|\b\d{1,2}\s?(am|pm|h)\b/i;
const THANKS = /\b(thank|thanks|grateful|merci|remercie)/i;
const ATTACHED = /\b(attach|attached|attachment|please find|ci-joint|ci-jointe|pièce jointe|piece jointe|en pj)/i;

/** True if the text proposes a day and a time, e.g. "Tuesday at 10:00" or "mardi à 10h". */
export function hasAvailability(text: string): boolean {
  return DAY.test(text) && TIME.test(text);
}

export function judge(event: WeekEvent, action: WeekAction | undefined, requiredFile: string): { ok: boolean; issue?: WeekIssue } {
  if (!action) return { ok: false, issue: "noAction" };
  const late = event.deadlineHours !== undefined && action.at > event.at + event.deadlineHours;
  switch (event.kind) {
    case "scam":
      if (action.type === "reply") return { ok: false, issue: "repliedToScam" };
      return action.type === "report" ? { ok: true } : { ok: false, issue: "wrongAction" };
    case "ack":
      return action.type === "archive" ? { ok: true } : { ok: false, issue: "wrongAction" };
    case "missingDocument": {
      if (action.type !== "reply" || !action.reply) return { ok: false, issue: "wrongAction" };
      if (!action.reply.attachments.includes(requiredFile)) return { ok: false, issue: "missingAttachment" };
      if (!hasGreeting(action.reply.text)) return { ok: false, issue: "noGreeting" };
      if (!ATTACHED.test(action.reply.text)) return { ok: false, issue: "missingAttachment" };
      return late ? { ok: false, issue: "late" } : { ok: true };
    }
    case "interview": {
      if (action.type !== "reply" || !action.reply) return { ok: false, issue: "wrongAction" };
      if (!hasGreeting(action.reply.text)) return { ok: false, issue: "noGreeting" };
      if (!hasAvailability(action.reply.text)) return { ok: false, issue: "noAvailability" };
      return late ? { ok: false, issue: "late" } : { ok: true };
    }
    case "rejection": {
      if (action.type !== "reply" || !action.reply) return { ok: false, issue: "wrongAction" };
      return THANKS.test(action.reply.text) ? { ok: true } : { ok: false, issue: "notGracious" };
    }
  }
}

/** The status each application should end the week with: the status of its last message. */
export function expectedStatuses(events: WeekEvent[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of [...events].sort((a, b) => a.at - b.at)) {
    if (e.application && e.kind !== "scam") out[e.application] = STATUS_FOR[e.kind];
  }
  return out;
}

export function scoreWeek(events: WeekEvent[], actions: WeekAction[], tracker: Record<string, string>, requiredFile: string) {
  const items = events.map((e) => ({ eventId: e.id, ...judge(e, actions.find((a) => a.eventId === e.id), requiredFile) }));
  const expected = expectedStatuses(events);
  const trackerItems = Object.entries(expected).map(([app, status]) => ({ app, expected: status, ok: tracker[app] === status }));
  const points = items.filter((i) => i.ok).length + trackerItems.filter((t) => t.ok).length;
  const total = items.length + trackerItems.length;
  return { items, tracker: trackerItems, points, total, percent: total ? Math.round((points / total) * 100) : 0 };
}
