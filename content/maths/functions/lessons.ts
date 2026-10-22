/**
 * Functions lessons 0–5 (GCE A Level Pure Mathematics). Each lesson follows the lesson rhythm:
 * see it → understand why → do it with me → fill the gaps → your turn → traps → exam style →
 * say it back → notebook page → mastery check. Maths in text goes between $…$.
 * Question generators are in ./generators.ts; hints for common errors in ./misconceptions.json.
 * Lessons 6–10 are in ./lessons-2.ts.
 */
import type { LessonPart, SolutionLine } from "@/lib/maths/types";
import { lessons2 } from "./lessons-2";

export type FunctionsLesson = { id: string; title: string; body: string[]; skills: { id: string; name: string }[]; parts: LessonPart[] };

const L = (latex: string, note?: string, mark?: string): SolutionLine => ({ latex, note, mark });

/* ---------- Lesson 0: check your foundations ---------- */

const lesson0: FunctionsLesson = {
  id: "fn-0",
  title: "Lesson 0 · Check your foundations",
  body: [
    "Functions use skills you already have: substitution, solving equations, reading graphs, interval notation, and from the Algebra topic: factorising, quadratic inequalities and modulus.",
    "This short check finds any gaps and repairs them before you start. Have your exercise book and a pen ready.",
  ],
  skills: [
    { id: "fn.pre.solve", name: "Solving linear equations" },
    { id: "fn.pre.graphs", name: "Plotting and reading graphs" },
    { id: "fn.pre.interval", name: "Inequalities and interval notation" },
    { id: "pre.substitute", name: "Substitution" },
    { id: "pre.rearrange", name: "Rearranging formulae" },
    { id: "pre.factorise", name: "Factorising quadratics" },
    { id: "alg.ineq", name: "Quadratic inequalities" },
    { id: "alg.mod", name: "Modulus" },
  ],
  parts: [
    {
      kind: "diagnostic",
      title: "Starting check",
      perSkill: 1,
      skills: [
        {
          id: "pre.substitute",
          name: "Substitution",
          generator: "pre.substitute",
          explain: "Replace the letter by the number IN BRACKETS, then follow the order of operations. This is exactly what $f(3)$ means.",
          repair: [L("x^2 - 3x \\text{ when } x = -2"), L("= (-2)^2 - 3(-2)", "Brackets round the value."), L("= 4 + 6 = 10")],
        },
        {
          id: "fn.pre.solve",
          name: "Solving linear equations",
          generator: "fn.pre.solve",
          explain: "Do the same to both sides. A term that crosses to the other side changes its operation: $+5$ becomes $-5$.",
          repair: [L("3x + 5 = 17"), L("3x = 17 - 5 = 12", "Subtract 5 from both sides."), L("x = 4", "Divide both sides by 3.")],
        },
        {
          id: "pre.rearrange",
          name: "Rearranging formulae",
          generator: "pre.rearrange",
          explain: "Undo the operations in reverse order: the last thing done is the first thing undone. You will use this for every inverse function.",
          repair: [L("y = 3x + 5"), L("y - 5 = 3x", "Undo the +5 first."), L("x = \\frac{y - 5}{3}", "Then undo the ×3.")],
        },
        {
          id: "fn.pre.graphs",
          name: "Plotting and reading graphs",
          generator: "fn.pre.readGraph",
          explain: "A point is (x, y): across first, then up. To read f(a), start at a on the x-axis, go to the curve, then across to the y-axis.",
          repair: [L("(2, 5): \\; x = 2, \\; y = 5", "Across 2, up 5."), L("y = 2x + 1 \\text{ at } x = 2: \\; y = 5", "So (2, 5) is on the line.")],
        },
        {
          id: "fn.pre.interval",
          name: "Inequalities and interval notation",
          generator: "fn.pre.interval",
          explain: "A square bracket includes the end ($\\le$, $\\ge$); a round bracket leaves it out ($<$, $>$). Infinity always takes a round bracket.",
          repair: [L("-2 < x \\le 5 \\iff x \\in (-2, 5]", "−2 is not included, 5 is."), L("x \\ge 3 \\iff x \\in [3, \\infty)")],
        },
        {
          id: "pre.factorise",
          name: "Factorising quadratics",
          generator: "pre.factorise",
          explain: "For $x^2 + bx + c$, find two numbers that multiply to $c$ and add to $b$. You need this to find roots when sketching.",
          repair: [L("x^2 - x - 6", "Multiply to −6, add to −1: −3 and 2."), L("= (x - 3)(x + 2)")],
        },
        {
          id: "alg.ineq",
          name: "Quadratic inequalities",
          generator: "alg.ineq.quad",
          explain: "Find the roots, sketch the U-shaped curve, and read off where it is below (or above) the x-axis. You will use this to find ranges and domains.",
          repair: [L("(x - 1)(x - 4) < 0", "Roots 1 and 4."), L("\\text{The U is below the axis between the roots}"), L("1 < x < 4")],
        },
        {
          id: "alg.mod",
          name: "Modulus equations",
          generator: "alg.mod.eq",
          explain: "$|A| = k$ means $A = k$ or $A = -k$. In lesson 9 you will draw $y = |f(x)|$ by reflecting the negative part of a graph.",
          repair: [L("|x - 3| = 5"), L("x - 3 = 5 \\text{ or } x - 3 = -5"), L("x = 8 \\text{ or } x = -2")],
        },
      ],
    },
  ],
};

