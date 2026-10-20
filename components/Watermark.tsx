import { getDict, fmt } from "@/lib/i18n";

/** Faint, non-interactive watermark with the buyer's name and last phone digits, tiled over paid screens. */
export function Watermark({ name, phoneLast4 }: { name: string; phoneLast4: string }) {
  const text = fmt(getDict().watermark, { name, phone: `••${phoneLast4}` });
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none print:block">
      <div className="absolute -inset-1/2 flex rotate-[-24deg] flex-col justify-around opacity-[0.07]">
        {Array.from({ length: 14 }, (_, row) => (
          <p key={row} className="whitespace-nowrap text-lg font-semibold text-ink" style={{ marginLeft: row % 2 ? "-6rem" : 0 }}>
            {Array.from({ length: 8 }, () => text).join("      ")}
          </p>
        ))}
      </div>
    </div>
  );
}
