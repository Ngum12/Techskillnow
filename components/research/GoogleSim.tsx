"use client";
/**
 * A practice Google (or Google Scholar) inside the lesson: type a topic, see suggestions, results, "People also
 * ask" and related searches, open pages and save sources. A search coach reads every query and says how to
 * narrow it. The "real Google" buttons open the same search on google.com for live results.
 */
import { useMemo, useRef, useState } from "react";
import type { GoogleSearchTask, SearchGoal } from "@/lib/research/types";
import { cleanQuery, estimateResults, genericResults, groupDigits, isAcademic, narrowerSearches, onSubject, practiceAcademic, readQuery, search, stem, suggestions, tokens, type Source } from "@/lib/research/search";
import { loadLiveSources, loadSources, loadTopic, saveLiveSources, saveSources } from "@/lib/research/store";
import type { LiveScope } from "@/lib/research/live";
import sourcesJson from "@/content/research/sources.json" with { type: "json" };
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";
import { ArticleView } from "./ArticleView";

const SOURCES = sourcesJson as Source[];
/** Pages made for a search (practice theses, encyclopedia, blogs…), kept so saved ones can still be found. */
const MADE = new Map<string, Source>();
const findSource = (id: string) => SOURCES.find((s) => s.id === id) ?? MADE.get(id);
const COLOURS = ["#1a73e8", "#d93025", "#188038", "#e37400", "#9334e6", "#007b83", "#b06000"];
const small = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};

function Wordmark({ scholar, size = "lg", live = false }: { scholar: boolean; size?: "lg" | "sm"; live?: boolean }) {
  if (live) {
    return (
      <span className={`select-none font-semibold tracking-tight text-[#1f3a5f] ${size === "lg" ? "text-[1.7rem]" : "text-[0.95rem]"}`} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        📚 {size === "lg" ? "Live research" : "Live"}
      </span>
    );
  }
  const letters: [string, string][] = [
    ["G", "#4285F4"],
    ["o", "#EA4335"],
    ["o", "#FBBC05"],
    ["g", "#4285F4"],
    ["l", "#34A853"],
    ["e", "#EA4335"],
  ];
  return (
    <span className={`select-none font-medium tracking-[-0.04em] ${size === "lg" ? "text-[2.6rem]" : "text-[1.25rem]"}`} style={{ fontFamily: "Arial, Helvetica, sans-serif" }} aria-label={scholar ? "Google Scholar" : "Google"}>
      {letters.map(([l, c], i) => (
        <span key={i} style={{ color: c }}>
          {l}
        </span>
      ))}
      {scholar && <span className={`ml-1.5 text-[#5f6368] ${size === "lg" ? "text-[1.6rem]" : "text-[0.95rem]"} tracking-normal`}>Scholar</span>}
    </span>
  );
}

const Magnifier = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" strokeLinecap="round" />
  </svg>
);

