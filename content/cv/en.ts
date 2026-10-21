import type { Course, KeywordAdvert, RecruiterScanTask, RedPenTask, AdvertHighlightTask, InboxTask, SectionOrderTask, CvProfileTask, TailorTask, KeywordMatchTask, TextRule } from "../types";

/* ---------- Shared pieces ---------- */

const CLICHES: TextRule = {
  kind: "excludesAll",
  words: ["hardworking", "hard-working", "god-fearing", "honest and", "any company", "potentials", "dynamic young", "ready to work"],
  message: "Remove clichés like “hardworking”, “God-fearing” or “ready to work in any company”. Every CV says them; show proof instead.",
};

const PROFILE_OWN = {
  instruction: "Now write your own profile in about 3 lines: who you are (studies or experience), one or two strengths with proof, and the job you want.",
  example:
    "Marketing graduate (HND) with 18 months of retail experience in Buea. Served 80+ customers a day and handled Mobile Money payments with no errors. Looking for a sales or customer service role.",
  rules: [
    { kind: "minWords", n: 20, message: "Write a little more: about 3 lines (at least 20 words)." },
    { kind: "maxWords", n: 70, message: "Keep it short: 3 lines, under 70 words." },
    CLICHES,
    { kind: "regex", pattern: "^(?!\\s*(i|my)\\b)", flags: "i", message: "Start with what you are (e.g. “Accounting graduate…”), not with “I” or “My”." },
    {
      kind: "includesAny",
      words: ["role", "position", "job", "looking for", "seeking", "work as", "career", "opportunity"],
      message: "End by saying the kind of job you want, e.g. “Looking for a customer service role.”",
    },
  ] as TextRule[],
};

/* ---------- Step 1: RecruiterScan (3 variants) ---------- */

const SCAN_LESSON =
  "Most people remember almost nothing from the crowded CV, and much more from the clean one. A recruiter's first look lasts about 7 seconds: clear headings, short lines and numbers decide whether they read on.";

const scan1: RecruiterScanTask = {
  type: "recruiterScan",
  instruction: "You are the recruiter. You will see a CV for 7 seconds only, then answer 3 questions about it.",
  seconds: 7,
  lesson: SCAN_LESSON,
  rounds: [
    {
      label: "CV A",
      cv: {
        layout: "messy",
        name: "EBOT MBI CLARISSE",
        contact: "Tel: 6 77 45 12 90 / 699 01 23 45 · Email: clarissebabygirl@yahoo.fr · P.O. Box 211 Kumba · Born 12/04/1999 at Mamfe · Single · Christian",
        sections: [
          {
            heading: "Personal statement",
            lines: [
              "I am a hardworking, honest and God-fearing young lady who is ready to work in any company that will give me the opportunity to show my potentials and contribute to the growth of the company and also develop myself.",
            ],
          },
          {
            heading: "Working experience",
            lines: [
              "2021-2022 worked at Mama Clara Provision Store as a sales girl where I was responsible for selling, cleaning the shop, arranging goods and other duties assigned by the boss. 2019 did holiday job in a bakery.",
            ],
          },
          {
            heading: "Educational background",
            lines: ["2012 FSLC, Government School Mamfe. 2016 GCE O Level in 7 papers, GHS Kumba. 2018 GCE A Level in 3 papers. 2021 HND in Marketing, Higher Institute of Commerce Buea."],
          },
          { heading: "Hobbies", lines: ["Reading, travelling, cooking, watching movies, dancing, sleeping."] },
        ],
      },
      questions: [
        { question: "What is her highest diploma?", options: ["GCE A Level", "HND in Marketing", "BSc in Economics", "Master's degree"], answer: 1 },
        { question: "Where did she work most recently?", options: ["A bakery", "A provision store", "A bank", "A school"], answer: 1 },
        { question: "What is her email address?", options: ["clarissebabygirl@yahoo.fr", "clarisse.ebot@gmail.com", "ebot.clarisse@yahoo.com", "There was no email"], answer: 0 },
      ],
    },
    {
      label: "CV B",
      cv: {
        layout: "clean",
        name: "Tabi Ndip Joel",
        contact: "tabi.ndip@gmail.com | +237 677 12 34 56 | Buea",
        sections: [
          { heading: "Profile", lines: ["Marketing graduate (HND) with 2 years of retail sales experience. Increased weekly drink sales by 15%."] },
          {
            heading: "Experience",
            lines: [
              "Sales Assistant, Etoile Supermarket, Buea (2022–2024)",
              "Served 80+ customers a day and handled Mobile Money payments",
              "Increased weekly drink sales by 15% with a new shelf layout",
            ],
          },
          { heading: "Education", lines: ["HND Marketing, Higher Institute of Commerce, Buea (2022)"] },
          { heading: "Skills", lines: ["Customer service · Mobile Money · Microsoft Excel · English and French"] },
        ],
      },
      questions: [
        { question: "What is his highest diploma?", options: ["GCE A Level", "HND Marketing", "BSc Economics", "Master's degree"], answer: 1 },
        { question: "Where did he work?", options: ["A bank", "A school", "Etoile Supermarket", "A hospital"], answer: 2 },
        { question: "By how much did he increase weekly drink sales?", options: ["5%", "15%", "50%", "He did not say"], answer: 1 },
      ],
    },
  ],
};

const scan2: RecruiterScanTask = {
  ...scan1,
  rounds: [
    {
      label: "CV A",
      cv: {
        layout: "messy",
        name: "FONYUY BERTRAND NSAH",
        contact: "Phone: 650 33 21 09 · E-mail: bertrandkingofnso@gmail.com · Quarter: Up Station, Bamenda · Date of birth: 03/09/1997 · Married · Catholic",
        sections: [
          {
            heading: "Career objective",
            lines: [
              "To obtain a challenging position in a reputable organisation where I can use my skills and knowledge for the achievement of the objectives of the organisation and my own personal development as a dynamic young man.",
            ],
          },
          {
            heading: "Work experience",
            lines: [
              "From 2019 to 2020 I was a teacher of mathematics in a private college in Bamenda. From 2021 till date I am working as a data clerk in a transport agency where I am in charge of entering data, receiving customers and doing other tasks.",
            ],
          },
          { heading: "Academic qualifications", lines: ["FSLC 2008. GCE O Level 2013. GCE A Level 2015. BSc Mathematics, University of Bamenda, 2019."] },
          { heading: "Interests", lines: ["Football, music, internet, friends, church activities, travelling."] },
        ],
      },
      questions: [
        { question: "What is his current job?", options: ["Teacher", "Data clerk", "Driver", "Accountant"], answer: 1 },
        { question: "What did he study at university?", options: ["Economics", "Computer science", "Mathematics", "Law"], answer: 2 },
        { question: "Which city does he live in?", options: ["Bamenda", "Douala", "Buea", "Kumba"], answer: 0 },
      ],
    },
    {
      label: "CV B",
      cv: {
        layout: "clean",
        name: "Nkeng Ateh",
        contact: "nkeng.ateh@gmail.com | +237 670 45 67 89 | Douala",
        sections: [
          { heading: "Profile", lines: ["Accounting graduate (BSc) with a 6-month internship. Reconciled 300+ transactions a month with no errors."] },
          {
            heading: "Experience",
            lines: ["Accounting Intern, Sawa Microfinance, Douala (Jan–Jun 2024)", "Reconciled 300+ Mobile Money transactions a month", "Prepared 12 weekly cash reports for the branch manager"],
          },
          { heading: "Education", lines: ["BSc Accounting, University of Douala (2023)"] },
          { heading: "Skills", lines: ["Microsoft Excel (very good) · Sage accounting · English and French"] },
        ],
      },
      questions: [
        { question: "Where did she do her internship?", options: ["A supermarket", "Sawa Microfinance", "A hospital", "A school"], answer: 1 },
        { question: "How many transactions did she reconcile a month?", options: ["30", "100", "300+", "She did not say"], answer: 2 },
        { question: "What did she study?", options: ["Marketing", "Accounting", "Law", "Nursing"], answer: 1 },
      ],
    },
  ],
};

