import "server-only";
import type { Dict } from "./i18n";
import { fmt, money } from "./i18n";
import { env } from "./env";
import { waLink } from "./whatsapp";

/** Where "Buy" goes: the Mobile Money checkout when Fapshi is set up, otherwise WhatsApp. */
export function buyTarget(t: Dict, courseId: string, courseTitle: string): { href: string; label: string; online: boolean } {
  if (env.fapshi) {
    return { href: `/buy?course=${courseId}`, label: fmt(t.landing.buyPrice, { price: money(env.coursePrice) }), online: true };
  }
  return { href: waLink(env.whatsappNumber, fmt(t.landing.buyMessage, { course: courseTitle })), label: t.landing.buy, online: false };
}
