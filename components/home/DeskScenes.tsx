/**
 * Realistic course covers for the job courses: the real lesson material on a desk, drawn in SVG
 * (light enough for 3G, sharp on every screen). Names, emails and CV lines come from the courses.
 */

/** Shared desk: warm wood with grain, lit from the top left. */
function Desk({ id }: { id: string }) {
  const grain = [14, 31, 47, 66, 83, 101, 118, 137, 152, 171];
  return (
    <>
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b98a5c" />
          <stop offset="1" stopColor="#9a6b40" />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0.2" cy="0.1" r="0.9">
          <stop offset="0" stopColor="#fff6e6" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff6e6" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" />
          <feOffset dx="2" dy="4" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.38" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill={`url(#${id}-wood)`} />
      {grain.map((y, i) => (
        <path key={y} d={`M0 ${y} C 80 ${y + (i % 2 ? 3 : -3)}, 200 ${y + (i % 3) - 1}, 320 ${y + (i % 2 ? -2 : 2)}`} fill="none" stroke="#8a5d35" strokeOpacity="0.22" strokeWidth={i % 3 === 0 ? 1.2 : 0.6} />
      ))}
      <rect width="320" height="180" fill={`url(#${id}-light)`} />
    </>
  );
}

const T = { fontFamily: "Arial, Helvetica, sans-serif" } as const;

