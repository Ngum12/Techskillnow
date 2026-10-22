import type {
  Course,
  CompareAppsTask,
  OpportunityBoardTask,
  Listing,
  TrackerTask,
  SectionOrderTask,
  SequenceTask,
  EvidenceTask,
  CoverLetterTask,
  RedPenTask,
  RedPenLine,
  ComposeTask,
  PortalTask,
  DossierTask,
  NetworkProfileTask,
  FollowUpTask,
  InboxWeekTask,
  InboxEmail,
  TextRule,
} from "../types";

/* ---------- Step 1: CompareApps (3 variants) ---------- */

type Pair = { role: string; org: string; a: string; b: string; proof: string; source: string };

const compare = (p: Pair): CompareAppsTask => {
  const file = (n: string, s: string) => `${n.replace(/ /g, "_")}_${s}.pdf`;
  return {
    type: "compareApps",
    instruction: `${p.a} and ${p.b} have the same diploma and the same experience. Both applied for the ${p.role} job at ${p.org}. Read both emails.`,
    a: {
      label: p.a,
      from: `${p.a.split(" ")[0].toLowerCase()}boss237@yahoo.fr`,
      subject: "CV",
      attachments: ["scan0001.pdf"],
      body: "good morning sir pls find attach my cv for any vacancy in your esteemed company. i am hardworking and God fearing. waiting for your call",
      outcome: "No answer after 4 weeks.",
    },
    b: {
      label: p.b,
      from: `${p.b.toLowerCase().replace(/ /g, ".")}@gmail.com`,
      subject: `Application for ${p.role} – ${p.b}`,
      attachments: [file(p.b, "CV"), file(p.b, "Cover_Letter")],
      body: `Dear Sir or Madam,\n\nI am applying for the ${p.role} position advertised ${p.source}. ${p.proof}\n\nPlease find attached my CV and cover letter. I would welcome the chance to discuss my application.\n\nKind regards,\n${p.b}\n+237 6 77 21 45 98`,
      outcome: `Invited to an interview 6 days later.`,
    },
    questions: [
      {
        question: "What does the recruiter learn from the subject line alone?",
        options: [`${p.a}'s subject says nothing; ${p.b}'s names the job and the person`, "Nothing: subjects are not read", "Both subjects are equally clear", `${p.a}'s is better because it is short`],
        answer: 0,
        explanation: "A recruiter with 200 emails sorts by subject. “CV” could be for any job; “Application for … – Name” goes straight to the right pile.",
      },
      {
        question: `Why is ${p.a}'s attachment a problem?`,
        options: ["It is a PDF", "“scan0001.pdf” says nothing about who or what it is, and there is no cover letter", "It is too small", "There is no problem"],
        answer: 1,
        explanation: `${p.b} sent two clearly named PDFs: Name_CV.pdf and Name_Cover_Letter.pdf. They are easy to find again and look professional.`,
      },
      {
        question: `What did ${p.b} do that ${p.a} did not?`,
        options: ["Wrote a longer message", "Named the exact role, gave one proof, and asked for an interview politely", "Used more polite words like “esteemed”", "Sent the email at night"],
        answer: 1,
        explanation: "Same CV, different result: a clear role, one real proof and a polite request. That is what this course teaches.",
      },
    ],
    success: "You spotted the difference. Everything that made the second application work can be learned, and you will build each part in this course.",
  };
};

const compare1 = compare({
  role: "Sales Assistant",
  org: "Akwa Star Pharmacy",
  a: "Eyong Peter",
  b: "Ngwa Brenda",
  proof: "In my 18-month internship at a Bamenda pharmacy I served over 60 customers a day and kept the stock book with no errors.",
  source: "on your Facebook page on 2 November",
});
const compare2 = compare({
  role: "Front Desk Agent",
  org: "Kribi Shores Hotel",
  a: "Mbarga Serge",
  b: "Ewane Linda",
  proof: "I speak English and French fluently and welcomed up to 80 guests a day during my holiday job at a Limbe guest house.",
  source: "on the CameroonJobs board",
});
const compare3 = compare({
  role: "Data Entry Clerk",
  org: "Mfoundi Bright Logistics",
  a: "Ateh Collins",
  b: "Fon Mirabel",
  proof: "As a volunteer for a health survey in Bafoussam, I entered 1,200 forms in Excel in three weeks with a 99% accuracy check.",
  source: "on your website",
});

/* ---------- Step 2: OpportunityBoard (3 variants) ---------- */

const L = (l: Listing) => l;

const board1: OpportunityBoardTask = {
  type: "opportunityBoard",
  instruction: "Use the filters, read each opportunity, then shortlist the ones worth applying for and skip the rest.",
  persona: "Ngwa Brenda: HND in Accounting (2025), 18-month internship in a microfinance office, lives in Bamenda, can move to Douala.",
  today: "Monday 3 November",
  listings: [
    L({ id: "b1", title: "Junior Accounts Assistant", org: "Mbe Hills Microfinance", location: "Bamenda", field: "Finance", deadline: "21 November", contact: "jobs@mbehillsmf.cm", details: "HND or Bachelor's in Accounting. Excel. 1 year of experience including internships. Send CV and cover letter.", expired: false, fake: false, eligible: true, why: "Matches her diploma and internship, in her city, deadline ahead. Shortlist." }),
    L({ id: "b2", title: "Cashier", org: "Tiko Fresh Foods", location: "Douala", field: "Sales", deadline: "15 November", contact: "recruit@tikofresh.cm", details: "GCE A Level minimum. Experience handling cash. Douala-based.", expired: false, fake: false, eligible: true, why: "She qualifies, it is in Douala where she can move, and there is time. Shortlist." }),
    L({ id: "b3", title: "Finance Officer", org: "Sanaga Health Initiative", location: "Yaoundé", field: "Finance", deadline: "28 October", contact: "careers@sanagahealth.org", details: "Master's in Finance, 5 years of NGO experience.", expired: true, fake: false, eligible: false, why: "The deadline (28 October) has passed, and it needs a Master's and 5 years. Skip." }),
    L({ id: "b4", title: "Bank Teller – 40 posts", org: "Global Capital Recruitment", location: "Douala", field: "Finance", deadline: "Open", contact: "WhatsApp +237 6 99 00 11 22", details: "No interview! Pay 15,000 FCFA file fee by Mobile Money to confirm your place. Salary 450,000 FCFA.", expired: false, fake: true, eligible: true, why: "A fee, WhatsApp only, no interview, salary too good: classic scam. Skip and warn friends." }),
    L({ id: "b5", title: "Bookkeeping Intern", org: "Menchum Green Energy", location: "Bamenda", field: "Finance", deadline: "30 November", contact: "internships@menchumgreen.cm", details: "Final-year students or recent graduates in Accounting. 6-month paid internship.", expired: false, fake: false, eligible: true, why: "Recent accounting graduate, Bamenda, good deadline. Shortlist." }),
    L({ id: "b6", title: "Laboratory Technician", org: "Akwa Star Pharmacy", location: "Douala", field: "Health", deadline: "20 November", contact: "jobs@akwastarpharma.cm", details: "Diploma in Medical Laboratory Science required.", expired: false, fake: false, eligible: false, why: "Needs a laboratory diploma she does not have. Skip." }),
  ],
  success: "Three real chances, no time wasted on expired, fake or out-of-reach adverts. Applying to fewer, better-matched jobs gets more answers.",
};

