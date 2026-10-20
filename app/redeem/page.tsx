import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { env } from "@/lib/env";
import { waLink } from "@/lib/whatsapp";
import { RedeemForm } from "./RedeemForm";

export default async function RedeemPage() {
  const t = getDict(await getLocale());
  return (
    <main className="mx-auto max-w-xl px-5 pb-10 pt-6">
      <Link href="/" className="font-bold text-primary">
        {t.appName}
      </Link>
      <h1 className="mt-6 text-2xl font-bold">{t.redeem.title}</h1>
      <p className="mt-2 text-muted">{t.redeem.help}</p>
      <RedeemForm supportLink={waLink(env.whatsappNumber, t.redeem.supportMessage)} />
    </main>
  );
}
