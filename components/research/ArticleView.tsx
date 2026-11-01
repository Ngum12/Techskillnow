"use client";
/**
 * The page a learner lands on after tapping a search result. Each kind of source looks like the real kind of
 * site (journal, university repository, newspaper, blog, encyclopedia, forum), so learners learn to tell them apart.
 */
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { apaReference } from "@/lib/research/apa";
import type { Source } from "@/lib/research/search";
import { abstractRoles, type Role } from "@/lib/research/reading";

const serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const;

export function Reference({ s }: { s: Source }) {
  return (
    <>
      {apaReference(s).map((p, i) =>
        p.italic ? (
          <i key={i}>{p.text}</i>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

function CiteBox({ s }: { s: Source }) {
  const r = useT().research;
  return (
    <div className="mt-4 rounded-md border border-[#d7dbe0] bg-[#f7f9fb] p-3">
      <p className="text-[0.7rem] font-bold uppercase tracking-wide text-[#5f6368]">{r.page.howToCite}</p>
      <p className="mt-1 pl-6 -indent-6 text-[0.82rem] leading-relaxed text-[#202124]">
        <Reference s={s} />
      </p>
    </div>
  );
}

const MARK: Record<Role, string> = {
  aim: "bg-[#e0e7ff]",
  method: "bg-[#dbeafe]",
  finding: "bg-[#dcfce7]",
  recommendation: "bg-[#fef3c7]",
  other: "",
};

/**
 * The abstract, with the reading guide on: each sentence highlighted by its role (aim, method, finding,
 * recommendation) and a short note on what else to read. Off, it is plain text, as on the real site.
 */
function Abstract({ text, guide, className, style }: { text: string; guide: boolean; className: string; style?: React.CSSProperties }) {
  const t = useT().research;
  const g = t.guide;
  if (!text) return <p className={`${className} italic text-[#5f6368]`}>{t.live.noAbstract}</p>;
  if (!guide) {
    return (
      <p className={className} style={style}>
        {text}
      </p>
    );
  }
  const parts = abstractRoles(text);
  const used = (["aim", "method", "finding", "recommendation"] as const).filter((r) => parts.some((x) => x.role === r));
  return (
    <>
      <div className="mt-2 rounded-md border border-[#c7d2fe] bg-[#f5f7ff] p-2.5 text-[0.75rem] leading-relaxed text-[#1e1b4b]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <p className="font-bold">🔎 {g.title}</p>
        <p className="mt-0.5">{g.text}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {used.map((r) => (
            <span key={r} className={`rounded px-1.5 py-0.5 font-semibold ${MARK[r]}`}>
              {g.roles[r]}
            </span>
          ))}
        </div>
      </div>
      <p className={className} style={style}>
        {parts.map((x, i) => (
          <span key={i}>
            <span className={`${MARK[x.role]} rounded-sm`} title={x.role === "other" ? undefined : g.roles[x.role]}>
              {x.text}
            </span>{" "}
          </span>
        ))}
      </p>
      <p className="mt-2 text-[0.72rem] text-[#5f6368]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        📄 {g.fullText}
      </p>
    </>
  );
}

export function ArticleView({ s, guide = false }: { s: Source; guide?: boolean }) {
  const r = useT().research;
  const p = r.page;

  if (s.kind === "journal" || s.kind === "report" || s.kind === "book") {
    return (
      <div className="bg-white">
        <div className="bg-[#1f3a5f] px-4 py-3 text-white">
          <p className="text-[0.95rem] font-semibold" style={serif}>
            {s.venue ?? s.site}
          </p>
          <p className="text-[0.68rem] opacity-80">
            {s.kind === "journal" ? [s.volume && `${p.volume} ${s.volume}`, s.pages && `pp. ${s.pages}`].filter(Boolean).join(" · ") || p.researchArticle : s.kind === "report" ? p.report : p.book}
          </p>
        </div>
        <div className="px-4 py-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-[#8a5a00]">{s.kind === "journal" ? p.researchArticle : s.kind === "report" ? p.report : p.book}</p>
          <h1 className="mt-1 text-[1.2rem] leading-snug text-[#1f2933]" style={serif}>
            {s.title}
          </h1>
          <p className="mt-2 text-[0.82rem] text-[#1f3a5f]">{s.authors.join(" · ")}</p>
          <p className="text-[0.72rem] text-[#5f6368]">
            {p.published} {s.year}
          </p>
          <div className="mt-3 flex gap-2">
            {s.pdf && <span className="rounded bg-[#1f3a5f] px-3 py-1.5 text-[0.72rem] font-semibold text-white">⬇ {p.download}</span>}
            <span className="rounded border border-[#1f3a5f] px-3 py-1.5 text-[0.72rem] font-semibold text-[#1f3a5f]">❝ {p.cite}</span>
          </div>
          <h2 className="mt-4 text-[0.9rem] font-bold text-[#1f2933]">{p.abstract}</h2>
          <Abstract text={s.abstract} guide={guide} className="mt-1 text-[0.85rem] leading-relaxed text-[#3c4043]" style={serif} />
          <p className="mt-3 text-[0.72rem] font-bold text-[#1f2933]">{p.keywords}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {s.keywords.map((k) => (
              <span key={k} className="rounded-full bg-[#eef2f7] px-2 py-0.5 text-[0.7rem] text-[#1f3a5f]">
                {k}
              </span>
            ))}
          </div>
          <CiteBox s={s} />
        </div>
      </div>
    );
  }

  if (s.kind === "thesis") {
    const university = s.site.replace(/ (Repository|Theses)$/, "");
    const rows: [string, string][] = [
      [p.title, s.title],
      [p.author, s.authors.join("; ")],
      [p.degree, s.degree ?? ""],
      [p.year, String(s.year)],
    ];
    return (
      <div className="bg-white">
        <div className="flex items-center gap-2 border-b-4 border-[#7a1f2b] bg-white px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[#7a1f2b] text-[0.8rem] font-bold text-white" style={serif}>
            {university.charAt(0)}
          </span>
          <div>
            <p className="text-[0.85rem] font-semibold text-[#7a1f2b]" style={serif}>
              {university}
            </p>
            <p className="text-[0.66rem] text-[#5f6368]">{p.repository}</p>
          </div>
        </div>
        <div className="px-4 py-4">
          <p className="text-[0.68rem] text-[#5f6368]">
            {p.home} › {p.theses} › {s.year}
          </p>
          <table className="mt-3 w-full text-[0.78rem]">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-[#eceff1] align-top">
                  <th className="w-24 py-1.5 pr-2 text-left font-semibold text-[#5f6368]">{k}</th>
                  <td className="py-1.5 text-[#202124]">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="mt-4 text-[0.88rem] font-bold text-[#202124]">{p.abstract}</h2>
          <Abstract text={s.abstract} guide={guide} className="mt-1 text-[0.85rem] leading-relaxed text-[#3c4043]" />
          <div className="mt-4 rounded border border-[#eceff1]">
            <p className="bg-[#f6f7f8] px-3 py-1.5 text-[0.72rem] font-bold text-[#5f6368]">{p.files}</p>
            <p className="flex items-center justify-between px-3 py-2 text-[0.78rem]">
              <span>📄 {s.id}.pdf · 1.8 MB</span>
              <span className="font-semibold text-[#7a1f2b]">{p.viewOpen}</span>
            </p>
          </div>
          <CiteBox s={s} />
        </div>
      </div>
    );
  }

  if (s.kind === "news") {
    return (
      <div className="bg-white">
        <div className="border-b-2 border-[#202124] px-4 py-2 text-center">
          <p className="text-[1.3rem] font-bold tracking-tight text-[#202124]" style={serif}>
            {s.site}
          </p>
        </div>
        <div className="px-4 py-4">
          <h1 className="text-[1.15rem] font-bold leading-snug text-[#202124]" style={serif}>
            {s.title}
          </h1>
          <p className="mt-1 text-[0.72rem] text-[#5f6368]">
            {fmt(p.by, { name: s.authors[0] ?? s.site })} · {s.year}
          </p>
          <div className="mt-3 flex aspect-[16/8] items-center justify-center rounded bg-[#e8eaed] text-[0.7rem] text-[#80868b]">{p.photo}</div>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-[#3c4043]" style={serif}>
            {s.snippet}
          </p>
        </div>
      </div>
    );
  }

  if (s.kind === "blog") {
    return (
      <div className="bg-[#fffbea]">
        <div className="bg-gradient-to-r from-[#ff6b00] to-[#e6007e] px-4 py-3">
          <p className="text-[1rem] font-extrabold text-white">{s.site} 🔥</p>
        </div>
        <div className="px-4 py-4">
          <div className="rounded border-2 border-dashed border-[#e6007e] bg-white p-2 text-center text-[0.72rem] font-bold text-[#e6007e]">{p.ad}</div>
          <h1 className="mt-3 text-[1.1rem] font-extrabold leading-snug text-[#202124]">{s.title}</h1>
          <p className="mt-2 text-[0.85rem] leading-relaxed text-[#3c4043]">{s.snippet}</p>
          <ol className="mt-2 list-decimal pl-5 text-[0.8rem] text-[#3c4043]">
            <li>{p.blogTopic1}</li>
            <li>{p.blogTopic2}</li>
            <li>{p.blogTopic3}</li>
          </ol>
        </div>
      </div>
    );
  }

  if (s.kind === "forum") {
    return (
      <div className="bg-[#f6f7f8]">
        <div className="bg-[#2d3e50] px-4 py-2.5 text-[0.9rem] font-bold text-white">{s.site}</div>
        <div className="space-y-2 p-3">
          <div className="rounded border border-[#dfe3e8] bg-white p-3">
            <p className="text-[0.7rem] font-semibold text-[#2d3e50]">{p.forumAsker}</p>
            <p className="mt-1 text-[0.9rem] font-semibold text-[#202124]">{s.title}</p>
            <p className="mt-1 text-[0.8rem] text-[#3c4043]">{s.snippet}</p>
          </div>
          {[p.forumReply1, p.forumReply2].map((x, i) => (
            <div key={i} className="ml-4 rounded border border-[#dfe3e8] bg-white p-3">
              <p className="text-[0.7rem] font-semibold text-[#2d3e50]">{i ? "tabi_ndip" : "nkeng_a"}</p>
              <p className="mt-1 text-[0.8rem] text-[#3c4043]">{x}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Encyclopedia
  return (
    <div className="bg-white px-4 py-4">
      <h1 className="border-b border-[#a2a9b1] pb-1 text-[1.35rem] text-[#202122]" style={serif}>
        {s.title.replace(/ – Open Encyclopedia$/, "")}
      </h1>
      <p className="mt-1 text-[0.7rem] text-[#54595d]">{p.fromEncyclopedia}</p>
      <p className="mt-3 text-[0.85rem] leading-relaxed text-[#202122]">{s.snippet}</p>
      <div className="mt-3 inline-block rounded border border-[#a2a9b1] bg-[#f8f9fa] p-2 text-[0.75rem]">
        <p className="font-bold">{p.contents}</p>
        <ol className="list-decimal pl-5 text-[#3366cc]">
          <li>{p.history}</li>
          <li>{p.debates}</li>
          <li>{p.references}</li>
        </ol>
      </div>
    </div>
  );
}