const board2: OpportunityBoardTask = {
  ...board1,
  persona: "Ewane Linda: Bachelor's in Tourism (2024), bilingual, 6 months as a guest house receptionist in Limbe, lives in Buea.",
  today: "Wednesday 12 November",
  listings: [
    L({ id: "h1", title: "Front Desk Agent", org: "Kribi Shores Hotel", location: "Kribi", field: "Hospitality", deadline: "30 November", contact: "recruitment@kribishores.cm", details: "Bilingual English–French, tourism or hospitality training, 6 months' experience. CV and cover letter.", expired: false, fake: false, eligible: true, why: "Exact match: bilingual, tourism, reception experience. Shortlist." }),
    L({ id: "h2", title: "Customer Care Agent", org: "Wouri Connect", location: "Buea", field: "Customer service", deadline: "24 November", contact: "careers@wouriconnect.cm", details: "Bachelor's degree, bilingual, good phone manner.", expired: false, fake: false, eligible: true, why: "She qualifies and it is in Buea. Shortlist." }),
    L({ id: "h3", title: "Hotel Manager", org: "Mount Fako Lodge", location: "Buea", field: "Hospitality", deadline: "5 December", contact: "gm@mountfakolodge.cm", details: "10 years' hotel management experience. Master's preferred.", expired: false, fake: false, eligible: false, why: "Needs 10 years of management. Not realistic yet. Skip." }),
    L({ id: "h4", title: "Cabin Crew – International airline", org: "Sky Africa Jobs Agency", location: "Douala", field: "Hospitality", deadline: "Open", contact: "skyafricajobs@gmail.com", details: "Send 25,000 FCFA for training kit, passport copy and Mobile Money PIN for verification.", expired: false, fake: true, eligible: true, why: "Asks for money and your PIN. No real employer does this. Skip." }),
    L({ id: "h5", title: "Tour Guide (seasonal)", org: "Limbe Coast Tours", location: "Limbe", field: "Tourism", deadline: "1 November", contact: "info@limbecoast.cm", details: "Tourism studies, English and French.", expired: true, fake: false, eligible: true, why: "Good match but the deadline (1 November) has passed. Skip." }),
    L({ id: "h6", title: "Reservations Assistant", org: "Bamboutos Hotels Group", location: "Douala", field: "Hospitality", deadline: "28 November", contact: "jobs@bamboutoshotels.cm", details: "Bachelor's degree, bilingual, computer skills.", expired: false, fake: false, eligible: true, why: "She qualifies; Douala is close enough. Shortlist." }),
  ],
};

const board3: OpportunityBoardTask = {
  ...board1,
  persona: "Fon Mirabel: GCE A Level and a certificate in Computer Office Skills (2025), volunteer data entry for a health survey, lives in Bafoussam.",
  today: "Tuesday 18 November",
  listings: [
    L({ id: "d1", title: "Data Entry Clerk", org: "Mfoundi Bright Logistics", location: "Bafoussam", field: "Administration", deadline: "5 December", contact: "hr@mfoundibright.cm", details: "GCE A Level, Excel, fast and accurate typing.", expired: false, fake: false, eligible: true, why: "Matches her level and experience, in her city. Shortlist." }),
    L({ id: "d2", title: "Survey Enumerator (3 months)", org: "Sanaga Health Initiative", location: "Bafoussam", field: "Research", deadline: "1 December", contact: "surveys@sanagahealth.org", details: "GCE A Level, smartphone data collection, local languages an advantage.", expired: false, fake: false, eligible: true, why: "Her survey experience fits exactly. Shortlist." }),
    L({ id: "d3", title: "IT Systems Engineer", org: "Wouri Connect", location: "Douala", field: "IT", deadline: "10 December", contact: "careers@wouriconnect.cm", details: "Engineering degree in computer science, 3 years' network experience.", expired: false, fake: false, eligible: false, why: "Needs an engineering degree and 3 years. Skip for now." }),
    L({ id: "d4", title: "Online typing job – earn 20,000/day", org: "Fast Cash Typing", location: "Online", field: "Administration", deadline: "Today only", contact: "WhatsApp +237 6 51 00 00 00", details: "Pay 5,000 FCFA registration and start immediately. No experience needed.", expired: false, fake: true, eligible: true, why: "Pay to work, unrealistic income, WhatsApp only: a scam. Skip." }),
    L({ id: "d5", title: "Office Assistant", org: "Bamboutos Learning Centre", location: "Bafoussam", field: "Administration", deadline: "10 November", contact: "admin@bamboutoslearning.cm", details: "GCE A Level, Word and Excel.", expired: true, fake: false, eligible: true, why: "Good fit but the deadline has passed. Skip." }),
    L({ id: "d6", title: "Records Assistant", org: "Menchum Green Energy", location: "Bafoussam", field: "Administration", deadline: "12 December", contact: "jobs@menchumgreen.cm", details: "GCE A Level minimum, filing and computer skills.", expired: false, fake: false, eligible: true, why: "She qualifies and there is time. Shortlist." }),
  ],
};

/* ---------- Step 3: ApplicationTracker (3 variants) ---------- */

const TRACKER_INSTRUCTION = "Add at least 2 applications to your tracker with the organisation, role and deadline. Add the documents and a follow-up date too.";
const TRACKER_SUCCESS = "Your tracker is saved in your profile. Update it every time you apply or get a reply.";
const tracker1: TrackerTask = {
  type: "tracker",
  instruction: TRACKER_INSTRUCTION,
  required: 2,
  suggestions: [
    { org: "Mbe Hills Microfinance", role: "Junior Accounts Assistant", deadline: "2026-11-21", documents: "CV, cover letter" },
    { org: "Tiko Fresh Foods", role: "Cashier", deadline: "2026-11-15", documents: "CV, cover letter" },
    { org: "Menchum Green Energy", role: "Bookkeeping Intern", deadline: "2026-11-30", documents: "CV, cover letter, transcript" },
  ],
  success: TRACKER_SUCCESS,
};
const tracker2: TrackerTask = {
  ...tracker1,
  suggestions: [
    { org: "Kribi Shores Hotel", role: "Front Desk Agent", deadline: "2026-11-30", documents: "CV, cover letter" },
    { org: "Wouri Connect", role: "Customer Care Agent", deadline: "2026-11-24", documents: "CV, cover letter, ID copy" },
    { org: "Bamboutos Hotels Group", role: "Reservations Assistant", deadline: "2026-11-28", documents: "CV, cover letter" },
  ],
};
const tracker3: TrackerTask = {
  ...tracker1,
  suggestions: [
    { org: "Mfoundi Bright Logistics", role: "Data Entry Clerk", deadline: "2026-12-05", documents: "CV, cover letter" },
    { org: "Sanaga Health Initiative", role: "Survey Enumerator", deadline: "2026-12-01", documents: "CV, A Level certificate" },
    { org: "Menchum Green Energy", role: "Records Assistant", deadline: "2026-12-12", documents: "CV, cover letter" },
  ],
};

/* ---------- Step 4: SectionOrder for letter layouts (3 variants) ---------- */

const LETTER_PARTS = {
  formal: [
    { id: "sender", label: "Your name, address, phone and email (top left)", why: "The reader must know at once who wrote and how to reach you." },
    { id: "recipient", label: "The Director, Mbe Hills Microfinance, P.O. Box 120, Bamenda", why: "Who the letter is for, below your details, often on the right." },
    { id: "date", label: "Bamenda, 4 November 2026", why: "Place and date come before the subject line." },
    { id: "subject", label: "Subject: Application for the post of Junior Accounts Assistant", why: "The subject (“Objet” in French) says in one line what the letter is about." },
    { id: "salutation", label: "Dear Sir or Madam,", why: "Then the greeting." },
    { id: "body", label: "Body: opening, why me, why you, request", why: "The three or four short paragraphs of the letter." },
    { id: "close", label: "Yours faithfully,", why: "A formal closing (use “Yours sincerely” if you greeted a named person)." },
    { id: "signature", label: "Signature and full name", why: "Always sign and print your name at the end." },
  ],
  email: [
    { id: "subjectLine", label: "Subject: Application for Junior Accounts Assistant – Ngwa Brenda", why: "First thing the recruiter sees in the inbox." },
    { id: "greet", label: "Dear Sir or Madam,", why: "Start with a greeting." },
    { id: "purpose", label: "I am applying for the Junior Accounts Assistant position advertised on…", why: "Say why you are writing in the first line." },
    { id: "proof", label: "One sentence with your strongest proof", why: "One reason to open your CV." },
    { id: "attach", label: "Please find attached my CV and cover letter.", why: "Say what is attached." },
    { id: "closing", label: "Kind regards,", why: "A polite closing." },
    { id: "sign", label: "Ngwa Brenda · +237 6 77 21 45 98", why: "Name and phone so they can call you." },
  ],
  paragraphs: [
    { id: "opening", label: "Opening: the role, and where you saw it", why: "The reader knows at once which job you want." },
    { id: "whyMe", label: "Why me: two proofs that match the advert", why: "The heart of the letter: evidence, not adjectives." },
    { id: "whyThem", label: "Why this organisation", why: "Shows you chose them, not “any company”." },
    { id: "request", label: "Request: ask for an interview and thank them", why: "End with the next step you want." },
  ],
};

