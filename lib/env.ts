import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return value;
}

function positiveInt(value: string | undefined, fallback: number) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const env = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get serviceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get adminEmail() {
    return required("ADMIN_EMAIL").trim().toLowerCase();
  },
  get whatsappNumber() {
    return (process.env.WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  },
  get maxDevices() {
    return positiveInt(process.env.MAX_DEVICES_PER_CODE, 2);
  },
  get referralDiscount() {
    return positiveInt(process.env.REFERRAL_DISCOUNT_XAF, 100);
  },
  /** Friends who must buy with a learner's link to earn one free course. */
  get referralFriendsPerCourse() {
    return positiveInt(process.env.REFERRAL_FRIENDS_PER_COURSE, 3);
  },
  /** Fapshi Mobile Money. Null until FAPSHI_API_USER and FAPSHI_API_KEY are set. */
  get fapshi() {
    const user = process.env.FAPSHI_API_USER;
    const key = process.env.FAPSHI_API_KEY;
    if (!user || !key) return null;
    const live = (process.env.FAPSHI_ENV ?? "sandbox").toLowerCase() === "live";
    return {
      user,
      key,
      baseUrl: live ? "https://live.fapshi.com" : "https://sandbox.fapshi.com",
      webhookSecret: process.env.FAPSHI_WEBHOOK_SECRET ?? "",
    };
  },
  get anthropicKey() {
    return process.env.ANTHROPIC_API_KEY ?? "";
  },
  get tutorLimit() {
    return positiveInt(process.env.TUTOR_LIMIT, 30);
  },
  /** Where learners send their real-world mission email. Missions are off when empty. */
  get missionEmail() {
    return (process.env.MISSION_EMAIL ?? "").trim().toLowerCase();
  },
  get inboundSecret() {
    return process.env.INBOUND_SECRET ?? "";
  },
  get appUrl() {
    return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  },
};
