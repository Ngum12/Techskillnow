"use client";
/**
 * MathField + MathKeypad. The phone keyboard never opens for maths: tapping a field shows one docked
 * keypad (fractions, powers, roots, brackets, x, trig, ln, e, inequalities). Desktop typing also works.
 * Fields hold plain linear syntax ("2x^(3) - sqrt(x)"); a KaTeX preview shows how it reads.
 */
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { useT } from "@/components/I18n";
import { previewLatex } from "@/lib/maths/expr";
import { Tex } from "./Tex";

type Editor = { insert: (s: string, cursorBack?: number) => void; backspace: () => void; move: (d: number) => void; clear: () => void; done?: () => void };
type Ctx = { active: string | null; open: (id: string, ed: Editor) => void; close: () => void };
const KeypadContext = createContext<Ctx | null>(null);

/** Wrap a lesson in this once: it renders the shared keypad. */
export function MathInputProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const editor = useRef<Editor | null>(null);
  const open = useCallback((id: string, ed: Editor) => {
    editor.current = ed;
    setActive(id);
  }, []);
  const close = useCallback(() => setActive(null), []);
  return (
    <KeypadContext.Provider value={{ active, open, close }}>
      {children}
      {active && <div className="h-80" aria-hidden="true" />}
      {active && <Keypad editor={editor} onClose={close} />}
    </KeypadContext.Provider>
  );
}

type Key = { label: string; insert?: string; back?: number; action?: "del" | "left" | "right" | "clear" | "done"; wide?: boolean; aria?: string };

const PAGE_MAIN: Key[] = [
  { label: "x" }, { label: "y" }, { label: "xⁿ", insert: "^()", back: 1, aria: "power" }, { label: "x²", insert: "^2", aria: "squared" }, { label: "(" }, { label: ")" },
  { label: "7" }, { label: "8" }, { label: "9" }, { label: "÷", insert: "/" }, { label: "a/b", insert: "()/()", back: 4, aria: "fraction" }, { label: "⌫", action: "del", aria: "delete" },
  { label: "4" }, { label: "5" }, { label: "6" }, { label: "×", insert: "*" }, { label: "√", insert: "sqrt()", back: 1, aria: "square root" }, { label: "|x|", insert: "||", back: 1, aria: "modulus" },
  { label: "1" }, { label: "2" }, { label: "3" }, { label: "−", insert: "-" }, { label: "=", insert: " = " }, { label: "<", insert: " < " },
  { label: "0" }, { label: "." }, { label: "+", insert: " + " }, { label: "◀", action: "left", aria: "cursor left" }, { label: "▶", action: "right", aria: "cursor right" }, { label: ">", insert: " > " },
];
const PAGE_MORE: Key[] = [
  { label: "sin", insert: "sin()", back: 1 }, { label: "cos", insert: "cos()", back: 1 }, { label: "tan", insert: "tan()", back: 1 }, { label: "ln", insert: "ln()", back: 1 }, { label: "e" }, { label: "π", insert: "pi" },
  { label: "a" }, { label: "b" }, { label: "k" }, { label: "p" }, { label: "q" }, { label: "n" },
  { label: "≤", insert: " <= " }, { label: "≥", insert: " >= " }, { label: "≠", insert: " != " }, { label: "or", insert: " or " }, { label: ",", insert: ", " }, { label: "⌫", action: "del", aria: "delete" },
  { label: "[" }, { label: "]" }, { label: "∞", aria: "infinity" }, { label: "∪", insert: " ∪ ", aria: "union" }, { label: "f(x)" }, { label: "g(x)" },
  { label: "◀", action: "left", aria: "cursor left" }, { label: "▶", action: "right", aria: "cursor right" }, { label: "t" }, { label: "Clear", action: "clear", wide: true },
];

