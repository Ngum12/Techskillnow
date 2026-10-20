import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { env } from "@/lib/env";
import { getDict } from "@/lib/i18n";
import { PaymentStatus } from "./PaymentStatus";

export const dynamic = "force-dynamic";

/** Fapshi sends the buyer back here after paying. */
export default async function BuyDonePage({ searchParams }: PageProps<"/buy/done">) {
  const { order } = await searchParams;
  const t = getDict(await getLocale());
  return (
    <main className="mx-auto max-w-xl px-5 pb-10 pt-6">
      <Link href="/" className="font-bold text-primary">
        {t.appName}
      </Link>
      <PaymentStatus orderId={typeof order === "string" ? order : ""} appUrl={env.appUrl} />
    </main>
  );
}