/** A laptop open on the inbox from the Email for Work course. */
export function EmailDesk() {
  const rows = [
    { from: "Ndi Recruitment", subject: "Interview invitation – Thursday 10am", preview: "We are pleased to invite you to an interview…", time: "Mon", unread: true, star: true },
    { from: "Sawa Logistics HR", subject: "We received your application", preview: "Thank you for applying for the Office Assistant…", time: "10:05", unread: true },
    { from: "Mboko Consulting", subject: "Interview on Tuesday", preview: "We would like to meet you on Tuesday at 9am…", time: "10:02", unread: false },
    { from: "Sawa Training Centre", subject: "Your course timetable", preview: "Classes start on Monday at 8am…", time: "Yesterday", unread: false },
    { from: "Brenda Tanyi", subject: "Notes from class", preview: "Here are the notes you asked for…", time: "Mon", unread: false },
    { from: "Aunty Grace", subject: "Sunday lunch", preview: "Don't forget to bring the plantains…", time: "08:40", unread: false },
  ];
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="block h-full w-full" role="img" aria-label="Email for Work: an inbox on a laptop" style={T}>
      <Desk id="em" />
      {/* Notebook and pen, back left. */}
      <g filter="url(#em-shadow)" transform="rotate(-8 30 40)">
        <rect x="-6" y="10" width="62" height="78" rx="2" fill="#2d4a3e" />
        <rect x="-4" y="12" width="56" height="74" rx="1.5" fill="#f4efe3" />
        {[24, 32, 40, 48, 56, 64, 72].map((y) => (
          <line key={y} x1="0" x2="48" y1={y} y2={y} stroke="#c9d3dc" strokeWidth="0.5" />
        ))}
      </g>
      {/* Coffee cup, right. */}
      <g filter="url(#em-shadow)">
        <ellipse cx="294" cy="150" rx="18" ry="6" fill="#ece6da" />
        <rect x="280" y="128" width="28" height="22" rx="3" fill="#f7f4ee" />
        <ellipse cx="294" cy="128" rx="14" ry="4.5" fill="#f7f4ee" />
        <ellipse cx="294" cy="128.5" rx="11.5" ry="3.4" fill="#5b3a22" />
        <path d="M308 133c8 0 8 12 0 12" fill="none" stroke="#f7f4ee" strokeWidth="3" />
      </g>
      {/* Laptop. */}
      <g filter="url(#em-shadow)">
        <path d="M48 152h224l14 12H34z" fill="#c9ccd0" />
        <path d="M34 164h252v3a3 3 0 0 1-3 3H37a3 3 0 0 1-3-3z" fill="#9fa4aa" />
        <rect x="145" y="153.5" width="30" height="2" rx="1" fill="#b3b7bc" />
        <rect x="56" y="12" width="208" height="141" rx="7" fill="#1d2124" />
        <rect x="62" y="18" width="196" height="129" rx="1.5" fill="#fff" />
      </g>
      {/* Inbox. */}
      <g>
        <rect x="62" y="18" width="196" height="12" fill="#f3f6f4" />
        <rect x="99" y="21" width="96" height="6.5" rx="3.2" fill="#e3e9e5" />
        <text x="104" y="25.8" fontSize="3.6" fill="#6b7a72">
          Search mail
        </text>
        <circle cx="250" cy="24" r="3.4" fill="#4338ca" />
        <text x="250" y="25.4" fontSize="3.4" fill="#fff" textAnchor="middle" fontWeight="700">
          N
        </text>
        <text x="66" y="26" fontSize="4.6" fontWeight="700" fill="#4338ca">
          Mail
        </text>
        {/* Sidebar. */}
        <rect x="66" y="34" width="27" height="9" rx="4.5" fill="#e0e3fc" />
        <text x="79.5" y="40" fontSize="3.6" fontWeight="700" fill="#17201b" textAnchor="middle">
          Compose
        </text>
        {[
          ["Inbox", "2", true],
          ["Starred", "", false],
          ["Sent", "", false],
          ["Drafts", "1", false],
          ["Spam", "", false],
        ].map(([label, n, on], i) => (
          <g key={String(label)}>
            {on && <rect x="64" y={47 + i * 8} width="31" height="7" rx="3.5" fill="#eef0fd" />}
            <text x="68" y={51.8 + i * 8} fontSize="3.5" fontWeight={on ? 700 : 400} fill="#2b3530">
              {label}
            </text>
            {n && (
              <text x="92" y={51.8 + i * 8} fontSize="3.3" fontWeight="700" fill="#2b3530" textAnchor="end">
                {n}
              </text>
            )}
          </g>
        ))}
        {/* Tabs. */}
        <text x="101" y="38.5" fontSize="3.6" fontWeight="700" fill="#4338ca">
          Primary
        </text>
        <rect x="99" y="41" width="22" height="0.9" fill="#4338ca" />
        <text x="129" y="38.5" fontSize="3.6" fill="#6b7a72">
          Promotions
        </text>
        <line x1="97" x2="258" y1="42" y2="42" stroke="#e5e9e6" strokeWidth="0.5" />
        {rows.map((r, i) => {
          const y = 43 + i * 15.6;
          return (
            <g key={r.subject}>
              <rect x="97" y={y} width="161" height="15.6" fill={r.unread ? "#fff" : "#f7f8f7"} />
              <line x1="97" x2="258" y1={y + 15.6} y2={y + 15.6} stroke="#e5e9e6" strokeWidth="0.4" />
              <rect x="100" y={y + 5.8} width="3.4" height="3.4" rx="0.6" fill="none" stroke="#9aa59f" strokeWidth="0.45" />
              <text x="107" y={y + 9.1} fontSize="3.8" fill={r.star ? "#e0a526" : "#c2c9c5"}>
                ★
              </text>
              <text x="113" y={y + 9.2} fontSize="3.7" fontWeight={r.unread ? 700 : 400} fill="#17201b">
                {r.from}
              </text>
              <text x="153" y={y + 6.8} fontSize="3.5" fontWeight={r.unread ? 700 : 400} fill="#17201b">
                {r.subject}
              </text>
              <text x="153" y={y + 11.6} fontSize="3.2" fill="#6b7a72">
                {r.preview}
              </text>
              <text x="255" y={y + 9.2} fontSize="3.2" fontWeight={r.unread ? 700 : 400} fill="#3c4741" textAnchor="end">
                {r.time}
              </text>
            </g>
          );
        })}
      </g>
      {/* Phone lying on the desk, front left. */}
      <g filter="url(#em-shadow)" transform="rotate(14 22 150)">
        <rect x="6" y="122" width="30" height="56" rx="4.5" fill="#15191c" />
        <rect x="8" y="125" width="26" height="50" rx="3" fill="#24302b" />
        <rect x="11" y="131" width="20" height="5" rx="1.2" fill="#3a6b56" />
        <rect x="11" y="139" width="16" height="2" rx="1" fill="#5d7c6f" />
      </g>
    </svg>
  );
}

