/**
 * Functions lessons 6–10: graphs to know, translations and stretches, reflections and combined
 * transformations, graph sketching (with modulus graphs), and the topic review. Same rhythm as ./lessons.ts.
 */
import type { SolutionLine } from "@/lib/maths/types";
import type { FunctionsLesson } from "./lessons";

const L = (latex: string, note?: string, mark?: string): SolutionLine => ({ latex, note, mark });

/* ---------- Lesson 6: graphs every student must know ---------- */

const lesson6: FunctionsLesson = {
  id: "fn-6",
  title: "Lesson 6 · Graphs you must know",
  body: [
    "Seven graphs come up again and again in the GCE: y = x, x², x³, 1/x, 1/x², √x and |x|. If you know their shapes by heart, sketching and transformations become easy.",
    "Today you learn each shape and its key features: where it crosses the axes, its turning points and its asymptotes.",
  ],
  skills: [
    { id: "fn.graph.know", name: "The graphs to know" },
    { id: "fn.graph.features", name: "Asymptotes and intercepts" },
  ],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "Move the slider to step through the seven graphs. For each one, look at three things: does it pass through the origin, is it symmetrical, and does it have asymptotes (dashed lines it gets close to but never touches)?",
      graph: {
        x: [-4, 4],
        y: [-4, 4],
        curves: [{ expr: "x" }],
        params: [{ name: "n", label: "Graph number", min: 1, max: 7, step: 1, value: 1 }],
        select: { param: "n", exprs: { "1": "x", "2": "x^2", "3": "x^3", "4": "1/x", "5": "1/x^2", "6": "sqrt(x)", "7": "|x|" } },
      },
      questions: [
        { prompt: "Graph 4 is $y = \\frac{1}{x}$. In which quadrants are its branches?", options: ["1st and 3rd (top right and bottom left)", "1st and 2nd (both above the x-axis)", "Only the 1st"], answer: 0, explain: "For $x > 0$, $\\frac{1}{x} > 0$; for $x < 0$, $\\frac{1}{x} < 0$. The branches are in opposite quadrants." },
        { prompt: "Graph 5 is $y = \\frac{1}{x^2}$. Why are both branches above the x-axis?", options: ["$x^2$ is always positive, so $\\frac{1}{x^2} > 0$", "Because it has no asymptotes", "It is the same as $\\frac{1}{x}$"], answer: 0, explain: "Squaring makes the bottom positive for every $x \\ne 0$, so the output is always positive." },
        { prompt: "Graph 6 is $y = \\sqrt{x}$. Why is there nothing to the left of the y-axis?", options: ["You cannot take the square root of a negative number", "The curve is too small to see", "It has an asymptote"], answer: 0, explain: "The domain of $\\sqrt{x}$ is $x \\ge 0$." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Draw all seven graphs in your exercise book on small axes, two to a line. Label each one with its key features from this list.",
      lines: [
        L("y = x: \\text{ straight line through } (0, 0), \\text{ gradient } 1"),
        L("y = x^2: \\text{ U shape, minimum } (0, 0), \\text{ symmetrical about the y-axis}"),
        L("y = x^3: \\text{ S shape through } (0, 0), \\text{ down on the left, up on the right}"),
        L("y = \\tfrac{1}{x}: \\text{ asymptotes } x = 0, \\; y = 0; \\text{ branches in opposite quadrants}"),
        L("y = \\tfrac{1}{x^2}: \\text{ asymptotes } x = 0, \\; y = 0; \\text{ always above the x-axis}"),
        L("y = \\sqrt{x}: \\text{ starts at } (0, 0), \\text{ only } x \\ge 0"),
        L("y = |x|: \\text{ V shape, vertex } (0, 0)"),
        L("y = \\tfrac{a}{x - p} + q: \\text{ asymptotes } x = p \\text{ and } y = q", "The bottom is zero at x = p; the fraction tends to 0 for large x."),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "fn.graph.asymptotes", seed: 66 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.graph.asymptotes", hide: [0, -1] },
    { kind: "practice", title: "Your turn", generators: ["fn.graph.identify", "fn.graph.asymptotes", "fn.graph.identify"], count: 4 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Find the vertical asymptote of $y = \\frac{3}{x + 2}$.",
          lines: ["x + 2 \\text{ is on the bottom}", "\\text{Asymptote: } x = 2"],
          wrong: 1,
          options: ["The bottom is zero when $x + 2 = 0$, so $x = -2$", "There is no vertical asymptote", "$y = 2$"],
          answer: 0,
          explain: "Solve bottom = 0: $x + 2 = 0 \\Rightarrow x = -2$.",
        },
        {
          prompt: "Describe the graph of $y = \\frac{1}{x^2}$.",
          lines: ["\\text{Asymptotes } x = 0, \\; y = 0", "\\text{Branches in the 1st and 3rd quadrants}"],
          wrong: 1,
          options: ["Both branches are ABOVE the x-axis (1st and 2nd quadrants): $\\frac{1}{x^2} > 0$", "It crosses the origin", "It has an asymptote at $y = 1$"],
          answer: 0,
          explain: "The 1st and 3rd quadrants belong to $\\frac{1}{x}$. $\\frac{1}{x^2}$ is never negative.",
        },
        {
          prompt: "Find the horizontal asymptote of $y = \\frac{4}{x - 1} - 3$.",
          lines: ["\\text{As } x \\to \\infty, \\; \\frac{4}{x - 1} \\to 0", "\\text{Asymptote: } y = 3"],
          wrong: 1,
          options: ["$y \\to 0 - 3$, so the asymptote is $y = -3$", "There is no horizontal asymptote", "$y = 4$"],
          answer: 0,
          explain: "Keep the sign: the fraction tends to 0, leaving $y = -3$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.fn.graphs" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Describe the graph of y = a/(x − p) + q: its asymptotes and how you find where it crosses the axes.",
      need: 2,
      ideas: [
        { id: "vertical", text: "The vertical asymptote is x = p, where the bottom is zero.", keywords: [["vertical"], ["bottom", "denominator", "zero", "x = p", "x=p"]] },
        { id: "horizontal", text: "The horizontal asymptote is y = q, because the fraction tends to zero.", keywords: [["horizontal"], ["y = q", "y=q", "tends", "zero", "large"]] },
        { id: "intercepts", text: "Put x = 0 to find the y-intercept and y = 0 for the x-intercept.", keywords: [["x = 0", "x=0", "y = 0", "y=0"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Graphs to know",
        blocks: [
          { type: "rule", title: "Shapes", text: "$x$: line. $x^2$: U. $x^3$: S. $|x|$: V. $\\sqrt{x}$: half a sideways U, $x \\ge 0$. $\\frac{1}{x}$: opposite quadrants. $\\frac{1}{x^2}$: both branches above." },
          { type: "rule", title: "Asymptotes", text: "For $y = \\frac{a}{x - p} + q$: vertical $x = p$, horizontal $y = q$." },
          { type: "sketch", title: "Sketch: $y = \\frac{1}{x}$", graph: { x: [-4, 4], y: [-4, 4], curves: [{ expr: "1/x" }], asymptotes: [{ x: 0 }, { y: 0 }] } },
          { type: "sketch", title: "Sketch: $y = \\frac{1}{x^2}$", graph: { x: [-4, 4], y: [-1, 5], curves: [{ expr: "1/x^2" }], asymptotes: [{ x: 0 }, { y: 0 }] } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["fn.graph.identify", "fn.graph.asymptotes", "fn.graph.identify", "fn.graph.asymptotes", "fn.graph.identify"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 7: translations and stretches ---------- */

const lesson7: FunctionsLesson = {
  id: "fn-7",
  title: "Lesson 7 · Translations and stretches",
  body: [
    "Change a function a little and its graph moves or stretches. Outside the bracket, changes act on y the way you expect. Inside the bracket, they act on x the OPPOSITE way.",
    "Today you play with the four transformations, track key points as they move, and write the exam description in full.",
  ],
  skills: [
    { id: "fn.tr", name: "Images of points" },
    { id: "fn.tr.describe", name: "Describing transformations" },
    { id: "fn.tr.equation", name: "Equations of transformed graphs" },
  ],
  parts: [
    {
      kind: "transform",
      title: "See it",
      text: "The grey curve is $y = f(x)$ with three key points A, B and C. Move one slider at a time and watch where the points go. The box below describes the transformation in exam language.",
      base: "(x - 1)^2 - 4",
      x: [-6, 6],
      y: [-8, 8],
      points: [
        { label: "A", x: 1 },
        { label: "B", x: 3 },
        { label: "C", x: -1 },
      ],
      sliders: ["shiftY", "shiftX", "stretchY", "stretchX"],
      questions: [
        { prompt: "Set $f(x + a)$ with $a = 2$. Which way does the minimum point A(1, −4) move?", options: ["Right, to (3, −4)", "Left, to (−1, −4)", "Up, to (1, −2)"], answer: 1, explain: "$f(x + 2)$ moves the graph LEFT by 2: the vector is $\\begin{pmatrix} -2 \\\\ 0 \\end{pmatrix}$. Inside the bracket, the opposite of what you expect." },
        { prompt: "Set $f(ax)$ with $a = 2$. Where does B(3, 0) go?", options: ["(6, 0)", "(1.5, 0)", "(3, 0)"], answer: 1, explain: "$f(2x)$ divides every x-coordinate by 2: a stretch parallel to the x-axis, scale factor $\\frac{1}{2}$." },
        { prompt: "Set $a f(x)$ with $a = 2$. What happens to A(1, −4)?", options: ["(1, −8)", "(2, −4)", "(1, −2)"], answer: 0, explain: "Outside: every y-coordinate is multiplied by 2. Points on the x-axis (like B and C) do not move." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy this table into your exercise book under the title “Transformations”.",
      lines: [
        L("y = f(x) + a: \\text{ translation } \\begin{pmatrix} 0 \\\\ a \\end{pmatrix}", "Outside: y-values go up by a."),
        L("y = f(x + a): \\text{ translation } \\begin{pmatrix} -a \\\\ 0 \\end{pmatrix}", "Inside: the graph moves LEFT by a."),
        L("y = af(x): \\text{ stretch parallel to the y-axis, scale factor } a", "Outside: y-values × a."),
        L("y = f(ax): \\text{ stretch parallel to the x-axis, scale factor } \\tfrac{1}{a}", "Inside: x-values ÷ a."),
        L("\\text{Why inside is opposite: } f(x + 2) \\text{ reaches each value 2 sooner}", "The new graph at x does what the old graph did at x + 2."),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "fn.tr.equation", seed: 707 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.tr.equation", hide: [-1] },
    { kind: "practice", title: "Your turn", generators: ["fn.tr.point", "fn.tr.describe", "fn.tr.equation"], count: 4 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Describe the transformation from $y = f(x)$ to $y = f(x - 3)$.",
          lines: ["x - 3 \\text{ means subtract } 3", "\\text{Translation } \\begin{pmatrix} -3 \\\\ 0 \\end{pmatrix}"],
          wrong: 1,
          options: ["Inside the bracket is the opposite way: translation $\\begin{pmatrix} 3 \\\\ 0 \\end{pmatrix}$, 3 to the RIGHT", "Translation $\\begin{pmatrix} 0 \\\\ -3 \\end{pmatrix}$", "The working is right"],
          answer: 0,
          explain: "$f(x - 3)$ moves the graph right by 3.",
        },
        {
          prompt: "Describe the transformation from $y = f(x)$ to $y = f(3x)$.",
          lines: ["\\text{Stretch parallel to the x-axis}", "\\text{Scale factor } 3"],
          wrong: 1,
          options: ["The scale factor is $\\frac{1}{3}$: x-values are divided by 3", "It is a stretch parallel to the y-axis", "The working is right"],
          answer: 0,
          explain: "Inside the bracket works the opposite way: $f(3x)$ squashes the graph to a third of its width.",
        },
        {
          prompt: "The point (4, 6) is on $y = f(x)$. Find its image on $y = f(x) - 2$.",
          lines: ["-2 \\text{ moves the graph left by } 2", "(2, 6)"],
          wrong: 0,
          options: ["$-2$ is OUTSIDE f: it moves the graph DOWN by 2, giving (4, 4)", "It moves the graph right: (6, 6)", "The answer (2, 6) is right"],
          answer: 0,
          explain: "Outside f acts on y. Only changes inside the bracket move the graph sideways.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.fn.transform" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain how f(x + a) and f(ax) change a graph, and why they seem to work the wrong way.",
      need: 2,
      ideas: [
        { id: "translate", text: "f(x + a) moves the graph left by a.", keywords: [["f(x + a)", "f(x+a)", "inside", "translat"], ["left", "opposite", "negative"]] },
        { id: "stretch", text: "f(ax) is a stretch parallel to the x-axis with scale factor 1/a.", keywords: [["stretch", "f(ax)", "squash"], ["1/a", "divide", "factor"]] },
        { id: "outside", text: "Changes outside f act on y, the way you expect.", keywords: [["outside"], ["y", "up", "down", "expect"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Translations and stretches",
        blocks: [
          { type: "rule", title: "Outside f (acts on y, as expected)", text: "$f(x) + a$: translation $\\begin{pmatrix} 0 \\\\ a \\end{pmatrix}$. $af(x)$: stretch parallel to the y-axis, scale factor a." },
          { type: "rule", title: "Inside the bracket (acts on x, the opposite way)", text: "$f(x + a)$: translation $\\begin{pmatrix} -a \\\\ 0 \\end{pmatrix}$. $f(ax)$: stretch parallel to the x-axis, scale factor $\\frac{1}{a}$." },
          {
            type: "example",
            title: "Example",
            prompt: "$f(x) = x^2 + 2x$ is translated by $\\begin{pmatrix} 3 \\\\ 0 \\end{pmatrix}$.",
            lines: [L("y = f(x - 3)", "Right 3: replace x by x − 3."), L("= (x - 3)^2 + 2(x - 3)"), L("= x^2 - 4x + 3")],
          },
          { type: "sketch", title: "Sketch: $y = x^2$ and $y = (x - 2)^2$", graph: { x: [-3, 5], y: [-1, 8], curves: [{ expr: "x^2", faint: true }, { expr: "(x - 2)^2" }] } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["fn.tr.point", "fn.tr.describe", "fn.tr.equation", "fn.tr.point", "fn.tr.describe"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 8: reflections and combined transformations ---------- */

const lesson8: FunctionsLesson = {
  id: "fn-8",
  title: "Lesson 8 · Reflections and combined transformations",
  body: [
    "A minus sign outside f flips the graph upside down; a minus sign inside flips it left to right.",
    "Exam questions often combine two or three transformations. Today you learn which order to apply them in, and how to describe each one fully.",
  ],
  skills: [
    { id: "fn.tr.reflect", name: "Reflections" },
    { id: "fn.tr.combined", name: "Combined transformations" },
  ],
  parts: [
    {
      kind: "transform",
      title: "See it",
      text: "The grey curve is $y = \\sqrt{x + 4} - 1$ with key points P, Q and R. Tick the reflections and move the sliders. Try a reflection AND a stretch together.",
      base: "sqrt(x + 4) - 1",
      x: [-7, 7],
      y: [-6, 6],
      points: [
        { label: "P", x: -4 },
        { label: "Q", x: 0 },
        { label: "R", x: 5 },
      ],
      sliders: ["reflectX", "reflectY", "shiftY", "stretchY"],
      questions: [
        { prompt: "Tick $-f(x)$. Where does Q(0, 1) go?", options: ["(0, −1)", "(0, 1)", "(−0, 1)"], answer: 0, explain: "$-f(x)$ changes the sign of every y-value: reflection in the x-axis." },
        { prompt: "Untick it and tick $f(-x)$. Where does R(5, 2) go?", options: ["(5, −2)", "(−5, 2)", "(−5, −2)"], answer: 1, explain: "$f(-x)$ changes the sign of every x-value: reflection in the y-axis." },
        { prompt: "For $y = 2f(x) + 1$, what happens to Q(0, 1)?", options: ["(0, 3): multiply by 2, then add 1", "(0, 4): add 1, then multiply by 2", "(0, 2)"], answer: 0, explain: "Outside f, follow the order of operations: ×2 first, then +1. So $1 \\to 2 \\to 3$." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Add these to your “Transformations” page.",
      lines: [
        L("y = -f(x): \\text{ reflection in the x-axis}", "y-values change sign."),
        L("y = f(-x): \\text{ reflection in the y-axis}", "x-values change sign."),
        L("y = af(x) + b: \\text{ stretch (y), THEN translate } \\begin{pmatrix} 0 \\\\ b \\end{pmatrix}", "Outside: follow the order of operations."),
        L("y = f(ax + b) = f\\left(a\\left(x + \\tfrac{b}{a}\\right)\\right)", "Inside: translate by $\\begin{pmatrix} -b \\\\ 0 \\end{pmatrix}$, then stretch by $\\frac{1}{a}$; or stretch first, then translate by $\\begin{pmatrix} -\\frac{b}{a} \\\\ 0 \\end{pmatrix}$."),
        L("\\text{“Describe fully”: name it, and give the vector, or the axis, or direction and scale factor}"),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "fn.tr.combined", seed: 808 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.tr.combined", hide: [2, -1] },
    { kind: "practice", title: "Your turn", generators: ["fn.tr.reflect", "fn.tr.combined", "fn.tr.sequence"], count: 4 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "The point (3, 5) is on $y = f(x)$. Find its image on $y = -f(x)$.",
          lines: ["\\text{The minus sign reflects in the y-axis}", "(-3, 5)"],
          wrong: 0,
          options: ["$-f(x)$ is OUTSIDE: reflection in the x-axis, so (3, −5)", "It reflects in $y = x$: (5, 3)", "The working is right"],
          answer: 0,
          explain: "Outside f, the minus acts on y. Inside the bracket, $f(-x)$, it would act on x.",
        },
        {
          prompt: "The point (2, 4) is on $y = f(x)$. Find its image on $y = 3f(x) - 1$.",
          lines: ["4 - 1 = 3", "3 \\times 3 = 9", "(2, 9)"],
          wrong: 0,
          options: ["Multiply first, then subtract: $3 \\times 4 - 1 = 11$, giving (2, 11)", "The x-coordinate should change", "The working is right"],
          answer: 0,
          explain: "$3f(x) - 1$ means 3 times the output, then subtract 1. Subtracting first would be $3(f(x) - 1)$.",
        },
        {
          prompt: "Describe fully the transformation from $y = f(x)$ to $y = f(-x)$.",
          lines: ["\\text{Reflection}"],
          wrong: 0,
          options: ["Not enough: “Reflection in the y-axis” (name the mirror line)", "“Reflection in the x-axis”", "“Rotation”"],
          answer: 0,
          explain: "“Describe fully” means name the transformation AND give its details. For a reflection, the mirror line.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.fn.combined" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain the difference between −f(x) and f(−x), and the order to use for y = af(x) + b.",
      need: 2,
      ideas: [
        { id: "xaxis", text: "−f(x) is a reflection in the x-axis.", keywords: [["-f(x)", "−f(x)", "minus outside", "outside"], ["x-axis", "x axis"]] },
        { id: "yaxis", text: "f(−x) is a reflection in the y-axis.", keywords: [["f(-x)", "f(−x)", "minus inside", "inside"], ["y-axis", "y axis"]] },
        { id: "order", text: "For af(x) + b, stretch first, then translate.", keywords: [["stretch", "multiply"], ["first", "then", "before"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Reflections and combined transformations",
        blocks: [
          { type: "rule", title: "Reflections", text: "$-f(x)$: reflection in the x-axis. $f(-x)$: reflection in the y-axis." },
          { type: "rule", title: "Order", text: "Outside f: order of operations (×, then +). Inside: work from x outwards." },
          {
            type: "example",
            title: "Example",
            prompt: "(1, 4) is on $y = f(x)$. Find its image on $y = 2f(x + 3) - 5$.",
            lines: [L("x: 1 - 3 = -2", "Inside: left 3."), L("y: 2 \\times 4 - 5 = 3", "Outside: ×2, then −5."), L("(-2, 3)")],
          },
          { type: "sketch", title: "Sketch: $y = \\sqrt{x}$ and $y = -\\sqrt{x}$", graph: { x: [-1, 6], y: [-3, 3], curves: [{ expr: "sqrt(x)", faint: true }, { expr: "-sqrt(x)" }] } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["fn.tr.reflect", "fn.tr.combined", "fn.tr.sequence", "fn.tr.combined", "fn.tr.reflect"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 9: graph sketching ---------- */

const lesson9: FunctionsLesson = {
  id: "fn-9",
  title: "Lesson 9 · Sketching graphs",
  body: [
    "A sketch is not a careful plot. It shows the shape and the key features: where it crosses the axes, turning points, asymptotes and what happens for large x.",
    "Today you sketch on paper, compare with the real graph, and learn the two modulus graphs: y = |f(x)| and y = f(|x|), which link to modulus in the Algebra topic.",
  ],
  skills: [
    { id: "fn.sketch", name: "Sketching curves" },
    { id: "fn.sketch.modulus", name: "Modulus graphs" },
  ],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "The curve is $y = x^2 - 2x - 3$ and the coloured part is below the x-axis. To draw $y = |f(x)|$, that part is REFLECTED up in the x-axis, not deleted.",
      graph: { x: [-3, 5], y: [-5, 6], curves: [{ expr: "x^2 - 2x - 3" }, { expr: "|x^2 - 2x - 3|", colour: "#b8452b" }], highlight: "below" },
      questions: [
        { prompt: "Where does $y = x^2 - 2x - 3$ cross the x-axis?", options: ["$x = -1$ and $x = 3$", "$x = 1$ and $x = -3$", "$x = -3$ only"], answer: 0, explain: "$(x + 1)(x - 3) = 0$." },
        { prompt: "The minimum of f is $(1, -4)$. What happens to it on $y = |f(x)|$?", options: ["It becomes a maximum at $(1, 4)$", "It disappears", "It stays at $(1, -4)$"], answer: 0, explain: "Reflecting in the x-axis turns $(1, -4)$ into $(1, 4)$: the minimum becomes a maximum." },
        { prompt: "Can $y = |f(x)|$ ever go below the x-axis?", options: ["No, a modulus is never negative", "Yes, between the roots"], answer: 0, explain: "$|f(x)| \\ge 0$ for every x." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy this checklist into your exercise book. Use it for every sketch.",
      lines: [
        L("1. \\; x = 0: \\text{ where it crosses the y-axis}"),
        L("2. \\; y = 0: \\text{ where it crosses the x-axis (factorise)}"),
        L("3. \\; \\text{Turning points (complete the square for a quadratic)}"),
        L("4. \\; \\text{Asymptotes: bottom} = 0, \\text{ and what y tends to}"),
        L("5. \\; \\text{Large } x: \\text{ where do the ends go?}"),
        L("y = |f(x)|: \\text{ reflect the parts below the x-axis upwards}"),
        L("y = f(|x|): \\text{ keep } x \\ge 0, \\text{ reflect it in the y-axis}"),
      ],
    },
    { kind: "sketch", title: "Sketch and compare", generator: "fn.sketch.curve" },
    { kind: "worked", title: "Do it with me", generator: "fn.sketch.modValues", seed: 909 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.sketch.modValues", hide: [0, 1] },
    { kind: "practice", title: "Your turn", generators: ["fn.sketch.modulus", "fn.sketch.modValues", "fn.sketch.modulus"], count: 3 },
    { kind: "sketch", title: "Sketch another", generator: "fn.sketch.curve" },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Sketch $y = |x^2 - 4|$.",
          lines: ["x^2 - 4 < 0 \\text{ for } -2 < x < 2", "\\text{Remove that part of the curve}", "\\text{Keep the two outer pieces}"],
          wrong: 1,
          options: ["REFLECT that part in the x-axis: it becomes a hump with maximum (0, 4)", "Shift it up by 4", "The working is right"],
          answer: 0,
          explain: "The modulus makes negative outputs positive: $(0, -4) \\to (0, 4)$. Nothing is deleted.",
        },
        {
          prompt: "Sketch $y = f(|x|)$ where $f(x) = (x - 1)(x - 3)$.",
          lines: ["\\text{Reflect the part below the x-axis}"],
          wrong: 0,
          options: ["That is $|f(x)|$. For $f(|x|)$, keep the part for $x \\ge 0$ and reflect it in the y-axis", "Reflect in the line $y = x$", "Delete the left half"],
          answer: 0,
          explain: "Modulus outside: acts on outputs. Modulus inside: acts on inputs, so the graph becomes symmetrical about the y-axis.",
        },
        {
          prompt: "Find where $y = \\frac{2}{x - 1} + 1$ crosses the x-axis.",
          lines: ["x = 0: \\; y = -1", "\\text{So it crosses the x-axis at } -1"],
          wrong: 1,
          options: ["$x = 0$ gives the y-intercept. For the x-axis, put $y = 0$: $\\frac{2}{x - 1} = -1$, so $x = -1$", "It never crosses the x-axis", "The working is right"],
          answer: 0,
          explain: "x-axis: y = 0. y-axis: x = 0. Here both happen to involve −1, but they are different points: (−1, 0) and (0, −1).",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.fn.sketch" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "List what a good sketch must show, and explain how to draw y = |f(x)| from y = f(x).",
      need: 2,
      ideas: [
        { id: "axes", text: "Show where the curve crosses the axes.", keywords: [["cross", "intercept", "meets", "cuts"], ["axes", "axis"]] },
        { id: "features", text: "Show turning points and asymptotes.", keywords: [["turning", "asymptote", "maximum", "minimum", "vertex"]] },
        { id: "modulus", text: "For |f(x)|, reflect the part below the x-axis upwards.", keywords: [["reflect", "flip", "mirror"], ["below", "negative", "under"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Sketching graphs",
        blocks: [
          { type: "rule", title: "Checklist", text: "Axes crossings (x = 0, y = 0), turning points, asymptotes, behaviour for large x. Label every key point with its coordinates." },
          { type: "rule", title: "Modulus graphs", text: "$y = |f(x)|$: reflect the parts below the x-axis upwards. $y = f(|x|)$: keep $x \\ge 0$, reflect it in the y-axis." },
          { type: "sketch", title: "Sketch: $y = |x^2 - 2x - 3|$", graph: { x: [-3, 5], y: [-1, 6], curves: [{ expr: "|x^2 - 2x - 3|" }], points: [{ x: -1, y: 0, label: "−1" }, { x: 3, y: 0, label: "3" }, { x: 1, y: 4, label: "(1, 4)" }, { x: 0, y: 3, label: "(0, 3)" }] } },
          { type: "sketch", title: "Sketch: $y = \\frac{2}{x - 1} + 1$", graph: { x: [-5, 6], y: [-5, 6], curves: [{ expr: "2/(x - 1) + 1" }], asymptotes: [{ x: 1 }, { y: 1 }], points: [{ x: 0, y: -1, label: "(0, −1)" }, { x: -1, y: 0, label: "(−1, 0)" }] } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["fn.sketch.modulus", "fn.sketch.modValues", "fn.graph.asymptotes", "fn.sketch.modulus", "fn.sketch.modValues"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 10: topic review ---------- */

const lesson10: FunctionsLesson = {
  id: "fn-10",
  title: "Lesson 10 · Topic review",
  body: [
    "This lesson brings the whole topic together: notation, domain and range, composite and inverse functions, transformations and sketching.",
    "Finish with a full exam question and the topic mastery check. If a skill shows as weak on your skills map, go back to its lesson.",
  ],
  skills: [{ id: "fn.review", name: "Mixed exam questions" }],
  parts: [
    {
      kind: "see",
      title: "See it all together",
      text: "The curve is $f(x) = (x - 1)^2 + 1$, $x \\ge 1$ (blue), its inverse (red) and the line $y = x$. Use it to answer these review questions.",
      graph: { x: [-1, 7], y: [-1, 7], curves: [{ expr: "(sqrt(x - 1))^4 + 1" }, { expr: "1 + sqrt(x - 1)", colour: "#b8452b" }, { expr: "x", faint: true }], points: [{ x: 1, y: 1, label: "(1, 1)" }, { x: 2, y: 2, label: "(2, 2)" }] },
      questions: [
        { prompt: "What is the range of f?", options: ["$f(x) \\ge 1$", "$x \\ge 1$", "$f(x) \\ge 0$", "All real numbers"], answer: 0, explain: "The least output is $f(1) = 1$. Write it with f(x)." },
        { prompt: "What is $f^{-1}(x)$?", options: ["$1 + \\sqrt{x - 1}$", "$1 - \\sqrt{x - 1}$", "$\\frac{1}{(x - 1)^2 + 1}$", "$\\sqrt{x} - 1$"], answer: 0, explain: "$y - 1 = (x - 1)^2 \\Rightarrow x = 1 + \\sqrt{y - 1}$ (positive root, since $x \\ge 1$)." },
        { prompt: "Where do f and $f^{-1}$ meet?", options: ["Only on $y = x$: at (1, 1) and (2, 2)", "Nowhere", "At (0, 0)"], answer: 0, explain: "$(x - 1)^2 + 1 = x \\Rightarrow x^2 - 3x + 2 = 0 \\Rightarrow x = 1$ or $x = 2$." },
        { prompt: "The curve $y = f(x)$ is translated by $\\begin{pmatrix} 2 \\\\ 0 \\end{pmatrix}$. What is the new equation?", options: ["$y = (x - 3)^2 + 1$", "$y = (x + 1)^2 + 1$", "$y = (x - 1)^2 + 3$"], answer: 0, explain: "Right 2: replace x by $x - 2$, giving $(x - 2 - 1)^2 + 1 = (x - 3)^2 + 1$." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Write this one-page summary in your exercise book. It is your revision sheet for the whole topic.",
      lines: [
        L("\\text{Function: one output per input. Domain: inputs. Range: outputs, written with } f(x)"),
        L("fg(x) = f(g(x)): \\; g \\text{ first}"),
        L("f^{-1}: \\; y = f(x), \\text{ make } x \\text{ the subject; domain of } f^{-1} = \\text{range of } f"),
        L("y = f^{-1}(x) \\text{ is the reflection of } y = f(x) \\text{ in } y = x"),
        L("\\text{Outside f acts on y as expected; inside acts on x the opposite way}"),
        L("|f(x)|: \\text{ reflect the negative parts up}; \\quad f(|x|): \\text{ reflect the right half in the y-axis}"),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "fn.inv.domain", seed: 1010 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.inv.domain", hide: [-1] },
    { kind: "practice", title: "Mixed practice", generators: ["fn.range", "fn.comp.expr", "fn.inv.expr", "fn.inv.solve", "fn.tr.combined", "fn.sketch.modulus"], count: 6 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "$f(x) = 2x + 1$, $g(x) = x^2$. Find $gf(x)$.",
          lines: ["gf(x) = g(f(x))", "= 2x^2 + 1"],
          wrong: 1,
          options: ["$gf$ means f first, then g: $(2x + 1)^2 = 4x^2 + 4x + 1$", "The answer $2x^2 + 1$ is right", "$gf(x) = 2x + 1 + x^2$"],
          answer: 0,
          explain: "$2x^2 + 1$ is $fg(x)$. For $gf$, square the whole of $f(x)$.",
        },
        {
          prompt: "$h(x) = \\frac{4}{x - 2}$, $x \\ne 2$. Find $h^{-1}(x)$ and its domain.",
          lines: ["h^{-1}(x) = \\frac{x - 2}{4}", "\\text{Domain: } x \\in \\mathbb{R}"],
          wrong: 0,
          options: ["That is $\\frac{1}{h(x)}$. Rearranging: $h^{-1}(x) = \\frac{4}{x} + 2$, $x \\ne 0$", "The working is right", "$h^{-1}(x) = \\frac{x}{4} + 2$"],
          answer: 0,
          explain: "Use the method: $y(x - 2) = 4 \\Rightarrow x = \\frac{4}{y} + 2$. h is never 0, so the domain of $h^{-1}$ is $x \\ne 0$.",
        },
        {
          prompt: "The minimum of $y = f(x)$ is $(2, -3)$. Find the minimum of $y = f(2x) + 1$.",
          lines: ["x: 2 \\times 2 = 4", "y: -3 + 1 = -2", "(4, -2)"],
          wrong: 0,
          options: ["$f(2x)$ DIVIDES x by 2: the minimum is (1, −2)", "y should be −4", "The working is right"],
          answer: 0,
          explain: "Inside the bracket works the opposite way: scale factor $\\frac{1}{2}$ parallel to the x-axis.",
        },
      ],
    },
    { kind: "exam", title: "Full exam question", generator: "exam.fn.full" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "In a few sentences, explain the three ideas from this topic you most need to remember in the exam.",
      need: 3,
      ideas: [
        { id: "comp", text: "In fg, g acts first.", keywords: [["fg", "composite"], ["first", "inside", "then"]] },
        { id: "inv", text: "The domain of the inverse is the range of f, and its graph is a reflection in y = x.", keywords: [["inverse"], ["range", "reflect", "y = x", "y=x", "swap"]] },
        { id: "tr", text: "Changes inside the bracket act on x the opposite way.", keywords: [["inside", "bracket", "f(x + a)", "f(ax)"], ["opposite", "left", "divide", "1/a"]] },
        { id: "range", text: "Write the range with f(x), not x.", keywords: [["range"], ["f(x)", "output"]] },
        { id: "mod", text: "For |f(x)|, reflect the negative part up instead of deleting it.", keywords: [["|f(x)|", "modulus"], ["reflect", "flip"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Functions: the whole topic",
        blocks: [
          { type: "rule", title: "Composite and inverse", text: "$fg(x) = f(g(x))$. $f^{-1}$: y = f(x), make x the subject. Domain of $f^{-1}$ = range of f. Only one-to-one functions have inverses." },
          { type: "rule", title: "Transformations", text: "$f(x) + a$ up a; $f(x + a)$ left a; $af(x)$ y × a; $f(ax)$ x ÷ a; $-f(x)$ reflect in x-axis; $f(-x)$ reflect in y-axis." },
          { type: "rule", title: "Sketching", text: "Axes crossings, turning points, asymptotes, large x. $|f(x)|$: reflect negative parts up." },
          { type: "sketch", title: "Sketch: f, f⁻¹ and y = x", graph: { x: [-1, 7], y: [-1, 7], curves: [{ expr: "(sqrt(x - 1))^4 + 1" }, { expr: "1 + sqrt(x - 1)" }, { expr: "x", faint: true }] } },
        ],
      },
    },
    {
      kind: "mastery",
      title: "Topic mastery check",
      generators: ["fn.map.lineTest", "fn.range", "fn.comp.eval", "fn.comp.expr", "fn.inv.expr", "fn.inv.domain", "fn.inv.solve", "fn.graph.asymptotes", "fn.tr.point", "fn.tr.combined", "fn.sketch.modulus"],
      count: 10,
      need: 8,
    },
  ],
};

export const lessons2: FunctionsLesson[] = [lesson6, lesson7, lesson8, lesson9, lesson10];
