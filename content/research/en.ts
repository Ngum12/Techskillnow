import type { Course } from "../types";

/*
 * Your Final Year Project: From Topic to Defence (university and HND students).
 * Very practical: learners search in a practice Google and Google Scholar, build their own topic step by step,
 * and leave with a topic card ready for their supervisor. Practice sources: ./sources.json (all invented for
 * the course, so no real author or institution is misquoted). Search logic: /lib/research.
 */

const course: Course = {
  id: "research-project",
  locale: "en",
  title: "Your Final Year Project: From Topic to Defence",
  promise: "Find an original topic, search Google and Google Scholar like a researcher, read papers in minutes, use AI honestly, reference in APA and prepare your defence.",
  price: 1000,
  track: "university",
  audience: "For final year Bachelor's and HND students",
  outcomes: ["An original topic, narrowed and checked", "Searches that find real theses and articles", "A topic card ready for your supervisor"],
  series: "University · Final Year Project",
  freeSteps: 3,
  steps: [
    {
      title: "What a final year project really is",
      body: [
        "At the end of your programme you write a final year project (also called a dissertation, research project or long essay; in French, a mémoire). Then you present it to a jury: the defence.",
        "Every project has the same parts in the same order. Once you know them, the whole thing stops being scary.",
        "Leaf through a complete project, page by page. Read the note under each page.",
      ],
      mistake: "Starting to write chapter one before you know what the whole project looks like.",
      task: {
        type: "projectAnatomy",
        instruction: "Go through this bound project from the cover to the appendices.",
        project: {
          title: "Effect of mobile money charges on the savings of market traders in Buea (2020–2024)",
          student: "NKENG ATEH CLARISSE",
          matricule: "SU20A0417",
          degree: "Bachelor of Science (BSc) in Banking and Finance",
          department: "Department of Banking and Finance, Faculty of Economics and Management",
          university: "Sawa University",
          supervisor: "Dr. Ngwa Peter Tanyi",
          date: "June 2024",
        },
        pages: [
          { id: "cover", label: "Cover", note: "The cover page: university, department, title, your name and matricule, the degree, your supervisor and the date. Your department gives the exact layout.", body: ["A project submitted in partial fulfilment of the requirements for the award of a {degree}", "By", "Supervisor"] },
          { id: "declaration", label: "Declaration", note: "You declare that the work is your own, and sign. Submitting copied work after signing this is serious misconduct.", body: ["I, Nkeng Ateh Clarisse, hereby declare that this project is my original work and that it has not been submitted for any other degree in this or any other university.", "~", "Signature: ……………     Date: ……………"] },
          { id: "certification", label: "Certification", note: "Your supervisor and head of department certify that you did the work under their supervision. Some departments put this page before the declaration.", body: ["This is to certify that this project by Nkeng Ateh Clarisse was carried out under my supervision and is ready for examination.", "Supervisor: Dr. Ngwa Peter Tanyi ……………", "Head of Department: ……………"] },
          { id: "dedication", label: "Dedication", note: "Short and personal: one or two lines to someone who matters to you.", body: ["To my mother, Mrs. Ateh Grace, for every sacrifice."] },
          { id: "acknowledgements", label: "Acknowledgements", note: "Thank the people who helped: your supervisor, lecturers, the people who answered your questionnaire, family. Half a page is enough.", body: ["I thank my supervisor, Dr. Ngwa Peter Tanyi, for his patient guidance.", "~", "I also thank the market traders of Buea who answered my questionnaire."] },
          { id: "abstract", label: "Abstract", note: "The whole project in 150–300 words: aim, method, main findings, main recommendation. You write it last, but it sits at the front.", body: ["This study examined the effect of mobile money charges on the savings of market traders in Buea. A questionnaire was administered to 120 traders…", "~", "Keywords: mobile money, transaction charges, savings, market traders"] },
          { id: "toc", label: "Table of contents", note: "Every heading with its page number. Let Word build it for you from your headings, then update it at the end.", body: ["Declaration ……… i", "Abstract ……… v", "Chapter One: Introduction ……… 1", "Chapter Two: Literature Review ……… 9", "Chapter Three: Methodology ……… 24", "Chapter Four: Data Presentation and Analysis ……… 33", "Chapter Five: Summary, Conclusion and Recommendations ……… 51", "References ……… 58", "Appendices ……… 62"] },
          { id: "ch1", label: "Chapter 1", note: "Chapter one introduces the study: background, the problem, the research questions and objectives, why it matters, and its scope.", body: ["CHAPTER ONE: INTRODUCTION", "# 1.1 Background to the study", "~", "# 1.2 Statement of the problem", "~", "# 1.3 Research questions", "1. How do withdrawal charges affect the amount traders save each month?", "# 1.4 Objectives · 1.5 Significance · 1.6 Scope", "~"] },
          { id: "ch2", label: "Chapter 2", note: "Chapter two reviews what others have found, the theory you use, and the gap your study fills. Every idea taken from a source is cited.", body: ["CHAPTER TWO: LITERATURE REVIEW", "# 2.1 Conceptual review", "~", "# 2.2 Theoretical framework", "~", "# 2.3 Empirical review", "Ebot (2023) found that transaction charges reduced mobile money use among very small traders in Douala.", "# 2.4 Gap in the literature", "~"] },
          { id: "ch3", label: "Chapter 3", note: "Chapter three explains how you did the study, clearly enough for someone else to repeat it: design, area, population, sample, instrument, analysis.", body: ["CHAPTER THREE: METHODOLOGY", "# 3.1 Research design", "~", "# 3.2 Area of study · 3.3 Population", "~", "# 3.4 Sample and sampling technique", "120 traders were selected from three markets by stratified random sampling.", "# 3.5 Instrument · 3.6 Data analysis", "~"] },
          { id: "ch4", label: "Chapter 4", note: "Chapter four presents the results in tables and charts, each one described in words. Only what the data show, no opinions yet.", body: ["CHAPTER FOUR: DATA PRESENTATION AND ANALYSIS", "# 4.1 Response rate", "~", "# 4.2 Demographic information", "Table 4.1: Gender of respondents", "~", "# 4.3 Answers to the research questions", "~"] },
          { id: "ch5", label: "Chapter 5", note: "Chapter five summarises the findings, discusses them against the literature, concludes, and makes recommendations and suggestions for further research.", body: ["CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS", "# 5.1 Summary of findings", "~", "# 5.2 Discussion", "~", "# 5.3 Conclusion · 5.4 Recommendations", "~"] },
          { id: "references", label: "References", note: "Every source you cited, in alphabetical order, in one style (usually APA). Nothing you did not cite.", body: ["Ebot, M. C. (2023). Effect of mobile money services on the growth of small businesses in Douala V Municipality (2018–2022) [Bachelor's project, Sawa University].", "Ngwa, P. T., & Fotso, A. (2022). Mobile money and financial inclusion in Central Africa: A review of evidence. Wouri Journal of Business Studies, 9(2), 45–63.", "~"] },
          { id: "appendix", label: "Appendices", note: "Documents that support the work: your questionnaire or interview guide, permission letters, extra tables.", body: ["Appendix A: Questionnaire", "Dear respondent, I am a final year student of Sawa University carrying out research on…", "~", "Appendix B: Letter of introduction"] },
        ],
        quiz: [
          { question: "Where does the student promise that the work is their own?", answer: "declaration", why: "The declaration is signed by the student. Copying after signing it is serious misconduct." },
          { question: "Where are the research questions?", answer: "ch1", why: "Research questions and objectives are in chapter one, after the statement of the problem." },
          { question: "Where do you explain how you chose your sample?", answer: "ch3", why: "Chapter three, the methodology, explains the population, sample and sampling technique." },
          { question: "Which part is written last, but placed near the front?", answer: "abstract", why: "You can only summarise findings once you have them, so the abstract is written last." },
          { question: "Where does your questionnaire go?", answer: "appendix", why: "Instruments like questionnaires and interview guides go in the appendices." },
        ],
        success: "You know the map of a project. Every later step fills one part of it.",
      },
    },
    {
      title: "Where good topics come from",
      body: [
        "A good topic starts from a real problem you have noticed: in your field, your town, your internship, the news.",
        "But not every problem can be researched. “Mobile money in Cameroon” is a subject, not a topic. “Mobile money is better than banks” is an opinion. “What is the capital?” is already known.",
        "A researchable problem is a question you can answer by collecting data from real people or documents.",
      ],
      mistake: "Copying a topic from a list on the internet. Supervisors and juries recognise them, and they are rarely original.",
      task: {
        type: "cardSort",
        instruction: "Is each idea researchable, too broad, or not researchable at all?",
        buckets: [
          { id: "ok", label: "Researchable" },
          { id: "broad", label: "Too broad" },
          { id: "no", label: "Not researchable (opinion or known fact)" },
        ],
        cards: [
          { text: "Mobile money in Cameroon", answer: "broad", why: "A whole subject: no group of people, no place, no question. Thousands of projects could fit under it." },
          { text: "Why do some market traders in Buea refuse mobile money payments?", answer: "ok", why: "A clear group (market traders), a place (Buea) and a question you can answer by asking them." },
          { text: "Mobile money is better than banks", answer: "no", why: "This is an opinion. You could study “differences in cost between…”, but not prove “better”." },
          { text: "Effect of late salary payment on the motivation of secondary school teachers in Bamenda", answer: "ok", why: "Who (teachers), where (Bamenda) and what (effect on motivation): you can measure it." },
          { text: "Education in Africa", answer: "broad", why: "A continent and a whole sector. No supervisor can guide this in one project." },
          { text: "What is the capital city of Cameroon?", answer: "no", why: "Already known. Research answers questions nobody has answered yet for your group and place." },
          { text: "Factors affecting the use of mosquito nets among pregnant women in Kumba", answer: "ok", why: "A clear group, place and angle (factors affecting use)." },
          { text: "Problems of the youth", answer: "broad", why: "Which youths, where, which problem? Narrow it to one problem, one group, one place." },
        ],
        required: 6,
        success: "You can tell a research problem from a subject or an opinion. Next, you search your own idea on Google.",
      },
    },
    {
      title: "Search your idea on Google",
      body: [
        "Your first search shows how big your idea really is. One or two words give hundreds of millions of results: that is what supervisors mean by “too broad”.",
        "Then you narrow it: who exactly, where, and what about it. Watch the number of results fall and the results become research.",
        "Below the browser, the search coach reads every search you type. The buttons there open the same search on the real Google.",
      ],
      mistake: "Searching two words, then taking a ready-made topic from the first blog you see.",
      task: {
        type: "googleSearch",
        engine: "google",
        goals: [
          { kind: "search", minWords: 1, instruction: "Type a broad idea from your field (the kind of subject you are thinking about) and search.", done: "Look at the number of results: hundreds of millions. That is why supervisors say “too broad”. Read the coach under the browser." },
          { kind: "narrow", facets: 3, instruction: "Now narrow it: add who, where and what about it. Use the coach's tips, or tap a related search at the bottom of the results.", done: "Much better: fewer results, and they look like research." },
          { kind: "open", academic: true, instruction: "Open a result that is real research: a thesis or a journal article, not a blog or a forum.", done: "That is an academic source. Read its abstract: aim, method, findings." },
          { kind: "save", count: 1, instruction: "Tap Save to keep it in My sources. You will need your sources later.", done: "Saved. Researchers keep track of every source as they go." },
        ],
        success: "You searched like a researcher: broad, then narrow, then real sources. Try the same search on the real Google with the button below.",
      },
    },
    {
      title: "Narrow it down: the topic funnel",
      body: [
        "Every good topic answers four questions: who, where, what about it, and when.",
        "“Loan repayment” becomes “Factors affecting loan repayment among microfinance clients in Fako (2019–2024)”. Same idea, but now it is a project you can actually do.",
        "Build your own topic in the funnel. It will be saved and used in the next steps.",
      ],
      mistake: "Choosing a place or a group you cannot reach. Pick people you can actually meet and data you can actually get.",
      task: {
        type: "topicFunnel",
        instruction: "Choose your field, then narrow your idea one step at a time. You can write your own answer at each step.",
        fields: [
          { id: "business", label: "Business, banking and accounting", ideas: ["mobile money use", "loan repayment", "tax compliance", "customer satisfaction", "social media marketing", "employee motivation"], populations: ["market traders", "small businesses", "microfinance clients", "bank customers", "hotel employees"], places: ["Buea", "Douala", "Bamenda", "Limbe", "Fako Division"], angles: ["factors affecting", "effect of charges on", "challenges of", "the role of training in"], periods: ["2019–2024", "2020–2024", "since COVID-19"] },
          { id: "health", label: "Nursing and public health", ideas: ["exclusive breastfeeding", "use of mosquito nets", "antenatal care attendance", "self-medication", "hypertension awareness"], populations: ["working mothers", "pregnant women", "university students", "adults over 40", "nurses"], places: ["Bamenda Regional Hospital", "Buea Health District", "Kumba", "Douala", "Limbe"], angles: ["factors influencing", "knowledge and practice of", "barriers to", "prevalence of"], periods: ["2021–2024", "2023", "since 2020"] },
          { id: "education", label: "Education", ideas: ["online learning", "absenteeism", "smartphone use", "teacher motivation", "inclusive education"], populations: ["first-year university students", "primary school pupils", "secondary school teachers", "students with disabilities"], places: ["Buea", "Wouri Division", "rural Menoua", "Bamenda", "Yaoundé"], angles: ["challenges of", "causes of", "effect of", "teachers' perception of"], periods: ["since COVID-19", "2020–2024", "2022–2024"] },
          { id: "agriculture", label: "Agriculture", ideas: ["post-harvest losses of maize", "fertilizer use in cocoa farming", "youth participation in farming", "adaptation to climate change"], populations: ["smallholder farmers", "cocoa farmers", "young people aged 18–35", "women farmers"], places: ["Ndop", "Meme Division", "Fako Division", "the North West Region"], angles: ["factors affecting", "effect of", "determinants of", "challenges of"], periods: ["2019–2024", "the last two seasons", "2020–2024"] },
          { id: "computing", label: "Computer science and IT", ideas: ["cybersecurity awareness", "adoption of mobile apps", "use of a student information system", "e-payment adoption"], populations: ["small businesses", "farmers", "secondary school staff", "university students"], places: ["Douala", "Buea", "the West Region", "Bamenda"], angles: ["factors affecting", "assessment of", "challenges of", "design and evaluation of"], periods: ["2023–2024", "since 2020", "2024"] },
          { id: "social", label: "Law, economics and social sciences", ideas: ["youth unemployment", "land disputes", "remittances and household welfare", "access to justice", "child labour"], populations: ["university graduates", "households", "victims of domestic violence", "plantation workers", "traditional authorities"], places: ["Dschang", "the North West Region", "Yaoundé", "Fako Division", "Buea"], angles: ["causes of", "effect of", "challenges of", "the role of"], periods: ["2015–2024", "since 2018", "2020–2024"] },
        ],
        success: "You have a topic a supervisor can work with: who, where, what about it and when.",
      },
    },
    {
      title: "Is it original? Search Google Scholar",
      body: [
        "Before you fall in love with your topic, check what others have already written. Google Scholar shows theses, journal articles and books only, and how often each one is cited.",
        "If someone has done your exact topic, do not panic: change one thing (the town, the group, the period or the angle) and you have an original study that builds on theirs.",
        "Search your topic, open what is closest to yours, and save at least two sources.",
      ],
      mistake: "Never checking, and discovering at the defence that a student from your own department did the same topic two years ago.",
      task: {
        type: "sequence",
        tasks: [
          {
            type: "googleSearch",
            engine: "scholar",
            goals: [
              { kind: "narrow", facets: 2, instruction: "Search Google Scholar with your topic (or try: mobile money small businesses Douala).", done: "These are academic sources only. Look at who studied what, where and when." },
              { kind: "open", academic: true, count: 2, instruction: "Open the two results closest to your topic and read their abstracts.", done: "Now you know what has been done. Your topic must add something new." },
              { kind: "save", count: 2, instruction: "Save at least two sources you will use in your literature review.", done: "Your literature review has started." },
            ],
            success: "You checked what exists. Use the date filters (Since 2024, Since 2023…) to find the newest work.",
          },
          {
            type: "multipleChoice",
            question: "Ebot (2023) studied “Effect of mobile money services on the growth of small businesses in Douala V Municipality (2018–2022)”. Which topic would be original for you?",
            options: [
              "Effect of mobile money services on the growth of small businesses in Douala V Municipality",
              "Mobile money in Cameroon",
              "Effect of mobile money charges on the savings of market traders in Buea (2020–2024)",
              "Mobile money and small businesses",
            ],
            answer: 2,
            explanation: "It builds on Ebot's work but changes the angle (charges and savings), the group (market traders), the place (Buea) and the period. That is an original contribution.",
            hints: ["That is Ebot's topic, copied. A jury would ask why it was done again.", "Too broad, and Ebot's study already covers part of it.", null, "Too broad: no place, no period, no angle."],
          },
        ],
      },
    },
    {
      title: "Is it a good topic?",
      body: [
        "Before you write anything, test your topic against five questions: Is it narrow enough? Can I get the data? Has it already been done exactly? Is it ethical? Does it matter to someone?",
        "A topic that fails one of these will cause trouble later, often at the defence.",
      ],
      mistake: "Choosing a topic that needs data nobody will give you (confidential bank records, government secrets).",
      task: {
        type: "cardSort",
        instruction: "Judge each topic. What is the main problem, if any?",
        buckets: [
          { id: "good", label: "Good topic" },
          { id: "broad", label: "Too broad" },
          { id: "data", label: "No access to data" },
          { id: "done", label: "Already done exactly" },
          { id: "ethics", label: "Not ethical" },
        ],
        cards: [
          { text: "Factors influencing exclusive breastfeeding among working mothers in Limbe (2020–2024)", answer: "good", why: "Narrow, reachable (mothers at clinics), not yet done in Limbe for working mothers, and useful for health workers." },
          { text: "Effect of motivation on employee performance in selected hotels in Limbe (2022)", detail: "Your Google Scholar search found: Etah, G. (2022), same title, Sawa University.", answer: "done", why: "The exact topic exists. Change the sector, the town or the angle to make it yours." },
          { text: "Hidden spending in the national budget", answer: "data", why: "You will not get access to those records as a student. Choose data you can actually collect." },
          { text: "Testing a new herbal medicine on patients without telling them", answer: "ethics", why: "Research on people needs their informed consent and ethical approval. This would harm them." },
          { text: "The economy of Africa", answer: "broad", why: "A whole continent and a whole field. Narrow to one group, one place and one angle." },
          { text: "Challenges of online learning among first-year students of Sawa University since COVID-19", answer: "good", why: "Clear group, place and period, and you can reach the students." },
          { text: "The private account statements of customers of a bank where you do not work", answer: "data", why: "Banks protect customer data by law. Survey customers who agree, instead." },
          { text: "Asking 12-year-old pupils about their parents' income without their parents' permission", answer: "ethics", why: "Children need their parents' consent, and income is a sensitive question." },
          { text: "Agriculture in Cameroon", answer: "broad", why: "Which crop, which farmers, where, what about it?" },
        ],
        required: 7,
        success: "Check your own topic against these five questions before you show it to your supervisor.",
      },
    },
    {
      title: "Problem, questions and objectives",
      body: [
        "The statement of the problem says what is wrong, who it affects, what is already known and what is missing.",
        "Then come your research questions, and your specific objectives: one objective for each question, saying the same thing as an action (“To assess…”, “To determine…”).",
        "Supervisors check this match first. Objectives that answer no question are the most common correction.",
      ],
      mistake: "Writing objectives that do not match any research question, or having three questions and five objectives.",
      task: {
        type: "alignment",
        topic: "Effect of mobile money charges on the savings of market traders in Buea (2020–2024)",
        problem: "Most market traders in Buea now receive payments by mobile money, yet many complain that withdrawal charges eat into their profits. Studies in Douala show that charges reduce mobile money use among very small traders, but no study has measured their effect on traders' savings in Buea.",
        questions: [
          "What is the level of mobile money use among market traders in Buea?",
          "How do withdrawal charges affect the amount traders save each month?",
          "What strategies do traders use to reduce mobile money charges?",
        ],
        objectives: [
          { text: "To determine the level of mobile money use among market traders in Buea.", question: 0, why: "“Level of mobile money use” is exactly what RQ1 asks." },
          { text: "To identify the strategies traders use to reduce mobile money charges.", question: 2, why: "Strategies to reduce charges: that is RQ3." },
          { text: "To assess the effect of withdrawal charges on traders' monthly savings.", question: 1, why: "Charges and monthly savings: RQ2." },
          { text: "To find out the history of mobile money in the world.", question: null, why: "No research question asks about the history of mobile money worldwide. It belongs, at most, in the background." },
        ],
        success: "One question, one objective, same idea. Do the same for your own topic on your topic card at the end.",
      },
    },
    {
      title: "Read a paper in 10 minutes",
      body: [
        "Nobody reads a research paper from the first line to the last. Researchers read in layers: title, abstract, then only the parts they need.",
        "Every paper puts things in the same places: the aim in the abstract and the end of the introduction, the sample in the methodology, the numbers in the results, the gap in the suggestions for further research.",
        "Practise on a full paper: for each question, tap the section where you would look. Watch how much time you save.",
      ],
      mistake: "Printing twenty full articles and reading them line by line. You will run out of time before you start writing.",
      task: {
        type: "paperSkim",
        instruction: "This full article came up in your search. Find each answer without reading everything.",
        paper: {
          file: "Ayuk_2023_mobile_money_fraud_Buea.pdf",
          title: "Mobile money fraud and customer trust among students in Buea",
          authors: "Ayuk, S. O. · Wouri Journal of Business Studies, 10(1), 12–27 (2023)",
          venue: "Wouri Journal of Business Studies · Vol. 10, No. 1",
          sections: [
            {
              id: "abstract",
              heading: "Abstract",
              paragraphs: ["This article studies mobile money fraud and customer trust among university students in Buea. A survey of 320 students found that 41% had received a fraudulent message in the past year and 9% lost money. Students who lost money used mobile money less for six months. The study recommends awareness campaigns on campus and faster reversal of fraudulent transfers."],
              key: "This article studies mobile money fraud and customer trust among university students in Buea.",
            },
            {
              id: "intro",
              heading: "1. Introduction",
              paragraphs: [
                "Mobile money has become the main way students in Buea receive money from their families and pay for transport, food and data. With this growth, fraudulent messages and calls have multiplied, from fake “wrong transfer” requests to false promotions.",
                "Little is known about how fraud affects young users' trust in the service. This study therefore set out to measure how common fraud attempts are among students, how many lose money, and whether losing money changes how they use mobile money afterwards.",
              ],
            },
            {
              id: "lit",
              heading: "2. Literature review",
              paragraphs: [
                "Trust is central to the adoption of digital financial services. Studies in Kenya and Ghana link fraud experiences to lower use of mobile money, especially among first-time users. In Cameroon, research has focused on adoption and charges rather than on fraud.",
                "This study draws on trust theory, which holds that people continue to use a service when they believe it is reliable and that problems will be fixed.",
              ],
            },
            {
              id: "method",
              heading: "3. Methodology",
              paragraphs: [
                "A cross-sectional survey design was used. The population was students of three higher education institutions in Buea. A sample of 320 students was selected by stratified random sampling across the three institutions and year groups.",
                "Data were collected with a structured questionnaire and analysed with descriptive statistics and chi-square tests.",
              ],
              key: "A sample of 320 students was selected by stratified random sampling across the three institutions and year groups.",
            },
            {
              id: "results",
              heading: "4. Results",
              paragraphs: [
                "Of the 320 respondents, 131 (41%) had received at least one fraudulent mobile money message in the past year. Twenty-nine students (9%) lost money, with a median loss of 15,000 FCFA.",
                "Students who lost money reported using mobile money less often for an average of six months.",
              ],
              key: "Twenty-nine students (9%) lost money, with a median loss of 15,000 FCFA.",
            },
            {
              id: "discussion",
              heading: "5. Discussion",
              paragraphs: [
                "These findings agree with studies from Kenya and Ghana that link fraud to reduced use of mobile money. Unlike those studies, losses here were concentrated among first-year students, who had less experience with the service.",
              ],
              key: "These findings agree with studies from Kenya and Ghana that link fraud to reduced use of mobile money.",
            },
            {
              id: "conclusion",
              heading: "6. Conclusion and recommendations",
              paragraphs: [
                "Fraud attempts are common among students in Buea and losing money reduces trust and use. The study recommends awareness campaigns on campus at the start of each academic year and faster reversal of fraudulent transfers by operators.",
              ],
              key: "The study recommends awareness campaigns on campus at the start of each academic year and faster reversal of fraudulent transfers by operators.",
            },
            {
              id: "further",
              heading: "7. Suggestions for further research",
              paragraphs: [
                "This study covered students only. Future research should examine fraud among market traders and older users, who may be more vulnerable, and test whether awareness campaigns actually reduce losses.",
              ],
              key: "Future research should examine fraud among market traders and older users, who may be more vulnerable, and test whether awareness campaigns actually reduce losses.",
            },
            {
              id: "refs",
              heading: "References",
              paragraphs: ["Ngwa, P. T., & Fotso, A. (2022). Mobile money and financial inclusion in Central Africa: A review of evidence. Wouri Journal of Business Studies, 9(2), 45–63."],
            },
          ],
        },
        questions: [
          { question: "What did the author want to find out?", answer: "abstract", why: "The aim is the first sentence of the abstract. It is repeated at the end of the introduction as objectives." },
          { question: "How many students took part, and how were they chosen?", answer: "method", why: "The sample and how it was selected are always in the methodology." },
          { question: "How many students actually lost money?", answer: "results", why: "Numbers and percentages are in the results." },
          { question: "Do these findings agree with studies from other countries?", answer: "discussion", why: "The discussion compares the findings with other studies." },
          { question: "What does the author recommend?", answer: "conclusion", why: "Recommendations come with the conclusion." },
          { question: "Which new topic does the author suggest for future researchers? (Useful for finding your own gap!)", answer: "further", why: "Suggestions for further research are a gift: here, fraud among market traders and older users is still unstudied. That could be your topic." },
        ],
        success: "You found everything in a few minutes. Read every source like this: title, abstract, then only what you need.",
      },
    },
    {
      title: "Read what others have written",
      body: [
        "For each source, keep a reading note: who and when, what they wanted to find out, how they did it, what they found, and how it helps your own study.",
        "With good notes, your literature review almost writes itself. Without them, you end up rereading everything the week before submission.",
      ],
      mistake: "Copying whole paragraphs from sources into your notes. Write the main idea in your own words.",
      task: {
        type: "noteCard",
        instruction: "This thesis came up in your search. Read the page, then fill your reading note.",
        sourceId: "mm-sme-douala",
        fields: [
          { label: "Author and year", options: ["Ebot (2023)", "Sawa University (2023)", "Ebot (2018)", "Douala V (2022)"], answer: 0, why: "The author's surname and the year the work was produced. The university is not the author, and 2018–2022 is the period studied." },
          { label: "Aim", options: ["To examine how mobile money services affect the growth of small businesses in Douala V", "To sell mobile money services to traders", "To compare banks in Yaoundé", "To study mobile money in the whole of Cameroon"], answer: 0, why: "Look at the first sentence of the abstract: “This study examined…”." },
          { label: "Method", options: ["A questionnaire to 214 owners chosen by stratified sampling, analysed with statistics", "Interviews with five bank managers", "Library research only", "An experiment in a laboratory"], answer: 0, why: "The abstract says: a questionnaire was given to 214 owners selected by stratified sampling." },
          { label: "Main finding", options: ["Regular users had higher sales and savings, but charges reduced use by very small traders", "Mobile money has no effect on businesses", "All traders stopped using mobile money", "Banks are better than mobile money"], answer: 0, why: "Findings come after the method: higher sales and savings for regular users, and charges as a barrier." },
        ],
        success: "That is a complete reading note. Keep one for every source you save.",
      },
    },
    {
      title: "Search smarter: quotes, PDF and site",
      body: [
        "Three small tricks make Google work like a research tool.",
        "Quotes keep words together: \"mobile money\" finds that exact phrase. filetype:pdf shows only PDF documents, where most theses and articles are. site: searches inside one kind of website, for example site:repository for university repositories.",
      ],
      mistake: "Scrolling through pages of blogs instead of telling Google exactly what you want.",
      task: {
        type: "googleSearch",
        engine: "google",
        goals: [
          { kind: "operator", operator: "quotes", instruction: "Search an exact phrase in quotes, for example: \"mobile money\" traders Buea", done: "Quotes keep the phrase together, so the results are closer to what you mean." },
          { kind: "operator", operator: "pdf", instruction: "Now add filetype:pdf to a search, for example: mobile money small businesses Douala filetype:pdf", done: "Only PDF documents: theses, articles and reports." },
          { kind: "operator", operator: "site", instruction: "Search inside repositories: add site:repository, for example: microfinance loan repayment site:repository", done: "Only results from university repositories, where past projects are kept." },
          { kind: "open", academic: true, instruction: "Open one of the academic results.", done: "Well done. Try the same tricks on the real Google with the button below." },
        ],
        success: "Quotes, filetype:pdf and site: work on the real Google too. Use them for your own topic.",
      },
    },
    {
      title: "Which sources can you trust?",
      body: [
        "Not everything Google finds can go in your project. Journal articles, theses, reports from known organisations and textbooks can be cited.",
        "News articles show that a problem is real and current: use them in your background only. Blogs, forums and encyclopedias help you understand, but you never cite them. Sites selling complete projects: avoid completely.",
      ],
      mistake: "Citing a blog or an encyclopedia page in your literature review.",
      task: {
        type: "cardSort",
        instruction: "What would you do with each source?",
        buckets: [
          { id: "cite", label: "Cite it in my project" },
          { id: "background", label: "Background only, do not rely on it" },
          { id: "avoid", label: "Do not use" },
        ],
        cards: [
          { text: "Mobile money and financial inclusion in Central Africa: a review of evidence", detail: "Wouri Journal of Business Studies, 2022 · peer-reviewed journal", answer: "cite", why: "A peer-reviewed journal article with named authors: exactly what a literature review needs." },
          { text: "50 mobile money project topics for final year students (free PDF)", detail: "StudyTips237 blog · “WhatsApp us for chapters 1–5”", answer: "avoid", why: "Sells copied projects. Using it is plagiarism and juries recognise these projects." },
          { text: "Traders complain as mobile money charges rise in Douala markets", detail: "The Coastal Herald, 2024 · news", answer: "background", why: "Shows the problem is real and current, so it can support your background, but it is not research evidence." },
          { text: "Factors affecting loan repayment among microfinance clients in Fako Division", detail: "Mount Fako University Repository, 2022 · BSc project", answer: "cite", why: "A completed project in a university repository can be cited (as a Bachelor's project)." },
          { text: "Malaria – Open Encyclopedia", detail: "Encyclopedia written by volunteers", answer: "background", why: "Good to understand the subject. Then follow its references to the real studies and cite those." },
          { text: "Please help: project topic on mobile money?", detail: "AskStudents Forum · 14 replies", answer: "avoid", why: "Anonymous opinions. Fine to get ideas, never a source." },
          { text: "Farmers' perception of climate change and adaptation strategies in the North West Region", detail: "Report by Grassfields Farmers' Network, 2023 · explains its method", answer: "cite", why: "A report from a known organisation that explains how it collected data can be cited. Mention who wrote it." },
          { text: "Complete project on mobile money, chapters 1–5, 5,000 FCFA", detail: "WhatsApp advert", answer: "avoid", why: "Buying a project is academic fraud. It can cost you your degree." },
        ],
        required: 6,
        success: "You can judge a source in seconds. Do the same with everything you find for your own topic.",
      },
    },
    {
      title: "Reference it in APA",
      body: [
        "Every source you use appears twice: briefly in the text, for example (Ebot, 2023), and in full in your reference list at the end.",
        "Most departments use APA style: author, year, title, then where it was published. Titles of journals, books and projects are in italics.",
      ],
      mistake: "Writing references in a different order each time, or citing sources in the text that are missing from the list.",
      task: {
        type: "referenceBuilder",
        instruction: "Build each reference in APA order by tapping the pieces, then choose how to cite it in your text.",
        rounds: [
          {
            label: "Journal article",
            pieces: ["Ngwa, P. T., & Fotso, A.", "(2022).", "Mobile money and financial inclusion in Central Africa: A review of evidence.", "*Wouri Journal of Business Studies*,", "*9*(2),", "45–63."],
            intext: { options: ["(Ngwa & Fotso, 2022)", "(Peter Ngwa and Fotso, 2022)", "(Wouri Journal of Business Studies, 2022)", "(Ngwa, Fotso, Mobile money, 2022)"], answer: 0, why: "Two authors: both surnames joined by &, then the year." },
          },
          {
            label: "Bachelor's project",
            pieces: ["Ebot, M. C.", "(2023).", "*Effect of mobile money services on the growth of small businesses in Douala V Municipality (2018–2022)*", "[Bachelor's project, Sawa University].", "Sawa University Repository."],
            intext: { options: ["(Ebot, 2023)", "(Clarisse, 2023)", "(Sawa University, 2023)", "(Ebot, 2018–2022)"], answer: 0, why: "One author: the surname and the year the project was completed, not the period it studied." },
          },
          {
            label: "Book",
            pieces: ["Tabi, J. N., & Mbah, L. E.", "(2021).", "*Research methods for undergraduate projects*", "(3rd ed.).", "Fako Academic Press."],
            intext: { options: ["(Tabi & Mbah, 2021)", "(Tabi et al., 2021)", "(Fako Academic Press, 2021)", "(Research methods, 2021)"], answer: 0, why: "Two authors: name both. Use “et al.” only when there are three or more authors." },
          },
        ],
        success: "Your references follow APA. Tip: the “How to cite” box on each article page in this course shows the APA reference.",
      },
    },
    {
      title: "Write it in your own words",
      body: [
        "Using other people's ideas is normal in research. Hiding that they are theirs is plagiarism.",
        "Paraphrase: read, close the source, write the idea in your own words and sentences, then cite. Changing a few words in their sentence is not enough.",
        "AI tools can help you understand or plan, but they invent sources that do not exist, and handing in their text as yours is plagiarism.",
      ],
      mistake: "Replacing a few words with synonyms and thinking it is a paraphrase.",
      task: {
        type: "sequence",
        tasks: [
          {
            type: "multipleChoice",
            question: "Original: “Regular users recorded higher monthly sales and savings, but transaction charges reduced use for very small traders” (Ebot, 2023). Which is a good paraphrase?",
            options: [
              "Regular users registered bigger monthly sales and savings, but transaction fees lowered use for very small traders.",
              "Traders who used mobile money often earned and saved more, although the smallest traders used it less because of the charges (Ebot, 2023).",
              "Traders who used mobile money often earned and saved more, although the smallest traders used it less because of the charges.",
              "Regular users recorded higher monthly sales and savings, but transaction charges reduced use for very small traders.",
            ],
            answer: 1,
            explanation: "New words and a new sentence structure, the same idea, and the source cited. That is a paraphrase.",
            hints: ["Only a few words were swapped and there is no citation: this is still plagiarism (“patchwriting”).", null, "Good wording, but the source is missing. Without (Ebot, 2023) it is plagiarism.", "Copied word for word with no quotation marks and no citation."],
          },
          {
            type: "multipleChoice",
            question: "You ask an AI chatbot to write your literature review. What is the main problem?",
            options: [
              "Nothing, if the text sounds good",
              "It may invent sources that do not exist, and submitting its text as your own work is plagiarism",
              "It writes too slowly",
              "Supervisors never read the literature review",
            ],
            answer: 1,
            explanation: "AI tools often make up authors and articles. Use them to understand ideas or plan, then read real sources and write in your own words.",
          },
          {
            type: "multipleChoice",
            question: "When must you cite a source?",
            options: [
              "Only when you copy a sentence word for word",
              "Every time you use someone else's idea, finding, number or words",
              "Only for books",
              "Only in chapter two",
            ],
            answer: 1,
            explanation: "Ideas, findings and numbers from others are cited wherever they appear, in every chapter.",
          },
        ],
      },
    },
    {
      title: "Use AI the honest way",
      body: [
        "AI chat tools can make you a faster researcher: they help you brainstorm, narrow a topic, find search words and understand hard ideas.",
        "But they cannot do the work for you. Text written by AI and handed in as yours is plagiarism. AI also invents references and numbers that look real.",
        "Practise with a study assistant. Choose a message or type your own, check every source it suggests, and learn how to say honestly how you used it.",
      ],
      mistake: "Copying references from an AI chat into your project without finding them first. Many do not exist, and examiners check.",
      task: {
        type: "aiAssistant",
        instruction: "Work with the AI on your topic. Honest requests move you forward; the coach warns you about the rest.",
        greeting: "Hello! I'm your study assistant. How can I help with your project on {topic}?",
        stages: [
          {
            instruction: "Use the AI to brainstorm: ask it for angles you could study.",
            prompts: [
              {
                text: "What are some angles I could study on {topic}? Give me 5 ideas.",
                ok: true,
                reply: "Here are five angles you could explore:\n\n1. How charges affect how often traders use mobile money\n2. Whether traders who keep money on their phone save more than those who withdraw daily\n3. Strategies traders use to avoid charges\n4. Differences between men and women traders\n5. Changes after the most recent increase in charges\n\nChoose one you can actually measure in your town, and check what already exists on Google Scholar.",
                coach: "Honest use: brainstorming gives you options to think about. You still choose, check what exists and decide with your supervisor.",
              },
              {
                text: "Write my chapter one on {topic}.",
                ok: false,
                reply: "Sure! Here is Chapter One:\n\n1.1 Background to the study\nMobile money has revolutionised financial services across Africa. According to Smith (2019), over 90% of traders now use it daily, and this trend is expected to grow…",
                coach: "Misconduct: a chapter written by AI and submitted as yours is plagiarism, and you signed a declaration saying the work is your own. Notice too that “Smith (2019)” and “90%” may be invented.",
              },
              {
                text: "Give me a complete original project with chapters 1 to 5 that nobody has done.",
                ok: false,
                reply: "Of course! Title: “The Impact of Digital Finance on Economic Growth in Africa”. Chapter 1: Introduction…",
                coach: "Misconduct, and a bad topic too: far too broad, and not yours. At the defence the jury will ask why you chose it and how you collected the data.",
              },
            ],
          },
          {
            instruction: "Now ask the AI to help you understand something, or to help you narrow your topic.",
            prompts: [
              {
                text: "Explain the difference between a research question and an objective, with an example.",
                ok: true,
                reply: "A research question asks what you want to find out; an objective says the same thing as an action.\n\nQuestion: How do withdrawal charges affect the amount traders save each month?\nObjective: To assess the effect of withdrawal charges on traders' monthly savings.\n\nOne objective for each question.",
                coach: "Honest use: asking for an explanation helps you understand. Write your own questions and objectives afterwards.",
              },
              {
                text: "My topic is still broad. Ask me questions to help me narrow it.",
                ok: true,
                reply: "Happy to help. Answer these:\n\n1. Who exactly will you study? (one group)\n2. Where can you reach them? (one town or market)\n3. What do you want to find out about them?\n4. Which period will you cover?\n\nThen put your answers together in one sentence.",
                coach: "Honest use: the AI asks the questions, you give the answers. The topic stays yours.",
              },
              {
                text: "Rewrite this paragraph from Ebot (2023) so Turnitin cannot detect it.",
                ok: false,
                reply: "Here is a rewritten version that will be harder to detect:\n\n“Frequent users of mobile money saw bigger monthly sales and savings, though fees discouraged the smallest traders…”",
                coach: "Misconduct: disguising someone else's work is still plagiarism, with or without a detector. Paraphrase it yourself and cite (Ebot, 2023).",
              },
            ],
          },
          {
            instruction: "Ask the AI for search keywords you can use on Google Scholar.",
            prompts: [
              {
                text: "Suggest search keywords and synonyms for {topic}.",
                ok: true,
                reply: "Try these on Google Scholar:\n\n• \"mobile money\" OR \"mobile payments\"\n• transaction charges OR fees\n• savings behaviour OR saving habits\n• market traders OR informal traders\n• Cameroon OR Buea\n\nTip: put two-word terms in quotes and add a place.",
                coach: "Honest use: the keywords help you search, but you still find and read the sources yourself.",
              },
              {
                text: "Make up realistic questionnaire results for 120 traders so I can write chapter four.",
                ok: false,
                reply: "Here are realistic results: 62% of traders reported reduced savings, 24% reported no change, 14% reported increased savings…",
                coach: "Fabrication: inventing data is the most serious research misconduct. It can lead to the cancellation of your degree. Collect real answers, even from fewer people.",
              },
            ],
          },
        ],
        verify: {
          instruction: "You asked for sources and the AI gave three. Check each one on Google Scholar before you trust it.",
          prompt: "Give me three sources on {topic}.",
          reply: "Here are three sources you can cite:",
          refs: [
            {
              text: "Ebot, M. C. (2023). Effect of mobile money services on the growth of small businesses in Douala V Municipality (2018–2022) [Bachelor's project, Sawa University].",
              query: "\"Effect of mobile money services on the growth of small businesses\"",
              real: true,
              why: "Found: it is a real project in the Sawa University Repository. Read it before citing it.",
            },
            {
              text: "Mbah, K. T. (2021). Mobile money charges and traders' savings in Buea. Journal of Central African Finance, 12(4), 88–101.",
              query: "\"Mobile money charges and traders' savings in Buea\"",
              real: false,
              why: "Nothing found, even with the exact title. The AI invented it: the author, the journal and the pages look real, but they are not. Citing it would be fabrication.",
            },
            {
              text: "Ngwa, P. T., & Fotso, A. (2022). Mobile money and financial inclusion in Central Africa: A review of evidence. Wouri Journal of Business Studies, 9(2), 45–63.",
              query: "\"Mobile money and financial inclusion in Central Africa\"",
              real: true,
              why: "Found: a real journal article. Open it and read the abstract before you cite it.",
            },
          ],
        },
        disclosure: {
          question: "Your university allows AI for planning if you say so. Which statement should go in your project (for example in the methodology or the acknowledgements)?",
          options: [
            "No statement: nobody will know.",
            "AI wrote parts of this project.",
            "I used Study Assistant, an AI tool, to brainstorm angles for my topic and to suggest search keywords. I found and checked every source myself, and the writing, data and analysis are my own.",
            "I used AI a little.",
          ],
          answer: 2,
          why: "It names the tool, says exactly what it was used for, and confirms that the sources, writing, data and analysis are yours.",
        },
        success: "You used AI like a good researcher: to think faster, never to replace your own reading, data and writing. Always check your university's rules on AI.",
      },
    },
    {
      title: "The structure of your project",
      body: [
        "Put the parts in the right order and your project already looks professional.",
        "Check your department's guide: the order of the first pages varies a little between universities (some put the certification first). The chapters are almost always the same.",
      ],
      mistake: "Forgetting the page numbering: Roman numerals (i, ii, iii) for the preliminary pages, then 1, 2, 3 from chapter one.",
      task: {
        type: "sectionOrder",
        rounds: [
          {
            persona: "The preliminary pages",
            instruction: "Put the first pages in the order they appear after the cover.",
            sections: [
              { id: "abstract", label: "Abstract", why: "The summary comes after the acknowledgements, just before the table of contents." },
              { id: "declaration", label: "Declaration", why: "Right after the cover: you declare the work is yours." },
              { id: "toc", label: "Table of contents", why: "Last of the preliminary pages, just before chapter one." },
              { id: "dedication", label: "Dedication", why: "After the official pages, a short personal line." },
              { id: "certification", label: "Certification", why: "Your supervisor's certification follows your declaration." },
              { id: "acknowledgements", label: "Acknowledgements", why: "After the dedication: thanking those who helped." },
            ],
            answer: ["declaration", "certification", "dedication", "acknowledgements", "abstract", "toc"],
          },
          {
            persona: "Chapter one",
            instruction: "Put the sections of chapter one in order.",
            sections: [
              { id: "questions", label: "Research questions and objectives", why: "They follow from the problem you have just stated." },
              { id: "scope", label: "Scope of the study", why: "Near the end: the limits of your study (who, where, when)." },
              { id: "background", label: "Background to the study", why: "Always first: the context of the problem." },
              { id: "significance", label: "Significance of the study", why: "After the objectives: who will benefit from your findings." },
              { id: "problem", label: "Statement of the problem", why: "After the background: what exactly is wrong." },
              { id: "definitions", label: "Definition of terms", why: "Last: the key words as you use them." },
            ],
            answer: ["background", "problem", "questions", "significance", "scope", "definitions"],
          },
          {
            persona: "The chapters",
            instruction: "Put the chapters and end sections in order.",
            sections: [
              { id: "method", label: "Chapter 3: Methodology", why: "How you did the study comes before the results." },
              { id: "refs", label: "References", why: "After the last chapter." },
              { id: "intro", label: "Chapter 1: Introduction", why: "Always first." },
              { id: "results", label: "Chapter 4: Data presentation and analysis", why: "The results, once the method is explained." },
              { id: "appendix", label: "Appendices", why: "At the very end." },
              { id: "lit", label: "Chapter 2: Literature review", why: "What others found, before your method." },
              { id: "summary", label: "Chapter 5: Summary, conclusion and recommendations", why: "The last chapter: what it all means." },
            ],
            answer: ["intro", "lit", "method", "results", "summary", "refs", "appendix"],
          },
        ],
        success: "You know where everything goes. Use Word's heading styles so your table of contents builds itself.",
      },
    },
    {
      title: "Fix the questionnaire",
      body: [
        "Your results can only be as good as your questions. One bad question can make a whole section of chapter four useless.",
        "Avoid questions that push an answer, that ask two things at once, that are vague, that use words respondents do not know, or that ask for sensitive information without need.",
      ],
      mistake: "Printing 120 questionnaires before testing them on five people first (a pilot test).",
      task: {
        type: "redPen",
        instruction: "This draft questionnaire has five bad questions. Tap each one.",
        passPercent: 80,
        success: "You can spot a bad question. Always pilot your questionnaire on a few people before the real survey.",
        lines: [
          { style: "title", parts: ["Questionnaire for market traders in Buea"] },
          { style: "small", parts: ["Dear respondent, I am a final year student of Sawa University. Your answers are confidential and will be used for research only."] },
          { style: "heading", parts: ["Section B: Mobile money use"] },
          { parts: ["Q3. ", { text: "Don't you agree that mobile money charges are far too high?", error: "leading" }] },
          { parts: ["Q4. ", { text: "How often do you use mobile money, and do you save money with it?", error: "double" }] },
          { parts: ["Q5. How much do you save in a normal month?  ☐ Less than 5,000 FCFA  ☐ 5,000–20,000  ☐ More than 20,000  ☐ I do not save"] },
          { parts: ["Q6. ", { text: "Do you use mobile money regularly?  ☐ Yes  ☐ No", error: "vague" }] },
          { parts: ["Q7. ", { text: "How much cash do you keep hidden at home, and where?", error: "sensitive" }] },
          { parts: ["Q8. ", { text: "Has financial disintermediation affected your liquidity preference?", error: "jargon" }] },
          { parts: ["Q9. Which service do you use most?  ☐ MTN MoMo  ☐ Orange Money  ☐ Both"] },
        ],
        errors: [
          { id: "leading", label: "Leading question", why: "It pushes the respondent to agree. Ask neutrally: “How would you describe mobile money charges?” with a scale." },
          { id: "double", label: "Two questions in one", why: "“How often” and “do you save” are two questions. A “yes” would not say which one they answered." },
          { id: "vague", label: "Vague", why: "“Regularly” means different things to different people. Give options: daily, weekly, monthly, rarely." },
          { id: "sensitive", label: "Sensitive and unnecessary", why: "Asking where cash is hidden could put people at risk, and your study does not need it." },
          { id: "jargon", label: "Jargon", why: "Market traders will not understand these terms. Use everyday words." },
        ],
      },
    },
    {
      title: "From answers to a table",
      body: [
        "In chapter four, you turn the answers into tables: how many people chose each answer (the frequency) and what share of all respondents that is (the percentage).",
        "Each table has a number and a title, the frequencies add up to the total, and the percentages add up to 100. Then you describe the table in a sentence or two.",
      ],
      mistake: "Pasting a table with no number, no title and no sentence explaining what it shows.",
      task: {
        type: "dataTally",
        instruction: "Here are 20 completed questionnaires. Count the answers to Q5 and complete the table.",
        question: "How much do you save in a normal month?",
        options: ["Less than 5,000 FCFA", "5,000–20,000 FCFA", "More than 20,000 FCFA", "I do not save"],
        responses: [1, 0, 1, 3, 1, 0, 2, 1, 0, 3, 1, 0, 1, 3, 0, 1, 2, 3, 0, 1],
        chart: {
          question: "Which chart best shows how the 20 traders are shared across the savings groups?",
          options: ["A pie chart: each slice is the share of traders in one group", "A line graph", "A scatter plot", "A list of all 20 answers in a paragraph"],
          answer: 0,
          why: "The groups are parts of one whole (all the respondents), so a pie chart works well (a bar chart too). Line graphs show change over time.",
        },
        success: "Now describe it in words: “Most respondents (40%) save between 5,000 and 20,000 FCFA a month, while 20% do not save at all.”",
      },
    },
    {
      title: "Defend it",
      body: [
        "At the defence you present your work in 10 to 15 minutes, then the jury asks questions. They want to see that you understand what you did and why.",
        "The questions are predictable. Practise your answers out loud, with a timer, until you can answer each in under a minute.",
      ],
      mistake: "Reading your slides word for word, or saying “my supervisor told me to” when asked why you made a choice.",
      task: {
        type: "interview",
        instruction: "Answer each jury question out loud before the time runs out, then compare with the model answer.",
        seconds: 60,
        required: 4,
        cards: [
          { question: "Present your work briefly.", tip: "Problem, aim, method, main findings, main recommendation. No details yet.", model: "Many traders in Buea complain that mobile money charges reduce their profits. I studied the effect of withdrawal charges on the savings of 120 market traders using a questionnaire. I found that 62% save less because of charges, and most avoid withdrawals by paying suppliers directly. I recommend lower charges for small amounts." },
          { question: "Why did you choose this topic?", tip: "A real problem you noticed, plus the gap in the literature.", model: "My mother is a trader in Buea and complains about charges every month. When I searched, studies in Douala looked at mobile money use, but none measured the effect of charges on traders' savings in Buea." },
          { question: "Why did you choose a sample of 120?", tip: "Your population, how you calculated or decided, and how you selected them.", model: "There are about 170 registered traders in the three markets. Using a sample size table at 95% confidence I needed about 118, so I selected 120 by stratified random sampling across the three markets." },
          { question: "What are the limitations of your study?", tip: "Be honest, then say how you reduced each limitation.", model: "Some traders were not comfortable giving exact savings figures, so I used ranges. The study covers only Buea, so the findings may not apply to rural markets." },
          { question: "How is your work different from what others have done?", tip: "Name a study, then say what you changed: place, group, period, angle.", model: "Ebot (2023) studied mobile money and the growth of small businesses in Douala. I focused on charges and savings, with market traders in Buea, for 2020 to 2024." },
          { question: "If you did this study again, what would you do differently?", tip: "One concrete improvement shows maturity.", model: "I would add interviews with a few traders to understand why they choose certain strategies, not only how many use them." },
        ],
        success: "You can answer the questions every jury asks. Practise with a friend playing the jury.",
      },
    },
    {
      title: "Your topic card",
      body: [
        "Now put it all together for your own project: your topic, the statement of the problem, your research questions and the matching objectives, and keywords for your searches.",
        "The card is checked the way a supervisor reads a topic proposal. When it passes, copy it or send it straight to your supervisor on WhatsApp.",
      ],
      mistake: "Sending your supervisor three vague topic ideas in one line. Send one clear topic card.",
      task: {
        type: "topicCard",
        instruction: "Write your own topic card. Your topic from the funnel is already filled in: improve it if you need to.",
        success: "Your topic card is ready. Send it to your supervisor, and come back to the course whenever you start a new chapter.",
      },
    },
  ],
  assessment: {
    passMark: 7,
    warmup: [0, 2, 4, 6, 8],
    questions: [
      { step: 1, question: "Which part of a project is written last but placed near the front?", options: ["The declaration", "The abstract", "Chapter one", "The references"], answer: 1 },
      { step: 2, question: "Which of these is a researchable topic?", options: ["Education in Africa", "Mobile money is better than banks", "Factors affecting the use of mosquito nets among pregnant women in Kumba", "Problems of the youth"], answer: 2 },
      { step: 14, question: "An AI chat gives you three references for your topic. What do you do?", options: ["Copy them into your reference list", "Find each one on Google Scholar first; cite only those that exist and that you have read", "Ask the AI if they are real", "Delete your other sources"], answer: 1 },
      { step: 5, question: "Someone already did your exact topic. What should you do?", options: ["Do it again anyway", "Give up research", "Change the place, group, period or angle", "Copy their chapters"], answer: 2 },
      { step: 7, question: "You have three research questions. How many specific objectives?", options: ["One", "Three, one for each question", "Five", "As many as you like"], answer: 1 },
      { step: 10, question: "What does filetype:pdf do in a Google search?", options: ["Downloads a PDF reader", "Shows only PDF documents", "Converts pages to PDF", "Searches only in Cameroon"], answer: 1 },
      { step: 11, question: "Which source can you cite in your literature review?", options: ["A blog listing project topics", "A forum thread", "A peer-reviewed journal article", "An encyclopedia page"], answer: 2 },
      { step: 12, question: "In APA, how do you cite a project by Ebot from 2023 in the text?", options: ["(Clarisse, 2023)", "(Ebot, 2023)", "(Sawa University, 2023)", "(Ebot Clarisse 2023)"], answer: 1 },
      { step: 16, question: "“How often do you use mobile money and do you save with it?” What is wrong?", options: ["It is too short", "It asks two things at once", "It is in English", "Nothing"], answer: 1 },
      { step: 17, question: "8 of 20 respondents chose an answer. What percentage is that?", options: ["8%", "20%", "40%", "80%"], answer: 2 },
    ],
  },
};

export default course;
