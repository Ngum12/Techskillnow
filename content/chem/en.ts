import type { ChemLabData, Course } from "../types";
import { apparatus, chemSettings, checkpoints, errorData, indicators, systems } from "./data";

/*
 * Chemistry Practicals: Titration and Salt Analysis (GCE A Level).
 * Prototype: Section A (lab basics) and Section B (titration). All chemistry values, colours, effects and
 * marking points live in the .json files of this folder. Section C (salt analysis) will add steps here
 * that read their own data files.
 */

const lab: ChemLabData = { settings: chemSettings, systems, indicators, errors: errorData };
const cp = (...ids: string[]) => ids.map((id) => checkpoints.find((c) => c.id === id)!).filter(Boolean);
const paperLabel = chemSettings.labels.practicalPaper;

const course: Course = {
  id: "chem-titration",
  locale: "en",
  title: "Chemistry Practicals: Titration and Salt Analysis",
  promise: "Practise acid–base titration on a virtual bench, write the method the way examiners mark it, and calculate concentrations with confidence. Salt analysis is coming next.",
  price: 1000,
  track: "exam",
  audience: "For Lower and Upper Sixth science students",
  outcomes: ["Titrations on a virtual bench, to concordant results", "A written method that matches the mark scheme", "Concentration calculations, step by step"],
  series: "GCE Practicals · Chemistry",
  freeSteps: 1,
  steps: [
    // Section A: Lab basics
    {
      title: "Meet the bench",
      body: [
        "A titration finds the concentration of one solution by reacting it exactly with a solution of known concentration.",
        "Every piece of apparatus has one job. Choosing the wrong one costs accuracy, and marks.",
        "Tap each item on the bench to learn its name and use, then test yourself.",
      ],
      mistake: "Using a measuring cylinder for the 25.0 cm³ portion. Only a pipette measures it accurately enough.",
      task: { type: "chemTour", instruction: "Explore the bench: tap every piece of apparatus.", items: apparatus.items, tasks: apparatus.tasks, success: "You know the bench. In the practical, name each piece correctly in your method too." },
    },
    {
      title: "Reading instruments",
      body: [
        "Read a burette at eye level, at the bottom of the meniscus. The numbers increase downwards.",
        "Record every burette reading to 2 decimal places, to the nearest 0.05 cm³: 23.45, 7.50, 0.00. Never 23.4 or 23.453.",
      ],
      mistake: "Reading the top of the meniscus, or writing 0.5 instead of 0.50. Both lose recording marks.",
      task: { type: "buretteRead", instruction: "Read the burette in each close-up. Write your reading to 2 decimal places.", rounds: 5, required: 4, parallax: errorData.parallax, success: "You read like an examiner: bottom of the meniscus, eye level, nearest 0.05 cm³." },
    },
    {
      title: "Recording results like an examiner",
      body: [
        "A results table has a heading with its unit for every row: “Final burette reading / cm³”, “Initial burette reading / cm³”, “Titre / cm³”.",
        "Every value has the same number of decimal places (2), and the titre is final minus initial for each titration.",
      ],
      mistake: "Writing only the titres. Examiners want both readings for every titration, rough included.",
      task: { type: "resultsTable", instruction: "Read the six close-ups (start and end of three titrations) and complete the results table.", success: "A table an examiner would give full marks: units, 2 decimal places, both readings and correct titres." },
    },
    // Section B: Titration
    {
      title: "Preparing the apparatus",
      body: [
        "Rinse each item with the solution it will hold: the burette with the acid, the pipette with the alkali. The conical flask is rinsed with distilled water only.",
        "Remove the funnel and fill the jet below the tap before you start. As in a real lab, a wrong choice is not announced: you will see its effect on your results.",
      ],
      mistake: "Rinsing everything with distilled water. Water left in the burette or pipette dilutes the solution and changes your titre.",
      task: { type: "titrationLab", phase: "prepare", instruction: "Prepare your apparatus for the titration.", lab, notebook: cp("prepare"), paperLabel, success: "Your apparatus is ready. Your choices carry into the next titrations." },
    },
    {
      title: "Rough titration",
      body: [
        "Pipette 25.0 cm³ of the alkali into the flask, add 2–3 drops of indicator and stand the flask on a white tile.",
        "Run the acid in quickly while swirling until the colour changes. This rough titre tells you roughly where the end point is.",
      ],
      mistake: "Forgetting to record the initial reading before you open the tap.",
      task: { type: "titrationLab", phase: "rough", instruction: "Carry out a rough titration.", lab, notebook: cp("pipette", "indicator", "titrate"), paperLabel, success: "Rough titre recorded. Now you know where to slow down." },
    },
    {
      title: "Accurate titrations to concordance",
      body: [
        "Run the acid in quickly to about 1 cm³ before the rough titre, then add it drop by drop, swirling after each drop, until the first permanent colour change.",
        "Repeat until at least two titres agree within 0.10 cm³ (concordant). Average only those.",
      ],
      mistake: "Averaging every titre, including the rough one or one that does not agree.",
      task: { type: "titrationLab", phase: "accurate", instruction: "Titrate accurately until you have concordant titres, then choose which to average.", lab, notebook: cp("record", "concordance"), paperLabel, success: "Concordant titres, a correct mean and a written method. That is a complete practical." },
    },
    {
      title: "Calculations, step by step",
      body: [
        "1. Moles of the known solution: n = c × V ÷ 1000. 2. Mole ratio from the balanced equation. 3. Moles of the unknown in 25.0 cm³. 4. Concentration: c = n × 1000 ÷ 25.0. 5. Mass concentration = concentration × Mr, where asked.",
        "Each box earns its own mark. If an early box is wrong but you use it correctly later, you still earn the later marks (error carried forward), so always show every step.",
      ],
      mistake: "Forgetting to divide by 1000 to change cm³ to dm³, or using the mole ratio upside down.",
      task: { type: "chemCalc", instruction: "Work through the calculation one box at a time.", lab, success: "Every box right. Show these steps in the exam and you protect your method marks." },
    },
    {
      title: "What went wrong?",
      body: ["Examiners often ask how a mistake changes the titre: higher, lower or no change, with a reason.", "The key question: does the mistake change the moles in the flask, the concentration of the acid, or only the reading?"],
      task: {
        type: "sequence",
        tasks: [
          { type: "errorCards", instruction: "For each situation, decide what happens to the titre and why.", scenarios: errorData.scenarios, success: "You can explain every common titration error." },
          { type: "methodChallenge", instruction: "Each method has one wrong step. Tap it, then predict its effect.", challenges: errorData.methodChallenges, success: "You can spot a faulty method and explain the effect: a favourite exam question." },
        ],
      },
    },
    {
      title: "Mock titration",
      body: [
        "Now the real thing: prepare, titrate to concordance and calculate the concentration against the clock, with no hints.",
        "You get a full mark breakdown, and your whole written method beside the model answer, to save as revision notes.",
      ],
      task: {
        type: "titrationLab",
        phase: "exam",
        instruction: "Timed mock practical.",
        lab,
        notebook: [],
        allCheckpoints: checkpoints,
        exam: chemSettings.exam,
        paperLabel,
        success: "Mock passed. You are ready for the practical.",
      },
    },
  ],
  assessment: {
    passMark: 7,
    warmup: [0, 2, 4, 6, 8],
    questions: [
      { step: 1, question: "Which apparatus measures exactly 25.0 cm³ of alkali into the flask?", options: ["Measuring cylinder", "Burette", "Pipette", "Beaker"], answer: 2 },
      { step: 2, question: "Which burette reading is recorded correctly?", options: ["23.4", "23.45", "23.453", "23"], answer: 1 },
      { step: 2, question: "You read the burette with your eye above the meniscus. The reading is:", options: ["Too high", "Too low", "Correct", "Impossible to tell"], answer: 1 },
      { step: 3, question: "Which is the best heading for a row of a results table?", options: ["Final reading", "Final burette reading / cm³", "Burette (cm)", "Result"], answer: 1 },
      { step: 4, question: "What should the burette be rinsed with before it is filled with acid?", options: ["Distilled water only", "The acid it will hold", "The alkali", "Tap water"], answer: 1 },
      { step: 4, question: "The conical flask is still wet with distilled water when the alkali is pipetted in. The titre will be:", options: ["Higher", "Lower", "Unchanged", "Zero"], answer: 2 },
      { step: 5, question: "Acid is added to sodium hydroxide with phenolphthalein. At the end point the colour changes from:", options: ["Colourless to pink", "Pink to colourless", "Yellow to orange", "Red to yellow"], answer: 1 },
      { step: 6, question: "Accurate titres: 24.10, 24.35 and 24.15 cm³. Which should be averaged?", options: ["All three", "24.10 and 24.35", "24.10 and 24.15", "24.35 only"], answer: 2 },
      { step: 7, question: "How many moles of HCl are in 20.00 cm³ of 0.100 mol dm⁻³ hydrochloric acid?", options: ["2.00 mol", "0.200 mol", "0.00200 mol", "0.0200 mol"], answer: 2 },
      { step: 8, question: "An air bubble in the burette jet disappears during the titration. The recorded titre will be:", options: ["Higher", "Lower", "Unchanged", "Exactly right"], answer: 0 },
    ],
  },
};

export default course;