/* ---------- Lesson 1: what is a function? ---------- */

const lesson1: FunctionsLesson = {
  id: "fn-1",
  title: "Lesson 1 · What is a function?",
  body: [
    "A function is a machine: you put a number in, it gives exactly one number out. Taxi fares, phone credit and exam marks all work like this.",
    "Today you learn the words examiners use: one-to-one, many-to-one, and why one-to-many is not a function. Then you test graphs with a vertical line.",
  ],
  skills: [
    { id: "fn.map", name: "Mappings: one-to-one, many-to-one" },
    { id: "fn.map.graph", name: "Line tests on graphs" },
  ],
  parts: [
    {
      kind: "machine",
      title: "See it",
      text: "A taxi in Bamenda charges 300 FCFA to start and 100 FCFA for every kilometre. As a machine: input $x$ km, output $100x + 300$ FCFA. Type a distance and press Run.",
      machines: [{ name: "f", expr: "100x + 300", inverse: "(x - 300)/100" }],
      order: ["f"],
      questions: [
        { prompt: "Run the machine with $x = 4$. What comes out?", options: ["400", "700", "1300", "430"], answer: 1, explain: "$f(4) = 100 \\times 4 + 300 = 700$ FCFA." },
        { prompt: "Run $x = 4$ again. Can the machine ever give a different answer for the same input?", options: ["Yes, sometimes", "No: one input always gives the same one output"], answer: 1, explain: "That is what makes it a function: each input gives exactly ONE output, every time." },
        { prompt: "Tabi paid 1100 FCFA. How far did she travel?", options: ["8 km", "11 km", "14 km", "1.1 km"], answer: 0, explain: "Work backwards: $1100 - 300 = 800$, then $800 \\div 100 = 8$ km. Running a machine backwards is the idea behind inverse functions (lesson 4)." },
      ],
    },
    {
      kind: "see",
      title: "See it: the vertical line test",
      text: "Drag the blue vertical line across the circle. Count the points where it meets the curve. A function can only give ONE output (y) for each input (x).",
      graph: {
        x: [-5, 5],
        y: [-5, 5],
        curves: [{ expr: "", param: { x: "3cos(t)", y: "3sin(t)", t: [0, 6.2832] } }],
        params: [{ name: "c", label: "x = c", min: -4.5, max: 4.5, step: 0.1, value: 1 }],
        lineTest: { param: "c", dir: "vertical" },
      },
      questions: [
        { prompt: "Put the line at $x = 1$. How many points does it meet?", options: ["0", "1", "2", "3"], answer: 2, explain: "Two points: $x = 1$ gives two values of y, one above and one below." },
        { prompt: "So is the circle the graph of a function?", options: ["Yes", "No"], answer: 1, explain: "No. One input with two outputs breaks the rule. This is a one-to-many relation." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy these into your exercise book under the title “Functions”. Draw a small mapping diagram next to each type.",
      lines: [
        L("\\text{A function maps each input to exactly one output}", "The inputs are the domain, the outputs the range."),
        L("\\text{One-to-one: different inputs always give different outputs}", "Example: $x \\mapsto 2x + 1$."),
        L("\\text{Many-to-one: two or more inputs share an output}", "Example: $x \\mapsto x^2$, since $3 \\mapsto 9$ and $-3 \\mapsto 9$. Still a function."),
        L("\\text{One-to-many: one input has two or more outputs}", "Example: $x \\mapsto \\pm\\sqrt{x}$. NOT a function."),
        L("\\text{Vertical line meets graph at most once} \\Rightarrow \\text{function}"),
        L("\\text{Horizontal line meets it at most once} \\Rightarrow \\text{one-to-one}"),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "fn.map.classify", seed: 31 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.eval", hide: [-1] },
    { kind: "practice", title: "Your turn", generators: ["fn.map.classify", "fn.map.lineTest", "fn.map.lineTest"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Is $x \\mapsto x^2$, $x \\in \\mathbb{R}$, a function?",
          lines: ["3 \\mapsto 9 \\text{ and } -3 \\mapsto 9", "\\text{Two arrows go to } 9", "\\text{So it is not a function}"],
          wrong: 2,
          options: ["It IS a function: each input still has one output (many-to-one is allowed)", "It is not a function because 9 has two arrows", "It is one-to-one"],
          answer: 0,
          explain: "Two inputs sharing an output is allowed. Only one input with two outputs breaks the rule.",
        },
        {
          prompt: "Use the vertical line test on the sideways parabola $x = y^2$.",
          lines: ["\\text{Horizontal lines meet it once}", "\\text{So it is a function}"],
          wrong: 1,
          options: ["Use VERTICAL lines to test for a function: $x = 4$ meets it at $y = 2$ and $y = -2$, so not a function", "Horizontal lines are right, so it is a function", "It is one-to-one"],
          answer: 0,
          explain: "Vertical line test: function or not. Horizontal line test: one-to-one or not (only for functions).",
        },
        {
          prompt: "Classify the mapping $\\{1, 4\\} \\to \\{-2, -1, 1, 2\\}$, $x \\mapsto \\pm\\sqrt{x}$.",
          lines: ["1 \\mapsto 1, \\; 1 \\mapsto -1, \\; 4 \\mapsto 2, \\; 4 \\mapsto -2", "\\text{Every output has one arrow}", "\\text{So it is one-to-one}"],
          wrong: 2,
          options: ["Each input has TWO arrows: one-to-many, so not a function", "It is many-to-one", "It is one-to-one"],
          answer: 0,
          explain: "Count arrows OUT of each input first. Two arrows out of one input: one-to-many.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.fn.basics" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "In one or two sentences, explain what makes a mapping a function, and how the vertical line test shows it.",
      need: 2,
      ideas: [
        { id: "one", text: "A function gives exactly one output for each input.", keywords: [["one", "single", "only", "unique"], ["output", "value", "answer", "image"]] },
        { id: "vertical", text: "A vertical line meets the graph of a function at most once.", keywords: [["vertical"], ["once", "one point", "1 point", "one place", "twice", "two"]] },
        { id: "many", text: "Many-to-one is still a function, but one-to-many is not.", keywords: [["many-to-one", "many to one", "one-to-many", "one to many"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "What is a function?",
        blocks: [
          { type: "definition", title: "Definition", text: "A function maps every input in its domain to exactly ONE output." },
          { type: "rule", title: "Types", text: "One-to-one: different inputs, different outputs. Many-to-one: inputs can share an output (still a function). One-to-many: NOT a function." },
          { type: "rule", title: "Line tests", text: "Vertical line meets the graph at most once: function. Horizontal line meets it at most once: one-to-one." },
          { type: "sketch", title: "Sketch: $y = x^2$ is many-to-one", graph: { x: [-3, 3], y: [-1, 9], curves: [{ expr: "x^2" }, { expr: "4", faint: true }], points: [{ x: -2, y: 4, label: "(−2, 4)" }, { x: 2, y: 4, label: "(2, 4)" }] } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["fn.map.classify", "fn.map.lineTest", "fn.map.classify", "fn.map.lineTest", "fn.eval"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 2: notation, domain and range ---------- */

const lesson2: FunctionsLesson = {
  id: "fn-2",
  title: "Lesson 2 · Notation, domain and range",
  body: [
    "Examiners write functions in two ways: f(x) = 2x + 1 and f: x ↦ 2x + 1. Both mean the same machine.",
    "Every function comes with a domain (the inputs allowed) and a range (the outputs it gives). Today you find both, from the formula and from the graph.",
  ],
  skills: [
    { id: "fn.notation", name: "Function notation" },
    { id: "fn.domain", name: "Finding the domain" },
    { id: "fn.range", name: "Finding the range" },
  ],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "The blue bar on the x-axis is the domain: drag its ends with the sliders. The red bar on the y-axis is the range: every output the curve gives for those inputs.",
      graph: {
        x: [-3, 5],
        y: [-4, 10],
        curves: [{ expr: "(x - 1)^2 - 3" }],
        params: [
          { name: "p", label: "Domain starts at", min: -3, max: 5, step: 0.5, value: 2 },
          { name: "q", label: "Domain ends at", min: -3, max: 5, step: 0.5, value: 4 },
        ],
        domainRange: { from: "p", to: "q" },
      },
      questions: [
        { prompt: "Set the domain to $2 \\le x \\le 4$. What is the range?", options: ["$-2 \\le f(x) \\le 6$", "$2 \\le f(x) \\le 4$", "$-3 \\le f(x) \\le 6$", "$0 \\le f(x) \\le 6$"], answer: 0, explain: "$f(2) = -2$ and $f(4) = 6$. The curve rises the whole way, so the outputs run from $-2$ to $6$." },
        { prompt: "Now set the domain to $-1 \\le x \\le 3$. What is the least value of f?", options: ["$f(-1) = 1$", "$-3$, at the turning point", "$f(3) = 1$", "$0$"], answer: 1, explain: "The domain now contains the minimum point $(1, -3)$. The least output is $-3$, not a value at either end." },
        { prompt: "Which bar describes the range?", options: ["The blue bar on the x-axis", "The red bar on the y-axis"], answer: 1, explain: "The range is a set of OUTPUTS, so it lives on the y-axis. Write it with f(x): $-3 \\le f(x) \\le 1$." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy these into your exercise book under the title “Domain and range”.",
      lines: [
        L("f(x) = 2x + 1 \\quad \\text{or} \\quad f: x \\mapsto 2x + 1", "Two ways to write the same function. Read ↦ as “maps to”."),
        L("x \\in \\mathbb{R}", "x is any real number. $\\mathbb{R}$ is the set of real numbers."),
        L("\\text{Domain: the set of inputs}", "Given with the function, or the largest set where the formula works."),
        L("\\sqrt{\\;}: \\text{ the inside must be } \\ge 0 \\qquad \\tfrac{1}{\\;}: \\text{ the bottom must not be } 0"),
        L("\\text{Range: the set of outputs, written with } f(x)", "For example $f(x) \\ge -3$, never $x \\ge -3$."),
        L("[a, b] = \\{x : a \\le x \\le b\\}, \\quad (a, b) = \\{x : a < x < b\\}"),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "fn.range", seed: 777 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.domain", hide: [-1] },
    { kind: "practice", title: "Your turn", generators: ["fn.eval", "fn.domain", "fn.range"], count: 4 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Find the range of $f(x) = (x - 3)^2 + 2$, $x \\in \\mathbb{R}$.",
          lines: ["(x - 3)^2 \\ge 0", "\\text{Least value when } x = 3", "x \\ge 3"],
          wrong: 2,
          options: ["The range is about outputs: $f(x) \\ge 2$", "The answer $x \\ge 3$ is right", "$f(x) \\ge 3$"],
          answer: 0,
          explain: "The least OUTPUT is $f(3) = 2$. Write the range with f(x): $f(x) \\ge 2$.",
        },
        {
          prompt: "Find the domain of $g(x) = \\sqrt{x - 4}$.",
          lines: ["x - 4 > 0", "x > 4"],
          wrong: 0,
          options: ["$\\sqrt{0} = 0$ is allowed, so $x - 4 \\ge 0$ and $x \\ge 4$", "It should be $x - 4 < 0$", "The domain is all real numbers"],
          answer: 0,
          explain: "The inside of a square root can be zero. Use $\\ge$, not $>$.",
        },
        {
          prompt: "Find $f(-3)$ for $f(x) = 2x^2 - x$.",
          lines: ["f(-3) = 2 \\times -3^2 - (-3)", "= -18 + 3", "= -15"],
          wrong: 0,
          options: ["Use brackets: $2(-3)^2 = 2 \\times 9 = 18$, so $f(-3) = 21$", "$-(-3)$ should be $-3$", "The answer is $15$"],
          answer: 0,
          explain: "Always put the input in brackets: $(-3)^2 = 9$, so $f(-3) = 18 + 3 = 21$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.fn.range" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain the difference between the domain and the range of a function, and how you write the range.",
      need: 2,
      ideas: [
        { id: "domain", text: "The domain is the set of inputs, the x values allowed.", keywords: [["domain"], ["input", "x value", "x-value", "values of x"]] },
        { id: "range", text: "The range is the set of outputs the function gives.", keywords: [["range"], ["output", "y value", "y-value", "f(x)", "values of f"]] },
        { id: "fx", text: "Write the range using f(x), not x.", keywords: [["f(x)", "y"], ["not x", "instead of x", "never x", "not using x", "using f"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Domain and range",
        blocks: [
          { type: "definition", title: "Notation", text: "$f(x) = 2x + 1$ and $f: x \\mapsto 2x + 1$ mean the same. $x \\in \\mathbb{R}$: x is any real number." },
          { type: "rule", title: "Largest domain", text: "Square root: inside $\\ge 0$. Fraction: bottom $\\ne 0$." },
          { type: "rule", title: "Range", text: "The set of outputs. Write it with f(x). For a quadratic, complete the square and check if the turning point is in the domain." },
          {
            type: "example",
            title: "Example",
            prompt: "Range of $f(x) = x^2 - 2x - 2$, $-1 \\le x \\le 4$:",
            lines: [L("f(x) = (x - 1)^2 - 3", "Turning point (1, −3) is in the domain."), L("f(-1) = 1, \\; f(4) = 6"), L("-3 \\le f(x) \\le 6")],
          },
          { type: "sketch", title: "Sketch", graph: { x: [-2, 5], y: [-4, 7], curves: [{ expr: "(x - 1)^2 - 3" }], points: [{ x: 1, y: -3, label: "(1, −3)" }, { x: -1, y: 1 }, { x: 4, y: 6 }] } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["fn.eval", "fn.domain", "fn.range", "fn.range", "fn.domain"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 3: composite functions ---------- */

const lesson3: FunctionsLesson = {
  id: "fn-3",
  title: "Lesson 3 · Composite functions",
  body: [
    "A composite function is two machines joined together: the output of the first becomes the input of the second.",
    "The most common mistake in the exam is the order. fg(x) means do g FIRST, then f. Today you see why, and how to find fg(x) and solve fg(x) = k.",
  ],
  skills: [
    { id: "fn.comp", name: "Evaluating composite functions" },
    { id: "fn.comp.expr", name: "Finding fg(x)" },
    { id: "fn.comp.solve", name: "Solving fg(x) = k" },
  ],
  parts: [
    {
      kind: "machine",
      title: "See it",
      text: "Here is $fg$, with $f(x) = 2x + 3$ and $g(x) = x^2$. The input goes into $g$ first (the letter next to x), then the result goes into $f$. Try a few inputs.",
      machines: [
        { name: "f", expr: "2x + 3", inverse: "(x - 3)/2" },
        { name: "g", expr: "x^2", inverse: "sqrt(x)" },
      ],
      order: ["g", "f"],
      questions: [
        { prompt: "Run the input 3. What is $fg(3)$?", options: ["9", "21", "81", "15"], answer: 1, explain: "$g(3) = 9$, then $f(9) = 2(9) + 3 = 21$." },
        { prompt: "What would $gf(3)$ be (f first, then g)?", options: ["21", "81", "9", "36"], answer: 1, explain: "$f(3) = 9$, then $g(9) = 81$. So $fg(3) \\ne gf(3)$: the order matters." },
        { prompt: "Write $fg(x)$ as one expression.", options: ["$2x^2 + 3$", "$(2x + 3)^2$", "$2x + 3 + x^2$", "$4x^2 + 9$"], answer: 0, explain: "Put $g(x) = x^2$ in place of x in f: $f(x^2) = 2x^2 + 3$." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy this into your exercise book under the title “Composite functions”.",
      lines: [
        L("fg(x) = f(g(x))", "Read from the inside out: g acts first, then f."),
        L("\\text{Input } x \\xrightarrow{\\;g\\;} g(x) \\xrightarrow{\\;f\\;} f(g(x))"),
        L("fg(x) \\ne gf(x) \\text{ in general}", "Always check which letter is next to x."),
        L("f^2(x) = ff(x) = f(f(x))", "The same machine twice. Not $(f(x))^2$."),
        L("\\text{For } fg \\text{ to exist, the range of } g \\text{ must lie in the domain of } f"),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "fn.comp.expr", seed: 2024 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.comp.eval", hide: [1, 2] },
    { kind: "practice", title: "Your turn", generators: ["fn.comp.eval", "fn.comp.expr", "fn.comp.solve"], count: 4 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "$f(x) = x + 4$ and $g(x) = 3x$. Find $fg(2)$.",
          lines: ["f(2) = 6", "g(6) = 18", "fg(2) = 18"],
          wrong: 0,
          options: ["$fg$ means g first: $g(2) = 6$, then $f(6) = 10$", "$f(2)$ should be 8", "The answer 18 is right"],
          answer: 0,
          explain: "The function next to x acts first. $fg(2) = f(g(2)) = f(6) = 10$. The working shown is $gf(2)$.",
        },
        {
          prompt: "$f(x) = 2x - 1$, $g(x) = x^2$. Find $fg(x)$.",
          lines: ["fg(x) = f(x^2)", "= 2x^2 - 1", "= (2x - 1)^2"],
          wrong: 2,
          options: ["Stop at $2x^2 - 1$: $(2x - 1)^2$ is $gf(x)$", "The answer is $2x - 1 + x^2$", "The last line is right"],
          answer: 0,
          explain: "$fg(x) = 2x^2 - 1$. Squaring the whole of $f(x)$ gives $gf(x) = (2x - 1)^2$, a different function.",
        },
        {
          prompt: "$f(x) = 3x + 1$, $g(x) = x^2$. Solve $fg(x) = 28$.",
          lines: ["3x^2 + 1 = 28", "x^2 = 9", "x = 3"],
          wrong: 2,
          options: ["$x^2 = 9$ gives $x = 3$ OR $x = -3$", "$x^2 = 9$ gives $x = 81$", "The answer is $x = 4.5$"],
          answer: 0,
          explain: "Taking a square root gives two answers: $x = \\pm 3$. Both work: $fg(-3) = 3(9) + 1 = 28$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.fn.composite" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain what fg(x) means and how you work it out.",
      need: 2,
      ideas: [
        { id: "first", text: "In fg, the function g acts first, then f.", keywords: [["g"], ["first", "before", "inside", "then f"]] },
        { id: "sub", text: "Substitute the whole of g(x) in place of x in f.", keywords: [["substitut", "replace", "put", "plug", "in place"], ["g(x)", "g"]] },
        { id: "order", text: "The order matters: fg is usually not the same as gf.", keywords: [["order", "not the same", "different", "not equal"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Composite functions",
        blocks: [
          { type: "definition", title: "Definition", text: "$fg(x) = f(g(x))$: g first, then f. The letter next to x acts first." },
          { type: "rule", title: "Method", text: "Write $fg(x) = f(g(x))$. Put the whole of g(x), in brackets, in place of every x in f. Simplify." },
          {
            type: "example",
            title: "Example",
            prompt: "$f(x) = 2x + 3$, $g(x) = x^2 - 1$. Find $fg(x)$ and solve $fg(x) = 11$.",
            lines: [L("fg(x) = 2(x^2 - 1) + 3 = 2x^2 + 1"), L("2x^2 + 1 = 11 \\Rightarrow x^2 = 5"), L("x = \\pm\\sqrt{5}")],
          },
          { type: "rule", title: "Remember", text: "$fg \\ne gf$ in general. $f^2(x) = f(f(x))$." },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["fn.comp.eval", "fn.comp.expr", "fn.comp.solve", "fn.comp.eval", "fn.comp.expr"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 4: inverse functions ---------- */

const lesson4: FunctionsLesson = {
  id: "fn-4",
  title: "Lesson 4 · Inverse functions",
  body: [
    "The inverse function f⁻¹ runs the machine backwards: it takes an output and gives back the input.",
    "Only one-to-one functions have an inverse. Today you learn the method (y = f(x), swap, rearrange), how to restrict a domain, and how to state the domain of the inverse.",
  ],
  skills: [
    { id: "fn.inv", name: "Finding f⁻¹(x)" },
    { id: "fn.inv.domain", name: "The domain of f⁻¹" },
    { id: "fn.inv.exists", name: "When an inverse exists" },
  ],
  parts: [
    {
      kind: "machine",
      title: "See it",
      text: "The function $f(x) = 3x - 2$ is two steps: multiply by 3, then subtract 2. Running it BACKWARDS undoes the steps in reverse order: add 2 first, then divide by 3. Type an output and press Run.",
      machines: [
        { name: "p", expr: "3x", inverse: "x/3" },
        { name: "q", expr: "x - 2", inverse: "x + 2" },
      ],
      order: ["p", "q"],
      backwards: true,
      questions: [
        { prompt: "Run the output 10 backwards. Which input gave 10?", options: ["4", "8/3", "28", "12"], answer: 0, explain: "$10 + 2 = 12$, then $12 \\div 3 = 4$. Check: $f(4) = 3(4) - 2 = 10$." },
        { prompt: "So what is $f^{-1}(x)$?", options: ["$\\frac{x + 2}{3}$", "$\\frac{x}{3} + 2$", "$\\frac{1}{3x - 2}$", "$3x + 2$"], answer: 0, explain: "Add 2 first, then divide by 3: $f^{-1}(x) = \\frac{x + 2}{3}$." },
        { prompt: "Is $f^{-1}(x)$ the same as $\\frac{1}{f(x)}$?", options: ["Yes", "No"], answer: 1, explain: "No! $\\frac{1}{f(x)} = \\frac{1}{3x - 2}$ is a reciprocal. $f^{-1}$ is the machine run backwards. The −1 is a label, not a power." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy the method into your exercise book under the title “Inverse functions”.",
      lines: [
        L("\\text{Only a one-to-one function has an inverse}", "If two inputs gave the same output, running backwards could not choose between them."),
        L("1. \\; y = f(x)", "Write the function with y."),
        L("2. \\; \\text{Make } x \\text{ the subject}", "Undo the operations in reverse order."),
        L("3. \\; \\text{Swap: write } f^{-1}(x) \\text{ with } x \\text{ in place of } y"),
        L("\\text{Domain of } f^{-1} = \\text{range of } f", "Always state it."),
        L("ff^{-1}(x) = f^{-1}f(x) = x", "The inverse undoes the function."),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "fn.inv.domain", seed: 99 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.inv.expr", hide: [-1] },
    { kind: "practice", title: "Your turn", generators: ["fn.inv.expr", "fn.inv.domain", "fn.inv.exists"], count: 4 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "$f(x) = 5x - 4$. Find $f^{-1}(x)$.",
          lines: ["f^{-1}(x) = \\dfrac{1}{5x - 4}"],
          wrong: 0,
          options: ["$f^{-1}$ is the inverse, not the reciprocal: $y = 5x - 4 \\Rightarrow x = \\frac{y + 4}{5}$, so $f^{-1}(x) = \\frac{x + 4}{5}$", "It should be $\\frac{1}{5x + 4}$", "It should be $5x + 4$"],
          answer: 0,
          explain: "The −1 means “inverse”. Use the method: y = f(x), make x the subject, swap.",
        },
        {
          prompt: "$f(x) = 2x + 6$. Find $f^{-1}(x)$.",
          lines: ["\\text{Undo: divide by 2, then subtract 6}", "f^{-1}(x) = \\frac{x}{2} - 6"],
          wrong: 0,
          options: ["Undo in REVERSE order: subtract 6 first, then divide by 2, so $f^{-1}(x) = \\frac{x - 6}{2}$", "Divide by 6 then subtract 2", "The working is right"],
          answer: 0,
          explain: "f multiplies by 2 and THEN adds 6, so the inverse subtracts 6 FIRST. Check: $f^{-1}(f(1)) = f^{-1}(8) = 1$ ✓.",
        },
        {
          prompt: "$f(x) = (x - 2)^2 + 1$, $x \\ge 2$. Find $f^{-1}(x)$ and its domain.",
          lines: ["x = 2 + \\sqrt{y - 1}", "f^{-1}(x) = 2 + \\sqrt{x - 1}", "\\text{Domain: } x \\ge 2"],
          wrong: 2,
          options: ["The domain of $f^{-1}$ is the RANGE of f: $f(x) \\ge 1$, so $x \\ge 1$", "The domain is all real numbers", "The domain is $x \\ge 0$"],
          answer: 0,
          explain: "Domain and range swap over. f starts at (2, 1) and outputs $f(x) \\ge 1$, so $f^{-1}$ takes inputs $x \\ge 1$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.fn.inverse" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain how to find an inverse function, and what its domain is.",
      need: 2,
      ideas: [
        { id: "method", text: "Write y = f(x), make x the subject, then swap x and y.", keywords: [["y = f(x)", "y=f(x)", "make x", "subject", "rearrange"], ["swap", "replace", "switch", "interchange", "subject"]] },
        { id: "domain", text: "The domain of the inverse is the range of f.", keywords: [["domain"], ["range"]] },
        { id: "oneone", text: "Only a one-to-one function has an inverse.", keywords: [["one-to-one", "one to one"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Inverse functions",
        blocks: [
          { type: "definition", title: "Definition", text: "$f^{-1}$ undoes f: if $f(a) = b$ then $f^{-1}(b) = a$. It exists only if f is one-to-one." },
          { type: "rule", title: "Method", text: "y = f(x). Make x the subject. Write $f^{-1}(x)$. Domain of $f^{-1}$ = range of f." },
          {
            type: "example",
            title: "Example",
            prompt: "$f(x) = \\frac{2x + 1}{x - 3}$, $x \\ne 3$.",
            lines: [L("y(x - 3) = 2x + 1"), L("xy - 3y = 2x + 1"), L("x(y - 2) = 3y + 1"), L("f^{-1}(x) = \\frac{3x + 1}{x - 2}, \\; x \\ne 2")],
          },
          { type: "rule", title: "Careful", text: "$f^{-1}(x) \\ne \\frac{1}{f(x)}$. For a quadratic, restrict the domain (e.g. $x \\ge 0$) so it is one-to-one, and choose the right square root." },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["fn.inv.expr", "fn.inv.domain", "fn.inv.exists", "fn.inv.expr", "fn.inv.domain"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 5: the graph of an inverse ---------- */

const lesson5: FunctionsLesson = {
  id: "fn-5",
  title: "Lesson 5 · The graph of an inverse",
  body: [
    "Running a machine backwards swaps inputs and outputs, so on a graph it swaps x and y. That is a reflection in the line y = x.",
    "Today you see the inverse graph appear as a mirror image, learn why the domain of f⁻¹ is the range of f, and solve f(x) = f⁻¹(x) the quick way.",
  ],
  skills: [
    { id: "fn.inv.graph", name: "Graphs of inverses" },
    { id: "fn.inv.solve", name: "Solving f(x) = f⁻¹(x)" },
  ],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "Drag the point along $y = f(x)$. The red point is its mirror image in the dashed line $y = x$. As you drag, the red trail draws the graph of $f^{-1}$.",
      graph: {
        x: [-5, 5],
        y: [-5, 5],
        curves: [{ expr: "x^3/8 + 1" }],
        params: [{ name: "a", label: "x", min: -3.5, max: 3, step: 0.1, value: 1 }],
        dragPoint: { param: "a", label: "x" },
        mirror: true,
      },
      questions: [
        { prompt: "The point $(2, 2)$ is on $y = f(x)$. Where is its mirror image?", options: ["$(2, 2)$: it is on the line $y = x$", "$(-2, -2)$", "$(2, -2)$"], answer: 0, explain: "Points on $y = x$ reflect onto themselves. That is where f and $f^{-1}$ meet." },
        { prompt: "The point $(0, 1)$ is on $y = f(x)$. Which point is on $y = f^{-1}(x)$?", options: ["$(0, -1)$", "$(1, 0)$", "$(-1, 0)$", "$(0, 1)$"], answer: 1, explain: "Reflecting in $y = x$ swaps the coordinates: $(0, 1) \\to (1, 0)$." },
        { prompt: "So the inputs of $f^{-1}$ are…", options: ["the inputs of f", "the outputs of f"], answer: 1, explain: "Swapping x and y turns the outputs of f into the inputs of $f^{-1}$: domain of $f^{-1}$ = range of f." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy this into your exercise book and add a sketch of a curve, its inverse and the line $y = x$.",
      lines: [
        L("(a, b) \\text{ on } y = f(x) \\iff (b, a) \\text{ on } y = f^{-1}(x)"),
        L("y = f^{-1}(x) \\text{ is the reflection of } y = f(x) \\text{ in } y = x"),
        L("\\text{Domain of } f^{-1} = \\text{range of } f, \\quad \\text{range of } f^{-1} = \\text{domain of } f"),
        L("f(x) = f^{-1}(x) \\text{ on the line } y = x", "For an increasing f, solve $f(x) = x$ instead: much less work."),
        L("\\text{Check each answer is in the domain}"),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "fn.inv.graph", seed: 515 },
    { kind: "gaps", title: "Fill the gaps", generator: "fn.inv.solve", hide: [-1] },
    { kind: "practice", title: "Your turn", generators: ["fn.inv.graph", "fn.inv.solve", "fn.inv.domain"], count: 4 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "$f(x) = \\sqrt{x - 1} + 3$, $x \\ge 1$. State the domain of $f^{-1}$.",
          lines: ["\\text{Domain of } f: x \\ge 1", "\\text{Domain of } f^{-1}: x \\ge 1"],
          wrong: 1,
          options: ["Domain of $f^{-1}$ = range of f = $f(x) \\ge 3$, so $x \\ge 3$", "It is the same as the domain of f", "$x \\ge 0$"],
          answer: 0,
          explain: "Reflecting in $y = x$ swaps domain and range. The curve starts at (1, 3), so the inverse starts at (3, 1).",
        },
        {
          prompt: "$f(x) = x^2 - 6$, $x \\ge 0$. Solve $f(x) = f^{-1}(x)$.",
          lines: ["x^2 - 6 = x", "(x - 3)(x + 2) = 0", "x = 3 \\text{ or } x = -2"],
          wrong: 2,
          options: ["Reject $x = -2$: the domain is $x \\ge 0$. So $x = 3$ only", "Both answers are right", "Reject $x = 3$"],
          answer: 0,
          explain: "Always check your answers against the domain. $x = -2$ is not allowed.",
        },
        {
          prompt: "How is the graph of $y = f^{-1}(x)$ related to $y = f(x)$?",
          lines: ["\\text{It is the reflection in the x-axis}"],
          wrong: 0,
          options: ["It is the reflection in the line $y = x$", "It is the reflection in the y-axis", "It is $\\frac{1}{f(x)}$"],
          answer: 0,
          explain: "Swapping x and y is a reflection in $y = x$, not in either axis.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.fn.inverseLine" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain how the graph of f⁻¹ is related to the graph of f, and how to solve f(x) = f⁻¹(x).",
      need: 2,
      ideas: [
        { id: "reflect", text: "The graph of the inverse is the reflection of f in the line y = x.", keywords: [["reflect", "mirror"], ["y = x", "y=x", "line y"]] },
        { id: "swap", text: "The domain and range swap over.", keywords: [["domain", "range", "coordinates", "x and y"], ["swap", "switch", "interchange", "exchange"]] },
        { id: "solve", text: "Solve f(x) = x, because they meet on y = x.", keywords: [["f(x) = x", "f(x)=x", "meet on", "intersect on", "cross on", "on y = x", "on the line"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Graphs of inverse functions",
        blocks: [
          { type: "rule", title: "Reflection", text: "The graph of $y = f^{-1}(x)$ is the reflection of $y = f(x)$ in the line $y = x$: $(a, b) \\to (b, a)$." },
          { type: "rule", title: "Domain and range", text: "Domain of $f^{-1}$ = range of f. Range of $f^{-1}$ = domain of f." },
          {
            type: "example",
            title: "Example",
            prompt: "$f(x) = 3x - 4$. Solve $f(x) = f^{-1}(x)$.",
            lines: [L("3x - 4 = x", "They meet on y = x."), L("2x = 4"), L("x = 2")],
          },
          { type: "sketch", title: "Sketch: $f$, $f^{-1}$ and $y = x$", graph: { x: [-1, 6], y: [-1, 6], curves: [{ expr: "(sqrt(x))^4/4" }, { expr: "2sqrt(x)" }, { expr: "x", faint: true }] } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["fn.inv.graph", "fn.inv.solve", "fn.inv.graph", "fn.inv.solve", "fn.inv.expr"], count: 5, need: 4 },
  ],
};

export const lessons: FunctionsLesson[] = [lesson0, lesson1, lesson2, lesson3, lesson4, lesson5, ...lessons2];
