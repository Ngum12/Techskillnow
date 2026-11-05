"use client";
import { useEffect, useState } from "react";
import type { CreatorProject } from "@/lib/creator/types";
import {
  BrowserFrame,
  Coach,
  Notice,
  control,
  input,
  primary,
} from "./WorkshopShared";
export function StoreWalkthrough({
  phase,
  project,
  save,
  complete,
}: {
  phase?: string;
  project: CreatorProject;
  save: (p: Partial<CreatorProject>) => void;
  complete: () => void;
}) {
  const [tab, setTab] = useState("home");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [price, setPrice] = useState(project.price || "1500");
  const [file, setFile] = useState<{
    name: string;
    url: string;
    size: number;
  } | null>(null);
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(
    () => () => {
      if (file) URL.revokeObjectURL(file.url);
    },
    [file],
  );
  const profile = phase === "profile";
  function submit() {
    const errors = [];
    if (profile) {
      if (name.trim().length < 3)
        errors.push("Give the practice store a recognisable name.");
      if (bio.trim().length < 15)
        errors.push(
          "Say who the store helps and what kind of guide it offers.",
        );
      if (email.toLowerCase().trim() !== "merveille@example.com")
        errors.push("Use the practice support email merveille@example.com.");
    } else {
      if (title.trim().length < 8)
        errors.push("Use a descriptive product title.");
      if (!/^[0-9]+$/.test(price) || Number(price) < 100)
        errors.push("Enter a whole-number price of at least 100 FCFA.");
      if (description.trim().length < 40)
        errors.push(
          "Say what the buyer receives, who it suits and what is excluded.",
        );
      if (!file) errors.push("Choose a real PDF for the practice upload.");
    }
    if (errors.length) {
      setMessage(errors.join(" "));
      return;
    }
    setPublished(true);
    if (!profile) save({ title, price, description });
    complete();
    setMessage(
      profile
        ? "Practice profile saved. Your store identity is visible below."
        : "Practice listing published below. No real product has been uploaded to Selar.",
    );
  }
  return (
    <>
      <Coach>
        {profile
          ? "Open Store settings, enter the supplied practice details, then save and inspect the store."
          : "Open Products → Add product. Upload your guide, set the price and inspect the customer-facing result."}
      </Coach>
      <BrowserFrame title="Selar · seller practice" host="selar.com">
        <nav
          className="flex gap-2 overflow-x-auto border-b bg-slate-50 p-3"
          aria-label="Practice seller dashboard"
        >
          {["home", "settings", "products", "orders"].map((t) => (
            <button
              type="button"
              key={t}
              className={`${control} capitalize ${tab === t ? "ring-2 ring-violet-600" : ""}`}
              onClick={() => {
                setTab(t);
                setMessage(
                  t === "orders"
                    ? "No real orders here. In the actual dashboard, check confirmed transactions rather than screenshots."
                    : "",
                );
              }}
            >
              {t === "settings" ? "Store settings" : t}
            </button>
          ))}
        </nav>
        <div className="space-y-4 p-4">
          {tab === "home" && (
            <>
              <h4 className="text-xl font-semibold">Welcome, Merveille</h4>
              <p className="text-sm text-slate-600">
                Your training store has no real sales. Start with{" "}
                {profile ? "Store settings" : "Products"} above.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-violet-50 p-4 text-sm">
                  Practice revenue
                  <br />
                  <strong className="text-xl">0 FCFA</strong>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  Orders
                  <br />
                  <strong className="text-xl">0</strong>
                </div>
              </div>
            </>
          )}
          {tab === "settings" && (
            <>
              <h4 className="text-lg font-semibold">Store identity</h4>
              <p className="text-sm text-slate-600">
                Practice with “Merveille’s Practical Guides”, a short
                description and merveille@example.com. The real platform may
                arrange these controls differently.
              </p>
              <label className="block text-sm font-semibold">
                Store name
                <input
                  className={`${input} mt-2`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block text-sm font-semibold">
                Who you help
                <input
                  className={`${input} mt-2`}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Useful phone-friendly guides for home bakers"
                />
              </label>
              <label className="block text-sm font-semibold">
                Support email
                <input
                  className={`${input} mt-2`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {profile && (
                <button type="button" className={primary} onClick={submit}>
                  Save store profile
                </button>
              )}
            </>
          )}
          {tab === "products" && (
            <>
              {published && !profile ? (
                <div className="rounded-xl border p-4">
                  <p className="text-xs font-bold uppercase text-emerald-800">
                    Practice listing · visible to a training buyer
                  </p>
                  <h4 className="mt-3 text-xl font-semibold">{title}</h4>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                    {description}
                  </p>
                  <p className="mt-4 text-2xl font-bold">
                    {Number(price).toLocaleString()} FCFA
                  </p>
                  <p className="mt-2 text-xs">PDF download · {file?.name}</p>
                  <a
                    href={file?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${control} mt-4 block text-center`}
                  >
                    Preview the attached file ↗
                  </a>
                  <button
                    type="button"
                    className={`${control} mt-3`}
                    onClick={() => setPublished(false)}
                  >
                    Edit listing
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="text-lg font-semibold">
                    ＋ Add product → Digital download
                  </h4>
                  <p className="text-sm text-slate-600">
                    A guide is a downloadable file, not a physical cake or a
                    live class. Your price belongs to your guide; the
                    TechSkillNow course price is separate.
                  </p>
                  <label className="block text-sm font-semibold">
                    Product title
                    <input
                      className={`${input} mt-2`}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={180}
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Price · XAF / FCFA
                    <input
                      className={`${input} mt-2`}
                      inputMode="numeric"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Description
                    <button
                      type="button"
                      className="ml-3 min-h-10 text-xs underline"
                      onClick={() =>
                        setDescription(
                          `For ${project.audience || "home bakers using a phone"}. This downloadable PDF helps you ${project.outcome || "prepare clear product photos"}. Includes preparation, numbered actions, checkpoints and troubleshooting. It does not include equipment, a physical product or live coaching.`,
                        )
                      }
                    >
                      Start from the taught structure
                    </button>
                    <textarea
                      rows={5}
                      className={`${input} mt-2`}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Upload PDF · practice only
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="mt-2 block w-full text-sm"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setFile(null);
                        try {
                          if (
                            f.size > 20000000 ||
                            new TextDecoder().decode(
                              await f.slice(0, 5).arrayBuffer(),
                            ) !== "%PDF-"
                          ) {
                            setMessage(
                              "Choose an actual PDF under 20 MB, not a renamed file.",
                            );
                            return;
                          }
                          setFile({
                            name: f.name,
                            size: f.size,
                            url: URL.createObjectURL(f),
                          });
                          setMessage(
                            "PDF selected. It stays in this browser session; nothing is uploaded to Selar.",
                          );
                        } catch {
                          setMessage(
                            "Could not read that file. Export the PDF again and retry.",
                          );
                        }
                      }}
                    />
                  </label>
                  {file && (
                    <p className="text-sm text-emerald-900">
                      ✓ {file.name} · {(file.size / 1000000).toFixed(2)} MB
                    </p>
                  )}
                  <button type="button" className={primary} onClick={submit}>
                    Publish practice listing
                  </button>
                </>
              )}
            </>
          )}
          {published && profile && (
            <div className="rounded-xl bg-violet-950 p-5 text-white">
              <h4 className="text-xl font-bold">{name}</h4>
              <p className="mt-2">{bio}</p>
              <p className="mt-3 text-sm text-violet-200">Support: {email}</p>
              <p className="mt-2 text-xs">
                Practice profile saved, not a real account.
              </p>
            </div>
          )}
          {message && <Notice>{message}</Notice>}
        </div>
      </BrowserFrame>
    </>
  );
}