const rotate = <T,>(a: T[], n: number) => [...a.slice(n), ...a.slice(0, n)];
const shuffled = <T,>(a: T[], order: number[]) => order.map((i) => a[i]);

const letterOrder = (shift: number): SectionOrderTask => ({
  type: "sectionOrder",
  rounds: [
    {
      persona: "A formal letter (printed, hand-delivered or attached as a PDF)",
      instruction: "Drag or use the arrows to put the parts in order, from the top of the page to the bottom.",
      sections: shuffled(LETTER_PARTS.formal, rotate([4, 0, 6, 2, 7, 1, 5, 3], shift)),
      answer: LETTER_PARTS.formal.map((x) => x.id),
    },
    {
      persona: "The application email that carries your documents",
      instruction: "Put the parts of the email in order.",
      sections: shuffled(LETTER_PARTS.email, rotate([3, 6, 1, 4, 0, 5, 2], shift)),
      answer: LETTER_PARTS.email.map((x) => x.id),
    },
    {
      persona: "The paragraphs of a cover letter",
      instruction: "Put the four paragraphs in order.",
      sections: shuffled(LETTER_PARTS.paragraphs, rotate([2, 0, 3, 1], shift % 4)),
      answer: LETTER_PARTS.paragraphs.map((x) => x.id),
    },
  ],
  success: "Formal letter, email, paragraphs: you know where everything goes. Recruiters notice a correct layout before they read a word.",
});

/* ---------- Step 5: Openings (sequence: choose, then fix) ---------- */

const BAD_OPENING_RULES = (role: string[], example: string): TextRule[] => [
  { kind: "changed", message: "Rewrite the opening in your own words." },
  { kind: "excludesAll", words: ["humbly", "beg", "esteemed", "god-fearing", "any vacant", "hardworking", "hard-working"], message: "Remove begging and clichés (“humbly beg”, “esteemed company”, “hardworking”)." },
  { kind: "includesAny", words: ["apply", "applying", "application"], message: "Say clearly that you are applying." },
  { kind: "includesAny", words: role, message: `Name the exact role, e.g. “${example}”.` },
  { kind: "minWords", n: 15, message: "Add one reason to read on: your diploma or best proof (at least 15 words)." },
  { kind: "maxWords", n: 70, message: "An opening is 1–3 sentences: under 70 words." },
];

const openings = (role: string, org: string, roleWords: string[], name: string, bg: string): SequenceTask => ({
  type: "sequence",
  tasks: [
    {
      type: "multipleChoice",
      question: `Which opening for the ${role} job at ${org} makes the recruiter read on?`,
      options: [
        `I am writing to humbly apply for any vacant position in your esteemed company.`,
        `My name is ${name}, I am 24 years old, single, and I come from a good Christian family.`,
        `I am applying for the ${role} position advertised on your website. ${bg}`,
        `Following my graduation, I want to develop myself and acquire experience in your company.`,
      ],
      answer: 2,
      explanation: "It names the role and where it was seen, then gives a reason to read on. The others talk about the writer's needs, personal details or “any position”.",
      hints: ["“Any vacant position” tells them you did not read the advert.", "Age, marital status and family are not reasons to hire you.", null, "It talks about what you want, not what you bring."],
    },
    {
      type: "fixText",
      instruction: `Rewrite this opening for the ${role} job at ${org}. Name the role, say where you saw it, and give one reason to read on.`,
      initial: `I humbly write to beg for any vacant position in your esteemed company. I am a hardworking and God-fearing young person ready to work.`,
      multiline: true,
      rules: BAD_OPENING_RULES(roleWords, `I am applying for the ${role} position…`),
      success: "Clear and confident. The recruiter knows which job you want and why to keep reading.",
    },
  ],
});

/* ---------- Steps 6–7: Evidence + cover letter (same advert per learner) ---------- */

type Advert = { id: string; org: string; role: string; contact: string; text: string; requirements: { id: string; text: string; keywords: string[] }[] };

const ADVERTS: Advert[] = [
  {
    id: "mbehills-accounts",
    org: "Mbe Hills Microfinance",
    role: "Junior Accounts Assistant",
    contact: "",
    text: "Mbe Hills Microfinance, Bamenda, is recruiting a Junior Accounts Assistant.\nRequirements: HND or Bachelor's in Accounting or Finance; good Excel skills; at least 1 year of experience (internships count); accuracy with figures; English and French.\nSend your CV and cover letter to jobs@mbehillsmf.cm by 21 November.",
    requirements: [
      { id: "diploma", text: "HND or Bachelor's in Accounting or Finance", keywords: ["hnd", "bachelor", "accounting", "finance", "bts", "licence"] },
      { id: "excel", text: "Good Excel skills", keywords: ["excel", "spreadsheet"] },
      { id: "experience", text: "At least 1 year of experience (internships count)", keywords: ["intern", "experience", "assistant", "clerk", "cashier"] },
      { id: "accuracy", text: "Accuracy with figures", keywords: ["accurate", "error", "reconcil", "record", "cash", "figure"] },
      { id: "languages", text: "English and French", keywords: ["english", "french", "bilingual"] },
    ],
  },
  {
    id: "wouri-care",
    org: "Wouri Connect",
    role: "Customer Care Agent",
    contact: "Mrs Ekane",
    text: "Wouri Connect, Buea, is looking for Customer Care Agents.\nRequirements: a Bachelor's degree; bilingual English–French; experience serving customers; calm under pressure; basic computer skills.\nEmail your CV and cover letter to careers@wouriconnect.cm, attention Mrs Ekane, by 24 November.",
    requirements: [
      { id: "degree", text: "A Bachelor's degree", keywords: ["bachelor", "licence", "degree", "hnd"] },
      { id: "bilingual", text: "Bilingual English–French", keywords: ["english", "french", "bilingual"] },
      { id: "customers", text: "Experience serving customers", keywords: ["customer", "client", "guest", "served", "serve", "sales"] },
      { id: "pressure", text: "Calm under pressure", keywords: ["busy", "per day", "a day", "daily", "peak", "queue", "complaint"] },
      { id: "computer", text: "Basic computer skills", keywords: ["computer", "word", "excel", "internet", "email"] },
    ],
  },
  {
    id: "mfoundi-data",
    org: "Mfoundi Bright Logistics",
    role: "Data Entry Clerk",
    contact: "",
    text: "Mfoundi Bright Logistics, Bafoussam, needs a Data Entry Clerk.\nRequirements: GCE A Level or higher; Excel; fast and accurate typing; experience with records or forms; reliable and punctual.\nSend your CV and cover letter to hr@mfoundibright.cm before 5 December.",
    requirements: [
      { id: "level", text: "GCE A Level or higher", keywords: ["a level", "gce", "baccalaur", "hnd", "bachelor", "certificate"] },
      { id: "excel", text: "Excel", keywords: ["excel", "spreadsheet"] },
      { id: "typing", text: "Fast and accurate typing", keywords: ["typing", "entered", "data", "accura", "words per"] },
      { id: "records", text: "Experience with records or forms", keywords: ["record", "form", "file", "survey", "register", "stock"] },
      { id: "reliable", text: "Reliable and punctual", keywords: ["never", "on time", "every", "reliable", "attendance", "deadline"] },
    ],
  },
];

const evidence = (a: Advert): EvidenceTask => ({
  type: "evidence",
  instruction: "For each requirement, pick the line from your CV that proves it. Leave a gap if you have no proof: that's honest.",
  advert: { id: a.id, org: a.org, role: a.role, requirements: a.requirements },
  minLinks: 2,
  success: "Your proofs are linked to this advert. In the next step they appear in your cover letter builder.",
});

const letter = (a: Advert): CoverLetterTask => ({
  type: "coverLetter",
  instruction: "Write your cover letter for this advert, one part at a time. Use your proofs from the last step in “Why me”.",
  advert: { id: a.id, org: a.org, role: a.role, contact: a.contact, text: a.text },
  maxWords: 300,
  success: "A one-page letter with the role, real proofs and a clear request. Download it: you'll attach it in step 9.",
});

