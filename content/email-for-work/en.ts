import type { Course } from "../types";

const course: Course = {
  id: "email-for-work",
  locale: "en",
  title: "Email for Work",
  promise: "Write and send professional emails with confidence, right from your phone.",
  price: 850,
  freeSteps: 1,
  steps: [
    // 1
    {
      title: "Why email still matters",
      illustration: "email-01-why",
      body: [
        "Employers, schools and banks still use email for important things: job offers, contracts and official letters.",
        "WhatsApp is for quick chats. Email is your professional voice, and it keeps a written record.",
        "In this course you will practise every step on screens that look like the real thing.",
      ],
    },
    // 2
    {
      title: "Choosing a professional address",
      illustration: "email-02-address",
      body: [
        "Your email address is the first thing a recruiter sees. Use your real name, for example firstname.lastname@gmail.com.",
        "If your name is taken, add your initial or a short number, not a nickname.",
      ],
      mistake: "Using a fun address like sexy.princess237@… or bigboss2000@… for job applications. Keep fun addresses for friends.",
      task: {
        type: "multipleChoice",
        question: "Nkeng Ateh is applying for jobs. Which address should she use?",
        options: ["sweetnkeng237@gmail.com", "nkeng.ateh@gmail.com", "queen_of_douala@gmail.com", "nkeng2000xx@gmail.com"],
        answer: 1,
        explanation: "nkeng.ateh@gmail.com uses her real name only. It looks serious and is easy to remember.",
        hints: ["“sweet” sounds personal, not professional.", null, "A nickname does not tell the recruiter who she is.", "Random numbers and letters look careless."],
      },
    },
    // 3
    {
      title: "Creating a Gmail account",
      illustration: "email-03-account",
      body: [
        "On your phone, open gmail.com or the Gmail app and tap “Create account”.",
        "Google asks for your name, birthday, the address you want, a password and a phone number. Let us practise on a safe copy of those screens.",
      ],
      mistake: "Writing the password on a paper that others can see, or using your birthday as the password.",
      task: {
        type: "signup",
        instruction: "Fill in each screen as if you were creating your real account.",
        success: "Your practice account is ready. On the real Gmail, the screens are almost the same.",
      },
    },
    // 4
    {
      title: "Securing it: recovery phone and 2-step verification",
      illustration: "email-04-security",
      body: [
        "Add your phone number as a recovery phone, so you can get back in if you forget your password.",
        "Turn on 2-Step Verification in your Google Account settings. When you sign in on a new phone, Google sends you a code.",
        "That code is only for you. Nobody from Google will ever ask you for it.",
      ],
      mistake: "Sending your verification code to someone on WhatsApp who says they are “from Google” or “helping you”.",
      task: {
        type: "multipleChoice",
        question: "You receive a 6-digit Google code by SMS. A minute later, someone on WhatsApp asks you to send it to them. What do you do?",
        options: [
          "Send it, they said it is urgent",
          "Send only the first 3 digits",
          "Do not send it, and change your password",
          "Ask them to call you first, then send it",
        ],
        answer: 2,
        explanation: "The code is the key to your account. Anyone who asks for it is trying to steal it. Never share it, and change your password to be safe.",
      },
    },
    // 5
    {
      title: "Inbox tour: read, archive, spam, search",
      illustration: "email-05-inbox",
      body: [
        "Tap an email to read it. Archive removes it from the inbox but keeps it safe. Spam is for junk and dangerous emails.",
        "Use the search box at the top to find any email in seconds.",
      ],
      mistake: "Deleting important emails to “clean up”. Archive them instead, so you can find them later.",
      task: {
        type: "inbox",
        emails: [
          { id: "promo", from: "Weekly Phone Deals", fromEmail: "news@phonedeals.cm", subject: "50% off phones this weekend", preview: "Our biggest sale of the year starts now…", body: "Our biggest sale of the year starts now. Visit our shop in Bonamoussadi.", time: "09:12" },
          { id: "family", from: "Aunty Grace", fromEmail: "grace.fon@gmail.com", subject: "Sunday lunch", preview: "Don't forget to bring the plantains…", body: "Don't forget to bring the plantains on Sunday. See you!", time: "08:40" },
          { id: "prize", from: "Prize Department", fromEmail: "claims@winner-prize.xyz", subject: "YOU HAVE WON 5,000,000 FCFA!!!", preview: "Send your ID and a small fee to claim…", body: "Congratulations!!! You have won 5,000,000 FCFA. Send a copy of your ID card and 10,000 FCFA processing fee to claim your prize today.", time: "Yesterday" },
          { id: "course", from: "Sawa Training Centre", fromEmail: "info@sawatraining.cm", subject: "Your course timetable", preview: "Classes start on Monday at 8am…", body: "Dear student, classes start on Monday at 8am in room 3.", time: "Yesterday" },
          { id: "interview", from: "Ndi Recruitment", fromEmail: "hr@ndirecruitment.cm", subject: "Interview invitation – Thursday 10am", preview: "We are pleased to invite you to an interview…", body: "Dear candidate,\n\nWe are pleased to invite you to an interview on Thursday at 10am at our office in Akwa, Douala. Please reply to confirm.\n\nBest regards,\nNdi Recruitment", time: "Mon" },
        ],
        goals: [
          { action: "open", target: "interview", instruction: "Type “interview” in the search box, then open the interview email.", wrong: "That is not the interview email. Try searching for “interview”.", done: "Found it. Search saves a lot of scrolling." },
          { action: "archive", target: "promo", instruction: "Now open the phone deals newsletter and archive it.", wrong: "Archive the newsletter about phone deals, not this one.", done: "Archived. It left the inbox but it is not deleted." },
          { action: "spam", target: "prize", instruction: "Last one: open the prize email and report it as spam.", wrong: "This email looks normal. Find the one promising money.", done: "Reported. Gmail will move emails like this to Spam." },
        ],
        success: "You can now search, read, archive and report spam.",
      },
    },
    // 6
    {
      title: "Parts of an email: To, Cc, Bcc, Subject",
      illustration: "email-06-parts",
      body: [
        "To: the main person you are writing to. Cc: people who should see the email, for information.",
        "Bcc: hidden copy; others cannot see these addresses. Subject: a short title that says what the email is about.",
      ],
      mistake: "Putting 30 addresses in To or Cc for a group message. Everyone sees everyone's address. Use Bcc instead.",
      task: {
        type: "multipleChoice",
        question: "You send a report to your manager and want your colleague Paul to see it too, for information. Where do you put Paul's address?",
        options: ["To", "Cc", "Bcc", "Subject"],
        answer: 1,
        explanation: "Cc means “for your information”. Your manager is the main reader (To), and Paul is copied (Cc).",
        hints: ["To is for the main person, your manager.", null, "With Bcc, your manager would not know Paul received it.", "The Subject is the title, not an address."],
      },
    },
    // 7
    {
      title: "Writing a clear subject line",
      illustration: "email-07-subject",
      body: [
        "A good subject tells the reader what the email is about before they open it.",
        "Keep it short and specific, for example: “Application for Sales Assistant – Nkeng Ateh”.",
      ],
      mistake: "Leaving the subject empty or writing “Hello”, “Urgent” or “Pls read”. Recruiters skip these.",
      task: {
        type: "fixText",
        instruction: "Nkeng is applying for the Sales Assistant job. Rewrite her subject line.",
        initial: "hello",
        rules: [
          { kind: "changed", message: "Change the subject. “hello” does not say anything." },
          { kind: "excludesAll", words: ["hello", "hi", "urgent", "pls", "please read"], message: "Remove greetings and words like “urgent”. The subject is a title, not a greeting." },
          { kind: "includesAny", words: ["application", "applying", "apply", "candidature"], message: "Say that this is a job application, e.g. “Application for…”." },
          { kind: "includesAny", words: ["sales assistant"], message: "Name the job: Sales Assistant." },
          { kind: "maxWords", n: 12, message: "Keep it short: 12 words or fewer." },
        ],
        success: "Clear and specific. The recruiter knows what this is before opening it.",
      },
    },
    // 8
    {
      title: "Greetings and closings in English and French",
      illustration: "email-08-greetings",
      body: [
        "English: start with “Dear Mr Tabi,” or “Dear Sir or Madam,” and end with “Kind regards,” then your name.",
        "French: start with “Monsieur,” / “Madame,” or “Madame, Monsieur,” and end with “Cordialement,” then your name.",
        "Use “Hi” or “Salut” only with people you know well.",
      ],
      mistake: "Starting with “Hey”, “Yo” or “Cc” (as in “coucou”) when writing to an employer.",
      task: {
        type: "multipleChoice",
        question: "You are writing in French to a company. You don't know who will read it. Which greeting is best?",
        options: ["Salut !", "Madame, Monsieur,", "Coucou,", "Bonjour mon frère,"],
        answer: 1,
        explanation: "“Madame, Monsieur,” is the polite, standard greeting when you don't know the reader's name.",
      },
    },
    // 9
    {
      title: "Writing the body: short, polite, clear",
      illustration: "email-09-body",
      body: [
        "Say who you are, what you want, and what happens next. Three short paragraphs are enough.",
        "Write full words, not SMS language, and say please and thank you.",
      ],
      mistake: "Writing in SMS style (“pls”, “u”, “tnx”) or in ALL CAPITAL LETTERS, which reads like shouting.",
      task: {
        type: "fixText",
        instruction: "Rewrite this message so it is polite and clear. Ask for information about the job.",
        initial: "pls i need the job send me info quick",
        multiline: true,
        rules: [
          { kind: "changed", message: "Rewrite the message in your own words." },
          { kind: "excludesAll", words: ["pls", "plz", "u", "quick", "tnx", "thx"], message: "Replace SMS words (pls, u, thx) and “quick” with full, polite words." },
          { kind: "includesAny", words: ["please", "could you", "would you", "kindly"], message: "Ask politely, for example “Could you please send me…”." },
          { kind: "includesAny", words: ["thank"], message: "Thank the reader at the end." },
          { kind: "minWords", n: 12, message: "Add a little more: say what you want and why (at least 12 words)." },
          { kind: "maxWords", n: 90, message: "Keep it short: under 90 words." },
          { kind: "regex", pattern: "^(?![^a-z]*$)", message: "Do not write in all capital letters." },
        ],
        success: "Polite and clear. This is how professionals write.",
      },
    },
    // 10
    {
      title: "Naming and attaching a file",
      illustration: "email-10-attach",
      body: [
        "Before you attach a file, give it a clear name, for example Nkeng_Ateh_CV.pdf, not scan0012.pdf.",
        "Send documents as PDF. Tap the paperclip to attach, and check the file appears before you send.",
      ],
      mistake: "Writing “please find my CV attached” and forgetting to attach it. Always check before you press Send.",
      task: {
        type: "compose",
        instruction: "Help Nkeng send her CV to hr@sawalogistics.cm. Attach the correctly named file and write a short subject.",
        files: ["scan0012.pdf", "Nkeng_Ateh_CV.pdf", "photo.jpg"],
        rules: [
          { kind: "validEmail", field: "to", message: "The “To” address is not a valid email. It should look like name@company.cm." },
          { kind: "equals", field: "to", value: "hr@sawalogistics.cm", message: "Send it to hr@sawalogistics.cm." },
          { kind: "notEmpty", field: "subject", message: "Add a subject, for example “CV – Nkeng Ateh”." },
          { kind: "attachment", file: "Nkeng_Ateh_CV.pdf", message: "Attach the clearly named file: Nkeng_Ateh_CV.pdf." },
          { kind: "noAttachment", file: "scan0012.pdf", message: "Remove scan0012.pdf. The name does not tell the reader what it is." },
          { kind: "greeting", message: "Start the body with a greeting, for example “Dear Sir or Madam,”." },
        ],
        success: "Sent! The right file, a clear name, and a subject.",
      },
      variants: [
        {
          type: "compose",
          instruction: "Help Nkeng send her CV to recrutement@mbokoconsulting.cm. Attach the correctly named file and write a short subject.",
          files: ["Document1.pdf", "IMG_4471.jpg", "Nkeng_Ateh_CV.pdf"],
          rules: [
            { kind: "validEmail", field: "to", message: "The “To” address is not a valid email. It should look like name@company.cm." },
            { kind: "equals", field: "to", value: "recrutement@mbokoconsulting.cm", message: "Send it to recrutement@mbokoconsulting.cm." },
            { kind: "notEmpty", field: "subject", message: "Add a subject, for example “CV – Nkeng Ateh”." },
            { kind: "attachment", file: "Nkeng_Ateh_CV.pdf", message: "Attach the clearly named file: Nkeng_Ateh_CV.pdf." },
            { kind: "noAttachment", file: "Document1.pdf", message: "Remove Document1.pdf. The name does not tell the reader what it is." },
            { kind: "noAttachment", file: "IMG_4471.jpg", message: "Remove the photo. Only the CV was asked for." },
            { kind: "greeting", message: "Start the body with a greeting, for example “Dear Sir or Madam,”." },
          ],
          success: "Sent! The right file, a clear name, and a subject.",
        },
      ],
    },
    // 11
    {
      title: "Sharing big files with a Drive link",
      illustration: "email-11-drive",
      body: [
        "Gmail attachments are limited to 25 MB. For bigger files, upload them to Google Drive and share a link.",
        "In Drive, tap Share, choose “Anyone with the link” and set it to Viewer, then paste the link in your email.",
      ],
      mistake: "Sharing with “Editor” access. Anyone with the link could change or delete your file.",
      task: {
        type: "multipleChoice",
        question: "Your portfolio is 60 MB. How do you send it to a recruiter?",
        options: [
          "Attach it anyway and hope it works",
          "Upload it to Drive and share a Viewer link in the email",
          "Send it on WhatsApp to the company's general number",
          "Share it with Editor access so they can open it",
        ],
        answer: 1,
        explanation: "A Drive link with Viewer access works for any size and keeps your file safe from changes.",
      },
    },
    // 12
    {
      title: "Reply, Reply All, Forward",
      illustration: "email-12-reply",
      body: [
        "Reply answers only the sender. Reply All answers the sender and everyone in To and Cc.",
        "Forward sends the email to someone new, with any attachments.",
      ],
      mistake: "Using Reply All to say “Thank you” or “OK”. Everyone receives your message for nothing.",
      task: {
        type: "multipleChoice",
        question: "Your manager emailed 20 colleagues about tomorrow's meeting. You want to tell only your manager that you will be 10 minutes late. Which do you use?",
        options: ["Reply", "Reply All", "Forward", "Compose a new email to all 20 people"],
        answer: 0,
        explanation: "Reply sends your answer only to your manager. The other 19 people don't need it.",
      },
    },
    // 13
    {
      title: "Creating a signature",
      illustration: "email-13-signature",
      body: [
        "A signature is added at the end of every email. Gmail app: Settings › your account › Mobile signature.",
        "Keep it simple: your full name, what you do or want to do, and your phone number.",
      ],
      mistake: "Leaving “Sent from my phone” as your only signature, or adding long quotes and big images.",
      task: {
        type: "fixText",
        instruction: "Replace “Sent from my phone” with a simple signature: your name on one line, then your role or goal, then your phone number (e.g. +237 6XX XX XX XX).",
        initial: "Sent from my phone",
        multiline: true,
        rules: [
          { kind: "excludesAll", words: ["sent from my"], message: "Remove “Sent from my phone”." },
          { kind: "minWords", n: 3, message: "Write your full name and your role or goal." },
          { kind: "regex", pattern: "\\n\\s*\\S", message: "Put each part on its own line." },
          { kind: "regex", pattern: "(\\+?237[\\s.-]?)?6([\\s.-]?\\d){8}", message: "Add your phone number, for example +237 6XX XX XX XX." },
        ],
        success: "Your signature looks professional. Add it in your Gmail settings today.",
      },
    },
    // 14
    {
      title: "Spotting scam and fake job emails",
      illustration: "email-14-scam",
      body: [
        "Warning signs: you must pay a fee for a job, the sender uses a free or strange address, there is pressure to act fast, or they ask for your password or code.",
        "Real employers never ask you to pay to get a job.",
      ],
      mistake: "Clicking links in an email that says your account “will be closed”. Open Gmail yourself instead.",
      task: {
        type: "inbox",
        emails: [
          { id: "realhr", from: "Sawa Logistics HR", fromEmail: "hr@sawalogistics.cm", subject: "We received your application", preview: "Thank you for applying for the Office Assistant…", body: "Dear Nkeng,\n\nThank you for applying for the Office Assistant position. We will contact shortlisted candidates within two weeks.\n\nKind regards,\nHR Team", time: "10:05" },
          { id: "fakejob", from: "Global Oil Recruitment", fromEmail: "globaloil.jobs2024@gmail.com", subject: "Congratulations, you are HIRED!", preview: "Pay 25,000 FCFA registration fee to start…", body: "Congratulations! You have been selected for a job with salary 850,000 FCFA. To confirm, pay 25,000 FCFA registration fee by mobile money within 24 hours.", time: "09:30" },
          { id: "school", from: "Sawa Training Centre", fromEmail: "info@sawatraining.cm", subject: "Certificate ready for collection", preview: "Your certificate is ready at the front desk…", body: "Dear student, your certificate is ready. You can collect it at the front desk from Monday.", time: "Yesterday" },
          { id: "phish", from: "Account Security Team", fromEmail: "security@gmai1-support.com", subject: "Your account will be closed in 24 hours", preview: "Click here and enter your password to verify…", body: "We detected a problem. Your account will be CLOSED in 24 hours. Click here and enter your email password to verify your identity.", time: "Yesterday" },
        ],
        goals: [
          { action: "spam", target: "fakejob", instruction: "One email is a fake job offer. Open it and report it as spam.", wrong: "This email is real: it comes from a company address and asks for nothing unusual.", done: "Correct. Asking for a fee and using a free Gmail address are big warning signs." },
          { action: "spam", target: "phish", instruction: "Another email is trying to steal your password. Find it and report it as spam.", wrong: "This email is real: it comes from a company address and asks for nothing unusual.", done: "Correct. Look at the address: “gmai1” with the number 1, not Gmail." },
        ],
        success: "You spotted both scams. Always check the sender and never pay to get a job.",
      },
      variants: [
        {
          type: "inbox",
          emails: [
            { id: "bank", from: "Customer Service", fromEmail: "alert@secure-bank-cm.info", subject: "URGENT: your account is blocked", preview: "Send your PIN and card number to unblock…", body: "Dear customer, your bank account is BLOCKED. Reply with your PIN and card number within 2 hours to unblock it.", time: "11:20" },
            { id: "interview", from: "Mboko Consulting", fromEmail: "recrutement@mbokoconsulting.cm", subject: "Interview on Tuesday", preview: "We would like to meet you on Tuesday at 9am…", body: "Dear Nkeng,\n\nWe would like to meet you on Tuesday at 9am at our office in Bastos, Yaoundé. Please confirm by replying to this email.\n\nRegards,\nHR", time: "10:02" },
            { id: "visa", from: "Canada Jobs Program", fromEmail: "canadajobs.program@yahoo.com", subject: "You are selected to work in Canada!", preview: "Send 150,000 FCFA for your visa and ticket…", body: "Congratulations! You have been selected for a job in Canada with free visa. Send 150,000 FCFA for processing to the number below today.", time: "Yesterday" },
            { id: "friend", from: "Brenda Tanyi", fromEmail: "brenda.tanyi@gmail.com", subject: "Notes from class", preview: "Here are the notes you asked for…", body: "Hi Nkeng, here are the notes you asked for. See you tomorrow!", time: "Mon" },
          ],
          goals: [
            { action: "spam", target: "visa", instruction: "One email is a fake job abroad. Open it and report it as spam.", wrong: "This email is real: the sender is known and asks for nothing unusual.", done: "Correct. Real employers never ask you to pay for a job or a visa." },
            { action: "spam", target: "bank", instruction: "Another email is trying to steal your bank details. Find it and report it as spam.", wrong: "This email is real: the sender is known and asks for nothing unusual.", done: "Correct. A bank will never ask for your PIN by email." },
          ],
          success: "You spotted both scams. Always check the sender and never pay to get a job.",
        },
      ],
    },
    // 15
    {
      title: "Final task: send a full job application",
      illustration: "email-15-success",
      body: [
        "Use everything you learned: correct address, clear subject, greeting, short polite body, closing, and your CV attached.",
      ],
      task: {
        type: "compose",
        instruction: "Apply for this job in your own name.",
        context: "JOB: Office Assistant at Sawa Logistics, Douala.\nSend your application with your CV to jobs@sawalogistics.cm.\nCopy (Cc) the manager: m.ebai@sawalogistics.cm.",
        files: ["CV.pdf", "photo.jpg"],
        rules: [
          { kind: "validEmail", field: "to", message: "The “To” address is not a valid email." },
          { kind: "equals", field: "to", value: "jobs@sawalogistics.cm", message: "Send it to the address in the advert: jobs@sawalogistics.cm." },
          { kind: "validEmail", field: "cc", message: "The “Cc” address is not a valid email." },
          { kind: "equals", field: "cc", value: "m.ebai@sawalogistics.cm", message: "Copy the manager in Cc: m.ebai@sawalogistics.cm." },
          { kind: "notEmpty", field: "subject", message: "Add a subject line." },
          { kind: "includesAny", field: "subject", words: ["application", "applying", "candidature"], message: "Say in the subject that this is an application." },
          { kind: "includesAny", field: "subject", words: ["office assistant"], message: "Name the job in the subject: Office Assistant." },
          { kind: "excludesAll", field: "subject", words: ["urgent", "hello", "pls"], message: "Remove “urgent”, “hello” or “pls” from the subject." },
          { kind: "greeting", message: "Start with a greeting, for example “Dear Sir or Madam,”." },
          { kind: "includesAny", field: "body", words: ["attached", "attachment", "find my cv", "ci-joint"], message: "Mention that your CV is attached." },
          { kind: "minWords", field: "body", n: 30, message: "Your message is too short. Say who you are and why you want the job (at least 30 words)." },
          { kind: "maxWords", field: "body", n: 200, message: "Your message is too long. Keep it under 200 words." },
          { kind: "excludesAll", field: "body", words: ["pls", "plz", "u", "thx", "tnx"], message: "Replace SMS words (pls, u, thx) with full words." },
          { kind: "closing", message: "End with a closing such as “Kind regards,” followed by your name." },
          { kind: "attachment", file: "CV.pdf", message: "Attach your CV.pdf." },
          { kind: "noAttachment", file: "photo.jpg", message: "Remove photo.jpg. The advert asks only for your CV." },
        ],
        success: "Excellent! That is a complete, professional job application.",
      },
      variants: [
        {
          type: "compose",
          instruction: "Apply for this job in your own name.",
          context: "JOB: Customer Service Agent at Mboa Services, Yaoundé.\nSend your application with your CV to careers@mboaservices.cm.\nCopy (Cc) the HR manager: hr.manager@mboaservices.cm.",
          files: ["CV.pdf", "photo.jpg"],
          rules: [
            { kind: "validEmail", field: "to", message: "The “To” address is not a valid email." },
            { kind: "equals", field: "to", value: "careers@mboaservices.cm", message: "Send it to the address in the advert: careers@mboaservices.cm." },
            { kind: "validEmail", field: "cc", message: "The “Cc” address is not a valid email." },
            { kind: "equals", field: "cc", value: "hr.manager@mboaservices.cm", message: "Copy the HR manager in Cc: hr.manager@mboaservices.cm." },
            { kind: "notEmpty", field: "subject", message: "Add a subject line." },
            { kind: "includesAny", field: "subject", words: ["application", "applying", "candidature"], message: "Say in the subject that this is an application." },
            { kind: "includesAny", field: "subject", words: ["customer service"], message: "Name the job in the subject: Customer Service Agent." },
            { kind: "excludesAll", field: "subject", words: ["urgent", "hello", "pls"], message: "Remove “urgent”, “hello” or “pls” from the subject." },
            { kind: "greeting", message: "Start with a greeting, for example “Dear Sir or Madam,”." },
            { kind: "includesAny", field: "body", words: ["attached", "attachment", "find my cv", "ci-joint"], message: "Mention that your CV is attached." },
            { kind: "minWords", field: "body", n: 30, message: "Your message is too short. Say who you are and why you want the job (at least 30 words)." },
            { kind: "maxWords", field: "body", n: 200, message: "Your message is too long. Keep it under 200 words." },
            { kind: "excludesAll", field: "body", words: ["pls", "plz", "u", "thx", "tnx"], message: "Replace SMS words (pls, u, thx) with full words." },
            { kind: "closing", message: "End with a closing such as “Kind regards,” followed by your name." },
            { kind: "attachment", file: "CV.pdf", message: "Attach your CV.pdf." },
            { kind: "noAttachment", file: "photo.jpg", message: "Remove photo.jpg. The advert asks only for your CV." },
          ],
          success: "Excellent! That is a complete, professional job application.",
        },
      ],
    },
  ],
  assessment: {
    passMark: 7,
    warmup: [0, 3, 4, 6, 9],
    questions: [
      { step: 2, question: "Which address is best for a job application?", options: ["bigboss237@gmail.com", "paul.nji@gmail.com", "sweetpaul@gmail.com", "pn2000xx@gmail.com"], answer: 1 },
      { step: 4, question: "Someone on WhatsApp asks for the code Google just sent you by SMS. What do you do?", options: ["Send it quickly", "Send half of it", "Never send it and change your password", "Send it if they say they work for Google"], answer: 2 },
      { step: 5, question: "What does “Archive” do to an email?", options: ["Deletes it forever", "Removes it from the inbox but keeps it", "Sends it to spam", "Forwards it to your boss"], answer: 1 },
      { step: 6, question: "You email 40 parents and don't want them to see each other's addresses. Where do you put their addresses?", options: ["To", "Cc", "Bcc", "Subject"], answer: 2 },
      { step: 7, question: "Which subject line is best?", options: ["Hello", "URGENT pls read", "Application for Accountant – Paul Nji", "(no subject)"], answer: 2 },
      { step: 8, question: "You are writing in English to a recruiter you don't know. Which greeting is best?", options: ["Hey!", "Dear Sir or Madam,", "Yo boss,", "Hi dear,"], answer: 1 },
      { step: 10, question: "Which file name is best for your CV?", options: ["scan0012.pdf", "CV_final_final2.pdf", "Paul_Nji_CV.pdf", "document.pdf"], answer: 2 },
      { step: 11, question: "Your file is 60 MB. How do you send it?", options: ["Attach it anyway", "Upload to Drive and share a Viewer link", "Share it with Editor access", "Split it into 10 emails"], answer: 1 },
      { step: 12, question: "Your manager emailed the whole team. You want to answer only your manager. Which do you use?", options: ["Reply", "Reply All", "Forward", "New email to everyone"], answer: 0 },
      { step: 14, question: "A “job offer” email asks you to pay 20,000 FCFA to register. What is it?", options: ["A normal step for jobs", "A scam: report it as spam", "A good deal", "A message from the government"], answer: 1 },
    ],
  },
  mission: {
    kind: "email",
    intro: "Last step: prove you can do it for real. Send a job application from your own Gmail to our test recruiter.",
    steps: [
      "Write the Gmail address you will send from.",
      "Open Gmail on your phone and write a new email to the address below.",
      "Write a clear subject, for example “Application for Office Assistant – your name”.",
      "Write a greeting, a short polite message, a closing and your signature with your phone number.",
      "Attach your CV as a PDF with a clear name, for example Firstname_Lastname_CV.pdf. If you don't have a CV yet, attach any PDF named that way.",
      "Press Send, then come back here. We check it automatically.",
    ],
    subjectWords: ["application", "applying", "candidature"],
    messages: {
      gmail: "Send from the Gmail address you entered here.",
      nickname: "Your address looks like a nickname. For work, use an address with your real name.",
      subject: "Your subject should say it is an application, e.g. “Application for Office Assistant – your name”.",
      pdf: "Attach your CV as a PDF file.",
      fileName: "Give your PDF a clear name, e.g. Firstname_Lastname_CV.pdf, not scan or document.",
      greeting: "Start your message with a greeting, e.g. “Dear Sir or Madam,”.",
      closing: "End with a closing such as “Kind regards,”.",
      signature: "Add a signature with your name and phone number at the end.",
      length: "Your message is too short. Say who you are and why you want the job (at least 30 words).",
    },
  },
};

export default course;