function Keypad({ editor, onClose }: { editor: React.RefObject<Editor | null>; onClose: () => void }) {
  const t = useT();
  const s = t.maths.keypad;
  const [page, setPage] = useState<"main" | "more">("main");
  const keys = page === "main" ? PAGE_MAIN : PAGE_MORE;
  const press = (k: Key) => {
    const ed = editor.current;
    if (!ed) return;
    if (k.action === "del") ed.backspace();
    else if (k.action === "left") ed.move(-1);
    else if (k.action === "right") ed.move(1);
    else if (k.action === "clear") ed.clear();
    else ed.insert(k.insert ?? k.label, k.back ?? 0);
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#eef1f3] px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]" role="group" aria-label={s.label}>
      <div className="mx-auto max-w-xl">
        <div className="mb-1.5 flex gap-1.5">
          <button type="button" className={`h-9 flex-1 rounded-lg text-sm font-semibold ${page === "main" ? "bg-primary text-white" : "bg-surface"}`} onMouseDown={(e) => e.preventDefault()} onClick={() => setPage("main")}>
            123
          </button>
          <button type="button" className={`h-9 flex-1 rounded-lg text-sm font-semibold ${page === "more" ? "bg-primary text-white" : "bg-surface"}`} onMouseDown={(e) => e.preventDefault()} onClick={() => setPage("more")}>
            f(x) abc
          </button>
          <button type="button" className="h-9 flex-1 rounded-lg bg-surface text-sm font-semibold" onMouseDown={(e) => e.preventDefault()} onClick={onClose}>
            {s.close} ▾
          </button>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {keys.map((k, i) => (
            <button
              key={`${page}-${i}`}
              type="button"
              aria-label={k.aria ?? k.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => press(k)}
              className={`h-11 rounded-lg text-[1.05rem] font-semibold shadow-sm active:bg-primary-soft ${k.wide ? "col-span-2" : ""} ${/^\d$|^\.$/.test(k.label) ? "bg-white" : k.action ? "bg-[#dfe5e9]" : "bg-[#f8fafb]"}`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A maths answer box. `value` is linear syntax; the preview underneath shows how it reads. */
export function MathField({
  value,
  onChange,
  label,
  placeholder,
  invalid = false,
  disabled = false,
  compact = false,
  onEnter,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onEnter?: () => void;
}) {
  const ctx = useContext(KeypadContext);
  const id = useId();
  const [cursor, setCursor] = useState(value.length);
  const valueRef = useRef(value);
  const cursorRef = useRef(cursor);
  const changeRef = useRef(onChange);
  valueRef.current = value;
  cursorRef.current = cursor;
  changeRef.current = onChange;
  const active = ctx?.active === id;

  useEffect(() => {
    if (cursor > value.length) setCursor(value.length);
  }, [value, cursor]);

  const editor: Editor = {
    insert: (s, back = 0) => {
      const v = valueRef.current;
      const c = Math.min(cursorRef.current, v.length);
      changeRef.current(v.slice(0, c) + s + v.slice(c));
      setCursor(c + s.length - back);
    },
    backspace: () => {
      const v = valueRef.current;
      const c = Math.min(cursorRef.current, v.length);
      if (c === 0) return;
      // Delete whole words (sqrt, sin, " or ") in one press.
      const m = v.slice(0, c).match(/(sqrt\(|sin\(|cos\(|tan\(|ln\(|pi|f\(x\)|g\(x\)| or | <= | >= | != | ∪ | = | < | > | \+ )$/);
      const n = m ? m[0].length : 1;
      changeRef.current(v.slice(0, c - n) + v.slice(c));
      setCursor(c - n);
    },
    move: (d) => setCursor((c) => Math.max(0, Math.min(valueRef.current.length, c + d))),
    clear: () => {
      changeRef.current("");
      setCursor(0);
    },
  };

  function activate() {
    if (disabled || !ctx) return;
    ctx.open(id, editor);
  }

  // Keep the keypad's editor pointing at the latest state while active.
  useEffect(() => {
    if (active && ctx) ctx.open(id, editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, value, cursor]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter") return onEnter?.();
    if (e.key === "Backspace") return (e.preventDefault(), editor.backspace());
    if (e.key === "ArrowLeft") return (e.preventDefault(), editor.move(-1));
    if (e.key === "ArrowRight") return (e.preventDefault(), editor.move(1));
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      editor.insert(e.key);
    }
  }

  const latex = value.trim() ? previewLatex(value) : null;
  const shown = value.slice(0, cursor);
  const rest = value.slice(cursor);
  return (
    <div className={compact ? "" : "w-full"}>
      <div
        role="textbox"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-invalid={invalid}
        aria-disabled={disabled}
        onClick={activate}
        onFocus={activate}
        onKeyDown={onKeyDown}
        className={`flex min-h-12 cursor-text items-center overflow-x-auto whitespace-pre rounded-xl border-2 bg-white px-3 font-mono text-[1.05rem] ${active ? "border-primary" : invalid ? "border-err" : "border-line"} ${disabled ? "opacity-70" : ""}`}
      >
        {value ? (
          <>
            <span>{shown.replace(/\*/g, "×")}</span>
            {active && <span className="mx-px inline-block h-6 w-0.5 animate-pulse bg-primary align-middle" aria-hidden="true" />}
            <span>{rest.replace(/\*/g, "×")}</span>
          </>
        ) : (
          <>
            {active && <span className="mr-px inline-block h-6 w-0.5 animate-pulse bg-primary align-middle" aria-hidden="true" />}
            <span className="text-muted">{placeholder}</span>
          </>
        )}
      </div>
      {!compact && value.trim() && (
        <div className="mt-1 min-h-7 px-1 text-[1.05rem]" aria-live="polite">
          {latex ? <Tex latex={latex} /> : <span className="text-sm text-muted">…</span>}
        </div>
      )}
    </div>
  );
}

/** Close the keypad when a part is finished. */
export function useCloseKeypad() {
  const ctx = useContext(KeypadContext);
  return () => ctx?.close();
}