/* ---------- Step 8: Red pen on a cover letter (3 variants) ---------- */

const LETTER_ERRORS = [
  { id: "wrongOrg", label: "Wrong organisation name", why: "Copied from another letter. Nothing shows carelessness faster: check names before every send." },
  { id: "noRole", label: "No role named", why: "“Any vacant post” forces the reader to guess. Name the exact role from the advert." },
  { id: "cliche", label: "Clichés instead of proof", why: "“Hardworking, dynamic, God-fearing” is in every letter. Replace it with something you did and its result." },
  { id: "personal", label: "Irrelevant personal details", why: "Age, tribe, marital status and religion do not belong in a cover letter." },
  { id: "begging", label: "Begging tone", why: "“I beg you, I am suffering” asks for pity. Show what you bring instead: confident and polite." },
  { id: "spelling", label: "Spelling mistake", why: "One spelling mistake can end your chances. Read it aloud before you send." },
  { id: "closing", label: "Closing that does not match", why: "“Dear Sir or Madam” goes with “Yours faithfully”. “Yours lovingly” is never professional." },
];

const redLetter = (lines: RedPenLine[]): RedPenTask => ({
  type: "redPen",
  instruction: "This cover letter was about to be sent. Tap every mistake you can find.",
  passPercent: 70,
  success: "Sharp eyes. Now reread your own letter for the same seven mistakes before you send it.",
  lines,
  errors: LETTER_ERRORS,
});

const redPen1 = redLetter([
  { style: "small", parts: ["Bamenda, 4 November 2026"] },
  { parts: ["Subject: Application for ", { text: "any vacant post", error: "noRole" }] },
  { parts: ["Dear Sir or Madam,"] },
  { parts: ["I wish to apply for a job at ", { text: "Tiko Fresh Foods", error: "wrongOrg" }, ". I saw your advert for Mbe Hills Microfinance on Facebook."] },
  { parts: ["I am a ", { text: "hardworking, dynamic and God-fearing", error: "cliche" }, " young lady. ", { text: "I am 25 years old, single, from Ndop", error: "personal" }, "."] },
  { parts: ["I have an HND in Accounting and I am good in ", { text: "Exel", error: "spelling" }, "."] },
  { parts: [{ text: "Please I beg you to consider me, I have suffered a lot since school", error: "begging" }, "."] },
  { parts: [{ text: "Yours lovingly,", error: "closing" }] },
  { parts: ["Ngwa Brenda"] },
]);
const redPen2 = redLetter([
  { style: "small", parts: ["Buea, 13 November 2026"] },
  { parts: ["Dear Sir or Madam,"] },
  { parts: ["I am writing to apply for ", { text: "a post in your company", error: "noRole" }, " at ", { text: "Kribi Shores Hotel", error: "wrongOrg" }, ", as advertised by Wouri Connect."] },
  { parts: ["I am ", { text: "honest, hardworking and ready to work in any condition", error: "cliche" }, "."] },
  { parts: [{ text: "I am a Catholic, 27 years old, from the Bakweri tribe", error: "personal" }, "."] },
  { parts: ["I have a Bachelor's degree and good ", { text: "comunication", error: "spelling" }, " skills."] },
  { parts: [{ text: "My family depends on me, please have mercy and give me this job", error: "begging" }, "."] },
  { parts: [{ text: "Yours truly in Christ,", error: "closing" }] },
  { parts: ["Ewane Linda"] },
]);
const redPen3 = redLetter([
  { style: "small", parts: ["Bafoussam, 19 November 2026"] },
  { parts: ["Subject: Request for ", { text: "employment", error: "noRole" }] },
  { parts: ["Dear Sir or Madam,"] },
  { parts: ["Further to your advert, I am applying to ", { text: "Sanaga Health Initiative", error: "wrongOrg" }, " (Mfoundi Bright Logistics, Bafoussam)."] },
  { parts: ["I am a ", { text: "dynamic, serious and very hardworking", error: "cliche" }, " person. ", { text: "I am married with two children and a Christian", error: "personal" }, "."] },
  { parts: ["I have my GCE A Level and I type very ", { text: "acurately", error: "spelling" }, "."] },
  { parts: [{ text: "I am begging you, I have been jobless for three years", error: "begging" }, "."] },
  { parts: [{ text: "Love,", error: "closing" }] },
  { parts: ["Fon Mirabel"] },
]);

/* ---------- Step 9: Apply by email with two attachments (3 variants) ---------- */

const applyEmail = (to: string, role: string, roleWords: string[], name: string, junk: string[]): ComposeTask => {
  const f = name.replace(/ /g, "_");
  return {
    type: "compose",
    instruction: `Send ${name}'s application for the ${role} job to ${to}. Attach the CV and the cover letter, write a clear subject and a short message.`,
    files: [junk[0], `${f}_CV.pdf`, junk[1], `${f}_Cover_Letter.pdf`],
    rules: [
      { kind: "equals", field: "to", value: to, message: `Send it to ${to}, exactly as in the advert.` },
      { field: "subject", kind: "includesAny", words: roleWords, message: `Name the role in the subject: “Application for ${role} – ${name}”.` },
      { field: "subject", kind: "includesAny", words: name.toLowerCase().split(" "), message: `Add the name to the subject: “Application for ${role} – ${name}”.` },
      { kind: "attachment", file: `${f}_CV.pdf`, message: `Attach the CV: ${f}_CV.pdf.` },
      { kind: "attachment", file: `${f}_Cover_Letter.pdf`, message: `Attach the cover letter: ${f}_Cover_Letter.pdf.` },
      { kind: "noAttachment", file: junk[0], message: `Remove ${junk[0]}: only send what the advert asks for, as named PDFs.` },
      { kind: "noAttachment", file: junk[1], message: `Remove ${junk[1]}: only send what the advert asks for, as named PDFs.` },
      { kind: "greeting", message: "Start with a greeting, e.g. “Dear Sir or Madam,”." },
      { field: "body", kind: "includesAny", words: ["attached", "attach", "please find"], message: "Say what is attached: “Please find attached my CV and cover letter.”" },
      { kind: "closing", message: "End with a closing such as “Kind regards,” and your name." },
      { field: "body", kind: "maxWords", n: 120, message: "Keep the email short (under 120 words): the details are in your letter." },
    ],
    success: "That is an application a recruiter can file in two seconds: clear subject, two named PDFs, a short polite message.",
  };
};

/* ---------- Step 10: Portal with session timeout (3 variants) ---------- */

const portalInbox = (org: string): InboxEmail[] => [
  { id: "p1", from: "MTN MoMo", fromEmail: "noreply@momo-alerts.cm", subject: "You have received 5,000 FCFA", preview: "Transaction ID 88213…", body: "You have received 5,000 FCFA. Transaction ID 88213.", time: "08:12" },
  { id: "p2", from: "Class WhatsApp digest", fromEmail: "digest@groups.example.cm", subject: "12 new messages", preview: "Who has the past questions…", body: "12 new messages in HND 2025 group.", time: "Yesterday" },
  { id: "p3", from: `${org} (fake)`, fromEmail: `${org.toLowerCase().replace(/\s+/g, "")}-jobs@gmail.com`, subject: "Pay to confirm your application", preview: "Send 10,000 FCFA…", body: "Send 10,000 FCFA to confirm your application.", time: "Yesterday" },
];

const portal = (portalName: string, org: string, role: string, refPrefix: string, motivationQuestion: string): PortalTask => ({
  type: "portal",
  portalName,
  org,
  role,
  motivationQuestion,
  wordLimit: 150,
  maxFileMb: 2,
  allowedTypes: ["pdf"],
  refPrefix,
  sessionSeconds: 180,
  inbox: portalInbox(org),
  success: "Submitted, confirmed and tracked. You also learned to save drafts: real portals log you out without warning.",
});

/* ---------- Step 11: Dossier (3 variants) ---------- */

