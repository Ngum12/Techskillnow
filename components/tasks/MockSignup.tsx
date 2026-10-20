"use client";
import { useState } from "react";
import type { SignupTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { Feedback } from "./Feedback";

const FUN_WORDS = ["sexy", "baby", "boss", "queen", "king", "sweet", "cool", "princess", "lover", "swag", "bad", "cute", "fine"];

const simplify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");

function GoogleMark() {
  return (
    <p aria-hidden="true" className="text-2xl font-semibold tracking-tight">
      <span className="text-[#4285f4]">G</span>
      <span className="text-[#ea4335]">o</span>
      <span className="text-[#fbbc05]">o</span>
      <span className="text-[#4285f4]">g</span>
      <span className="text-[#34a853]">l</span>
      <span className="text-[#ea4335]">e</span>
    </p>
  );
}

function Field({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="mt-4 block">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      <input className={`input ${error ? "border-err" : ""}`} aria-invalid={!!error} {...props} />
      {error && <span className="mt-1 block text-sm text-err">{error}</span>}
    </label>
  );
}

export function MockSignup({ task, passed, onPass }: { task: SignupTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.signup;
  const [screen, setScreen] = useState(passed ? 5 : 0);
  const [f, setF] = useState({ first: "", last: "", day: "", month: "", year: "", gender: "", user: "", pw: "", pw2: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);

  const bind = (key: keyof typeof f) => ({
    value: f[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [key]: e.target.value }),
  });

  const suggestion = [simplify(f.first), simplify(f.last)].filter(Boolean).join(".") || "firstname.lastname";

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (screen === 0 && !f.first.trim()) e.first = s.errors.firstName;
    if (screen === 1) {
      const d = +f.day, y = +f.year;
      if (!(d >= 1 && d <= 31) || !f.month || !(y >= 1900 && y <= new Date().getFullYear())) e.birthday = s.errors.birthday;
      if (!f.gender) e.gender = s.errors.gender;
    }
    if (screen === 2) {
      const u = f.user.trim().toLowerCase();
      const names = [simplify(f.first), simplify(f.last)].filter((n) => n.length >= 2);
      if (!/^[a-z0-9.]*$/.test(u)) e.user = s.errors.usernameChars;
      else if (u.length < 6 || u.length > 30) e.user = s.errors.usernameLength;
      else if (FUN_WORDS.some((w) => u.includes(w))) e.user = s.errors.usernameFun;
      else if (!names.some((n) => u.includes(n))) e.user = fmt(s.errors.usernameName, { suggestion });
    }
    if (screen === 3) {
      if (f.pw.length < 8) e.pw = s.errors.passwordShort;
      else if (!/[a-z]/i.test(f.pw) || !/\d/.test(f.pw) || !/[^a-z0-9]/i.test(f.pw)) e.pw = s.errors.passwordMix;
      else if (f.year && f.pw.includes(f.year)) e.pw = s.errors.passwordBirthday;
      else if (f.pw !== f.pw2) e.pw2 = s.errors.passwordMatch;
    }
    if (screen === 4) {
      const digits = f.phone.replace(/\D/g, "").replace(/^237/, "");
      if (!/^6\d{8}$/.test(digits)) e.phone = s.errors.phone;
    }
    return e;
  }

  function next() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const n = screen + 1;
    setScreen(n);
    if (n === 5) onPass();
  }

  const titles = [s.createTitle, s.basicTitle, s.addressTitle, s.passwordTitle, s.phoneTitle];
  const texts = [s.createText, s.basicText, s.addressText, s.passwordText, s.phoneText];
  const email = `${f.user.trim().toLowerCase() || suggestion}@gmail.com`;

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="card mt-4 p-5">
        <GoogleMark />
        {screen < 5 ? (
          <>
            <h3 className="mt-3 text-xl">{titles[screen]}</h3>
            <p className="mt-1 text-muted">{texts[screen]}</p>
            {screen === 0 && (
              <>
                <Field label={s.firstName} autoComplete="off" error={errors.first} {...bind("first")} />
                <Field label={s.lastName} autoComplete="off" {...bind("last")} />
              </>
            )}
            {screen === 1 && (
              <>
                <div className="mt-4 grid grid-cols-[1fr_1.4fr_1.2fr] gap-2">
                  <label>
                    <span className="mb-1 block text-sm text-muted">{s.day}</span>
                    <input className="input" inputMode="numeric" maxLength={2} {...bind("day")} />
                  </label>
                  <label>
                    <span className="mb-1 block text-sm text-muted">{s.month}</span>
                    <select className="input" {...bind("month")}>
                      <option value="" />
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={String(i + 1)}>
                          {new Date(2000, i, 1).toLocaleString(undefined, { month: "short" })}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-sm text-muted">{s.year}</span>
                    <input className="input" inputMode="numeric" maxLength={4} {...bind("year")} />
                  </label>
                </div>
                {errors.birthday && <p className="mt-1 text-sm text-err">{errors.birthday}</p>}
                <label className="mt-4 block">
                  <span className="mb-1 block text-sm text-muted">{s.gender}</span>
                  <select className="input" {...bind("gender")}>
                    <option value="" />
                    {s.genders.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                  {errors.gender && <span className="mt-1 block text-sm text-err">{errors.gender}</span>}
                </label>
              </>
            )}
            {screen === 2 && (
              <label className="mt-4 block">
                <span className="mb-1 block text-sm text-muted">{s.username}</span>
                <span className={`flex items-center rounded-[10px] border-2 bg-surface pr-3 ${errors.user ? "border-err" : "border-line"}`}>
                  <input
                    className="min-h-[52px] min-w-0 flex-1 bg-transparent px-3 outline-none"
                    autoCapitalize="none"
                    autoComplete="off"
                    placeholder={suggestion}
                    {...bind("user")}
                  />
                  <span className="text-muted">@gmail.com</span>
                </span>
                {errors.user && <span className="mt-1 block text-sm text-err">{errors.user}</span>}
              </label>
            )}
            {screen === 3 && (
              <>
                <Field label={s.password} type={showPw ? "text" : "password"} autoComplete="new-password" error={errors.pw} {...bind("pw")} />
                <Field label={s.confirm} type={showPw ? "text" : "password"} autoComplete="new-password" error={errors.pw2} {...bind("pw2")} />
                <label className="mt-3 flex min-h-11 items-center gap-3">
                  <input type="checkbox" className="h-5 w-5" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
                  {s.show}
                </label>
              </>
            )}
            {screen === 4 && (
              <label className="mt-4 block">
                <span className="mb-1 block text-sm text-muted">{s.phone}</span>
                <span className={`flex items-center gap-2 rounded-[10px] border-2 bg-surface pl-3 ${errors.phone ? "border-err" : "border-line"}`}>
                  <span className="text-muted">+237</span>
                  <input className="min-h-[52px] min-w-0 flex-1 bg-transparent pr-3 outline-none" inputMode="tel" autoComplete="off" placeholder="6XX XX XX XX" {...bind("phone")} />
                </span>
                {errors.phone && <span className="mt-1 block text-sm text-err">{errors.phone}</span>}
              </label>
            )}
            <div className="mt-6 flex justify-end">
              <button type="button" className="btn min-w-28 rounded-full bg-[#1a73e8] text-white" onClick={next}>
                {s.next}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-3">
            <h3 className="text-xl">{fmt(s.doneTitle, { name: f.first.trim() || "Nkeng" })}</h3>
            <p className="mt-1 break-all text-muted">{fmt(s.doneText, { email })}</p>
          </div>
        )}
      </div>
      {screen === 5 && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
