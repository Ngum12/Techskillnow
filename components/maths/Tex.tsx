"use client";
/**
 * KaTeX rendering. This module (and KaTeX with its CSS and fonts) is only loaded by the maths lesson
 * chunk, so other courses never download it. Rendered strings are cached.
 */
import katex from "katex";
import "katex/dist/katex.min.css";
import { memo } from "react";

const cache = new Map<string, string>();

function render(latex: string, display: boolean): string {
  const key = `${display ? "D" : "I"}${latex}`;
  let html = cache.get(key);
  if (html === undefined) {
    html = katex.renderToString(latex, { displayMode: display, throwOnError: false, strict: "ignore", output: "html" });
    if (cache.size > 2000) cache.clear();
    cache.set(key, html);
  }
  return html;
}

export const Tex = memo(function Tex({ latex, display = false, className = "" }: { latex: string; display?: boolean; className?: string }) {
  return <span className={`${display ? "block overflow-x-auto overflow-y-hidden py-1" : ""} ${className}`} dangerouslySetInnerHTML={{ __html: render(latex, display) }} />;
});

/** Text with inline maths between $…$ and display maths between $$…$$. */
export const MathText = memo(function MathText({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.startsWith("$$") ? <Tex key={i} latex={p.slice(2, -2)} display /> : p.startsWith("$") ? <Tex key={i} latex={p.slice(1, -1)} /> : <span key={i}>{p}</span>,
      )}
    </span>
  );
});