const scan3: RecruiterScanTask = {
  ...scan1,
  rounds: [
    {
      label: "CV A",
      cv: {
        layout: "messy",
        name: "NGO BASSA MARIE-CLAIRE",
        contact: "Tel: 691 22 33 44 · Email: mcsweetheart237@gmail.com · B.P. 4021 Yaoundé · Born on 21st July 2000 · Single",
        sections: [
          {
            heading: "Objective",
            lines: [
              "Seeking for a job where I can put into practice all the knowledge I have acquired during my studies, I am serious, punctual, obedient and ready to learn new things in any domain of work.",
            ],
          },
          {
            heading: "Experiences",
            lines: [
              "Internship at Bonne Santé Pharmacy Yaoundé in 2022 for 3 months as sales assistant, I was arranging medicines, helping customers and also cleaning. Also I sell cosmetics online with my sister on Facebook since 2021.",
            ],
          },
          { heading: "Diplomas", lines: ["BEPC 2015, Probatoire 2017, Baccalauréat A4 2018, BTS in Pharmacy Sales 2021, Institut Supérieur Saint-Jean Yaoundé."] },
          { heading: "Hobbies", lines: ["Cooking, music, films, social media, shopping."] },
        ],
      },
      questions: [
        { question: "What diploma does she have in her field?", options: ["BTS in Pharmacy Sales", "Licence in Biology", "Nursing diploma", "None"], answer: 0 },
        { question: "Where did she do her internship?", options: ["A hospital", "Bonne Santé Pharmacy", "A bank", "A supermarket"], answer: 1 },
        { question: "What does she sell online?", options: ["Phones", "Clothes", "Cosmetics", "Food"], answer: 2 },
      ],
    },
    {
      label: "CV B",
      cv: {
        layout: "clean",
        name: "Achu Peter Ngwa",
        contact: "achu.ngwa@gmail.com | +237 682 90 11 22 | Yaoundé",
        sections: [
          { heading: "Profile", lines: ["Logistics graduate (HND) who managed stock for a 3-branch shop. Cut stock losses by 20% in one year."] },
          {
            heading: "Experience",
            lines: ["Stock Keeper, Mbakwa Hardware, Yaoundé (2023–2024)", "Managed stock of 1,200 items across 3 branches", "Cut stock losses by 20% with a weekly count"],
          },
          { heading: "Education", lines: ["HND Logistics and Transport, Yaoundé (2023)"] },
          { heading: "Skills", lines: ["Stock management · Microsoft Excel · Driving licence B · English and French"] },
        ],
      },
      questions: [
        { question: "What was his job?", options: ["Driver", "Stock Keeper", "Teacher", "Cashier"], answer: 1 },
        { question: "By how much did he cut stock losses?", options: ["10%", "20%", "50%", "He did not say"], answer: 1 },
        { question: "Which licence does he have?", options: ["None", "Motorbike licence", "Driving licence B", "Truck licence"], answer: 2 },
      ],
    },
  ],
};

/* ---------- Step 2: JobAdvertHighlighter (3 variants) ---------- */

const advert1: AdvertHighlightTask = {
  type: "advertHighlight",
  instruction: "Read this advert like a recruiter. Tap each highlighted phrase and say what it is.",
  passPercent: 80,
  success: "You read it like a recruiter: you know what you must have, what helps, what to send, how and by when.",
  advert: {
    org: "Ndolo Youth Foundation",
    title: "Field Assistant (Youth Employment Project)",
    location: "Bamenda",
    paragraphs: [
      ["Ndolo Youth Foundation is recruiting a Field Assistant for its youth employment project in Bamenda and Bafut."],
      [
        "Requirements: ",
        { text: "HND or Bachelor's degree in social sciences", label: "must", why: "It is under “Requirements”: without it you will not be shortlisted." },
        ", ",
        { text: "at least 1 year of community work, including volunteering", label: "must", why: "Required experience. Volunteering counts, so put it on your CV." },
        " and ",
        { text: "fluent English and Pidgin", label: "must", why: "A language requirement for the job." },
        ". ",
        { text: "Knowledge of KoboToolbox is an advantage", label: "nice", why: "“An advantage” means nice-to-have: apply even without it." },
        ". ",
        { text: "A motorbike licence would be a plus", label: "nice", why: "“A plus” also means nice-to-have." },
        ".",
      ],
      [
        "The Field Assistant will ",
        { text: "visit about 20 households per week", label: null, why: "This describes the work. It is not a requirement or an instruction." },
        " and write short weekly reports.",
      ],
      [
        "To apply, ",
        { text: "send your CV and a one-page cover letter", label: "documents", why: "These are the documents required." },
        " ",
        { text: "by email to jobs@ndolofoundation.org", label: "apply", why: "How to apply: by email, to this exact address." },
        " with the subject “Field Assistant – Your Name”. ",
        { text: "Deadline: 15 November, 5 pm", label: "deadline", why: "Late applications are usually not read." },
        ". ",
        { text: "No fees are charged at any stage", label: null, why: "A good sign: real employers never charge fees. Nothing to do." },
        ".",
      ],
    ],
  },
};

const advert2: AdvertHighlightTask = {
  ...advert1,
  advert: {
    org: "Sawa Microfinance",
    title: "Customer Service Officer",
    location: "Douala (Akwa branch)",
    paragraphs: [
      ["Sawa Microfinance is looking for a Customer Service Officer for its Akwa branch."],
      [
        "Profile: ",
        { text: "HND or Licence in Banking, Accounting or Marketing", label: "must", why: "A required diploma." },
        "; ",
        { text: "perfectly bilingual (English and French)", label: "must", why: "“Perfectly bilingual” is required, not optional." },
        "; ",
        { text: "at least 6 months in a customer-facing job", label: "must", why: "Required experience: sales, a shop or a call box all count." },
        ". ",
        { text: "Experience with Mobile Money platforms is desirable", label: "nice", why: "“Desirable” means nice-to-have." },
        ".",
      ],
      [
        "You will ",
        { text: "welcome about 60 clients a day", label: null, why: "This describes the work. Nothing to prepare." },
        " and help them open accounts.",
      ],
      [
        "Applications must include ",
        { text: "a CV, a cover letter and copies of diplomas", label: "documents", why: "The documents required. Missing one can disqualify you." },
        ". ",
        { text: "Submit them online at careers.sawamicrofinance.cm", label: "apply", why: "How to apply: through the online portal, not by email." },
        ". ",
        { text: "Closing date: 30 November", label: "deadline", why: "The last day to apply." },
        ". ",
        { text: "Sawa Microfinance is an equal opportunity employer", label: null, why: "Information about the employer. Nothing to do." },
        ".",
      ],
    ],
  },
};