const dossier1: DossierTask = {
  type: "dossier",
  instruction: "Build the paper file the advert asks for: only the documents listed, the right number of copies, in the order given.",
  advert: {
    org: "Bamboutos Learning Centre",
    title: "Recruitment of 4 Administrative Assistants",
    text: "Files must contain, in this order:\n1. A handwritten application letter addressed to the Director\n2. A CV (2 copies)\n3. A certified copy of the highest diploma\n4. A copy of the national ID card\n5. Two passport-size photos\nFiles are submitted in a closed envelope at the Centre's front desk before 28 November.",
  },
  required: [
    { id: "letter", copies: 1 },
    { id: "cv", copies: 2 },
    { id: "diploma", copies: 1 },
    { id: "id", copies: 1 },
    { id: "photos", copies: 2 },
  ],
  pile: [
    { id: "cv", label: "CV", detail: "Printed, 2 pages" },
    { id: "originalDiploma", label: "Original diploma", detail: "Never hand in originals" },
    { id: "photos", label: "Passport-size photo" },
    { id: "letter", label: "Handwritten application letter", detail: "Addressed to the Director" },
    { id: "baptism", label: "Baptism certificate" },
    { id: "diploma", label: "Certified copy of HND" },
    { id: "id", label: "Copy of national ID card" },
    { id: "transcript", label: "Transcript of results", detail: "Not asked for" },
  ],
  success: "Complete, nothing extra, in the right order. Keep a photo of every page and the date you submitted it in your tracker.",
};
const dossier2: DossierTask = {
  ...dossier1,
  advert: {
    org: "Sanaga Health Initiative",
    title: "Community Health Field Officers (6 posts)",
    text: "Applications must include, in this order:\n1. An application letter\n2. A CV\n3. A copy of the highest diploma\n4. A recent medical certificate\n5. A copy of the national ID card (2 copies)\nDeposit at the regional office, Yaoundé, by 5 December.",
  },
  required: [
    { id: "letter", copies: 1 },
    { id: "cv", copies: 1 },
    { id: "diploma", copies: 1 },
    { id: "medical", copies: 1 },
    { id: "id", copies: 2 },
  ],
  pile: [
    { id: "id", label: "Copy of national ID card" },
    { id: "photos", label: "Passport-size photo", detail: "Not asked for here" },
    { id: "medical", label: "Medical certificate", detail: "Dated this month" },
    { id: "letter", label: "Application letter" },
    { id: "birth", label: "Birth certificate copy" },
    { id: "cv", label: "CV" },
    { id: "originalId", label: "Original ID card", detail: "Keep it" },
    { id: "diploma", label: "Copy of Bachelor's degree" },
  ],
};
const dossier3: DossierTask = {
  ...dossier1,
  advert: {
    org: "Menchum Green Energy",
    title: "Graduate Trainee Programme",
    text: "Send one envelope containing, in this order:\n1. A cover letter\n2. A CV (2 copies)\n3. Copies of all diplomas from GCE A Level\n4. A birth certificate copy\n5. One passport-size photo\nAddress it to the HR Manager, P.O. Box 77, Wum. Deadline: 12 December.",
  },
  required: [
    { id: "letter", copies: 1 },
    { id: "cv", copies: 2 },
    { id: "diploma", copies: 1 },
    { id: "birth", copies: 1 },
    { id: "photos", copies: 1 },
  ],
  pile: [
    { id: "birth", label: "Birth certificate copy" },
    { id: "cv", label: "CV" },
    { id: "recommendation", label: "Letter from your pastor", detail: "Not asked for" },
    { id: "diploma", label: "Copies of A Level and HND" },
    { id: "photos", label: "Passport-size photo" },
    { id: "letter", label: "Cover letter" },
    { id: "originalDiploma", label: "Original HND", detail: "Never send originals" },
    { id: "id", label: "Copy of ID card", detail: "Not asked for here" },
  ],
};

/* ---------- Step 12: Ask a referee (3 variants) ---------- */

const referee = (to: string, who: string, role: string, roleWords: string[], org: string): ComposeTask => ({
  type: "compose",
  instruction: `${org} asks for two referees. Write to ${who} (${to}) to ask if they agree to be your referee for the ${role} job.`,
  files: [],
  rules: [
    { kind: "equals", field: "to", value: to, message: `Send it to ${to}.` },
    { kind: "notEmpty", field: "subject", message: `Add a subject, e.g. “Request to be my referee – ${role}”.` },
    { kind: "greeting", message: `Start with a greeting, e.g. “Dear ${who},”.` },
    { field: "body", kind: "includesAny", words: ["referee", "reference"], message: "Say clearly that you are asking them to be your referee." },
    { field: "body", kind: "includesAny", words: roleWords, message: `Name the job you are applying for: ${role}.` },
    { field: "body", kind: "includesAny", words: ["would you", "could you", "kindly", "please", "may i"], message: "Ask politely: “Would you agree to be my referee?”" },
    { field: "body", kind: "includesAny", words: ["thank"], message: "Thank them for their time." },
    { kind: "closing", message: "End with a closing and your name." },
    { field: "body", kind: "maxWords", n: 150, message: "Keep it short: under 150 words." },
  ],
  success: "Polite, specific and easy to say yes to. Always ask before you list someone, and tell them when to expect a call.",
});

/* ---------- Step 13: Network profile (3 variants) ---------- */

const network = (headlineExample: string, aboutExample: string): NetworkProfileTask => ({
  type: "networkProfile",
  instruction: "Build the professional profile recruiters will find when they search for you. Reach 100% on the meter.",
  headlineExample,
  aboutExample,
  success: "Your profile is ready. Copy it to the professional network you use, and add the link to your CV header.",
});

/* ---------- Step 14: Follow up + a week of replies ---------- */

const followUp = (deadlineDay: number, role: string, org: string, to: string, roleWords: string[]): FollowUpTask => ({
  type: "followUp",
  instruction: `You applied for ${role} at ${org} on day 0. The deadline is day ${deadlineDay}. You have heard nothing. When do you follow up?`,
  days: deadlineDay + 14,
  deadlineDay,
  window: [deadlineDay + 5, deadlineDay + 10],
  feedback: {
    early: "Too early: they are still collecting applications. Wait until about a week after the deadline.",
    late: "Too late: decisions may already be made. Follow up about one week after the deadline.",
    right: "Right: about a week after the deadline. Now write a short, polite follow-up.",
  },
  compose: {
    type: "compose",
    instruction: `Write your follow-up to ${to}.`,
    files: [],
    rules: [
      { kind: "equals", field: "to", value: to, message: `Send it to ${to}.` },
      { field: "subject", kind: "includesAny", words: roleWords, message: `Name the role in the subject: “Follow-up: application for ${role}”.` },
      { kind: "greeting", message: "Start with a greeting." },
      { field: "body", kind: "includesAny", words: ["applied", "application", "submitted"], message: "Remind them that you applied and when." },
      { field: "body", kind: "includesAny", words: ["still", "remain", "interested", "keen"], message: "Say you are still interested in the role." },
      { field: "body", kind: "excludesAll", words: ["why have you not", "you have not replied", "urgent", "asap"], message: "Stay polite: do not complain or demand an answer." },
      { kind: "closing", message: "End with a closing and your name." },
      { field: "body", kind: "maxWords", n: 100, message: "A follow-up is short: under 100 words." },
    ],
    success: "Short, polite, and it puts your name back on top of the pile.",
  },
  success: "Followed up at the right time, in the right tone.",
});

const mail = (id: string, from: string, fromEmail: string, subject: string, body: string): InboxEmail => ({
  id,
  from,
  fromEmail,
  subject,
  preview: body.split("\n").find((l) => l.trim() && !/^dear/i.test(l))?.slice(0, 60) ?? "",
  body,
  time: "",
});

const WEEK_FILES = (n: string) => [`${n}_CV.pdf`, `${n}_Diploma.pdf`, `${n}_Birth_Certificate.pdf`, "selfie.jpg"];

