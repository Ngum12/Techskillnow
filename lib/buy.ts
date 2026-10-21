import "server-only";
import type { Dict } from "./i18n";
import { fmt, money } from "./i18n";
import { env } from "./env";
import { waLink } from "./whatsapp";

/** Price after an optional referral discount (never below Fapshi's 100 FCFA minimum). */
export function priceFor(course: { price: number }, withReferral: boolean): number {
  return Math.max(100, course.price - (withReferral ? env.referralDiscount : 0));
}

/** Where "Buy" goes: the Mobile Money checkout when Fapshi is set up, otherwise WhatsApp. */
export function buyTarget(t: Dict, course: { id: string; title: string; price: number }): { href: string; label: string; online: boolean } {
  if (env.fapshi) {
    return { href: `/buy?course=${course.id}`, label: fmt(t.landing.buyPrice, { price: money(course.price) }), online: true };
  }
  return { href: waLink(env.whatsappNumber, fmt(t.landing.buyMessage, { course: course.title })), label: t.landing.buy, online: false };
}
