"use client";
import type { ChemMode } from "@/content/types";
import { useT } from "@/components/I18n";

/** Learn (hints on) · Practise (new values each attempt) · Exam (timer, no hints). */
export function ModeSwitch({ modes, mode, onChange, disabled = false }: { modes: ChemMode[]; mode: ChemMode; onChange: (m: ChemMode) => void; disabled?: boolean }) {
  const s = useT().chem.modes;
  return (
    <div className="mt-3">
      <div className={`grid gap-1 rounded-xl bg-bg p-1`} style={{ gridTemplateColumns: `repeat(${modes.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={s.label}>
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            disabled={disabled}
            onClick={() => mode !== m && onChange(m)}
            className={`min-h-11 rounded-lg text-sm font-semibold ${mode === m ? "bg-surface text-primary shadow-sm" : "text-muted"}`}
          >
            {s[m]}
          </button>
        ))}
      </div>
      <p className="mt-1 text-center text-xs text-muted">{s.help[mode]}</p>
    </div>
  );
}