const advert3: AdvertHighlightTask = {
  ...advert1,
  advert: {
    org: "Bonne Santé Pharmacy",
    title: "Pharmacy Sales Assistant",
    location: "Yaoundé (Bastos)",
    paragraphs: [
      ["Bonne Santé Pharmacy, Bastos, is recruiting two Pharmacy Sales Assistants."],
      [
        "You must have ",
        { text: "a BTS or HND in Pharmacy Sales or Health", label: "must", why: "A required diploma for this job." },
        " and ",
        { text: "good French and working English", label: "must", why: "A required language level." },
        ". ",
        { text: "Previous work in a pharmacy is an asset", label: "nice", why: "“An asset” means nice-to-have." },
        ". ",
        { text: "Computer skills (stock software) are welcome", label: "nice", why: "“Welcome” means nice-to-have." },
        ".",
      ],
      [
        "The team works ",
        { text: "in shifts, including some Sundays", label: null, why: "Working conditions: good to know before you apply, but not something to send." },
        ".",
      ],
      [
        "Please ",
        { text: "drop your CV and a handwritten application letter", label: "documents", why: "The documents required, including a handwritten letter." },
        " ",
        { text: "at the pharmacy reception, Monday to Friday, 9 am to 4 pm", label: "apply", why: "How to apply: in person, at these times." },
        ", ",
        { text: "before 20 November", label: "deadline", why: "The deadline." },
        ". ",
        { text: "Only selected candidates will be called for an interview", label: null, why: "Useful to know, but nothing to do." },
        ".",
      ],
    ],
  },
};

/* ---------- Step 3: fake jobs (3 variants) ---------- */

const fake1: InboxTask = {
  type: "inbox",
  emails: [
    {
      id: "realngo",
      from: "Ndolo Youth Foundation",
      fromEmail: "jobs@ndolofoundation.org",
      subject: "Your application – Field Assistant",
      preview: "Thank you for applying. Shortlisted candidates will be…",
      body: "Dear candidate,\n\nThank you for applying for the Field Assistant position. Shortlisted candidates will be invited to a written test in Bamenda.\n\nRecruitment Team",
      time: "10:15",
    },
    {
      id: "fee",
      from: "Cameroon Oil Recruitment Board",
      fromEmail: "recruitment.board.cm@gmail.com",
      subject: "Congratulations: you are shortlisted (pay 15,000 FCFA)",
      preview: "Pay your file fee by Mobile Money to confirm your place…",
      body: "Congratulations! You have been shortlisted for a job with 650,000 FCFA salary. To confirm your place, pay the 15,000 FCFA file fee by Mobile Money to 6 70 00 11 22 within 48 hours.",
      time: "09:02",
    },
    {
      id: "whatsapp",
      from: "Mr Daniel – HR",
      fromEmail: "danielhr.jobs@outlook.com",
      subject: "Urgent hiring – contact me on WhatsApp only",
      preview: "Send your CV and ID card photo on WhatsApp…",
      body: "We have 50 vacancies for receptionists in Douala hotels. No interview needed. Send your CV, a photo of your ID card and your Mobile Money number on WhatsApp only: +237 6 99 00 00 00.",
      time: "Yesterday",
    },
    {
      id: "school",
      from: "Higher Institute of Commerce",
      fromEmail: "careers@hic-buea.cm",
      subject: "Career fair – Saturday",
      preview: "Meet 20 employers on campus this Saturday…",
      body: "Dear graduate, meet 20 employers at our career fair this Saturday from 9 am. Bring printed copies of your CV.",
      time: "Mon",
    },
  ],
  goals: [
    {
      action: "spam",
      target: "fee",
      instruction: "One email asks you to pay to get a job. Open it and report it as spam.",
      wrong: "This one looks genuine: a real address, and no money or personal data asked for.",
      done: "Correct. Real employers never ask for a fee, and a free Gmail address is a warning sign.",
    },
    {
      action: "spam",
      target: "whatsapp",
      instruction: "Another one is a WhatsApp-only “recruiter”. Find it and report it as spam.",
      wrong: "This one looks genuine: a real address, and no money or personal data asked for.",
      done: "Correct. “No interview”, WhatsApp only, and asking for your ID card and Mobile Money number: classic scam signs.",
    },
  ],
  success: "You spotted both. Real jobs never ask for fees, your ID card photo or your Mobile Money number before an interview.",
};

const fake2: InboxTask = {
  ...fake1,
  emails: [
    {
      id: "toogood",
      from: "International Jobs Canada",
      fromEmail: "canada.jobs.visa2025@yahoo.com",
      subject: "Work in Canada: 2,500,000 FCFA per month, free visa",
      preview: "No experience needed. Pay only the processing fee…",
      body: "You are selected to work in Canada as a farm assistant. Salary 2,500,000 FCFA per month, free visa and ticket. No experience needed. Pay only 75,000 FCFA processing fee today.",
      time: "11:40",
    },
    {
      id: "realbank",
      from: "Sawa Microfinance",
      fromEmail: "careers@sawamicrofinance.cm",
      subject: "Online test invitation",
      preview: "You are invited to an online test on Thursday…",
      body: "Dear applicant,\n\nYou are invited to a 30-minute online test on Thursday at 10 am. The link will be sent the day before.\n\nHuman Resources",
      time: "10:05",
    },
    {
      id: "whatsapp",
      from: "Recruitment Agent Paul",
      fromEmail: "paulagent237@gmail.com",
      subject: "Job for you – reply on WhatsApp",
      preview: "I can get you a job at the port. Contact me on WhatsApp…",
      body: "I can get you a job at the port of Douala. Many places available. Contact me on WhatsApp only and bring 20,000 FCFA for the registration.",
      time: "Yesterday",
    },
    {
      id: "friend",
      from: "Brenda Tanyi",
      fromEmail: "brenda.tanyi@gmail.com",
      subject: "The advert I told you about",
      preview: "Here is the link to the customer service job…",
      body: "Hi! Here is the customer service advert I told you about. The deadline is Friday. Good luck!",
      time: "Mon",
    },
  ],
  goals: [
    {
      action: "spam",
      target: "toogood",
      instruction: "One offer is too good to be true. Open it and report it as spam.",
      wrong: "This one is genuine: it asks for nothing unusual.",
      done: "Correct. A huge salary, “no experience needed” and a fee: it is a scam.",
    },
    {
      action: "spam",
      target: "whatsapp",
      instruction: "Another “agent” wants you on WhatsApp and asks for money. Report it as spam.",
      wrong: "This one is genuine: it asks for nothing unusual.",
      done: "Correct. Nobody can sell you a job. Report and delete.",
    },
  ],
};

const fake3: InboxTask = {
  ...fake1,
  emails: [
    {
      id: "realpharma",
      from: "Bonne Santé Pharmacy",
      fromEmail: "rh@bonnesante-pharma.cm",
      subject: "Interview – Pharmacy Sales Assistant",
      preview: "We would like to meet you on Tuesday at 9 am…",
      body: "Dear candidate,\n\nWe would like to meet you on Tuesday at 9 am at the pharmacy in Bastos. Please bring your original diplomas.\n\nThe Manager",
      time: "08:50",
    },
    {
      id: "fee",
      from: "Ministry Recruitment Service",
      fromEmail: "ministry.recruitment.cm@gmail.com",
      subject: "Final list: pay 25,000 FCFA to secure your place",
      preview: "Your name is on the final list. Pay to secure…",
      body: "Your name is on the final list for the civil service recruitment. Pay 25,000 FCFA by Orange Money within 24 hours to secure your place, or it will be given to someone else.",
      time: "Yesterday",
    },
    {
      id: "toogood",
      from: "Golden Hotels Group",
      fromEmail: "goldenhotels.hr@protonmail.com",
      subject: "Receptionist: 900,000 FCFA a month, start Monday",
      preview: "No interview. Send your ID card and bank details…",
      body: "We are hiring receptionists at 900,000 FCFA per month. No interview, start Monday. Send your ID card photo and your bank or Mobile Money details to receive your first salary advance.",
      time: "Yesterday",
    },
    {
      id: "church",
      from: "Youth Fellowship",
      fromEmail: "youth.fellowship.biyemassi@gmail.com",
      subject: "CV workshop after service",
      preview: "Bring your CV on Sunday for a free review…",
      body: "Dear youths, bring your CV on Sunday after service for a free review with HR volunteers.",
      time: "Mon",
    },
  ],
  goals: [
    {
      action: "spam",
      target: "fee",
      instruction: "One email pretends to be an official recruitment and asks for money. Report it as spam.",
      wrong: "This one looks genuine: it asks for nothing unusual.",
      done: "Correct. Official recruitments never ask for payment by Mobile Money, and a ministry does not use Gmail.",
    },
    {
      action: "spam",
      target: "toogood",
      instruction: "Another offer is too good to be true. Report it as spam.",
      wrong: "This one looks genuine: it asks for nothing unusual.",
      done: "Correct. A huge salary, no interview, and a request for your ID and payment details: it's a scam.",
    },
  ],
};