const week = (n: string, a: { org: string; role: string; email: string }, b: { org: string; role: string; email: string }, order: "ackA" | "ackB"): InboxWeekTask => {
  const ack = (id: string, app: typeof a, at: number, which: "A" | "B") => ({
    id,
    at,
    kind: "ack" as const,
    application: which,
    email: mail(id, `${app.org} Recruitment`, app.email, `Application received – ${app.role}`, `Dear applicant,\n\nThis is an automatic message. We have received your application for ${app.role}. Shortlisted candidates will be contacted.\n\n${app.org}`),
  });
  const missing = (id: string, app: typeof a, at: number, which: "A" | "B") => ({
    id,
    at,
    kind: "missingDocument" as const,
    application: which,
    deadlineHours: 36,
    email: mail(id, `${app.org} HR`, app.email, `Missing document – ${app.role}`, `Dear ${n.replace("_", " ")},\n\nThank you for your application for ${app.role}. Your file is missing a copy of your diploma. Please send it by reply within 36 hours, or your file cannot be considered.\n\nRegards,\nHR Office, ${app.org}`),
  });
  const invite = (id: string, app: typeof a, at: number, which: "A" | "B") => ({
    id,
    at,
    kind: "interview" as const,
    application: which,
    deadlineHours: 24,
    email: mail(id, `${app.org} HR`, app.email, `Interview invitation – ${app.role}`, `Dear ${n.replace("_", " ")},\n\nWe are pleased to invite you to an interview for the ${app.role} position. Please reply within 24 hours with a day and time when you are available next week (Monday to Friday, 9:00–16:00).\n\nRegards,\nHR Office, ${app.org}`),
  });
  const reject = (id: string, app: typeof a, at: number, which: "A" | "B") => ({
    id,
    at,
    kind: "rejection" as const,
    application: which,
    email: mail(id, `${app.org} HR`, app.email, `Your application – ${app.role}`, `Dear ${n.replace("_", " ")},\n\nThank you for your interest in ${app.org}. After careful review, we will not be taking your application further for this role. We encourage you to apply for future openings.\n\nKind regards,\nHR Office, ${app.org}`),
  });
  const scam = {
    id: "s",
    at: 58,
    kind: "scam" as const,
    application: null,
    email: mail("s", "Recruitment Desk", "jobs.offer.cameroon@gmail.com", "CONGRATULATIONS you are selected!!!", `Dear candidate,\n\nYou have been SELECTED for a well-paid position. To confirm, send 20,000 FCFA \"file fee\" by Mobile Money to 6 50 00 00 00 with your MoMo PIN within 2 hours.\n\nRecruitment Desk`),
  };
  const events =
    order === "ackA"
      ? [ack("a1", a, 2, "A"), ack("b1", b, 9, "B"), missing("a2", a, 30, "A"), scam, invite("b2", b, 95, "B")]
      : [ack("b1", b, 3, "B"), invite("a1", a, 26, "A"), scam, missing("b2", b, 74, "B"), reject("b3", b, 130, "B")];
  return {
    type: "inboxWeek",
    instruction: `It's the week after you applied to ${a.org} (A) and ${b.org} (B). Handle every email and keep your tracker right.`,
    applications: [
      { id: "A", org: a.org, role: a.role },
      { id: "B", org: b.org, role: b.role },
    ],
    events,
    files: WEEK_FILES(n),
    requiredFile: `${n}_Diploma.pdf`,
    passPercent: 70,
    success: "A whole week handled: nothing missed, nothing late, no scam answered, and a tracker that tells the truth.",
  };
};

const followWeek = (f: FollowUpTask, w: InboxWeekTask): SequenceTask => ({ type: "sequence", tasks: [f, w], images: [null, "app-14-envelope-path"] });

const MBE = { org: "Mbe Hills Microfinance", role: "Junior Accounts Assistant", email: "jobs@mbehillsmf.cm" };
const TIKO = { org: "Tiko Fresh Foods", role: "Cashier", email: "recruit@tikofresh.cm" };
const KRIBI = { org: "Kribi Shores Hotel", role: "Front Desk Agent", email: "recruitment@kribishores.cm" };
const WOURI = { org: "Wouri Connect", role: "Customer Care Agent", email: "careers@wouriconnect.cm" };
const MFOUNDI = { org: "Mfoundi Bright Logistics", role: "Data Entry Clerk", email: "hr@mfoundibright.cm" };
const SANAGA = { org: "Sanaga Health Initiative", role: "Survey Enumerator", email: "surveys@sanagahealth.org" };

/* ---------- Step 15: Final mission ---------- */

const MISSION_ADVERT = {
  org: "Nyanga Youth Futures",
  title: "Administrative Assistant",
  text: "Nyanga Youth Futures, a youth employment association in Douala, is recruiting an Administrative Assistant.\n\nYou will: manage the office email and files, keep attendance and payment records in Excel, welcome visitors and prepare simple reports.\n\nRequirements: GCE A Level or higher; Word, Excel and email; organised and accurate; English and French (one fluently).\n\nTo apply: email your CV and a cover letter as two PDFs (Firstname_Lastname_CV.pdf and Firstname_Lastname_Cover_Letter.pdf) to the address shown on the mission screen. Subject: “Application for Administrative Assistant – Your Name”. Deadline: 15 December.",
};

const missionLetter: CoverLetterTask = {
  type: "coverLetter",
  instruction: "Write your cover letter for this advert, then download it. You will attach it to your real application.",
  advert: { id: "nyanga-admin", org: MISSION_ADVERT.org, role: MISSION_ADVERT.title, contact: "", text: MISSION_ADVERT.text },
  maxWords: 300,
  success: "Your letter for Nyanga Youth Futures is ready. Download it, then tap “Finish course” for the mission address.",
};

