const KEY = "tsn_device";

function randomId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

function readCookie(): string | null {
  const m = document.cookie.match(/(?:^|; )tsn_device=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Stable per-browser device ID, created on first use and kept in localStorage and a cookie. */
export function getDeviceId(): string {
  let id: string | null = null;
  try {
    id = localStorage.getItem(KEY);
  } catch {}
  id = id || readCookie() || randomId();
  try {
    localStorage.setItem(KEY, id);
  } catch {}
  document.cookie = `${KEY}=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 730}; samesite=lax`;
  return id;
}