/** A printed CV from the CV course, with a pen and a highlighted achievement. */
export function CvDesk() {
  const line = (x: number, y: number, s: string, size = 3.3, weight = 400, fill = "#2b3530") => (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill}>
      {s}
    </text>
  );
  const heading = (y: number, s: string) => (
    <g>
      <text x="16" y={y} fontSize="4" fontWeight="700" fill="#4338ca" letterSpacing="0.35">
        {s}
      </text>
      <line x1="16" x2="114" y1={y + 1.6} y2={y + 1.6} stroke="#4338ca" strokeWidth="0.4" />
    </g>
  );
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="block h-full w-full" role="img" aria-label="A CV That Gets Interviews: a printed CV on a desk" style={T}>
      <Desk id="cv" />
      {/* A second sheet underneath (the job advert). */}
      <g filter="url(#cv-shadow)" transform="rotate(7 235 80)">
        <rect x="186" y="6" width="104" height="146" fill="#fbfaf6" />
        <text x="196" y="22" fontSize="5" fontWeight="700" fill="#17201b">
          JOB VACANCY
        </text>
        <text x="196" y="30" fontSize="3.6" fill="#3c4741">
          Accounts Assistant – Douala
        </text>
        {[40, 46, 52, 58, 68, 74, 80, 86, 96, 102].map((y, i) => (
          <rect key={y} x="196" y={y} width={[78, 70, 82, 56, 80, 74, 66, 50, 76, 60][i]} height="2" rx="1" fill="#d6d1c6" />
        ))}
      </g>
      {/* The CV. */}
      <g filter="url(#cv-shadow)" transform="translate(84 -6) rotate(-5 65 95)">
        <rect x="0" y="0" width="130" height="190" fill="#fff" />
        <text x="16" y="22" fontSize="9" fontWeight="700" fill="#17201b" letterSpacing="0.4">
          NKENG ATEH
        </text>
        {line(16, 29.5, "Accounting graduate · Douala", 3.7, 400, "#3c4741")}
        {line(16, 35, "nkeng.ateh@gmail.com  |  +237 670 45 67 89", 3.1, 400, "#6b7a72")}
        {heading(46, "PROFILE")}
        {line(16, 53, "Accounting graduate (BSc) with a 6-month internship.")}
        {line(16, 57.6, "Reconciled 300+ transactions a month with no errors.")}
        {heading(69, "EXPERIENCE")}
        {line(16, 76, "Accounting Intern, Sawa Microfinance, Douala", 3.4, 700, "#17201b")}
        {line(16, 80.6, "Jan–Jun 2024", 3.1, 400, "#6b7a72")}
        {/* Highlighter over the strongest line. */}
        <rect x="15" y="82.6" width="92" height="4.6" fill="#f5e663" opacity="0.75" />
        {line(17, 86.4, "•  Reconciled 300+ Mobile Money transactions a month")}
        {line(17, 91.6, "•  Prepared 12 weekly cash reports for the manager")}
        {heading(103, "EDUCATION")}
        {line(16, 110, "BSc Accounting, University of Douala (2023)")}
        {heading(121, "SKILLS")}
        {line(16, 128, "Microsoft Excel (very good)  ·  Sage accounting")}
        {line(16, 132.6, "English and French")}
        {heading(144, "REFEREES")}
        {line(16, 151, "Available on request")}
        <path d="M108 79.5l3 3 6-7" fill="none" stroke="#c0392b" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Pen. */}
      <g filter="url(#cv-shadow)" transform="rotate(-32 240 150)">
        <rect x="196" y="146" width="78" height="6" rx="3" fill="#1f2f4a" />
        <path d="M274 146.4l10 2.6-10 2.6z" fill="#c9ccd0" />
        <rect x="200" y="144.6" width="26" height="1.8" rx="0.9" fill="#c9ccd0" />
      </g>
      {/* Highlighter. */}
      <g filter="url(#cv-shadow)" transform="rotate(18 40 140)">
        <rect x="6" y="136" width="58" height="11" rx="2.5" fill="#f2d93b" />
        <rect x="6" y="136" width="18" height="11" rx="2.5" fill="#2b2b2b" />
        <path d="M64 138.5l7 3-7 3z" fill="#e8c51f" />
      </g>
    </svg>
  );
}

