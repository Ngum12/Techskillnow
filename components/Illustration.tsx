"use client";
import { useState } from "react";

/** Lazy-loaded WebP from /public/illustrations, with a neutral placeholder if the file is missing. */
export function Illustration({ name, alt = "", priority = false }: { name?: string; alt?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(!name);
  return (
    <div className="aspect-[3/2] w-full overflow-hidden rounded-xl bg-[#f3efe6]">
      {failed ? (
        <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true">
          <rect x="105" y="62" width="90" height="62" rx="8" fill="none" stroke="#c9c1b0" strokeWidth="5" />
          <path d="M108 66l42 32 42-32" fill="none" stroke="#c9c1b0" strokeWidth="5" strokeLinejoin="round" />
        </svg>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/illustrations/${name}.webp`}
          alt={alt}
          width={900}
          height={600}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