const course: Course = {
  id: "applications",
  locale: "en",
  title: "Applications That Get Answers",
  promise: "Leave with a tailored cover letter, a networking profile and a real application sent, and know how to handle every reply.",
  price: 1000,
  track: "career",
  audience: "For graduates and job seekers",
  cover: "app-15-mission",
  outcomes: ["A tailored cover letter for a real advert", "An application tracker and a networking profile", "A real application sent, and the reply handled"],
  series: "Get the Job · 2 of 4",
  usesCv: true,
  badge: "app-certificate-badge",
  freeSteps: 1,
  steps: [
    // Section A: Find and organise
    {
      title: "Why some applications get answers",
      illustration: "app-01-two-applicants",
      cvSetup: true,
      body: [
        "Two people with the same diploma apply for the same job. One gets an interview, the other hears nothing. The difference is rarely the CV: it is the application around it.",
        "A clear subject, named PDF files, a short tailored letter and a polite reply when they write back. All of it can be learned.",
        "Look at two real-looking applications and spot the difference.",
      ],
      mistake: "Sending the same email “for any vacancy” to every company. Recruiters can tell, and they skip it.",
      task: compare1,
      variants: [compare2, compare3],
    },
    {
      title: "Find real opportunities, skip the traps",
      illustration: "app-02-opportunities",
      body: [
        "Good sources: organisation websites and pages, trusted job boards, university career offices, and people you know in the field.",
        "Before you spend time on an advert, check three things: is the deadline still ahead, do you meet the must-haves, and is it real? Fees, WhatsApp-only contact and “no interview” mean a scam.",
      ],
      mistake: "Applying to everything. Ten well-matched applications get more answers than fifty random ones.",
      task: board1,
      variants: [board2, board3],
    },
    {
      title: "Track every application",
      illustration: "app-03-tracker",
      body: [
        "When you apply to several jobs, you forget what you sent, when, and to whom. Then a recruiter calls and you don't know which job it is.",
        "A tracker is a simple table: organisation, role, deadline, documents, status, follow-up date and reference number. Yours is saved in your profile, and you can download it as a spreadsheet.",
      ],
      mistake: "Keeping it all in your head or in WhatsApp chats. Write it down the day you apply.",
      task: tracker1,
      variants: [tracker2, tracker3],
    },
    // Section B: The cover letter
    {
      title: "Formal letter, email, cover letter: the layouts",
      illustration: "app-04-letter-formats",
      body: [
        "In Cameroon you will meet three formats. A formal letter (printed or as a PDF): your details, the recipient, place and date, a subject line (“Objet” in French), the greeting, the body, a formal closing and your signature.",
        "The application email: a short message that carries your documents. The cover letter: four short paragraphs, one page, attached as a PDF.",
      ],
      mistake: "Pasting your whole cover letter into the email body and attaching nothing. Keep the email short and attach the letter.",
      task: letterOrder(0),
      variants: [letterOrder(1), letterOrder(2)],
    },
    {
      title: "Openings that get read",
      illustration: "app-05-openings",
      body: [
        "The first two lines decide whether the rest is read. Name the exact role, where you saw it, and one reason to read on.",
        "Avoid begging (“I humbly beg”), flattery (“your esteemed company”) and clichés (“hardworking and God-fearing”). They waste the most valuable lines of your letter.",
      ],
      task: openings("Junior Accounts Assistant", "Mbe Hills Microfinance", ["accounts assistant", "accounting assistant"], "Ngwa Brenda", "With an HND in Accounting and 18 months of microfinance experience, I can support your team from day one."),
      variants: [
        openings("Customer Care Agent", "Wouri Connect", ["customer care"], "Ewane Linda", "I am bilingual and welcomed up to 80 guests a day in my last role."),
        openings("Data Entry Clerk", "Mfoundi Bright Logistics", ["data entry"], "Fon Mirabel", "I entered 1,200 survey forms in Excel in three weeks with 99% accuracy."),
      ],
    },
    {
      title: "Match your evidence to their needs",
      illustration: "app-06-evidence",
      variantGroup: "letter",
      body: [
        "A cover letter is not a summary of your CV. It answers one question: why are you a good match for this advert?",
        "List what they want, then find a proof for each from your CV: something you did, ideally with a number. Where you have no proof, leave a gap. Never invent.",
      ],
      mistake: "Claiming skills you can't prove. The interview will find out, and it closes doors.",
      task: evidence(ADVERTS[0]),
      variants: [evidence(ADVERTS[1]), evidence(ADVERTS[2])],
    },
    {
      title: "Write your cover letter",
      illustration: "cv-14-cover-letter",
      variantGroup: "letter",
      body: [
        "Four short paragraphs: the role you want, why you (two proofs), why them (something real about the organisation), and a polite request for an interview.",
        "One page, under 300 words. Greet a named person if the advert gives one (“Dear Mrs Ekane”), otherwise “Dear Sir or Madam”.",
      ],
      mistake: "Copying your CV line by line. The letter should explain and connect, not repeat.",
      task: letter(ADVERTS[0]),
      variants: [letter(ADVERTS[1]), letter(ADVERTS[2])],
    },
    {
      title: "Red pen: fix this letter",
      illustration: "app-08-red-pen",
      body: ["Train your eye on someone else's letter first: names, role, tone, spelling, closing.", "Then reread your own letter for the same mistakes before you send it."],
      task: redPen1,
      variants: [redPen2, redPen3],
    },
    // Section C: Send it right
    {
      title: "Apply by email",
      illustration: "app-09-email-apply",
      body: [
        "Subject: “Application for [Role] – Your Name”. Body: greeting, one line on the role, one proof, what is attached, a closing and your signature with your phone number.",
        "Attach exactly what the advert asks for, as clearly named PDFs: Firstname_Lastname_CV.pdf and Firstname_Lastname_Cover_Letter.pdf.",
      ],
      mistake: "Sending from a phone with “Sent from my iPhone” as the only signature. Always sign with your name and number.",
      task: applyEmail("jobs@mbehillsmf.cm", "Junior Accounts Assistant", ["accounts assistant", "accounting assistant"], "Ngwa Brenda", ["IMG_20261104.jpg", "CV_final_final2.docx"]),
      variants: [
        applyEmail("careers@wouriconnect.cm", "Customer Care Agent", ["customer care"], "Ewane Linda", ["Screenshot_2026.png", "Document1.docx"]),
        applyEmail("hr@mfoundibright.cm", "Data Entry Clerk", ["data entry"], "Fon Mirabel", ["scan0003.pdf", "mirabel cv new.docx"]),
      ],
    },
    {
      title: "Apply through an online portal",
      illustration: "cv-15-portal",
      body: [
        "Many employers use online forms. They time out, limit file sizes and word counts, and rarely tell you why something failed.",
        "Prepare your answers and PDFs before you start, save a draft often, and copy the reference number from the confirmation email into your tracker.",
      ],
      mistake: "Typing a long answer straight into the form and losing it when the session expires. Save drafts.",
      task: portal("Mbe Hills Careers", "Mbe Hills Microfinance", "Junior Accounts Assistant", "MBE", "Why do you want to work at Mbe Hills Microfinance? (max 150 words)"),
      variants: [
        portal("Wouri Connect Jobs", "Wouri Connect", "Customer Care Agent", "WCJ", "Describe a time you helped a difficult customer. (max 150 words)"),
        portal("Mfoundi Bright Recruitment", "Mfoundi Bright Logistics", "Data Entry Clerk", "MBL", "How do you make sure your data entry is accurate? (max 150 words)"),
      ],
    },
    {
      title: "Build a paper file (dossier)",
      illustration: "app-11-dossier",
      body: [
        "Some employers, schools and public recruitments still ask for a paper file. Read the list in the notice and follow it exactly: the documents, the number of copies and the order.",
        "Hand in copies, never originals. Before you submit, photograph every page and note the date in your tracker.",
      ],
      mistake: "Adding extra papers “to look serious”. Extra documents make your file harder to check, and missing ones can disqualify it.",
      task: dossier1,
      variants: [dossier2, dossier3],
    },
    {
      title: "Referees: ask first",
      illustration: "cv-16-referee",
      body: [
        "Many adverts ask for two or three referees: a lecturer, internship supervisor or former employer who can speak about your work.",
        "Always ask before you list someone. Tell them which job, and when they might be called. Family members are not referees.",
      ],
      task: referee("p.tanyi@uniba-example.cm", "Dr Tanyi", "Junior Accounts Assistant", ["accounts assistant", "accounting assistant"], "Mbe Hills Microfinance"),
      variants: [
        referee("m.ewane@limbeguesthouse.cm", "Mrs Ewane", "Customer Care Agent", ["customer care"], "Wouri Connect"),
        referee("survey.lead@sanagahealth.org", "Mr Kamga", "Data Entry Clerk", ["data entry"], "Mfoundi Bright Logistics"),
      ],
    },
    // Section D: After you apply
    {
      title: "A networking profile recruiters can find",
      illustration: "app-13-network",
      body: [
        "Recruiters search for candidates online and look you up after you apply. A clear profile makes you easy to find and easy to trust.",
        "A headline with what you do and what you want, a short “About” in your own voice with one result, your experience, at least five skills and a professional photo.",
      ],
      mistake: "A headline like “Unemployed” or “Seeking for job”. Say what you can do and the role you want.",
      task: network(
        "Accounting graduate (HND) | Cash handling & Excel | Looking for a junior accounts role in Bamenda or Douala",
        "I am an accounting graduate from Bamenda with 18 months of microfinance experience. During my internship I reconciled daily cash for 3 agents with no shortages and kept the loan register up to date. I enjoy accurate work with figures and clear records. I am looking for a junior accounts or finance assistant role where I can keep learning.",
      ),
      variants: [
        network(
          "Bilingual customer care | Tourism graduate | Looking for front desk or customer service roles",
          "I am a bilingual tourism graduate from Buea. As a guest house receptionist in Limbe I welcomed up to 80 guests a day and handled bookings in English and French. I like solving problems calmly and making people feel welcome. I am looking for a front desk or customer care role in the Littoral or South West.",
        ),
        network(
          "Data entry & Excel | Survey data collection | Looking for an administrative or data role in Bafoussam",
          "I am a detail-focused office skills graduate from Bafoussam. As a survey volunteer I entered 1,200 forms in Excel in three weeks with 99% accuracy. I am fast on a keyboard and careful with records. I am looking for a data entry or administrative assistant role.",
        ),
      ],
    },
    {
      title: "Follow up and handle every reply",
      illustration: "app-14-follow-up",
      body: [
        "Silence is normal. About a week after the deadline, a short polite follow-up puts your name back on top.",
        "Then replies arrive: automatic acknowledgements (no reply needed), requests for a missing document, interview invitations, rejections and scams. Each needs the right action, on time.",
      ],
      mistake: "Ignoring a rejection. A short thank-you leaves a good impression for the next opening.",
      task: followWeek(followUp(7, "Junior Accounts Assistant", "Mbe Hills Microfinance", "jobs@mbehillsmf.cm", ["accounts assistant", "accounting assistant"]), week("Ngwa_Brenda", MBE, TIKO, "ackA")),
      variants: [
        followWeek(followUp(10, "Customer Care Agent", "Wouri Connect", "careers@wouriconnect.cm", ["customer care"]), week("Ewane_Linda", KRIBI, WOURI, "ackB")),
        followWeek(followUp(5, "Data Entry Clerk", "Mfoundi Bright Logistics", "hr@mfoundibright.cm", ["data entry"]), week("Fon_Mirabel", MFOUNDI, SANAGA, "ackA")),
      ],
    },
    {
      title: "Final mission: send a real application",
      illustration: "app-15-mission",
      body: [
        "Your last task is real. Add the advert below to your tracker, write your cover letter for it, then send your application from your own Gmail.",
        "After this step, tap “Finish course” for the mission address. We check your email and both PDFs automatically, then the recruiter writes back, and you must answer correctly.",
      ],
      task: {
        type: "sequence",
        tasks: [
          {
            type: "missionBrief",
            advert: MISSION_ADVERT,
            track: { org: MISSION_ADVERT.org, role: MISSION_ADVERT.title, deadline: "2026-12-15", documents: "CV, cover letter (PDF)" },
            points: [
              "Add the advert to your tracker.",
              "Write and download your cover letter for this advert (next part): Firstname_Lastname_Cover_Letter.pdf.",
              "Download your CV from My CV: Firstname_Lastname_CV.pdf, 2 pages maximum.",
              "Subject: “Application for Administrative Assistant – Your Name”. A short message with a greeting, the role, a closing and your signature.",
            ],
          },
          missionLetter,
        ],
      },
    },
  ],
  assessment: {
    passMark: 7,
    warmup: [0, 2, 4, 6, 8],
    questions: [
      { step: 1, question: "Which subject line is best for an application email?", options: ["CV", "Job", "Application for Sales Assistant – Ngwa Brenda", "Please help me"], answer: 2 },
      { step: 2, question: "An advert asks you to pay 10,000 FCFA to “confirm your file”. What do you do?", options: ["Pay quickly before others", "Skip it: it is a scam", "Pay half", "Send your MoMo PIN instead"], answer: 1 },
      { step: 3, question: "What belongs in an application tracker?", options: ["Only the companies that replied", "Organisation, role, deadline, documents, status and follow-up date", "Your salary wishes", "Nothing: just remember"], answer: 1 },
      { step: 4, question: "In a formal letter, where does the subject line (“Objet”) go?", options: ["After the signature", "Before the greeting", "At the very bottom", "It is not needed"], answer: 1 },
      { step: 5, question: "Which is the strongest opening?", options: ["I humbly beg for any vacant position.", "My name is Paul, I am 23 and single.", "I am applying for the Data Entry Clerk position advertised on your website.", "I want to develop myself in your esteemed company."], answer: 2 },
      { step: 6, question: "The advert asks for Excel. You have never used it. What do you do in your letter?", options: ["Say you are an Excel expert", "Don't claim it; show proofs for the other requirements", "Copy the advert", "Don't apply to anything"], answer: 1 },
      { step: 8, question: "You greeted “Dear Sir or Madam”. Which closing matches?", options: ["Yours lovingly", "Yours faithfully", "Love", "Bye"], answer: 1 },
      { step: 9, question: "Which file names should you send?", options: ["scan0001.pdf and Document1.docx", "Ngwa_Brenda_CV.pdf and Ngwa_Brenda_Cover_Letter.pdf", "CV.jpg", "cv final final.docx"], answer: 1 },
      { step: 11, question: "The notice asks for “a copy of the highest diploma”. What do you put in the file?", options: ["The original diploma", "A copy of the highest diploma", "Every certificate since primary school", "Nothing"], answer: 1 },
      { step: 14, question: "An employer asks for a missing document within 36 hours. What is the right reply?", options: ["Wait until next week", "Reply on time, greet them, attach the document and say it is attached", "Call them at midnight", "Send a new application"], answer: 1 },
    ],
  },
  mission: {
    kind: "application",
    intro: "Prove it for real: send a complete application from your own Gmail, then answer the recruiter's reply.",
    steps: [
      "Write the Gmail address you will send from.",
      "Download your CV (Firstname_Lastname_CV.pdf) and your cover letter for Nyanga Youth Futures (Firstname_Lastname_Cover_Letter.pdf).",
      "In Gmail, write to the address below. Subject: “Application for Administrative Assistant – Your Name”.",
      "Write a short message: a greeting, one line saying which role you are applying for, a closing and your signature with your phone number.",
      "Attach both PDFs and press Send. We check everything automatically.",
      "If your application passes, the recruiter replies. Answer their email from Gmail exactly as they ask.",
    ],
    subjectWords: ["administrative assistant"],
    orgWords: ["nyanga"],
    advert: MISSION_ADVERT,
    subjectExample: "Application for Administrative Assistant – {name}",
    replies: {
      missing_document: {
        from: "Recruitment – Nyanga Youth Futures",
        subject: "Missing document – Administrative Assistant (Ref: {ref})",
        body: "Dear {name},\n\nThank you for your application for the {role} position at {org}. Your file is almost complete, but we did not receive a copy of your highest diploma or certificate.\n\nPlease reply to this email within 48 hours with the document attached as a PDF.\n\nKind regards,\nRecruitment Team\n{org}",
        instruction: "Reply to this email from Gmail (tap Reply). Greet them, say the document is attached, attach a PDF of your diploma or certificate with a clear name (e.g. Firstname_Lastname_Diploma.pdf), then close politely and sign.",
      },
      interview: {
        from: "Recruitment – Nyanga Youth Futures",
        subject: "Interview invitation – Administrative Assistant (Ref: {ref})",
        body: "Dear {name},\n\nThank you for your application for the {role} position at {org}. We are pleased to invite you to a short phone interview next week.\n\nPlease reply with a day and a time when you are available (Monday to Friday, 9:00–16:00).\n\nKind regards,\nRecruitment Team\n{org}",
        instruction: "Reply to this email from Gmail (tap Reply). Greet them, thank them, give a day and a time you are available (e.g. “Tuesday at 10:00”), then close politely and sign.",
      },
    },
    messages: {
      gmail: "Send from the Gmail address you entered here.",
      subject: "Your subject must name the role: “Application for Administrative Assistant – Your Name”.",
      bodyGreeting: "Start your email with a greeting, e.g. “Dear Sir or Madam,”.",
      bodyPurpose: "Say in the email which role you are applying for: “I am applying for the Administrative Assistant position.”",
      bodyClosing: "End your email with a closing such as “Kind regards,”.",
      bodySignature: "Sign the email with your name and phone number.",
      bodyLength: "Keep the email short (under 150 words): your details belong in the cover letter.",
      twoPdfs: "Attach two PDF files: your CV and your cover letter.",
      cvFileName: "Name your CV Firstname_Lastname_CV.pdf, as downloaded from My CV.",
      letterFileName: "Name your cover letter Firstname_Lastname_Cover_Letter.pdf, as downloaded in step 15.",
      unreadable: "We could not open one of your PDFs. Download it again from the course and attach that file (not a photo or a scan).",
      cvPages: "Your CV is longer than 2 pages. Shorten it and send again.",
      letterRole: "Your cover letter must name the role: Administrative Assistant.",
      letterOrg: "Your cover letter must name the organisation: Nyanga Youth Futures.",
      letterLength: "Your cover letter is longer than 350 words. Keep it to one page.",
      letterGreeting: "Your cover letter needs a greeting, e.g. “Dear Sir or Madam,”.",
      letterClosing: "Your cover letter needs a closing, e.g. “Yours faithfully,”.",
      letterSignature: "Sign your cover letter with your full name at the end.",
      reply_gmail: "Reply from the same Gmail address you applied from.",
      reply_greeting: "Start your reply with a greeting, e.g. “Dear Recruitment Team,”.",
      reply_closing: "End your reply with a closing such as “Kind regards,” and your name.",
      reply_attachment: "Attach the requested document as a PDF.",
      reply_attachmentName: "Give the document a clear name, e.g. Firstname_Lastname_Diploma.pdf.",
      reply_availability: "Give a day and a time you are available, e.g. “Tuesday at 10:00”.",
      reply_thanks: "Thank them for the invitation.",
    },
  },
};

export default course;
