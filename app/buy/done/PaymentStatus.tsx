"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { getDeviceId } from "@/lib/device";
import { waLink } from "@/lib/whatsapp";

type Status = { status: "pending" | "paid" | "failed" | "expired"; code: string | null; courseId: string; maxDevices: number };

export function PaymentStatus({ orderId, appUrl }: { orderId: string; appUrl: string }) {
  const t = useT();
  const router = useRouter();
  const [data, setData] = useState<Status | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Poll every 5 s until the payment is settled and the code exists (the server throttles calls to Fapshi).
  useEffect(() => {
    let stop = false;
    async function poll() {
      const res = await fetch(`/api/pay/status?order=${encodeURIComponent(orderId)}`).catch(() => null);
      if (stop) return;
      if (res?.status === 404) return setNotFound(true);
      if (res?.ok) {
        const next = (await res.json()) as Status;
        setData(next);
        if ((next.status === "paid" && next.code) || next.status === "failed" || next.status === "expired") return;
      }
      setTimeout(poll, 5000);
    }
    poll();
    return () => {
      stop = true;
    };
  }, [orderId]);

  async function start(code: string) {
    setStarting(true);
    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, deviceId: getDeviceId() }),
    }).catch(() => null);
    const body = res?.ok ? await res.json() : null;
    if (body?.courseId) {
      router.replace(`/learn/${body.courseId}`);
      router.refresh();
    } else {
      router.push("/redeem");
    }
  }

  if (notFound) {
    return (
      <div className="mt-8">
        <p>{t.buy.notFound}</p>
        <Link href="/redeem" className="btn btn-secondary mt-6 w-full">
          {t.landing.haveCode}
        </Link>
      </div>
    );
  }

  if (data?.status === "failed" || data?.status === "expired") {
    return (
      <div className="mt-8">
        <p className="rounded-xl bg-err-soft p-4 text-err">{t.buy.failed}</p>
        <Link href={`/buy?course=${data.courseId}`} className="btn btn-primary mt-6 w-full">
          {t.buy.tryAgain}
        </Link>
      </div>
    );
  }

  if (data?.status === "paid" && data.code) {
    const code = data.code;
    return (
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-ok">{t.buy.paidTitle}</h1>
        <div className="card mt-4 p-5 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t.buy.yourCode}</p>
          <p className="mt-1 font-mono text-4xl font-bold tracking-widest">{code}</p>
          <button
            type="button"
            className="btn btn-ghost mt-1"
            onClick={() => navigator.clipboard?.writeText(code).then(() => setCopied(true), () => {})}
          >
            {copied ? t.common.copied : t.common.copy}
          </button>
          <p className="text-sm text-muted">{fmt(t.buy.saveCode, { n: data.maxDevices })}</p>
        </div>
        <button type="button" className="btn btn-primary mt-6 w-full" disabled={starting} onClick={() => start(code)}>
          {starting ? t.buy.starting : t.buy.start}
        </button>
        <a href={waLink("", fmt(t.buy.saveMessage, { code, url: appUrl }))} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-3 w-full">
          {t.buy.saveWhatsApp}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-10 text-center" aria-live="polite">
      <div aria-hidden="true" className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-line border-t-primary" />
      <p className="mt-5 text-lg font-semibold">{t.buy.waiting}</p>
      <p className="mt-2 text-muted">{t.buy.waitingHelp}</p>
    </div>
  );
}
