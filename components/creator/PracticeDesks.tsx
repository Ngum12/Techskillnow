"use client";
import { useState } from "react";
import type { CreatorProject } from "@/lib/creator/types";
import type { CreatorWorkshopTask } from "@/lib/creator/workshop";
import { exportGuide, launchPack } from "@/lib/creator/export";
import { PublishingRehearsal } from "./PublishingRehearsal";
import {
  BrowserFrame,
  Coach,
  Notice,
  control,
  input,
  primary,
} from "./WorkshopShared";
export function ReviewDesk({
  reader = false,
  save,
  complete,
}: {
  reader?: boolean;
  save: (p: Partial<CreatorProject>) => void;
  complete: () => void;
}) {
  const rows = reader
    ? [
        {
          bad: "Prepare the phone.",
          question: "Reader: “What does prepare mean?”",
          good: "Clean the lens, check storage and charge the phone before you begin.",
          wrong: "Prepare the phone very professionally.",
        },
        {
          bad: "Take a perfect photo.",
          question: "Reader: “How do I know it is good enough?”",
          good: "Check that the whole product is visible and details are sharp. Retake if an edge is cut off or the image is blurry.",
          wrong: "Take the best possible perfect photo.",
        },
        {
          bad: "Send the picture.",
          question: "Reader: “Which version should I send?”",
          good: "Keep the original, then export the selected image. Open the exported copy on your phone and check its clarity before sharing.",
          wrong: "Send whichever file is closest.",
        },
      ]
    : [
        {
          bad: "This guide guarantees sales for every seller.",
          question: "What cannot the author establish?",
          good: "This guide teaches product photography. Sales depend on the offer, audience and other factors.",
          wrong: "This guide guarantees even more sales.",
        },
        {
          bad: "Photo copied from another shop without permission.",
          question: "What rights are missing?",
          good: "Use an original photo or an image with documented commercial-use permission.",
          wrong: "Keep it and add a small credit.",
        },
        {
          bad: "Mix well and continue until perfect.",
          question: "What would confuse a beginner?",
          good: "Replace vague instructions with an observable action, a checkpoint and a correction. Verify technical details before publishing.",
          wrong: "Mix extremely well and make it perfect.",
        },
      ];
  const [active, setActive] = useState<number | null>(null);
  const [fixed, setFixed] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  return (
    <>
      <Coach>
        {reader
          ? "Tap each unclear instruction, hear the reader’s question and choose a revision that actually answers it."
          : "Tap the highlighted parts of this AI draft. Inspect the problem, then replace each with a defensible version."}
      </Coach>
      <BrowserFrame
        title={
          reader
            ? "Beginner trial · revision desk"
            : "AI draft · editorial desk"
        }
        host="TechSkillNow document review"
      >
        <div className="p-4">
          <div className="rounded border bg-[#fffef9] p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-violet-800">
              Draft under review · {fixed.length}/3 repaired
            </p>
            <h4 className="my-4 text-xl font-bold">
              A useful guide needs clear, honest instructions
            </h4>
            {rows.map((r, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setActive(i)}
                className={`my-2 block w-full rounded-lg border p-4 text-left text-sm leading-relaxed ${fixed.includes(i) ? "border-emerald-200 bg-emerald-50" : "border-amber-300 bg-amber-100 underline decoration-dotted"}`}
              >
                {fixed.includes(i) ? `✓ ${r.good}` : r.bad}
              </button>
            ))}
          </div>
          {active !== null && (
            <div className="mt-4 rounded-xl bg-slate-950 p-4 text-white">
              <h5 className="font-semibold">{rows[active].question}</h5>
              <div className="mt-3 grid gap-2">
                {[rows[active].wrong, rows[active].good].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${control} text-left`}
                    onClick={() => {
                      if (option === rows[active].good) {
                        setFixed((v) => Array.from(new Set([...v, active])));
                        setMessage(
                          "The document now shows the corrected version. Compare it with the original.",
                        );
                      } else
                        setMessage(
                          "This keeps the original problem. Choose wording that adds useful detail or removes an unsupported claim.",
                        );
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
          {message && <Notice>{message}</Notice>}
          <button
            type="button"
            className={`${primary} mt-4 w-full`}
            disabled={fixed.length !== 3}
            onClick={() => {
              save(
                reader
                  ? {
                      review:
                        "Practice reader trial: unclear preparation, missing quality checks and file-version confusion were identified and revised. A real reader trial is still required.",
                    }
                  : {
                      verification:
                        "Practice editorial review completed: unsupported earnings, image permissions and vague steps corrected. Verify the facts and licences of my own guide before launch.",
                    },
              );
              complete();
            }}
          >
            Save the corrected practice document
          </button>
        </div>
      </BrowserFrame>
    </>
  );
}
export function PriceDesk({
  project,
  save,
  complete,
}: {
  project: CreatorProject;
  save: (p: Partial<CreatorProject>) => void;
  complete: () => void;
}) {
  const [price, setPrice] = useState(Number(project.price) || 1500);
  const [sales, setSales] = useState(3);
  const [fee, setFee] = useState(5);
  const [cost, setCost] = useState(500);
  const [seen, setSeen] = useState<string[]>([]);
  const revenue = price * sales,
    fees = (revenue * fee) / 100,
    net = revenue - fees - cost;
  return (
    <>
      <Coach>
        Move the controls. Inspect a zero-sales scenario and a three-sales
        scenario, then save a price for your guide.
      </Coach>
      <div className="space-y-5 rounded-2xl border bg-white p-5">
        <p className="rounded-xl bg-amber-50 p-3 text-sm">
          All fees here are hypothetical. Check the live platform’s actual
          percentage, fixed charges, currency conversion and payout costs before
          launch.
        </p>
        {[
          {
            label: "Product price (FCFA)",
            value: price,
            set: setPrice,
            min: 100,
            max: 10000,
            step: 100,
          },
          {
            label: "Fee assumption (%)",
            value: fee,
            set: setFee,
            min: 0,
            max: 30,
            step: 1,
          },
          {
            label: "Launch costs (FCFA)",
            value: cost,
            set: setCost,
            min: 0,
            max: 5000,
            step: 100,
          },
        ].map((f) => (
          <label key={f.label} className="block text-sm font-semibold">
            {f.label}: {f.value}
            <input
              className="mt-3 block w-full accent-violet-800"
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={f.value}
              onChange={(e) => f.set(Number(e.target.value))}
            />
          </label>
        ))}
        <div className="flex gap-2">
          {[0, 3, 10].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={sales === n}
              className={`${control} ${sales === n ? "ring-2 ring-violet-600" : ""}`}
              onClick={() => {
                setSales(n);
                setSeen((v) => Array.from(new Set([...v, String(n)])));
              }}
            >
              {n} sales
            </button>
          ))}
        </div>
        <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
          <dt>Revenue</dt>
          <dd className="text-right font-bold">
            {revenue.toLocaleString()} FCFA
          </dd>
          <dt>Assumed fees</dt>
          <dd className="text-right">−{fees.toLocaleString()} FCFA</dd>
          <dt>Launch cost</dt>
          <dd className="text-right">−{cost.toLocaleString()} FCFA</dd>
          <dt className="font-bold">Remaining before other costs/tax</dt>
          <dd
            aria-live="polite"
            className="text-right text-lg font-bold text-violet-900"
          >
            {net.toLocaleString()} FCFA
          </dd>
        </dl>
        <p className="text-sm">
          {sales === 0
            ? "With no sales, you still bear your launch costs. Spending on promotion is not a guarantee of income."
            : "Revenue is not profit. A confirmed sale is also separate from when the platform lets you withdraw the money."}
        </p>
        <button
          type="button"
          disabled={!seen.includes("0") || !seen.includes("3")}
          className={`${primary} w-full`}
          onClick={() => {
            save({ price: String(price) });
            complete();
          }}
        >
          Save my price after comparing scenarios
        </button>
      </div>
    </>
  );
}
export function FileDesk({
  project,
  complete,
}: {
  project: CreatorProject;
  complete: () => void;
}) {
  const files = [
    { name: "draft-v1.txt", folder: "Drafts" },
    { name: "my-original-photo.jpg", folder: "Images" },
    { name: "guide-final.pdf", folder: "Final" },
    { name: "launch-message.txt", folder: "Launch" },
  ];
  const [selected, setSelected] = useState(0);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [backed, setBacked] = useState(false);
  function backup() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(project, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-product-backup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBacked(true);
  }
  return (
    <>
      <Coach>
        Select a file, then tap its correct folder. Keep the final buyer file
        separate from private working notes.
      </Coach>
      <BrowserFrame
        title="My Digital Product · file organiser"
        host="Phone storage / Google Drive practice"
      >
        <div className="space-y-4 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {files.map((f, i) => (
              <button
                type="button"
                key={f.name}
                className={`${control} text-left ${selected === i ? "ring-2 ring-violet-500" : ""}`}
                onClick={() => setSelected(i)}
              >
                {placed[f.name] ? "✓" : "▤"} {f.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Drafts", "Images", "Final", "Launch"].map((folder) => (
              <button
                type="button"
                key={folder}
                className={`${control} text-left`}
                onClick={() => {
                  if (files[selected].folder !== folder) {
                    setFeedback(
                      "Look at the file’s purpose: working text, original image, buyer PDF or promotion material.",
                    );
                    return;
                  }
                  setPlaced((p) => ({ ...p, [files[selected].name]: folder }));
                  setFeedback(`${files[selected].name} is now in ${folder}.`);
                }}
              >
                📁 {folder}
                <span className="mt-2 block text-xs font-normal">
                  {Object.entries(placed)
                    .filter(([, v]) => v === folder)
                    .map(([k]) => k)
                    .join(", ") || "Empty"}
                </span>
              </button>
            ))}
          </div>
          <button type="button" className={control} onClick={backup}>
            Download a real backup of my project
          </button>
          <p className="text-xs text-slate-600">
            The folder exercise is simulated; the backup download is real. Your
            course draft stays in this browser, so keep backups on your own
            storage.
          </p>
          {feedback && <Notice>{feedback}</Notice>}
          <button
            type="button"
            className={`${primary} w-full`}
            disabled={Object.keys(placed).length < 4 || !backed}
            onClick={() => complete()}
          >
            My files are organised and backed up
          </button>
        </div>
      </BrowserFrame>
    </>
  );
}
export function PaymentDesk({
  project,
  complete,
}: {
  project: CreatorProject;
  complete: () => void;
}) {
  const [view, setView] = useState("payout");
  const [checked, setChecked] = useState<number[]>([]);
  const [delivered, setDelivered] = useState(false);
  return (
    <>
      <Coach>
        First inspect payout requirements. Then follow a practice buyer from
        payment to the delivered PDF.
      </Coach>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={control}
          onClick={() => setView("payout")}
        >
          Seller payout
        </button>
        <button
          type="button"
          className={control}
          onClick={() => setView("buyer")}
        >
          Buyer checkout
        </button>
      </div>
      {view === "payout" ? (
        <BrowserFrame title="Selar · payout practice" host="selar.com">
          <div className="space-y-4 p-4">
            <h4 className="text-lg font-semibold">
              Payment acceptance ≠ withdrawal readiness
            </h4>
            <p className="text-sm leading-relaxed">
              In your real account, select your genuine country, inspect the
              available payout route and complete the requested verification.
              This training screen never asks for account numbers, identity
              documents, PINs or OTPs.
            </p>
            {[
              "Available destination and country requirements",
              "Identity/account verification status",
              "Fees, minimums, holding period and withdrawal timing",
            ].map((label, i) => (
              <details
                key={label}
                className="rounded-xl border p-4"
                onToggle={(e) => {
                  if (e.currentTarget.open)
                    setChecked((v) => Array.from(new Set([...v, i])));
                }}
              >
                <summary className="min-h-10 cursor-pointer text-sm font-semibold">
                  {label}
                </summary>
                <p className="mt-3 text-sm text-slate-600">
                  {i === 0
                    ? "Use only a destination supported for your actual country and account. Buyer MTN/Orange checkout options do not establish which seller withdrawal routes are available."
                    : i === 1
                      ? "Read the status on the official platform and resolve outstanding verification. A store login alone is not evidence that payout is ready."
                      : "Read the current charges and timing in your account. Do not treat a pending order or a balance on hold as immediately withdrawable money."}
                </p>
              </details>
            ))}
            <button
              type="button"
              className={primary}
              disabled={checked.length < 3}
              onClick={() => setView("buyer")}
            >
              I inspected the requirements → Buyer journey
            </button>
          </div>
        </BrowserFrame>
      ) : (
        <PublishingRehearsal
          project={project}
          onComplete={() => setDelivered(true)}
        />
      )}
      <button
        type="button"
        className={`${primary} mt-4 w-full`}
        disabled={checked.length < 3 || !delivered}
        onClick={() => complete()}
      >
        Finish the payout and delivery rehearsal
      </button>
    </>
  );
}
export function LaunchDesk({
  project,
  save,
  complete,
}: {
  project: CreatorProject;
  save: (p: Partial<CreatorProject>) => void;
  complete: () => void;
}) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [reply, setReply] = useState("");
  const [feedback, setFeedback] = useState("");
  const model = `Struggling to ${project.outcome || "take clear product photos"}? Here is one useful tip: check the whole subject fits before you take the photo. I created “${project.title || "My practical guide"}” for ${project.audience || "phone-first beginners"}. It includes steps, checkpoints and troubleshooting. Price: ${project.price || "1500"} FCFA. Ask for a preview if it suits you. [Add your real Selar product link after publishing.]`;
  return (
    <>
      <Coach>
        Build a useful launch message from the taught example, inspect it as a
        WhatsApp status, then answer a customer’s question.
      </Coach>
      <BrowserFrame
        title="WhatsApp-style · launch practice"
        host="Training message composer"
      >
        <div className="space-y-4 p-4">
          <p className="rounded-xl bg-amber-50 p-3 text-sm">
            <strong>Message recipe:</strong> useful tip → reader and result →
            contents → price → honest next action. Ask permission before sending
            privately or promoting in a group.
          </p>
          <button
            type="button"
            className={control}
            onClick={() => setText(model)}
          >
            Start with the worked message
          </button>
          <label className="block text-sm font-semibold">
            Your launch message
            <textarea
              className={`${input} mt-2`}
              rows={7}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={primary}
            onClick={() => {
              if (
                text.trim().length < 60 ||
                /guarantee.*(?:income|sales)|get rich/i.test(text)
              ) {
                setFeedback(
                  "Use the worked structure and avoid unsupported income promises.",
                );
                return;
              }
              setSent(true);
            }}
          >
            Preview status →
          </button>
          {sent && (
            <>
              <div className="rounded-2xl bg-[#075e54] p-5 text-white">
                <p className="text-xs text-emerald-100">
                  My practice status · not sent
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {text}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-4 text-sm">
                <strong>Customer:</strong> “Am I buying a physical item or a
                downloadable file? Is coaching included?”
              </div>
              <label className="block text-sm font-semibold">
                Your reply
                <input
                  className={`${input} mt-2`}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="It is a downloadable PDF guide; live coaching is not included."
                />
              </label>
              <button
                type="button"
                className={primary}
                onClick={() => {
                  if (
                    !/pdf|download|file|digital/i.test(reply) ||
                    !/not|no |exclud/i.test(reply)
                  ) {
                    setFeedback(
                      "Clearly name the digital format and explain that coaching is not included.",
                    );
                    return;
                  }
                  save({
                    launch: `LAUNCH MESSAGE\n${text}\n\nSUPPORT REPLY\n${reply}\n\nSEVEN-DAY PLAN\n1. Share a useful tip with a suitable audience.\n2. Demonstrate one task.\n3. Show a preview.\n4. Answer actual questions.\n5. Explain who it suits.\n6. Invite feedback without pressure.\n7. Review real visits, questions, sales and costs.`,
                  });
                  complete();
                  setFeedback(
                    "Message and support reply saved. No message was sent to anyone.",
                  );
                }}
              >
                Save my message and support reply
              </button>
            </>
          )}
          {feedback && <Notice>{feedback}</Notice>}
        </div>
      </BrowserFrame>
    </>
  );
}
export function HandoverDesk({
  project,
  save,
  complete,
}: {
  project: CreatorProject;
  save: (p: Partial<CreatorProject>) => void;
  complete: () => void;
}) {
  const tasks = [
    {
      title: "Use your real AI account",
      url: "https://chatgpt.com",
      action:
        "Copy your practised prompt into the actual service. Review its response and personalise the guide with your own tested knowledge.",
    },
    {
      title: "Inspect your final PDF",
      url: "https://www.canva.com",
      action:
        "Open your final export on your phone. Check readability, original or licensed images, accurate steps and the correct file version.",
    },
    {
      title: "Ask one real reader to try a section",
      action:
        "Observe where they hesitate. Revise the confusing instruction. The earlier practice reader was fictional; this one must be a real intended user.",
    },
    {
      title: "Create your real Selar store",
      url: "https://selar.com",
      action:
        "Use your own email, genuine country and details. Complete the verification requested by Selar. Existing account holders can use their account.",
    },
    {
      title: "Configure payments and payout",
      url: "https://selar.com",
      action:
        "Inspect the actual Cameroon checkout methods, supported payout destination, fees, verification and holding periods. Resolve blockers before launching.",
    },
    {
      title: "Publish and check your actual listing",
      url: "https://selar.com",
      action:
        "Upload your final PDF and preview, set price/currency, publish, and check delivery through a supported preview/test method. Paste the real product link below.",
    },
  ];
  const [at, setAt] = useState(0);
  const [url, setUrl] = useState(project.storeUrl);
  const [message, setMessage] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const realPrompt = `Help me create an original short practical guide. My reader: ${project.audience || "[describe the reader and available tools]"}. The result: ${project.outcome || "[one achievable task]"}. Working title: ${project.title || "[title]"}. Ask me about my tested method, materials and missing details before drafting. Then propose an outline and draft one section at a time with actions, checkpoints and troubleshooting. Use plain language. Do not invent quantities, evidence, licences, testimonials or earnings. Flag facts I must verify.`;
  function next() {
    if (at === 5) {
      try {
        const u = new URL(url);
        if (
          u.protocol !== "https:" ||
          !["selar.com", "selar.co"].some(
            (h) => u.hostname === h || u.hostname.endsWith("." + h),
          ) ||
          u.pathname === "/"
        )
          throw new Error();
        save({ storeUrl: url });
      } catch {
        setMessage(
          "Paste the HTTPS link to your published Selar product, not a dashboard, sign-up or home page.",
        );
        return;
      }
    }
    setMessage("");
    setAt((n) => n + 1);
  }
  return (
    <>
      <Coach>
        Complete one real-world action at a time. Return when you have done it.
        The platform cannot verify external accounts or transactions for you.
      </Coach>
      <div className="rounded-2xl border bg-white p-5">
        {at < tasks.length ? (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
              Real-world handover · {at + 1}/{tasks.length}
            </p>
            <h4 className="mt-3 text-xl font-bold">{tasks[at].title}</h4>
            <p className="my-4 leading-relaxed">{tasks[at].action}</p>
            {tasks[at].url && (
              <a
                href={tasks[at].url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${control} mb-4 block text-center`}
              >
                Open actual platform ↗
              </a>
            )}
            {at === 0 && (
              <details className="mb-4 rounded-xl border p-4">
                <summary className="min-h-10 cursor-pointer text-sm font-semibold">
                  Take my adapted prompt to the real assistant
                </summary>
                <p className="my-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {realPrompt}
                </p>
                <button
                  type="button"
                  className={control}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(realPrompt);
                      setMessage(
                        "Prompt copied. Paste it into your actual AI account and answer its questions.",
                      );
                    } catch {
                      setMessage(
                        "Select the prompt above and copy it manually.",
                      );
                    }
                  }}
                >
                  Copy my adapted prompt
                </button>
                <label className="mt-4 block text-sm font-semibold">
                  Bring back my reviewed response (optional)
                  <textarea
                    rows={7}
                    className={`${input} mt-2`}
                    value={project.draft}
                    onChange={(e) =>
                      save({ draft: e.target.value.slice(0, 60000) })
                    }
                  />
                </label>
                <p className="mt-2 text-xs text-slate-600">
                  Paste your own reviewed material if you want to continue
                  designing it here. This is optional; you can also work in the
                  actual design tool.
                </p>
              </details>
            )}
            {at === 5 && (
              <label className="mb-4 block text-sm font-semibold">
                My published product link
                <input
                  type="url"
                  className={`${input} mt-2`}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </label>
            )}
            <button
              type="button"
              className={`${primary} w-full`}
              onClick={next}
            >
              I completed this real-world action
            </button>
            <p className="mt-3 text-xs text-slate-600">
              This is your declaration, not an automatic verification. Do not
              mark an unresolved task complete.
            </p>
          </>
        ) : (
          <>
            <h4 className="text-2xl font-bold text-violet-950">
              Your launch folder
            </h4>
            <p className="my-4">
              You have rehearsed the tools and declared the real setup complete.
              Keep your project and launch messages backed up. Actual sales are
              not required to complete the course.
            </p>
            <button
              type="button"
              className={`${control} w-full`}
              onClick={() => {
                const text = launchPack({ ...project, storeUrl: url });
                const address = URL.createObjectURL(
                  new Blob([text], { type: "text/plain" }),
                );
                const a = document.createElement("a");
                a.href = address;
                a.download = "my-launch-pack.txt";
                a.click();
                setTimeout(() => URL.revokeObjectURL(address), 1000);
                setDownloaded(true);
              }}
            >
              Download my launch pack
            </button>
            <button
              type="button"
              className={`${primary} mt-3 w-full`}
              disabled={!downloaded}
              onClick={() => complete()}
            >
              Finish my practical pathway
            </button>
          </>
        )}
        {message && <Notice>{message}</Notice>}
      </div>
    </>
  );
}
