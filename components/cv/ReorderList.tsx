"use client";
import { useRef, useState } from "react";
import { useT } from "@/components/I18n";

type Item = { id: string; label: string };

/**
 * Touch-friendly reordering: drag an item by its handle, or use the up/down buttons
 * (which also work for keyboard and screen-reader users).
 */
export function ReorderList({
  items,
  onChange,
  marks,
  disabled,
}: {
  items: Item[];
  onChange: (ids: string[]) => void;
  /** Optional per-item state shown after checking. */
  marks?: Record<string, "ok" | "err">;
  disabled?: boolean;
}) {
  const t = useT();
  const listRef = useRef<HTMLOListElement>(null);
  const drag = useRef<{ id: string; startY: number; startIndex: number; itemH: number } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const ids = items.map((i) => i.id);

  function move(id: string, to: number) {
    const from = ids.indexOf(id);
    if (from < 0 || to < 0 || to >= ids.length || from === to) return;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, id);
    onChange(next);
  }

  function onPointerDown(e: React.PointerEvent, id: string) {
    if (disabled) return;
    const li = (e.currentTarget as HTMLElement).closest("li");
    const itemH = (li?.getBoundingClientRect().height ?? 56) + 8;
    drag.current = { id, startY: e.clientY, startIndex: ids.indexOf(id), itemH };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(id);
    setOffset(0);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    const target = Math.max(0, Math.min(ids.length - 1, d.startIndex + Math.round(dy / d.itemH)));
    const current = ids.indexOf(d.id);
    if (target !== current) move(d.id, target);
    setOffset(dy - (target - d.startIndex) * d.itemH);
  }

  function onPointerUp() {
    drag.current = null;
    setDragging(null);
    setOffset(0);
  }

  return (
    <ol ref={listRef} className="flex flex-col gap-2">
      {items.map((item, index) => {
        const mark = marks?.[item.id];
        const isDragging = dragging === item.id;
        return (
          <li
            key={item.id}
            className={`flex min-h-[56px] items-center gap-2 rounded-xl border-2 bg-surface pr-1 ${
              mark === "ok" ? "border-ok" : mark === "err" ? "border-err" : "border-line"
            } ${isDragging ? "relative z-10 shadow-lg" : ""}`}
            style={isDragging ? { transform: `translateY(${offset}px)` } : undefined}
          >
            <button
              type="button"
              aria-label={t.sim.dragHandle}
              className="flex h-12 w-11 shrink-0 cursor-grab touch-none items-center justify-center text-xl text-muted"
              onPointerDown={(e) => onPointerDown(e, item.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              disabled={disabled}
            >
              ⠿
            </button>
            <span className="w-6 shrink-0 text-sm font-bold text-muted">{index + 1}.</span>
            <span className="min-w-0 flex-1 py-2">{item.label}</span>
            <button
              type="button"
              className="h-11 w-11 shrink-0 rounded-lg text-lg disabled:opacity-30"
              aria-label={`${t.sim.moveUp}: ${item.label}`}
              disabled={disabled || index === 0}
              onClick={() => move(item.id, index - 1)}
            >
              ↑
            </button>
            <button
              type="button"
              className="h-11 w-11 shrink-0 rounded-lg text-lg disabled:opacity-30"
              aria-label={`${t.sim.moveDown}: ${item.label}`}
              disabled={disabled || index === items.length - 1}
              onClick={() => move(item.id, index + 1)}
            >
              ↓
            </button>
          </li>
        );
      })}
    </ol>
  );
}
