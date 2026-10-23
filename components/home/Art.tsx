import { ApplicationsDesk, CvDesk, EmailDesk } from "./DeskScenes";

/** Small drawn pictures for the home page (inline SVG: no downloads, sharp on every screen). */

type IconName = "screen" | "lab" | "hint" | "phone" | "send" | "badge" | "check" | "arrow" | "briefcase" | "cap";

const PATHS: Record<IconName, React.ReactNode> = {
  screen: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4M7 9h6M7 12h10" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  hint: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  send: (
    <>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="m9 14-2 8 5-3 5 3-2-8" />
      <path d="m9.5 9 1.7 1.7L14.5 7.5" />
    </>
  ),
  check: <path d="m5 12 5 5 9-10" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  cap: (
    <>
      <path d="m2 9 10-5 10 5-10 5L2 9Z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6" />
    </>
  ),
};

export function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name as IconName] ?? PATHS.check}
    </svg>
  );
}

/**
 * A drawn cover for each course, all in one style: the thing you will actually work on, on a tinted desk.
 * Fills its container (the card decides the shape).
 */
const COVER = "block h-full w-full";

export function CourseMotif({ id }: { id: string }) {
  // The job courses show their real material on a desk.
  if (id === "email-for-work") return <EmailDesk />;
  if (id === "cv") return <CvDesk />;
  if (id === "applications") return <ApplicationsDesk />;
  if (id.startsWith("chem")) {
    return (
      <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" className={`${COVER} bg-[#eaf3ef]`} aria-hidden="true">
        <rect x="0" y="168" width="300" height="32" fill="#d9cbb5" />
        <rect x="118" y="20" width="6" height="150" fill="#8b9aa3" />
        <rect x="96" y="164" width="60" height="6" rx="2" fill="#8b9aa3" />
        <rect x="140" y="18" width="14" height="112" rx="3" fill="#eef6fa" stroke="#41525c" strokeWidth="2" />
        <rect x="141" y="58" width="12" height="71" fill="#cfe3f1" />
        {[30, 45, 60, 75, 90, 105].map((y) => (
          <line key={y} x1="146" x2="153" y1={y} y2={y} stroke="#41525c" strokeWidth="1" />
        ))}
        <rect x="137" y="130" width="20" height="5" rx="2" fill="#4338ca" />
        <path d="M145 135v10" stroke="#41525c" strokeWidth="2" />
        <path d="M134 128 L134 146 L116 164 Q114 168 119 168 L175 168 Q180 168 178 164 L160 146 L160 128" transform="translate(-0 0)" fill="#f6d1e4" stroke="#41525c" strokeWidth="2" />
        <circle cx="146" cy="152" r="2.5" fill="#e0368a" />
        <rect x="205" y="120" width="40" height="48" rx="4" fill="#fff7e6" stroke="#41525c" strokeWidth="2" />
        <rect x="211" y="138" width="28" height="22" rx="3" fill="#f2c21b" opacity=".75" />
        <path d="M40 168v-52h40v52" fill="#eef6fa" stroke="#41525c" strokeWidth="2" />
        <rect x="41" y="138" width="38" height="30" fill="#dbeaf5" />
      </svg>
    );
  }
  if (id === "maths-functions") {
    // A curve, its inverse and the mirror line y = x.
    return (
      <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" className={`${COVER} bg-[#eef3f0]`} aria-hidden="true">
        <line x1="40" x2="270" y1="170" y2="170" stroke="#6b7a82" strokeWidth="1.5" />
        <line x1="60" x2="60" y1="16" y2="186" stroke="#6b7a82" strokeWidth="1.5" />
        <line x1="60" y1="170" x2="214" y2="16" stroke="#9aa6ad" strokeWidth="2" strokeDasharray="6 5" />
        <path d="M60 150 C 110 146, 150 120, 190 24" fill="none" stroke="#2f5d9c" strokeWidth="4" strokeLinecap="round" />
        <path d="M80 170 C 84 120, 110 80, 206 40" fill="none" stroke="#b8452b" strokeWidth="4" strokeLinecap="round" />
        <circle cx="128" cy="136" r="5" fill="#fff" stroke="#2f5d9c" strokeWidth="2.5" />
        <circle cx="94" cy="102" r="5" fill="#fff" stroke="#b8452b" strokeWidth="2.5" />
        <text x="200" y="64" fontSize="20" fontStyle="italic" fill="#1f2a30" fontFamily="Georgia, serif">
          f⁻¹
        </text>
        <rect x="212" y="120" width="64" height="34" rx="6" fill="#fff" stroke="#1f2a30" strokeWidth="2" />
        <text x="244" y="143" textAnchor="middle" fontSize="16" fill="#1f2a30" fontFamily="Georgia, serif">
          fg(x)
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" className={`${COVER} bg-[#eef0f7]`} aria-hidden="true">
      {[40, 80, 120, 160, 200, 240].map((x) => (
        <line key={`v${x}`} x1={x} x2={x} y1="16" y2="184" stroke="#dfe3ee" />
      ))}
      {[40, 70, 100, 130, 160].map((y) => (
        <line key={`h${y}`} x1="20" x2="280" y1={y} y2={y} stroke="#dfe3ee" />
      ))}
      <line x1="20" x2="280" y1="100" y2="100" stroke="#6b7a82" strokeWidth="1.5" />
      <line x1="150" x2="150" y1="16" y2="184" stroke="#6b7a82" strokeWidth="1.5" />
      <path d="M30 175 C 70 20, 110 30, 150 100 S 230 180, 270 25" fill="none" stroke="#2f5d9c" strokeWidth="4" strokeLinecap="round" />
      {[79, 150, 221].map((x) => (
        <circle key={x} cx={x} cy="100" r="5" fill="#fff" stroke="#b8452b" strokeWidth="2.5" />
      ))}
      <text x="196" y="44" fontSize="20" fontStyle="italic" fill="#1f2a30" fontFamily="Georgia, serif">
        f(a) = 0
      </text>
    </svg>
  );
}
