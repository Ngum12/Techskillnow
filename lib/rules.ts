import type { ComposeField, ComposeRule, TextRule } from "@/content/types";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Matches at the start of a word, so "thank" also matches "thanks". */
function startsWord(text: string, word: string) {
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escape(word)}`, "iu").test(text);
}

/** Matches a whole word or phrase only, so "u" does not match "using". */
function wholeWord(text: string, word: string) {
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escape(word)}($|[^\\p{L}\\p{N}])`, "iu").test(text);
}

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const GREETING = /^(dear|hello|good (morning|afternoon|evening)|hi|greetings|to whom|bonjour|bonsoir|madame|monsieur|cher|chère)\b/i;
const CLOSING = /(regards|sincerely|thank you|thanks|best wishes|yours faithfully|yours truly|respectfully|cordialement|salutations|bien à vous|respectueusement|merci|sincèrement)/i;

export function checkTextRule(rule: TextRule, text: string, initial = ""): boolean {
  switch (rule.kind) {
    case "notEmpty":
      return text.trim().length > 0;
    case "includesAny":
      return rule.words.some((w) => startsWord(text, w));
    case "excludesAll":
      return !rule.words.some((w) => wholeWord(text, w));
    case "minWords":
      return wordCount(text) >= rule.n;
    case "maxWords":
      return wordCount(text) <= rule.n;
    case "changed":
      return text.trim().toLowerCase() !== initial.trim().toLowerCase();
    case "regex":
      return new RegExp(rule.pattern, rule.flags).test(text);
  }
}

/** Returns the messages of every failed rule, in order. */
export function failedTextRules(rules: TextRule[], text: string, initial = ""): string[] {
  return rules.filter((r) => !checkTextRule(r, text, initial)).map((r) => r.message);
}

export type ComposeValues = Record<ComposeField, string> & { attachments: string[] };

function lines(text: string) {
  return text.split(/\n/).map((l) => l.trim()).filter(Boolean);
}

/** First non-empty line is a greeting ("Dear…", "Madame, Monsieur,"…). */
export function hasGreeting(body: string): boolean {
  return GREETING.test(lines(body)[0] ?? "");
}

/** A closing ("Kind regards", "Cordialement"…) near the end, allowing for a signature of a few lines below it. */
export function hasClosing(body: string): boolean {
  return lines(body).slice(-6).some((l) => CLOSING.test(l));
}

export { wordCount };

export function checkComposeRule(rule: ComposeRule, v: ComposeValues): boolean {
  switch (rule.kind) {
    case "validEmail": {
      const value = v[rule.field].trim();
      if (!value) return !!rule.optional;
      return value.split(/[,;]\s*/).every((a) => EMAIL.test(a.trim()));
    }
    case "equals":
      return v[rule.field].trim().toLowerCase() === rule.value.toLowerCase();
    case "attachment":
      return rule.file ? v.attachments.includes(rule.file) : v.attachments.length > 0;
    case "noAttachment":
      return !v.attachments.includes(rule.file);
    case "greeting":
      return hasGreeting(v.body);
    case "closing":
      return hasClosing(v.body);
    default:
      return checkTextRule(rule, v[rule.field]);
  }
}

function ruleGroup(rule: ComposeRule): string {
  if (rule.kind === "attachment" || rule.kind === "noAttachment") return "attachments";
  if (rule.kind === "greeting" || rule.kind === "closing") return rule.kind;
  return rule.field;
}

/** Returns the first failed rule's message for each part of the email (To, Cc, Subject, body, attachments…). */
export function failedComposeRules(rules: ComposeRule[], v: ComposeValues): string[] {
  const seen = new Set<string>();
  const messages: string[] = [];
  for (const rule of rules) {
    const group = ruleGroup(rule);
    if (seen.has(group) || checkComposeRule(rule, v)) continue;
    seen.add(group);
    messages.push(rule.message);
  }
  return messages;
}
