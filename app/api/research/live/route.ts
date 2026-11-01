import { getLearner } from "@/lib/session";
import { env } from "@/lib/env";
import { json } from "@/lib/http";
import { openAlexUrl, toSources, type LiveScope, type LiveSource } from "@/lib/research/live";

/*
 * Live research search for the Final Year Project course: real papers from OpenAlex, trimmed for phones.
 * Only learners of the course can search (so the daily allowance is theirs). Identical searches are served
 * from memory for a day, and each learner is limited to a fair number of searches.
 */

const COURSE = "research-project";
const DAY = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; body: { total: number; results: LiveSource[] } }>();
const recent = new Map<string, number[]>();
const PER_WINDOW = 40;
const WINDOW = 10 * 60 * 1000;

function limited(code: string): boolean {
  const now = Date.now();
  const times = (recent.get(code) ?? []).filter((t) => now - t < WINDOW);
  if (times.length >= PER_WINDOW) return true;
  times.push(now);
  recent.set(code, times);
  return false;
}

async function fetchWorks(url: string): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    return await fetch(url, { signal: ctl.signal, headers: { Accept: "application/json", "User-Agent": "TechSkillNow research course" }, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: Request) {
  const learner = await getLearner(COURSE);
  if (!learner) return json({ error: "locked" }, 401);

  const params = new URL(req.url).searchParams;
  const q = (params.get("q") ?? "").trim();
  const scope = (["all", "africa", "cm"].includes(params.get("scope") ?? "") ? params.get("scope") : "all") as LiveScope;
  const key = `${scope}|${q.toLowerCase().replace(/\s+/g, " ")}`;
  const url = openAlexUrl(q, { scope, key: env.openAlexKey || undefined });
  if (!url) return json({ error: "query" }, 400);

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < DAY) return json(hit.body);
  if (limited(learner.code)) return json({ error: "limit" }, 429);

  try {
    let res = await fetchWorks(url);
    // OpenAlex asks busy anonymous clients to wait a few seconds: retry once if the wait is short.
    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after") ?? "10");
      if (wait <= 3) {
        await new Promise((r) => setTimeout(r, wait * 1000));
        res = await fetchWorks(url);
      }
    }
    if (res.status === 429) return json({ error: "busy" }, 503);
    if (!res.ok) return json({ error: "unavailable" }, 502);
    const data = (await res.json()) as { meta?: { count?: number }; results?: unknown[] };
    const body = { total: data.meta?.count ?? 0, results: toSources(data as Parameters<typeof toSources>[0]) };
    if (cache.size > 300) cache.delete(cache.keys().next().value as string);
    cache.set(key, { at: Date.now(), body });
    return json(body);
  } catch {
    return json({ error: "offline" }, 504);
  }
}
