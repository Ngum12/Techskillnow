"use client";
import { useState } from "react";
import type { CreatorWorkshopTask } from "@/lib/creator/workshop";
import {
  BrowserFrame,
  Coach,
  Notice,
  control,
  input,
  primary,
} from "./WorkshopShared";

const settings = {
  ChatGPT: {
    host: "chatgpt.com",
    color: "bg-[#102e29]",
    purpose: "Ask questions, improve prompts and review draft responses.",
    controls: ["New chat", "Message composer", "Account menu"],
    targets: [
      "Start a fresh conversation",
      "Type and send a prompt",
      "Inspect account and plan settings",
    ],
  },
  Canva: {
    host: "canva.com",
    color: "bg-gradient-to-r from-cyan-700 to-violet-700",
    purpose: "Design a cover, arrange pages and export a PDF.",
    controls: ["Create a design", "Uploads", "Share / Download"],
    targets: [
      "Start a document design",
      "Add your own photos",
      "Export the finished PDF",
    ],
  },
  Selar: {
    host: "selar.com",
    color: "bg-[#58104b]",
    purpose: "List your digital guide, manage orders and inspect payouts.",
    controls: ["Products", "Orders", "Payout settings"],
    targets: [
      "Create a digital download listing",
      "Find a confirmed customer transaction",
      "Check verification and withdrawal requirements",
    ],
  },
  "Google Drive": {
    host: "drive.google.com",
    color: "bg-blue-800",
    purpose: "Organise drafts, images and final files.",
    controls: ["New", "My Drive", "Share"],
    targets: [
      "Create a folder or upload a file",
      "Find your saved work",
      "Manage who can access a file",
    ],
  },
};
export function AccountWalkthrough({
  task,
  complete,
}: {
  task: CreatorWorkshopTask;
  complete: (message?: string) => void;
}) {
  const tool = task.tool || "ChatGPT";
  const s = settings[tool];
  const [screen, setScreen] = useState(0);
  const [method, setMethod] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [tour, setTour] = useState(0);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [skipped, setSkipped] = useState(false);
  function next() {
    setFeedback("");
    if (screen === 1 && !method) {
      setFeedback(
        "Choose an account route. A Google account is one option; email is another.",
      );
      return;
    }
    if (screen === 1 && method === "Continue with Google") {
      setScreen(6);
      return;
    }
    if (
      screen === 2 &&
      email.toLowerCase().trim() !== "merveille@example.com"
    ) {
      setFeedback(
        "For this exercise enter merveille@example.com. Use your own email only on the real service.",
      );
      return;
    }
    if (screen === 3 && password !== "PracticeOnly!27") {
      setFeedback(
        "Type the supplied practice password: PracticeOnly!27. Never enter a real password in a simulation.",
      );
      return;
    }
    if (screen === 4 && code.trim() !== "482601") {
      setFeedback(
        "Open the practice inbox below and enter its six-digit code: 482601.",
      );
      return;
    }
    setScreen((n) => n + 1);
  }
  const prompts = [
    "Select the sign-up option.",
    "Choose how to create the practice account.",
    "Enter the supplied practice email.",
    "Practise choosing a password using the supplied dummy value.",
    "Find the verification message and enter its code.",
    "Your practice workspace is open. Find each control below.",
  ];
  return (
    <>
      <Coach>
        {screen === 6
          ? "Choose the supplied practice Google account, then inspect the tool workspace."
          : prompts[Math.min(screen, 5)]}
      </Coach>
      <BrowserFrame title={tool} host={s.host}>
        {screen === 6 ? (
          <div className="space-y-4 p-5">
            <p className="text-2xl font-semibold">Google · choose an account</p>
            <p className="text-sm">
              On the real service, Google controls its own sign-in and consent
              screens. Check the destination and requested access. This is a
              practice account selector.
            </p>
            <button
              type="button"
              className={`${control} w-full text-left`}
              onClick={() => {
                setScreen(5);
                setFeedback(
                  "The practice Google route is complete. No new password or email code was required in this example. Inspect the workspace next.",
                );
              }}
            >
              Merveille · merveille@example.com
            </button>
            <button
              type="button"
              className={control}
              onClick={() => {
                setScreen(1);
                setMethod("");
              }}
            >
              Choose another route
            </button>
          </div>
        ) : screen < 5 ? (
          <div className="p-5 sm:p-7">
            <div className={`mb-5 rounded-xl p-5 text-white ${s.color}`}>
              <h4 className="text-2xl font-bold">
                {screen === 0 ? `Welcome to ${tool}` : "Create your account"}
              </h4>
              <p className="mt-2 text-sm">{s.purpose}</p>
            </div>
            {screen === 0 && (
              <div className="grid gap-3">
                <button
                  type="button"
                  className={primary}
                  onClick={() => setScreen(1)}
                >
                  Sign up
                </button>
                <button
                  type="button"
                  className={control}
                  onClick={() => {
                    setSkipped(true);
                    setScreen(5);
                  }}
                >
                  I already have an account — skip sign-up
                </button>
                <p className="text-xs leading-relaxed text-slate-600">
                  This is a representative email sign-up pathway. Live screens,
                  Google sign-in, verification and eligibility requirements
                  vary. No account is created here.
                </p>
              </div>
            )}
            {screen === 1 && (
              <div className="grid gap-3">
                {["Continue with email", "Continue with Google"].map((m) => (
                  <button
                    type="button"
                    key={m}
                    aria-pressed={method === m}
                    className={`${control} ${method === m ? "ring-2 ring-violet-600" : ""}`}
                    onClick={() => setMethod(m)}
                  >
                    {m}
                  </button>
                ))}
                <p className="text-xs text-slate-600">
                  The email route rehearses password and email verification. The
                  Google route uses a practice account selector instead. On the
                  real platform, the provider controls its own sign-in screens.
                </p>
              </div>
            )}
            {screen === 2 && (
              <label className="block text-sm font-semibold">
                Email address
                <span className="my-2 block text-sm font-normal">
                  Practice identity: <code>merveille@example.com</code>
                </span>
                <input
                  className={input}
                  type="email"
                  autoComplete="off"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            {screen === 3 && (
              <label className="block text-sm font-semibold">
                Practice password
                <span className="my-2 block text-sm font-normal">
                  Use only: <code>PracticeOnly!27</code>. In real life, choose a
                  unique password and keep it private.
                </span>
                <input
                  className={input}
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="mt-2 min-h-12 text-sm underline"
                  onClick={() => setShow((v) => !v)}
                >
                  {show ? "Hide" : "Show"} practice password
                </button>
              </label>
            )}
            {screen === 4 && (
              <>
                <label className="block text-sm font-semibold">
                  Verification code
                  <input
                    className={`${input} mt-2`}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </label>
                <details className="mt-4 rounded-xl border bg-slate-50 p-4">
                  <summary className="min-h-10 cursor-pointer text-sm font-semibold">
                    ✉ Open practice inbox · 1 new message
                  </summary>
                  <p className="mt-3 text-sm">
                    From: {tool} training mailbox
                    <br />
                    To: merveille@example.com
                    <br />
                    Your practice code: <strong>482601</strong>
                  </p>
                  <p className="mt-2 text-xs">
                    A training message only. Real verification codes belong only
                    in the service that requested them.
                  </p>
                </details>
              </>
            )}
            {screen > 0 && (
              <button
                type="button"
                className={`${primary} mt-5 w-full`}
                onClick={next}
              >
                {screen === 4 ? "Verify practice email" : "Continue"}
              </button>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className={`rounded-xl p-5 text-white ${s.color}`}>
              <p className="text-xs uppercase tracking-widest">
                {skipped ? "Account setup skipped" : "Practice account created"}
              </p>
              <h4 className="mt-2 text-xl font-bold">Merveille’s workspace</h4>
              <p className="mt-2 text-sm">{s.purpose}</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {s.controls.map((label, i) => (
                <button
                  type="button"
                  key={label}
                  className={control}
                  onClick={() => {
                    if (i === tour) {
                      setFeedback(`${label}: ${s.targets[i]}.`);
                      if (tour === 2)
                        complete(
                          "Tool tour completed. You can recognise the main workspace controls.",
                        );
                      setTour((t) => Math.min(3, t + 1));
                    } else
                      setFeedback(
                        `Look for the control that lets you: ${s.targets[Math.min(tour, 2)].toLowerCase()}.`,
                      );
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold">
              {tour < 3
                ? `Find this control: ${s.targets[tour]}`
                : "✓ Workspace tour complete"}
            </p>
            <a
              href={`https://${s.host}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${control} mt-4 block text-center`}
            >
              Open the real {tool} ↗
            </a>
            <p className="mt-3 text-xs text-slate-600">
              Now you know the route. Repeat it in your own account when ready.
              Choose the free option where available; plan limits may change.
            </p>
          </div>
        )}
      </BrowserFrame>
      {feedback && <Notice>{feedback}</Notice>}
    </>
  );
}
