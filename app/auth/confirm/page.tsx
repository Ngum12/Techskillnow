"use client";
import { useEffect, useRef } from "react";
import { useT } from "@/components/I18n";

/** Magic-link landing page: the session arrives in the URL fragment, which only the browser can read. */
export default function AuthConfirm() {
  const t = useT();
  const started = useRef(false);

  useEffect(() => {
    // Effects run twice in development; the tokens are wiped from the URL on the first run, so only run once.
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    // Remove tokens from the address bar and history straight away.
    window.history.replaceState(null, "", window.location.pathname);
    if (!access_token || !refresh_token) {
      console.error("Sign-in link failed:", params.get("error_description") ?? "no tokens in link");
      window.location.replace("/admin/login?error=link");
      return;
    }
    fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token, refresh_token }),
    })
      .then((res) => window.location.replace(res.ok ? "/admin" : "/admin/login?error=link"))
      .catch(() => window.location.replace("/admin/login?error=link"));
  }, []);

  return <p className="py-16 text-center text-muted">{t.common.loading}</p>;
}