/** Bold the words of the snippet that match the search, as Google does. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const q = new Set(tokens(query));
  return (
    <>
      {text.split(/(\s+)/).map((w, i) => {
        const core = w.replace(/[^a-zà-ÿ0-9-]/gi, "");
        return core && q.has(stem(core)) ? <b key={i}>{w}</b> : <span key={i}>{w}</span>;
      })}
    </>
  );
}

function goalMet(g: SearchGoal, st: { reading: ReturnType<typeof readQuery> | null; opened: string[]; openedAny: string[]; saved: string[] }): boolean {
  const r = st.reading;
  switch (g.kind) {
    case "search":
      return !!r && r.words >= (g.minWords ?? 1);
    case "narrow":
      return !!r && Object.values(r.facets).filter(Boolean).length >= g.facets;
    case "operator":
      return !!r && (g.operator === "quotes" ? r.operators.quotes : g.operator === "pdf" ? r.operators.pdf : !!r.operators.site);
    case "open":
      return (g.academic ? st.opened : st.openedAny).length >= (g.count ?? 1);
    case "save":
      return st.saved.filter((id) => {
        const s = findSource(id);
        return !!s && isAcademic(s);
      }).length >= g.count;
  }
}

export function GoogleSim({ task, passed, onPass }: { task: GoogleSearchTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const r = t.research;
  const { reportAttempt } = useLesson();
  const scholar = task.engine === "scholar";
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "news" | "books">("all");
  const [since, setSince] = useState(0);
  const [paa, setPaa] = useState<number | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [opened, setOpened] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    // Real papers saved earlier come back into "My sources".
    const liveSaved = loadLiveSources();
    for (const x of liveSaved) MADE.set(x.id, x);
    return [...loadSources(), ...liveSaved.map((x) => x.id)];
  });
  // Scholar steps search real papers (OpenAlex) by default; "Practice" keeps the course's practice results.
  const [mode, setMode] = useState<"live" | "practice">(scholar ? "live" : "practice");
  const [scope, setScope] = useState<LiveScope>("all");
  const [liveRes, setLiveRes] = useState<{ status: "loading" | "ok" | "error"; error?: string; total: number; results: Source[]; ms: number } | null>(null);
  const request = useRef(0);
  const isLive = scholar && mode === "live";
  const [done, setDone] = useState<boolean[]>(() => task.goals.map(() => passed));
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [topic] = useState(() => (typeof window === "undefined" ? null : loadTopic()));
  const [guide, setGuide] = useState(true);

  const reading = useMemo(() => (query ? readQuery(query) : null), [query]);
  const live = useMemo(() => readQuery(input), [input]);
  const allDone = done.every(Boolean);
  const current = done.findIndex((d) => !d);

  const results = useMemo(() => {
    if (!query) return [] as Source[];
    if (isLive) return (liveRes?.status === "ok" ? liveRes.results : []).filter((s) => !since || s.year >= since);
    const hits = search(SOURCES, query, { scholar }).map((h) => h.source);
    // Every topic gets research to open: practice theses and articles when fewer than two research results
    // are about the subject itself (not only the same town or group of people).
    const practice = hits.filter((h) => isAcademic(h) && onSubject(h, query)).length < 2 ? practiceAcademic(query) : [];
    const generic = scholar ? [] : genericResults(query).filter((g) => !hits.some((h) => h.id === g.id));
    for (const m of [...practice, ...generic]) MADE.set(m.id, m);
    // Results about the subject come first, as on the real engine.
    const about = hits.filter((h) => onSubject(h, query));
    const others = hits.filter((h) => !onSubject(h, query));
    if (scholar) return [...about, ...practice, ...others].filter((s) => !since || s.year >= since);
    const list = reading?.level === "broad" ? [...generic, ...about, ...practice, ...others] : about.length >= 4 ? [...about, ...others] : [...about, ...practice, ...others, ...generic];
    return list.filter((s) => (tab === "news" ? s.kind === "news" : tab === "books" ? s.kind === "book" : true));
  }, [query, scholar, since, tab, reading?.level, isLive, liveRes]);

  const open = openId ? (findSource(openId) ?? null) : null;

  /** Ticks off every goal the learner has now reached, in order, and reports the first one still missing. */
  /** `academic`: the source just opened or saved is research (so a goal that needs several is on its way). */
  function progress(next: { reading: ReturnType<typeof readQuery> | null; opened: string[]; openedAny: string[]; saved: string[] }, action: SearchGoal["kind"], academic = false) {
    if (allDone) return;
    const d = [...done];
    let last = -1;
    for (let i = 0; i < d.length; i++) {
      if (d[i]) continue;
      if (!goalMet(task.goals[i], next)) break;
      d[i] = true;
      last = i;
    }
    if (last >= 0) {
      setDone(d);
      setMessage({ kind: "ok", text: task.goals[last].done });
      if (d.every(Boolean)) {
        reportAttempt(true, []);
        onPass();
      }
      return;
    }
    const g = task.goals[current];
    if (!g) return;
    // Explain what is missing for the goal the learner is working on.
    if (g.kind === "narrow" && action === "search" && next.reading) {
      const have = Object.values(next.reading.facets).filter(Boolean).length;
      setMessage({ kind: "err", text: fmt(r.coach.notYet, { have, need: g.facets }) });
      reportAttempt(false, [`narrow: ${next.reading.query}`]);
    } else if (g.kind === "operator" && action === "search") {
      setMessage({ kind: "err", text: r.coach.operatorMissing[g.operator] });
    } else if (g.kind === "open" && action === "open" && g.academic) {
      setMessage(academic ? { kind: "ok", text: fmt(r.coach.openMore, { n: (g.count ?? 1) - next.opened.length }) } : { kind: "err", text: r.coach.notAcademicOpen });
    } else if (g.kind === "save" && action === "save") {
      const have = next.saved.filter((id) => {
        const x = findSource(id);
        return !!x && isAcademic(x);
      }).length;
      setMessage(academic ? { kind: "ok", text: fmt(r.coach.saveMore, { n: g.count - have }) } : { kind: "err", text: r.coach.saveAcademic });
    } else {
      setMessage(null);
    }
  }

  /** Real papers from the server (which asks OpenAlex); the latest search wins if several overlap. */
  async function fetchLive(q: string, sc: LiveScope) {
    const id = ++request.current;
    const started = Date.now();
    setLiveRes({ status: "loading", total: 0, results: [], ms: 0 });
    try {
      const res = await fetch(`/api/research/live?q=${encodeURIComponent(q)}&scope=${sc}`);
      const data = (await res.json().catch(() => ({}))) as { error?: string; total?: number; results?: Source[] };
      if (id !== request.current) return;
      if (!res.ok || !data.results) {
        setLiveRes({ status: "error", error: data.error ?? "unavailable", total: 0, results: [], ms: 0 });
        return;
      }
      for (const x of data.results) MADE.set(x.id, x);
      setLiveRes({ status: "ok", total: data.total ?? data.results.length, results: data.results, ms: Date.now() - started });
    } catch {
      if (id === request.current) setLiveRes({ status: "error", error: "offline", total: 0, results: [], ms: 0 });
    }
  }

  function switchMode(m: "live" | "practice") {
    setMode(m);
    setOpenId(null);
    if (m === "live" && query) void fetchLive(query, scope);
  }

  function changeScope(sc: LiveScope) {
    setScope(sc);
    if (query) void fetchLive(query, sc);
  }

  function run(q: string) {
    const v = cleanQuery(q);
    if (!v) return;
    if (isLive) void fetchLive(v, scope);
    setInput(v);
    setQuery(v);
    setFocused(false);
    setOpenId(null);
    setPaa(null);
    setTab("all");
    window.scrollTo?.({ top: 0 });
    progress({ reading: readQuery(v), opened, openedAny: visited, saved }, "search");
  }

  function openSource(s: Source) {
    setOpenId(s.id);
    const v = visited.includes(s.id) ? visited : [...visited, s.id];
    const o = isAcademic(s) && !opened.includes(s.id) ? [...opened, s.id] : opened;
    setVisited(v);
    setOpened(o);
    progress({ reading, opened: o, openedAny: v, saved }, "open", isAcademic(s));
  }

  function toggleSave(s: Source) {
    const next = saved.includes(s.id) ? saved.filter((x) => x !== s.id) : [...saved, s.id];
    setSaved(next);
    saveSources(next.filter((id) => SOURCES.some((x) => x.id === id)));
    saveLiveSources(next.map((id) => findSource(id)).filter((x): x is Source => !!x && x.id.startsWith("live-")));
    if (!saved.includes(s.id)) progress({ reading, opened, openedAny: visited, saved: next }, "save", isAcademic(s));
  }

  const sugg = focused ? suggestions(SOURCES, input) : [];
  const url = open
    ? open.url.replace(/ › /g, "/")
    : isLive
      ? `openalex.org/works${query ? `?search=${encodeURIComponent(query).replace(/%20/g, "+")}` : ""}`
      : query
        ? `${scholar ? "scholar.google.com/scholar" : "google.com/search"}?q=${encodeURIComponent(query).replace(/%20/g, "+")}`
        : scholar
          ? "scholar.google.com"
          : "google.com";
  const count = isLive ? (liveRes?.total ?? 0) : reading ? estimateResults(reading, scholar) : 0;
  const seconds = isLive ? ((liveRes?.ms ?? 0) / 1000).toFixed(2) : (0.21 + (small(query) % 48) / 100).toFixed(2);
  const openLink = open && "link" in open ? (open as Source & { link?: string; oaUrl?: string }) : null;
  const related = query ? narrowerSearches(query, open?.field) : [];
  const facetKeys = ["population", "place", "angle", "time"] as const;
  const shown = reading ?? (input ? live : null);
  const realQ = encodeURIComponent(query || input);

  const searchBox = (compact: boolean) => (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        run(input);
      }}
    >
      <div className={`flex items-center gap-2 border border-[#dfe1e5] bg-white px-3.5 ${compact ? "h-10 rounded-full" : "h-12 rounded-full"} ${focused ? "shadow-[0_1px_6px_rgba(32,33,36,0.28)]" : ""} ${sugg.length && focused ? "rounded-b-none rounded-t-[22px]" : ""}`}>
        <span className="text-[#9aa0a6]">
          <Magnifier />
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          aria-label={r.searchLabel}
          placeholder={scholar ? r.scholarPlaceholder : r.placeholder}
          enterKeyHint="search"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-[#202124] outline-none placeholder:text-[#9aa0a6]"
        />
        {input && (
          <button type="button" aria-label={r.clear} className="text-[1.2rem] leading-none text-[#70757a]" onClick={() => setInput("")}>
            ×
          </button>
        )}
        <button type="submit" aria-label={r.searchLabel} className="text-[#4285F4]">
          <Magnifier className="h-5 w-5" />
        </button>
      </div>
      {focused && sugg.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-10 rounded-b-[22px] border border-t-0 border-[#dfe1e5] bg-white pb-2 shadow-[0_4px_6px_rgba(32,33,36,0.28)]">
          {sugg.map((s) => (
            <li key={s}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(s)} className="flex w-full items-center gap-3 px-3.5 py-2 text-left text-[0.9rem] text-[#202124] hover:bg-[#f1f3f4]">
                <span className="text-[#9aa0a6]">
                  <Magnifier />
                </span>
                <span>
                  {s.slice(0, input.trim().length)}
                  <b>{s.slice(input.trim().length)}</b>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );

  return (
    <div>
      {/* Goal */}
      <div className="rounded-xl bg-primary-soft p-4" aria-live="polite">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{allDone ? r.allGoals : fmt(r.goalOf, { n: current + 1, total: task.goals.length })}</p>
        <p className="mt-1 font-semibold">{allDone ? task.success : task.goals[current].instruction}</p>
      </div>
      {message && !allDone && <Feedback kind={message.kind} title={message.kind === "ok" ? t.task.correct : r.coach.title} messages={[message.text]} />}

      {scholar && (
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-[#eef0f4] p-1" role="tablist" aria-label={r.live.modeLabel}>
          {(["live", "practice"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchMode(m)} className={`min-h-11 rounded-lg px-2 text-[0.82rem] font-semibold leading-tight ${mode === m ? "bg-white text-ink shadow-sm" : "text-muted"}`}>
              {m === "live" ? `📚 ${r.live.modeLive}` : `🧪 ${r.live.modePractice}`}
            </button>
          ))}
        </div>
      )}

      {/* The browser */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-[0_8px_24px_-12px_rgba(32,33,36,0.35)]">
        <div className="flex items-center gap-2 bg-[#f1f3f4] px-2.5 py-2">
          <button type="button" aria-label={r.back} disabled={!open && !query} onClick={() => (open ? setOpenId(null) : (setQuery(""), setInput("")))} className="flex h-7 w-7 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#e3e5e8] disabled:opacity-40">
            ←
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[0.75rem] text-[#202124]">
            <span aria-hidden="true">🔒</span>
            <span className="truncate">{url}</span>
          </div>
        </div>

        {!query && !open && (
          <div className="flex min-h-[19rem] flex-col items-center justify-center gap-6 px-4 py-8">
            <Wordmark scholar={scholar} live={isLive} />
            {isLive && <p className="-mt-3 max-w-sm text-center text-[0.75rem] text-[#5f6368]">{r.live.tagline}</p>}
            <div className="w-full max-w-md">{searchBox(false)}</div>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => run(input)} className="rounded bg-[#f8f9fa] px-4 py-2 text-[0.85rem] text-[#3c4043] hover:shadow">
                {scholar ? r.scholarButton : r.googleButton}
              </button>
            </div>
            {topic?.title && (
              <button type="button" onClick={() => run(topic.title)} className="max-w-md rounded-full border border-[#dadce0] px-3 py-1.5 text-left text-[0.75rem] text-[#1a0dab]">
                {fmt(r.tryTopic, { topic: topic.title })}
              </button>
            )}
          </div>
        )}

        {query && !open && (
          <div>
            <div className="border-b border-[#ebebeb] px-3 pb-0 pt-3">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => (setQuery(""), setInput(""))} className="shrink-0">
                  <Wordmark scholar={scholar} size="sm" live={isLive} />
                </button>
                <div className="min-w-0 flex-1">{searchBox(true)}</div>
              </div>
              {scholar ? (
                <div className="-mx-3 mt-2 flex gap-1 overflow-x-auto px-3 pb-2 text-[0.75rem] [scrollbar-width:none]">
                  {isLive &&
                    (["all", "africa", "cm"] as const).map((sc) => (
                      <button key={sc} type="button" onClick={() => changeScope(sc)} className={`shrink-0 rounded-full border px-3 py-1 ${scope === sc ? "border-[#1f3a5f] bg-[#1f3a5f] font-semibold text-white" : "border-[#dadce0] text-[#3c4043]"}`}>
                        {r.live.scopes[sc]}
                      </button>
                    ))}
                  {isLive && <span className="mx-1 w-px shrink-0 bg-[#dadce0]" aria-hidden="true" />}
                  {[0, 2024, 2023, 2020].map((y) => (
                    <button key={y} type="button" onClick={() => setSince(y)} className={`shrink-0 rounded-full px-3 py-1 ${since === y ? "bg-[#e8f0fe] font-semibold text-[#1967d2]" : "text-[#5f6368]"}`}>
                      {y ? fmt(r.since, { y }) : r.anyTime}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="-mx-3 mt-2 flex gap-4 overflow-x-auto px-4 text-[0.8rem] [scrollbar-width:none]">
                  {(["all", "news", "books"] as const).map((k) => (
                    <button key={k} type="button" onClick={() => setTab(k)} className={`shrink-0 border-b-[3px] pb-2 ${tab === k ? "border-[#1a73e8] font-semibold text-[#1a73e8]" : "border-transparent text-[#5f6368]"}`}>
                      {r.tabs[k]}
                    </button>
                  ))}
                  {[r.tabs.images, r.tabs.videos].map((x) => (
                    <span key={x} className="shrink-0 pb-2 text-[#9aa0a6]">
                      {x}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="px-3 py-3">
              {isLive && liveRes?.status === "loading" ? (
                <div className="space-y-5 py-2" aria-label={r.live.loading}>
                  <p className="text-[0.75rem] text-[#70757a]">{r.live.loading}</p>
                  {[0, 1, 2].map((k) => (
                    <div key={k} className="animate-pulse space-y-2">
                      <div className="h-3.5 w-4/5 rounded bg-[#e8eaed]" />
                      <div className="h-2.5 w-3/5 rounded bg-[#eef0f2]" />
                      <div className="h-2.5 w-full rounded bg-[#f1f3f4]" />
                    </div>
                  ))}
                </div>
              ) : isLive && liveRes?.status === "error" ? (
                <div className="my-3 rounded-xl border border-[#f1c27d] bg-[#fff8eb] p-3 text-[0.85rem] text-[#5c3d00]">
                  <p className="font-semibold">{r.live.errors[(liveRes.error ?? "unavailable") as keyof typeof r.live.errors] ?? r.live.errors.unavailable}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" className="rounded-full bg-[#1f3a5f] px-3 py-1.5 text-[0.78rem] font-semibold text-white" onClick={() => void fetchLive(query, scope)}>
                      {r.live.retry}
                    </button>
                    <button type="button" className="rounded-full border border-[#1f3a5f] px-3 py-1.5 text-[0.78rem] font-semibold text-[#1f3a5f]" onClick={() => switchMode("practice")}>
                      {r.live.usePractice}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[0.75rem] text-[#70757a]">{fmt(scholar ? r.scholarAbout : r.about, { n: groupDigits(count), s: seconds })}</p>
              )}
              {!results.length && !(isLive && liveRes?.status !== "ok") && (
                <div className="py-6 text-[0.85rem] text-[#202124]">
                  <p>{fmt(r.noMatch, { q: query })}</p>
                  <p className="mt-3 text-[0.8rem] text-[#5f6368]">{isLive ? r.live.noResults : r.noMatchTip}</p>
                  {isLive && (
                    <button type="button" className="mt-3 rounded-full border border-[#1f3a5f] px-3 py-1.5 text-[0.78rem] font-semibold text-[#1f3a5f]" onClick={() => switchMode("practice")}>
                      {r.live.usePractice}
                    </button>
                  )}
                </div>
              )}
              <ol className="mt-2 space-y-5">
                {results.map((s, i) => (
                  <li key={s.id}>
                    {scholar ? (
                      <ScholarResult s={s} query={query} visited={visited.includes(s.id)} saved={saved.includes(s.id)} onOpen={() => openSource(s)} onSave={() => toggleSave(s)} />
                    ) : (
                      <WebResult s={s} query={query} visited={visited.includes(s.id)} onOpen={() => openSource(s)} />
                    )}
                    {!scholar && i === 1 && tab === "all" && (
                      <div className="mt-5 border-y border-[#ebebeb] py-3">
                        <p className="text-[1rem] text-[#202124]">{r.paa}</p>
                        <div className="mt-1 divide-y divide-[#ebebeb]">
                          {r.paaItems.map((item, k) => (
                            <div key={k}>
                              <button type="button" onClick={() => setPaa(paa === k ? null : k)} className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-[0.85rem] text-[#202124]">
                                {fmt(item.q, { topic: query.replace(/"|(site|filetype):\S+/g, "").trim() })}
                                <span className={`text-[#70757a] transition-transform ${paa === k ? "rotate-180" : ""}`}>⌄</span>
                              </button>
                              {paa === k && <p className="pb-3 text-[0.8rem] leading-relaxed text-[#4d5156]">{item.a}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {related.length > 0 && (
                <div className="mt-6 border-t border-[#ebebeb] pt-4">
                  <p className="text-[1rem] text-[#202124]">{r.related}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {related.map((q) => (
                      <button key={q} type="button" onClick={() => run(q)} className="flex items-center gap-2.5 rounded-full bg-[#f1f3f4] px-3.5 py-2 text-left text-[0.8rem] text-[#202124]">
                        <span className="text-[#5f6368]">
                          <Magnifier />
                        </span>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {open && (
          <div>
            <div className="max-h-[32rem] overflow-y-auto">
              {isAcademic(open) && (
                <label className="flex items-center justify-end gap-2 border-b border-[#ebebeb] bg-[#f8f9fa] px-3 py-1.5 text-[0.72rem] font-semibold text-[#3c4043]">
                  <input type="checkbox" checked={guide} onChange={(e) => setGuide(e.target.checked)} className="h-4 w-4 accent-[#4338ca]" />
                  {r.guide.toggle}
                </label>
              )}
              <ArticleView s={open} guide={guide && isAcademic(open)} />
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-[#ebebeb] bg-[#f8f9fa] px-3 py-2">
              <button type="button" onClick={() => setOpenId(null)} className="rounded-full px-3 py-1.5 text-[0.8rem] font-semibold text-[#1a73e8] hover:bg-[#e8f0fe]">
                ← {r.backToResults}
              </button>
              {openLink?.link && (
                <a href={openLink.oaUrl ?? openLink.link} target="_blank" rel="noopener noreferrer" className="rounded-full px-2 py-1.5 text-[0.78rem] font-semibold text-[#1f3a5f] underline-offset-2 hover:underline">
                  {openLink.oaUrl ? r.live.readFree : r.live.openReal} ↗
                </a>
              )}
              <button type="button" onClick={() => toggleSave(open)} className={`rounded-full px-3.5 py-1.5 text-[0.8rem] font-semibold ${saved.includes(open.id) ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#1a73e8] text-white"}`}>
                {saved.includes(open.id) ? `★ ${r.savedSource}` : `☆ ${r.saveSource}`}
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[0.72rem] text-muted">{isLive ? r.live.disclaimer : r.disclaimer}</p>

      {/* Coach */}
      <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">🧭 {r.coach.title}</p>
        {open ? (
          <>
            <p className={`mt-2 text-[0.9rem] ${isAcademic(open) ? "text-ok" : "text-[#8a5a00]"}`}>{isAcademic(open) ? r.coach.academic : r.coach.kinds[open.kind as "news" | "blog" | "encyclopedia" | "forum"]}</p>
            {open.id.startsWith("live-") && <p className="mt-1 text-[0.85rem] text-muted">📚 {r.live.realPaper}</p>}
          </>
        ) : (
          <>
            <p className="mt-2 text-[0.9rem] font-semibold">{shown ? r.coach.level[shown.level] : r.coach.level.empty}</p>
            {shown && shown.query && (
              <>
                <ul className="mt-3 grid grid-cols-2 gap-2">
                  {facetKeys.map((f) => (
                    <li key={f} className={`rounded-lg border px-2.5 py-1.5 text-[0.78rem] ${shown.facets[f] ? "border-ok bg-ok-soft text-ok" : "border-line text-muted"}`}>
                      {shown.facets[f] ? "✓" : "○"} {r.coach.facets[f]}
                      {shown.facets[f] && <span className="block truncate font-semibold">“{shown.facets[f]}”</span>}
                    </li>
                  ))}
                </ul>
                {shown.tooLong ? (
                  <p className="mt-3 text-[0.85rem]">✂️ {r.coach.tooLong}</p>
                ) : (
                  shown.missing.length > 0 && <p className="mt-3 text-[0.85rem]">💡 {r.coach.missing[shown.missing[0]]}</p>
                )}
              </>
            )}
          </>
        )}
        {(query || input) && (
          <div className="mt-4 flex flex-col gap-2 min-[420px]:flex-row">
            <a className="btn btn-secondary min-h-11 flex-1 py-2 text-[0.85rem]" href={`https://www.google.com/search?q=${realQ}`} target="_blank" rel="noopener noreferrer">
              {r.coach.realGoogle} ↗
            </a>
            <a className="btn btn-secondary min-h-11 flex-1 py-2 text-[0.85rem]" href={`https://scholar.google.com/scholar?q=${realQ}`} target="_blank" rel="noopener noreferrer">
              {r.coach.realScholar} ↗
            </a>
          </div>
        )}
        <details className="mt-4 border-t border-line pt-3">
          <summary className="cursor-pointer text-[0.85rem] font-semibold">{fmt(r.coach.mySources, { n: saved.filter((id) => findSource(id)).length })}</summary>
          {saved.length === 0 ? (
            <p className="mt-2 text-[0.8rem] text-muted">{r.coach.noSources}</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {saved
                .map((id) => findSource(id))
                .filter((s): s is Source => !!s)
                .map((s) => (
                  <li key={s.id} className="text-[0.8rem]">
                    ★ {s.title} <span className="text-muted">({s.year})</span>
                  </li>
                ))}
            </ul>
          )}
        </details>
      </section>
    </div>
  );
}

function Favicon({ site }: { site: string }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ebebeb] text-[0.75rem] font-bold text-white" style={{ background: COLOURS[small(site) % COLOURS.length] }} aria-hidden="true">
      {site.charAt(0)}
    </span>
  );
}

function WebResult({ s, query, visited, onOpen }: { s: Source; query: string; visited: boolean; onOpen: () => void }) {
  return (
    <div>
      <button type="button" onClick={onOpen} className="group block w-full text-left">
        <span className="flex items-center gap-2.5">
          <Favicon site={s.site} />
          <span className="min-w-0">
            <span className="block truncate text-[0.82rem] text-[#202124]">{s.site}</span>
            <span className="block truncate text-[0.72rem] text-[#4d5156]">{s.url}</span>
          </span>
        </span>
        <span className={`mt-1 block text-[1.05rem] leading-snug group-hover:underline ${visited ? "text-[#681da8]" : "text-[#1a0dab]"}`}>
          {s.pdf && <span className="mr-1.5 rounded border border-[#dadce0] px-1 text-[0.62rem] font-semibold text-[#5f6368] no-underline">PDF</span>}
          {s.title}
        </span>
      </button>
      <p className="mt-1 text-[0.82rem] leading-relaxed text-[#4d5156]">
        <span className="text-[#70757a]">{s.year} — </span>
        <Highlighted text={s.snippet} query={query} />
      </p>
    </div>
  );
}

function ScholarResult({ s, query, visited, saved, onOpen, onSave }: { s: Source; query: string; visited: boolean; saved: boolean; onOpen: () => void; onSave: () => void }) {
  const r = useT().research;
  const host = s.url.split(" ›")[0];
  return (
    <div>
      <button type="button" onClick={onOpen} className={`text-left text-[1rem] leading-snug hover:underline ${visited ? "text-[#660099]" : "text-[#1a0dab]"}`}>
        {s.kind === "book" && <span className="mr-1 text-[0.72rem] font-semibold text-[#5f6368]">[BOOK]</span>}
        {s.title}
      </button>
      {s.pdf && <p className="text-[0.72rem] text-[#1a0dab]">[PDF] {host}</p>}
      <p className="mt-0.5 text-[0.75rem] text-[#006621]">
        {s.authors.join(", ")} - {s.venue ?? s.site}, {s.year} - {host}
      </p>
      <p className="mt-1 text-[0.8rem] leading-relaxed text-[#222]">
        <Highlighted text={s.snippet} query={query} />
      </p>
      <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] text-[#1a0dab]">
        <button type="button" onClick={onSave} className={saved ? "font-semibold text-[#137333]" : ""}>
          {saved ? `★ ${r.saved}` : `☆ ${r.save}`}
        </button>
        <span>❝ {r.cite}</span>
        <span>{fmt(r.citedBy, { n: s.citedBy ?? 0 })}</span>
        <span>{r.relatedArticles}</span>
      </p>
    </div>
  );
}
