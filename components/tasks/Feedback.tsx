export function Feedback({ kind, title, messages = [] }: { kind: "ok" | "err"; title: string; messages?: string[] }) {
  const ok = kind === "ok";
  return (
    <div role={ok ? "status" : "alert"} className={`mt-4 rounded-xl border-l-4 p-4 ${ok ? "border-ok bg-ok-soft" : "border-err bg-err-soft"}`}>
      <p className={`font-bold ${ok ? "text-ok" : "text-err"}`}>{title}</p>
      {messages.length === 1 && <p className="mt-1">{messages[0]}</p>}
      {messages.length > 1 && (
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