/* ---------- Step 5: SectionOrder (3 persona variants) ---------- */

const orderRounds = (fresher: string, experienced: string): SectionOrderTask["rounds"] => [
  {
    persona: fresher,
    instruction: "Put the sections of a fresher's CV in the best order.",
    sections: [
      { id: "skills", label: "Skills", why: "Skills support your story; they come after education and experience." },
      { id: "header", label: "Name and contact details", why: "Always at the very top: the recruiter must know who you are and how to reach you." },
      { id: "experience", label: "Experience (internships, volunteering)", why: "For a fresher, experience comes after education." },
      { id: "interests", label: "Interests", why: "Optional, always last." },
      { id: "profile", label: "Profile (3 lines)", why: "Right under your name: it tells the recruiter in 7 seconds who you are and what you want." },
      { id: "education", label: "Education", why: "Your diploma is your strongest proof as a fresher: put it before experience." },
      { id: "languages", label: "Languages", why: "After skills, near the end." },
    ],
    answer: ["header", "profile", "education", "experience", "skills", "languages", "interests"],
  },
  {
    persona: experienced,
    instruction: "Now put the sections of an experienced candidate's CV in the best order.",
    sections: [
      { id: "education", label: "Education", why: "With real work experience, your jobs matter more than school: education moves below experience." },
      { id: "languages", label: "Languages", why: "After skills, near the end." },
      { id: "header", label: "Name and contact details", why: "Always at the very top." },
      { id: "experience", label: "Experience", why: "For an experienced candidate, recent jobs are the strongest proof: right after the profile." },
      { id: "interests", label: "Interests", why: "Optional, always last." },
      { id: "skills", label: "Skills", why: "After education, to support your experience." },
      { id: "profile", label: "Profile (3 lines)", why: "Right under your name." },
    ],
    answer: ["header", "profile", "experience", "education", "skills", "languages", "interests"],
  },
];

const order1: SectionOrderTask = {
  type: "sectionOrder",
  rounds: orderRounds(
    "Candidate 1: Brenda, 22, has just finished an HND in Accounting. She did a 2-month internship and volunteers at church.",
    "Candidate 2: Paul, 31, has worked 6 years as a shop manager. He has a GCE A Level.",
  ),
  success: "Freshers lead with education; experienced candidates lead with experience. Your own CV can switch layout in “My CV”.",
};
const order2: SectionOrderTask = {
  ...order1,
  rounds: orderRounds(
    "Candidate 1: Ali, 23, just finished a Licence in Computer Science. He repaired phones in his uncle's shop during holidays.",
    "Candidate 2: Christine, 35, has been a secretary in a law firm for 9 years.",
  ),
};
const order3: SectionOrderTask = {
  ...order1,
  rounds: orderRounds(
    "Candidate 1: Grace, 21, has a BTS in Pharmacy Sales and did a 3-month internship.",
    "Candidate 2: Emmanuel, 29, has driven delivery trucks for 7 years.",
  ),
};

/* ---------- Step 7: profile (3 fix variants) ---------- */

const profile1: CvProfileTask = {
  type: "cvProfile",
  fix: {
    instruction:
      "Paul has an HND in Marketing and sold phones in Mokolo market for 2 years. Rewrite his profile in 2–3 lines: what he studied, his experience with a number, and the job he wants.",
    initial:
      "I am a hardworking, honest and God-fearing young man who is ready to work in any company that will give me the opportunity to show my potentials.",
    rules: [
      { kind: "changed", message: "Rewrite the profile." },
      CLICHES,
      { kind: "includesAny", words: ["marketing", "hnd"], message: "Say what he studied: an HND in Marketing." },
      { kind: "includesAny", words: ["sales", "sold", "selling", "phones"], message: "Mention his sales experience (phones, Mokolo market)." },
      { kind: "regex", pattern: "\\d", message: "Add a number, for example “2 years”." },
      { kind: "maxWords", n: 60, message: "Keep it under 60 words." },
    ],
  },
  own: PROFILE_OWN,
  success: "Your profile is saved in your CV. It is the first thing a recruiter reads.",
};
const profile2: CvProfileTask = {
  ...profile1,
  fix: {
    instruction:
      "Brenda has a BSc in Accounting and did a 6-month internship at a microfinance, where she checked 300 transactions a month. Rewrite her profile in 2–3 lines.",
    initial: "To obtain a challenging position in a reputable organisation where I can use my skills and knowledge and develop myself as a dynamic young lady.",
    rules: [
      { kind: "changed", message: "Rewrite the profile." },
      CLICHES,
      { kind: "includesAny", words: ["accounting", "bsc"], message: "Say what she studied: a BSc in Accounting." },
      { kind: "includesAny", words: ["internship", "intern", "microfinance"], message: "Mention her internship at the microfinance." },
      { kind: "regex", pattern: "\\d", message: "Add a number, for example “300 transactions a month”." },
      { kind: "maxWords", n: 60, message: "Keep it under 60 words." },
    ],
  },
};
const profile3: CvProfileTask = {
  ...profile1,
  fix: {
    instruction:
      "Ali has a Licence in Computer Science and repaired about 15 phones a week in his uncle's shop. He wants an IT support job. Rewrite his profile in 2–3 lines.",
    initial: "I am a serious, punctual and obedient person who is ready to learn new things in any domain. I am looking for any job.",
    rules: [
      { kind: "changed", message: "Rewrite the profile." },
      CLICHES,
      { kind: "includesAny", words: ["computer science", "licence", "it"], message: "Say what he studied: a Licence in Computer Science." },
      { kind: "includesAny", words: ["repair", "repaired", "phones"], message: "Mention his phone repair experience." },
      { kind: "includesAny", words: ["support", "it support", "technician"], message: "Say the job he wants: IT support." },
      { kind: "regex", pattern: "\\d", message: "Add a number, for example “15 phones a week”." },
      { kind: "excludesAll", words: ["any job", "any domain"], message: "Remove “any job”: say the job he wants." },
    ],
  },
};

/* ---------- Step 10: RedPenCV (3 variants) ---------- */

