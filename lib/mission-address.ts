import "server-only";
import { env } from "./env";

/**
 * Where a learner sends their mission email. With automatic checking (an inbound worker),
 * each learner gets a tagged address, mission+CODE@domain, so emails are matched to them exactly.
 */
export function missionAddress(code: string): string {
  const base = env.missionEmail;
  if (!base || !env.inboundSecret) return base;
  const [local, domain] = base.split("@");
  return domain ? `${local}+${code.toLowerCase()}@${domain}` : base;
}