/** An application file: a cover letter in its folder, a big envelope and the tracker from the course. */
export function ApplicationsDesk() {
  const text = (x: number, y: number, s: string, size = 3.2, weight = 400, fill = "#2b3530") => (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill}>
      {s}
    </text>
  );
  const rows = [
    { org: "Bamboutos Learning Centre", role: "Administrative Assistant", status: "Sent", colour: "#5d6f66", bg: "#e8ece9" },
    { org: "Sanaga Health Initiative", role: "Field Officer", status: "Interview", colour: "#8a5a00", bg: "#fbf0d6" },
    { org: "Menchum Green Energy", role: "Graduate Trainee", status: "Answer ✓", colour: "#17633a", bg: "#e2f2e8" },
  ];
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="block h-full w-full" role="img" aria-label="Applications That Get Answers: a cover letter, an envelope and an application tracker" style={T}>
      <Desk id="ap" />
      {/* Brown A4 envelope, addressed. */}
      <g filter="url(#ap-shadow)" transform="rotate(-9 70 120)">
        <rect x="-4" y="96" width="116" height="80" rx="1.5" fill="#c9a46a" />
        <path d="M-4 96l58 30 58-30" fill="none" stroke="#b48f55" strokeWidth="1" />
        {text(30, 146, "The Director,", 3.4, 700, "#3a2a12")}
        {text(30, 151.5, "Bamboutos Learning Centre", 3.2, 400, "#3a2a12")}
        {text(30, 157, "P.O. Box 120, Mbouda", 3.2, 400, "#3a2a12")}
      </g>
      {/* Open folder with the cover letter. */}
      <g filter="url(#ap-shadow)" transform="rotate(-3 120 80)">
        <rect x="40" y="6" width="150" height="150" rx="3" fill="#e2c48c" />
        <path d="M40 9a3 3 0 0 1 3-3h34l6 6h104a3 3 0 0 1 3 3" fill="#d6b67a" />
        <rect x="54" y="14" width="124" height="160" fill="#fff" />
        {text(64, 26, "Ngwa Tabi", 4.2, 700, "#17201b")}
        {text(64, 31, "Mbouda  ·  +237 6 77 21 45 98", 2.9, 400, "#6b7a72")}
        {text(64, 41, "The Director, Bamboutos Learning Centre", 3, 400)}
        {text(64, 49, "Re: Application for the post of Administrative Assistant", 3.1, 700, "#17201b")}
        {text(64, 57, "Dear Sir or Madam,", 3.1)}
        {[63, 67.5, 72, 76.5, 83, 87.5, 92, 96.5, 103, 107.5].map((y, i) => (
          <rect key={y} x="64" y={y} width={[104, 100, 106, 62, 104, 98, 104, 80, 102, 54][i]} height="1.8" rx="0.9" fill="#cfd5d1" />
        ))}
        {text(64, 117, "Yours faithfully,", 3.1)}
        <path d="M66 125c4-6 7 2 11-3s5 4 9-1 4 3 8 0" fill="none" stroke="#1f2f4a" strokeWidth="0.8" strokeLinecap="round" />
        {text(64, 133, "Ngwa Tabi", 3.1, 700, "#17201b")}
      </g>
      {/* Clipboard tracker. */}
      <g filter="url(#ap-shadow)" transform="rotate(5 255 85)">
        <rect x="196" y="16" width="116" height="150" rx="4" fill="#5b4632" />
        <rect x="202" y="24" width="104" height="138" fill="#fbfaf6" />
        <rect x="236" y="11" width="36" height="12" rx="3" fill="#b9bcc0" />
        {text(210, 38, "My applications", 5, 700, "#17201b")}
        {text(210, 44, "Track every application", 3, 400, "#6b7a72")}
        {rows.map((r, i) => {
          const y = 52 + i * 31;
          return (
            <g key={r.org}>
              <rect x="208" y={y} width="92" height="26" rx="2.5" fill="#fff" stroke="#e4ded2" strokeWidth="0.6" />
              {text(212, y + 7.5, r.org, 3.3, 700, "#17201b")}
              {text(212, y + 12.8, r.role, 3, 400, "#3c4741")}
              <rect x="212" y={y + 16} width={r.status.length * 2.2 + 6} height="6.4" rx="3.2" fill={r.bg} />
              {text(215, y + 20.6, r.status, 3, 700, r.colour)}
            </g>
          );
        })}
      </g>
      {/* Pen across the letter. */}
      <g filter="url(#ap-shadow)" transform="rotate(38 160 150)">
        <rect x="130" y="146" width="64" height="5" rx="2.5" fill="#4338ca" />
        <path d="M194 146.3l8 2.2-8 2.2z" fill="#c9ccd0" />
      </g>
    </svg>
  );
}