const redPen1: RedPenTask = {
  type: "redPen",
  instruction: "This CV has many problems. Tap every mistake you can find.",
  passPercent: 70,
  success: "Now check your own CV for the same mistakes before you send it.",
  lines: [
    { style: "fancy", parts: [{ text: "Curriculum Vitae of Mbah Lionel", error: "fonts" }] },
    { parts: ["Email: ", { text: "lionelthebest@yahoo.com", error: "email" }, "  |  Tel: +237 677 88 99 00  |  Douala"] },
    { parts: [{ text: "ID card N° 112233445 · Father: Mbah John · Mother: Ngum Rose", error: "irrelevant" }] },
    { style: "heading", parts: ["Profile"] },
    { parts: ["Sales assistant with 3 years of ", { text: "experiance", error: "spelling" }, " in busy markets."] },
    { style: "heading", parts: ["Work history"] },
    { parts: ["Sales assistant, Bonapriso Market — ", { text: "2019 – 2021", error: "dates" }] },
    { parts: ["• ", { text: "Responsible for selling and cleaning the shop", error: "duties" }] },
    { parts: ["Cashier, City Supermarket — ", { text: "March 2020 to Dec 2022", error: "dates" }] },
    { parts: ["• Handled up to 400,000 FCFA in cash a day with no shortages"] },
    { style: "heading", parts: ["Education"] },
    { parts: ["GCE A Level ", { text: "recieved", error: "spelling2" }, " in 2018, GBHS Deido"] },
    { style: "heading", parts: ["Hobbies"] },
    { parts: [{ text: "Sleeping, watching films, eating", error: "hobbies" }] },
    { style: "small", parts: [{ text: "Page 1 of 4", error: "pages" }] },
  ],
  errors: [
    { id: "fonts", label: "Fancy, hard-to-read title", why: "Use one plain font, and your name as the title, not “Curriculum Vitae”." },
    { id: "email", label: "Unprofessional email address", why: "“lionelthebest” looks unserious. Use firstname.lastname@gmail.com." },
    { id: "irrelevant", label: "Irrelevant personal details", why: "Your ID number and parents' names do not help you get the job, and they expose you to fraud." },
    { id: "spelling", label: "Spelling: “experiance”", why: "It is “experience”. One spelling mistake can end your chances." },
    { id: "dates", label: "Inconsistent, overlapping dates", why: "Two date formats, and the jobs overlap without explanation. Use one format and check the order." },
    { id: "duties", label: "A duty, not an achievement", why: "“Responsible for” says what he was supposed to do. Say what he achieved, with a number." },
    { id: "spelling2", label: "Spelling: “recieved”", why: "It is “received”. Ask someone to proofread your CV." },
    { id: "hobbies", label: "Hobbies that hurt", why: "“Sleeping, eating” suggests low energy. Show something positive, or remove the section." },
    { id: "pages", label: "4 pages long", why: "A first CV should be 1–2 pages. Nobody reads page 4." },
  ],
};

const redPen2: RedPenTask = {
  ...redPen1,
  lines: [
    { style: "title", parts: [{ text: "CURRICULUM VITAE", error: "title" }] },
    { parts: ["Ngo Bassa Marie-Claire  |  ", { text: "mcsweetheart237@gmail.com", error: "email" }, "  |  ", { text: "691 22 33 44", error: "phone" }] },
    { style: "heading", parts: ["Objective"] },
    { parts: [{ text: "Seeking for a job in any domain where I can put my knowledge in practice.", error: "vague" }] },
    { style: "heading", parts: ["Experience"] },
    { parts: ["Sales assistant (internship), Bonne Santé Pharmacy — June 2022 – Aug 2022"] },
    { parts: ["• ", { text: "In charge of arranging medicines and helping customers", error: "duties" }] },
    { parts: ["• Advised 40+ customers a day on over-the-counter products"] },
    { style: "heading", parts: ["Education"] },
    { parts: ["BTS Pharmacy Sales, Institut Saint-Jean — 2021"] },
    { parts: [{ text: "Baccalauréat A4 (2018), Probatoire (2017), BEPC (2015), CEP (2011)", error: "oldSchool" }] },
    { style: "heading", parts: ["Skills"] },
    { parts: [{ text: "Microsoft Ofice, Exel, internet", error: "spelling" }] },
    { style: "fancy", parts: [{ text: "Thank you for reading my CV and God bless you", error: "fonts" }] },
  ],
  errors: [
    { id: "title", label: "“CURRICULUM VITAE” as the title", why: "Everyone knows it is a CV. Put your name at the top, big and clear." },
    { id: "email", label: "Unprofessional email address", why: "Use your real name: firstname.lastname@gmail.com." },
    { id: "phone", label: "Phone without +237", why: "Write +237 6XX XX XX XX so international employers can call you too." },
    { id: "vague", label: "Vague objective", why: "“Any domain” tells the recruiter you have no direction. Name the job you want." },
    { id: "duties", label: "A duty, not an achievement", why: "Replace “In charge of” with what you did and the result." },
    { id: "oldSchool", label: "Too many old school certificates", why: "List your highest diplomas only. Nobody needs your CEP." },
    { id: "spelling", label: "Spelling: “Ofice”, “Exel”", why: "“Microsoft Office”, “Excel”. Spelling mistakes in your skills section are fatal." },
    { id: "fonts", label: "Fancy font and an unnecessary closing line", why: "A CV does not end with thanks or blessings. Keep one plain font." },
  ],
};

const redPen3: RedPenTask = {
  ...redPen1,
  lines: [
    { style: "fancy", parts: [{ text: "★ FONYUY BERTRAND NSAH ★", error: "fonts" }] },
    { parts: ["Email: ", { text: "bertrandkingofnso@gmail.com", error: "email" }, "  |  +237 650 33 21 09  |  Bamenda"] },
    { parts: [{ text: "Married · 2 children · Catholic · Tribe: Nso", error: "irrelevant" }] },
    { style: "heading", parts: ["Work experience"] },
    { parts: ["Data clerk, Unity Transport Agency — 2021 – present"] },
    { parts: ["• ", { text: "Responsible for entering data and receiving customers", error: "duties" }] },
    { parts: ["Mathematics teacher, St Paul College — ", { text: "Sept 2019 – 2020 June", error: "dates" }] },
    { parts: ["• Prepared 140 students for the GCE O Level; pass rate rose from 48% to 71%"] },
    { style: "heading", parts: ["Education"] },
    { parts: ["BSc Mathematics, University of ", { text: "Bamanda", error: "spelling" }, " (2019)"] },
    { style: "heading", parts: ["References"] },
    { parts: [{ text: "Mr John Ndze, +237 677 00 11 22 · Mrs Rose Fai, +237 699 22 33 44 · Pastor Paul, +237 680 11 22 33 · Mr Kum, +237 651 00 99 88", error: "references" }] },
    { style: "small", parts: [{ text: "Page 1 of 3", error: "pages" }] },
  ],
  errors: [
    { id: "fonts", label: "Decorative stars and fancy font", why: "Decorations look unprofessional and confuse CV software. Keep it plain." },
    { id: "email", label: "Unprofessional email address", why: "“kingofnso” is fun for friends, not for recruiters." },
    { id: "irrelevant", label: "Personal details that invite bias", why: "Religion, tribe and children are not needed and can lead to unfair judgement." },
    { id: "duties", label: "A duty, not an achievement", why: "Say what he achieved as a data clerk, with a number." },
    { id: "dates", label: "Messy date format", why: "“Sept 2019 – 2020 June” is confusing. Use one format: 2019 – 2020." },
    { id: "spelling", label: "Spelling: “Bamanda”", why: "Even the city name is wrong: “Bamenda”. Proofread every line." },
    { id: "references", label: "Too many references taking space", why: "Two references are enough, or write “References available on request”." },
    { id: "pages", label: "3 pages long", why: "Keep a first CV to 1–2 pages." },
  ],
};

/* ---------- Steps 12–13: adverts for keyword matching and tailoring ---------- */

