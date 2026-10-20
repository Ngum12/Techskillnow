"use client";
import { useState } from "react";
import { useT } from "@/components/I18n";

export function LoginForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error" | "rate_limit">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setState(res?.ok ? "sent" : res?.status === 429 ? "rate_limit" : "error");
  }

  if (state === "sent") return <p className="mt-6 rounded-xl bg-ok-soft p-4">{t.admin.linkSent}</p>;

  return (
    <form onSubmit={onSubmit} className="mt-6">
      <label htmlFor="email" className="label">
        {t.admin.email}
      </label>
      <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      {(state === "error" || state === "rate_limit") && (
        <p role="alert" className="mt-3 text-err">
          {state === "rate_limit" ? t.admin.rateLimited : t.common.errorGeneric}
        </p>
      )}
      <button type="submit" className="btn btn-primary mt-5 w-full" disabled={state === "busy"}>
        {t.admin.sendLink}
      </button>
    </form>
  );
}