const A_SALES: KeywordAdvert = {
  id: "etoile-sales",
  org: "Etoile Supermarket, Buea",
  title: "Sales Assistant",
  text: "Etoile Supermarket is recruiting Sales Assistants. You will serve customers, handle cash and Mobile Money payments, and keep shelves full. Requirements: GCE A Level or HND; customer service experience; honest cash handling; teamwork; punctual; English and French. Basic Excel is an advantage.",
  terms: ["customer service", "sales", "cash handling", "mobile money", "teamwork", "punctual", "English", "French", "Excel"],
};
const A_DATA: KeywordAdvert = {
  id: "sahel-data",
  org: "Sahel Health Initiative, Garoua",
  title: "Data Collector (Health Survey)",
  text: "Sahel Health Initiative needs Data Collectors for a 3-month health survey in villages around Garoua. Tasks: household interviews, data collection on smartphones, daily reports. Requirements: A Level minimum; experience in surveys or community work; good French; able to travel in the field. Knowledge of Fulfulde is a plus.",
  terms: ["data collection", "survey", "community", "field", "report", "health", "French", "smartphone"],
};
const A_ADMIN: KeywordAdvert = {
  id: "mbakwa-admin",
  org: "Mbakwa Legal Chambers, Yaoundé",
  title: "Administrative Assistant",
  text: "Busy law chambers seek a bilingual Administrative Assistant: reception, filing, typing letters, managing the diary and following up clients. Requirements: HND/BTS in Secretarial Studies or Office Administration; Microsoft Office (Word, Excel); excellent organisation; bilingual English/French; discretion.",
  terms: ["administrative", "reception", "filing", "Microsoft Office", "Excel", "organised", "bilingual", "customer"],
};
const A_CS: KeywordAdvert = {
  id: "sawa-cs",
  org: "Sawa Microfinance, Douala",
  title: "Customer Service Officer",
  text: "Welcome clients, open accounts, explain products and resolve complaints. Requirements: HND/Licence in Banking, Accounting or Marketing; 6 months customer-facing experience; bilingual; Mobile Money; problem solving; Excel.",
  terms: ["customer service", "accounting", "bilingual", "mobile money", "problem solving", "Excel", "cash handling", "teamwork"],
};
const A_NGO: KeywordAdvert = {
  id: "ndolo-field",
  org: "Ndolo Youth Foundation, Bamenda",
  title: "Field Assistant (NGO)",
  text: "Support youth employment activities in Bamenda and Bafut: community mobilisation, household visits, surveys, training sessions for young people and weekly reports. Requirements: degree in social sciences; volunteering or community work; English and Pidgin; motorbike licence a plus.",
  terms: ["community", "youth", "field", "survey", "teaching", "report", "volunteer", "English"],
};
const A_BANK: KeywordAdvert = {
  id: "firstsavings-cs",
  org: "First Savings Bank, Douala",
  title: "Customer Service Officer (Bank)",
  text: "Serve bank clients at the counter and by phone: account opening, cash deposits, card requests and complaints. Requirements: HND/Licence in Banking or Accounting; excellent customer service; cash handling; bilingual English/French; Excel; accuracy and punctuality.",
  terms: ["customer service", "accounting", "cash handling", "bilingual", "Excel", "problem solving", "punctual"],
};
const A_HOSPITAL: KeywordAdvert = {
  id: "hope-hospital-admin",
  org: "Hope District Hospital, Kumba",
  title: "Hospital Administrative Assistant",
  text: "Register patients at reception, file medical records, type reports and manage appointments. Requirements: Secretarial or Office Administration diploma; Microsoft Office; good organisation; English and French; respect for confidentiality; health sector experience is an advantage.",
  terms: ["patient", "administrative", "filing", "report", "Microsoft Office", "organised", "health", "bilingual"],
};
const A_TELECOM: KeywordAdvert = {
  id: "mboa-sales",
  org: "Mboa Telecom Services, Yaoundé",
  title: "Field Sales Agent (Telecom)",
  text: "Sell SIM cards, data bundles and Mobile Money services in markets and neighbourhoods. Meet weekly sales targets and report daily. Requirements: sales experience; confident communication; Mobile Money; social media; French and English; motorbike licence a plus.",
  terms: ["sales", "mobile money", "communication", "social media", "report", "field", "French", "customer"],
};
const A_SCHOOL: KeywordAdvert = {
  id: "bethel-secretary",
  org: "Bethel Bilingual College, Limbe",
  title: "School Secretary",
  text: "Welcome parents and visitors, type letters and exam documents, keep student files and collect school fees. Requirements: Secretarial diploma; Microsoft Office; bilingual; organised; experience with children or schools is a plus.",
  terms: ["secretary", "Microsoft Office", "bilingual", "organised", "children", "filing", "cash handling", "reception"],
};
const A_LOGISTICS: KeywordAdvert = {
  id: "portline-logistics",
  org: "PortLine Logistics, Douala",
  title: "Logistics Clerk",
  text: "Record goods in and out of the warehouse, prepare delivery notes, count stock and update Excel reports. Requirements: HND in Logistics or Management; Excel; stock or inventory experience; attention to detail; teamwork; driving licence a plus.",
  terms: ["logistics", "delivery", "Excel", "report", "teamwork", "driving licence"],
};

const keyword = (adverts: KeywordAdvert[]): KeywordMatchTask => ({
  type: "keywordMatch",
  instruction: "Pick a job advert (or paste a real one). See how well your CV matches the words the employer uses.",
  adverts,
  allowPaste: true,
  success: "Use this before every application: match the employer's words, truthfully, near the top of your CV.",
});

const tailor = (a: KeywordAdvert, b: KeywordAdvert): TailorTask => ({
  type: "tailor",
  instruction: "Same CV, two very different jobs. For each one, move the right skills up and rewrite your profile. Both scores must go up.",
  adverts: [a, b],
  success: "You now have two tailored versions. Never send the same CV to every job.",
});

/* ---------- The course ---------- */

const MISSION_ADVERT = {
  org: "Ndolo Youth Foundation, Bamenda",
  title: "Programme Assistant",
  text:
    "Ndolo Youth Foundation is recruiting a Programme Assistant to support training and employment activities for young people.\n\nYou will: organise training sessions, keep participant records in Excel, write short activity reports and communicate with partners.\n\nRequirements: HND or Bachelor's degree; experience organising activities (school, church, volunteering or work); good computer skills; English and French.\n\nTo apply: email your CV (PDF, maximum 2 pages) with the subject “Application for Programme Assistant – Your Name”.",
};

const course: Course = {
  id: "cv",
  locale: "en",
  title: "A CV That Gets Interviews",
  promise: "Finish with your own professional CV as a PDF, tailored to the job, built step by step on your phone.",
  price: 1000,
  series: "Get the Job · 1 of 4",
  usesCv: true,
  freeSteps: 1,
  steps: [
    // Section A: Understand the job
    {
      title: "Why most CVs are rejected in seconds",
      illustration: "cv-01-recruiter-scan",
      body: [
        "A recruiter often receives 200 CVs for one job. The first look lasts about 7 seconds.",
        "In those seconds they look for your name, the job you want, your diploma and your experience. If they can't find them, they move on.",
        "Try it yourself: be the recruiter.",
      ],
      mistake: "Thinking a longer, more decorated CV looks more serious. Recruiters prefer short, clean and easy to scan.",
      task: scan1,
      variants: [scan2, scan3],
    },
    {
      title: "Read a job advert like a recruiter",
      illustration: "cv-02-job-advert",
      body: [
        "An advert tells you exactly what the employer wants. “Required” or “must” means must-have. “An advantage” or “a plus” means nice-to-have: apply even if you don't have it.",
        "Before you write anything, find the documents required, how to apply and the deadline.",
      ],
      mistake: "Not applying because you don't have every nice-to-have. If you have the must-haves, apply.",
      task: advert1,
      variants: [advert2, advert3],
    },
    {
      title: "Spot the fake job",
      illustration: "cv-03-fake-job",
      body: [
        "Fake recruiters target job seekers. Warning signs: you must pay a fee, the “recruiter” only talks on WhatsApp, the salary is too good, there is no interview, or they ask for your ID card or Mobile Money number.",
        "A real employer never asks you to pay to get a job.",
      ],
      mistake: "Paying a “small registration fee” to secure a place. That money is never returned, and there is no job.",
      task: fake1,
      variants: [fake2, fake3],
    },
    // Section B: Build your CV
    {
      title: "You have more experience than you think",
      illustration: "cv-04-experience",
      body: [
        "Experience is not only paid jobs. Leading a school club, serving at church, helping in the family shop, tutoring, volunteering: all of it counts.",
        "Answer a few quick questions. We will turn your answers into the first lines of your CV.",
      ],
      mistake: "Writing “No experience” on a CV. Almost everyone has done something they can show.",
      cvSection: "experience",
      task: {
        type: "experienceMiner",
        intro: "Hello! I'm going to ask about 7 parts of your life. Just answer simply; we'll make it professional later.",
        success: "Your experiences are saved in your CV. In step 8 you will turn them into strong lines.",
        questions: [
          {
            id: "school",
            ask: "At school or university, were you ever a prefect, class delegate, or member of a club?",
            examples: "(e.g. class prefect, debate club, health club, choir)",
            titleHint: "Club member",
            followUps: [
              { key: "what", ask: "What did you do there? One thing you did often or led.", placeholder: "e.g. Organised the weekly debate sessions" },
              { key: "where", ask: "Which school or club?", placeholder: "e.g. GBHS Limbe, Debate Club" },
              { key: "when", ask: "When? (years)", placeholder: "e.g. 2019–2021" },
              { key: "result", ask: "Any result or number? How many people, what changed?", placeholder: "e.g. 40 members; we won the regional contest" },
            ],
          },
          {
            id: "church",
            ask: "Do you serve in a church, a mosque or an association?",
            examples: "(e.g. youth leader, choir, treasurer, ushering, events)",
            titleHint: "Volunteer",
            followUps: [
              { key: "what", ask: "What do you do there?", placeholder: "e.g. Keep the youth group's accounts" },
              { key: "where", ask: "Which church or association?", placeholder: "e.g. Presbyterian Church Buea, Youth Fellowship" },
              { key: "when", ask: "Since when?", placeholder: "e.g. 2021–present" },
              { key: "result", ask: "Any result or number?", placeholder: "e.g. Raised 85,000 FCFA for the choir uniforms" },
            ],
          },
          {
            id: "family",
            ask: "Have you helped in a family business: a shop, farm, call box, restaurant or transport?",
            examples: "(Many people forget this one!)",
            titleHint: "Assistant, family business",
            followUps: [
              { key: "what", ask: "What did you do?", placeholder: "e.g. Sold goods, kept the stock book, handled Mobile Money" },
              { key: "where", ask: "What kind of business, and where?", placeholder: "e.g. Family provision store, Mutengene" },
              { key: "when", ask: "When?", placeholder: "e.g. Holidays 2018–2022" },
              { key: "result", ask: "Any number? Customers per day, money handled…", placeholder: "e.g. About 50 customers a day" },
            ],
          },
          {
            id: "volunteer",
            ask: "Have you volunteered: clean-up days, health campaigns, events, an NGO?",
            examples: "(e.g. vaccination campaign, Youth Day, a funeral or wedding committee)",
            titleHint: "Volunteer",
            followUps: [
              { key: "what", ask: "What did you do?", placeholder: "e.g. Registered people at a free health screening" },
              { key: "where", ask: "With which group?", placeholder: "e.g. Red Cross, Limbe branch" },
              { key: "when", ask: "When?", placeholder: "e.g. March 2023" },
              { key: "result", ask: "Any number or result?", placeholder: "e.g. Registered 300 people in 2 days" },
            ],
          },
          {
            id: "tutoring",
            ask: "Have you taught or tutored anyone: siblings, neighbours, holiday classes?",
            examples: "(Being a “répétiteur” counts.)",
            titleHint: "Private tutor",
            followUps: [
              { key: "what", ask: "What did you teach, and to whom?", placeholder: "e.g. Mathematics to Form 3 pupils" },
              { key: "where", ask: "Where?", placeholder: "e.g. Holiday classes, Bonaberi" },
              { key: "when", ask: "When?", placeholder: "e.g. 2020–2022" },
              { key: "result", ask: "Any result?", placeholder: "e.g. 5 of my 6 pupils passed the BEPC" },
            ],
          },
          {
            id: "sports",
            ask: "Do you play in a team, or have you organised sports or cultural events?",
            examples: "(e.g. football team captain, school festival, quarter tournament)",
            titleHint: "Team member / Organiser",
            followUps: [
              { key: "what", ask: "What was your role?", placeholder: "e.g. Captain; organised training twice a week" },
              { key: "where", ask: "Which team or event?", placeholder: "e.g. Quarter football tournament, Molyko" },
              { key: "when", ask: "When?", placeholder: "e.g. 2022" },
              { key: "result", ask: "Any result or number?", placeholder: "e.g. 8 teams, 300 spectators" },
            ],
          },
          {
            id: "work",
            ask: "Any paid work: a holiday job, internship, part-time job, or your own small business?",
            examples: "(Selling online counts too.)",
            titleHint: "Intern / Part-time worker",
            followUps: [
              { key: "what", ask: "What did you do?", placeholder: "e.g. Sold phone accessories on Facebook" },
              { key: "where", ask: "Where, or for whom?", placeholder: "e.g. My own business, Douala" },
              { key: "when", ask: "When?", placeholder: "e.g. 2023–present" },
              { key: "result", ask: "Any number or result?", placeholder: "e.g. 120 orders delivered" },
            ],
          },
        ],
      },
    },
    {
      title: "The right sections in the right order",
      illustration: "cv-05-sections",
      body: [
        "Every CV has the same building blocks: name and contact, profile, education, experience, skills, languages.",
        "The order depends on you. A fresher puts education first; someone with real work experience puts experience first.",
      ],
      mistake: "Starting with a long “Personal information” section. Put your contact details in one line under your name.",
      task: order1,
      variants: [order2, order3],
    },
    {
      title: "Your header: who you are and how to reach you",
      illustration: "cv-06-header",
      body: [
        "Your name goes at the top in big letters, not “Curriculum Vitae”. Under it, one line: professional email, phone with +237, city, and LinkedIn if you have a good profile.",
        "Photo, date of birth and marital status depend on the employer. Read the norms below and choose.",
      ],
      mistake: "Using a nickname email, or a phone number without +237.",
      cvSection: "header",
      task: {
        type: "cvHeader",
        instruction: "Fill in your header. It is saved in your CV straight away.",
        localNorm:
          "Many Cameroonian companies and public recruitments expect your date of birth, sometimes your marital status and a photo.",
        internationalNorm:
          "International organisations, NGOs and many private companies prefer no photo, no date of birth and no marital status, to avoid discrimination.",
        success: "Your header is ready. Recruiters can see who you are and reach you in one line.",
      },
    },
    {
      title: "Write your profile in 3 lines",
      illustration: "cv-07-profile",
      body: [
        "The profile is 3 lines under your name: who you are, your best proof, and the job you want.",
        "Skip clichés like “hardworking and God-fearing”. Everyone writes them. Give proof instead.",
      ],
      mistake: "Writing a long “career objective” about your own development. The employer wants to know what you bring to them.",
      cvSection: "profile",
      task: profile1,
      variants: [profile2, profile3],
    },
    {
      title: "From duties to achievements",
      illustration: "cv-08-achievements",
      body: [
        "A duty says what you were supposed to do. An achievement says what you did and what changed.",
        "The formula: action verb + what you did + result, with a number if you can.",
      ],
      mistake: "Starting every line with “Responsible for…”. It hides what you actually achieved.",
      cvSection: "bullets",
      task: {
        type: "bulletBuilder",
        instruction: "Build 3 strong lines from your own experiences.",
        verbs: ["Organised", "Sold", "Served", "Taught", "Tutored", "Managed", "Led", "Coordinated", "Trained", "Collected", "Prepared", "Recorded", "Handled", "Raised", "Increased", "Reduced", "Created", "Delivered", "Supervised", "Improved"],
        example: { verb: "Organised", task: "a fundraising day for 120 church members", result: "raising 85,000 FCFA for the youth choir", before: "Responsible for church events." },
        required: 3,
        success: "Three strong lines. These are what make a recruiter stop and read.",
      },
    },
    {
      title: "Education, skills and languages",
      illustration: "cv-09-education-skills",
      body: [
        "List your highest diplomas first: diploma, school, city, year. You do not need your CEP or FSLC.",
        "Give every skill an honest level. In Cameroon, your English and French levels matter a lot.",
      ],
      mistake: "Writing “Excellent in all computer tools”. If the interview includes an Excel test, it shows.",
      cvSection: "education",
      task: {
        type: "cvEducationSkills",
        instruction: "Add your education, at least 4 skills with honest levels, and your languages.",
        honesty: "Only list skills you can prove in an interview or a test. “Very good in Excel” means you can build a table with formulas in front of the recruiter.",
        minSkills: 4,
        success: "Your education, skills and languages are in your CV.",
      },
    },
    {
      title: "Red pen: fix this CV",
      illustration: "cv-10-red-pen",
      body: ["Recruiters notice mistakes immediately. Train your eye on someone else's CV first.", "Look at the email, the dates, the spelling, the length, and what each line says."],
      task: redPen1,
      variants: [redPen2, redPen3],
    },
    {
      title: "Your CV is ready: preview and download",
      illustration: "cv-11-cv-ready",
      body: [
        "Your CV uses a clean, single-column layout that both people and recruiting software (ATS) can read.",
        "It is saved as Firstname_Lastname_CV.pdf, maximum 2 pages. That is the file you will send.",
      ],
      mistake: "Sending a Word file or a photo of your CV. Always send a PDF with a clear name.",
      cvSection: "export",
      task: { type: "cvExport", instruction: "Check your CV, choose the layout, then download your PDF.", success: "Your CV is downloaded." },
    },
    // Section C: Tailor
    {
      title: "Match your CV to the job",
      illustration: "cv-12-keyword-match",
      body: [
        "Recruiters and ATS software look for the words in the advert. If the advert says “customer service” and your CV says “helping clients”, you may be missed.",
        "Use the employer's words, but only for things that are true.",
      ],
      mistake: "Copying the whole advert into your CV, or adding skills you don't have. Interviews find out.",
      task: keyword([A_SALES, A_DATA, A_ADMIN]),
      variants: [keyword([A_CS, A_NGO, A_ADMIN]), keyword([A_DATA, A_SALES, A_CS])],
    },
    {
      title: "One CV, two jobs",
      illustration: "cv-13-tailor",
      body: [
        "Different jobs need different versions of your CV. You don't rewrite everything: you change the profile and the order of your skills.",
        "Ten minutes of tailoring can double your chances.",
      ],
      task: tailor(A_NGO, A_BANK),
      variants: [tailor(A_HOSPITAL, A_TELECOM), tailor(A_SCHOOL, A_LOGISTICS)],
    },
    {
      title: "Final mission: send your real CV",
      illustration: "cv-18-mission",
      body: [
        "Your last task is real. Tailor your CV to the advert below, download it, and send it from your own Gmail.",
        "After this step, tap “Finish course”: you will find the mission address and your checklist there. We check the email and the PDF automatically.",
      ],
      task: {
        type: "missionBrief",
        advert: MISSION_ADVERT,
        points: [
          "Tailor your profile and skills to this advert (step 13 shows how).",
          "Download your CV again: Firstname_Lastname_CV.pdf, 2 pages maximum.",
          "Subject: “Application for Programme Assistant – Your Name”.",
          "A short polite message with a greeting, a closing, and your signature with your phone number.",
        ],
      },
    },
  ],
  assessment: {
    passMark: 7,
    warmup: [0, 2, 4, 6, 8],
    questions: [
      { step: 1, question: "About how long does a recruiter's first look at a CV last?", options: ["7 seconds", "2 minutes", "10 minutes", "They always read everything"], answer: 0 },
      { step: 2, question: "An advert says “Knowledge of Excel is an advantage”. What does that mean?", options: ["You must have it", "It is nice-to-have: apply even without it", "It is the deadline", "It is a document to send"], answer: 1 },
      { step: 3, question: "A “recruiter” asks for 15,000 FCFA to confirm your place. What is it?", options: ["Normal practice", "A scam", "A sign of a good company", "A government rule"], answer: 1 },
      { step: 4, question: "You led your church youth group for 2 years. Can it go on your CV?", options: ["No, only paid jobs count", "Yes, it is real experience", "Only if you were paid", "Only under Hobbies"], answer: 1 },
      { step: 5, question: "For a fresh graduate, what usually comes right after the profile?", options: ["Interests", "Education", "References", "Languages"], answer: 1 },
      { step: 6, question: "What should be the title at the top of your CV?", options: ["CURRICULUM VITAE", "Your full name", "“My CV”", "The job title only"], answer: 1 },
      { step: 7, question: "Which profile is best?", options: ["Hardworking, honest and God-fearing young man ready for any job.", "Marketing graduate with 2 years of phone sales; looking for a sales role.", "I want to develop myself in a reputable company.", "No profile is needed."], answer: 1 },
      { step: 8, question: "Which line is an achievement?", options: ["Responsible for the cash box", "In charge of customers", "Handled 300,000 FCFA a day with no shortages", "Duties included cleaning"], answer: 2 },
      { step: 11, question: "Which file should you send?", options: ["CV.docx", "Photo of my CV.jpg", "Tabi_Ndip_CV.pdf", "scan0001.pdf"], answer: 2 },
      { step: 12, question: "The advert asks for “customer service”. You did serve customers. What do you do?", options: ["Nothing, they will understand", "Use the words “customer service” on your CV", "Copy the whole advert into your CV", "Add skills you don't have"], answer: 1 },
    ],
  },
  mission: {
    kind: "cv",
    intro: "Prove it for real: send your tailored CV, as a PDF, from your own Gmail to our test recruiter.",
    steps: [
      "Write the Gmail address you will send from.",
      "Download your CV again after tailoring it to the Programme Assistant advert.",
      "In Gmail, write to the address below with the subject “Application for Programme Assistant – Your Name”.",
      "Write a greeting, 2–3 polite sentences, a closing and your signature with your phone number.",
      "Attach your PDF (Firstname_Lastname_CV.pdf) from Downloads, then press Send. We check it automatically.",
    ],
    subjectWords: ["programme assistant", "program assistant"],
    advert: MISSION_ADVERT,
    subjectExample: "Application for Programme Assistant – {name}",
    messages: {
      gmail: "Send from the Gmail address you entered here.",
      subject: "Your subject must name the role: “Application for Programme Assistant – Your Name”.",
      pdf: "Attach your CV as a PDF file.",
      fileName: "Name your file Firstname_Lastname_CV.pdf, like the one you downloaded in step 11.",
      unreadable: "We could not open your PDF. Download it again from “My CV” and attach that file (not a photo or a scan).",
      pages: "Your CV is longer than 2 pages. Shorten it and send it again.",
      cvEmail: "We could not find your email address in the CV. Add it to your header.",
      cvPhone: "We could not find your phone number in the CV. Add it with +237 to your header.",
      cvSections: "Your CV must include Education, Experience and Skills sections.",
      greeting: "Start your message with a greeting, e.g. “Dear Sir or Madam,”.",
      closing: "End your message with a closing such as “Kind regards,”.",
      signature: "Sign with your name and phone number at the end of the message.",
    },
  },
};

export default course;
