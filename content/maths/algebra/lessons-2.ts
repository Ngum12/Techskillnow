/**
 * Algebra lessons 5–12: factor theorem, cubics, partial fractions, inequalities, modulus, topic review.
 * Same lesson rhythm and conventions as ./lessons.ts. Maths in text goes between $…$.
 */
import type { SolutionLine } from "@/lib/maths/types";
import type { AlgebraLesson } from "./lessons";

const L = (latex: string, note?: string, mark?: string): SolutionLine => ({ latex, note, mark });

/* ---------- Lesson 5: the factor theorem ---------- */

const lesson5: AlgebraLesson = {
  id: "alg-5",
  title: "Lesson 5 · The factor theorem",
  body: [
    "In lesson 4 you found that the remainder is f(a). What if the remainder is 0?",
    "Then (x − a) divides exactly: it is a factor. On the graph, that is where the curve crosses the x-axis.",
  ],
  skills: [{ id: "alg.factor", name: "The factor theorem" }],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "Here is $y = (x + 2)(x - 1)(x - 3)$. Drag the green point along the curve and watch the value of $f(a)$ underneath. The red circles mark where the curve crosses the x-axis.",
      graph: {
        x: [-4, 5],
        y: [-12, 12],
        curves: [{ expr: "(x + 2)(x - 1)(x - 3)" }],
        params: [{ name: "a", label: "a", min: -3.5, max: 4.5, step: 0.5, value: -3 }],
        dragPoint: { param: "a", label: "a" },
        showRoots: true,
      },
      questions: [
        { prompt: "Drag the point to $a = 1$. What is $f(1)$?", options: ["0", "1", "−6", "6"], answer: 0, explain: "At $a = 1$ the point sits on the x-axis, so $f(1) = 0$." },
        { prompt: "At which values of $a$ is $f(a) = 0$?", options: ["$-2, 1, 3$", "$2, -1, -3$", "$0$ only", "$1$ only"], answer: 0, explain: "The curve crosses the x-axis at $x = -2, 1, 3$." },
        { prompt: "So which of these is a factor of $f(x)$?", options: ["$(x - 1)$", "$(x + 1)$", "$(x - 2)$", "$(x + 3)$"], answer: 0, explain: "$f(1) = 0$, and $(x - 1)$ is zero when $x = 1$: it is a factor. This is the factor theorem." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy the factor theorem and why it works into your book.",
      lines: [
        L("f(x) = (x - a)Q(x) + f(a)", "From lesson 4: the remainder is $f(a)$."),
        L("f(a) = 0 \\Rightarrow f(x) = (x - a)Q(x)", "If the remainder is 0, $(x - a)$ divides exactly."),
        L("\\text{Factor theorem: } (x - a) \\text{ is a factor of } f(x) \\iff f(a) = 0", "It works both ways: a factor gives $f(a) = 0$, and $f(a) = 0$ gives a factor."),
        L("\\text{To find a factor: try } x = \\pm 1, \\pm 2, \\pm 3, \\dots", "When the leading coefficient is 1, try the factors of the constant term."),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "alg.factor.find", seed: 5151 },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.factor.find", hide: [-1] },
    { kind: "practice", title: "Your turn", generators: ["alg.factor.test", "alg.factor.find"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Is $(x + 3)$ a factor of $f(x) = x^3 + 2x^2 - 5x - 6$?",
          lines: ["x + 3 = 0 \\Rightarrow x = 3", "f(3) = 27 + 18 - 15 - 6 = 24", "\\text{Not a factor}"],
          wrong: 0,
          options: ["$x + 3 = 0$ gives $x = -3$, so test $f(-3)$", "$f(3)$ should be 0", "You must use long division"],
          answer: 0,
          explain: "$f(-3) = -27 + 18 + 15 - 6 = 0$, so $(x + 3)$ IS a factor.",
        },
        {
          prompt: "Find a factor of $x^3 - 7x - 6$.",
          lines: ["f(1) = 1 - 7 - 6 = -12", "f(-1) = -1 + 7 - 6 = 0", "\\text{So } (x - 1) \\text{ is a factor}"],
          wrong: 2,
          options: ["$f(-1) = 0$ means $(x + 1)$ is a factor", "$f(1)$ was wrong", "You must try $x = 0$ first"],
          answer: 0,
          explain: "The factor that is zero at $x = -1$ is $(x + 1)$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.rem.unknowns" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "State the factor theorem in your own words, and say how you find a factor of a cubic.",
      need: 2,
      ideas: [
        { id: "zero", text: "If f(a) = 0, then (x − a) is a factor.", keywords: [["f(a) = 0", "f(a)=0", "zero", "0"], ["factor"]] },
        { id: "try", text: "Try small values of x, like ±1, ±2, ±3.", keywords: [["try", "test", "substitut", "put"], ["value", "number", "1", "2"]] },
        { id: "graph", text: "On the graph, it is where the curve crosses the x-axis.", keywords: [["cross", "meet", "cut", "touch"], ["axis"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "The factor theorem",
        blocks: [
          { type: "rule", title: "Theorem", text: "$(x - a)$ is a factor of $f(x)$ exactly when $f(a) = 0$." },
          { type: "note", title: "Finding a factor", text: "Try $x = \\pm1, \\pm2, \\pm3, \\dots$ (factors of the constant term) until $f(x) = 0$." },
          { type: "example", title: "Example", prompt: "Is $(x - 2)$ a factor of $x^3 - 3x^2 + 4$?", lines: [L("f(2) = 8 - 12 + 4 = 0", undefined, "M1"), L("\\text{So } (x - 2) \\text{ is a factor}", undefined, "A1")] },
          { type: "sketch", title: "Sketch: roots are where f(x) = 0", graph: { x: [-4, 5], y: [-12, 12], curves: [{ expr: "(x + 2)(x - 1)(x - 3)" }], showRoots: true } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.factor.test", "alg.factor.find", "alg.rem.find"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 6: factorising and solving cubics ---------- */

const lesson6: AlgebraLesson = {
  id: "alg-6",
  title: "Lesson 6 · Factorising and solving cubic equations",
  body: [
    "Now put it together: find one factor by trial, divide to get a quadratic, then factorise the quadratic.",
    "You will also solve cubic equations and find unknown coefficients, a question the GCE asks almost every year.",
  ],
  skills: [{ id: "alg.cubic", name: "Factorising and solving cubics" }],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "This is $y = (x - 1)(x - 2)(x + k)$. Move the slider for $k$. The curve can cross the x-axis up to three times, and each crossing gives one factor.",
      graph: { x: [-5, 5], y: [-10, 10], curves: [{ expr: "(x - 1)(x - 2)(x + k)" }], params: [{ name: "k", label: "k", min: -4, max: 4, step: 1, value: 3 }], showRoots: true },
      questions: [
        { prompt: "With $k = 3$, where does the curve cross the x-axis?", options: ["$x = 1, 2, -3$", "$x = -1, -2, 3$", "$x = 1, 2, 3$"], answer: 0, explain: "The factors $(x - 1)$, $(x - 2)$, $(x + 3)$ are zero at $x = 1, 2, -3$." },
        { prompt: "Set $k = -2$. Now how many different crossing points are there?", options: ["3", "2", "1"], answer: 1, explain: "With $k = -2$ the factor $(x - 2)$ appears twice: the curve only touches the axis at $x = 2$. So there are 2 different roots." },
        { prompt: "To solve $(x - 1)(x - 2)(x + 3) = 0$, you say:", options: ["$x = 1$ or $x = 2$ or $x = -3$", "$x = 1 + 2 - 3$", "There is no solution"], answer: 0, explain: "A product is zero when one of its factors is zero." },
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "alg.cubic.factorise", seed: 6161 },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.cubic.factorise", hide: [1, 2] },
    { kind: "practice", title: "Your turn", generators: ["alg.cubic.factorise", "alg.cubic.solve"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Solve $x^3 - 4x^2 + x + 6 = 0$, given $(x - 2)$ is a factor.",
          lines: ["(x - 2)(x^2 - 2x - 3) = 0", "\\text{Divide both sides by } (x - 2): \\; x^2 - 2x - 3 = 0", "x = 3 \\text{ or } x = -1"],
          wrong: 1,
          options: ["Dividing by $(x - 2)$ loses the solution $x = 2$: set each factor to zero instead", "The quadratic is wrong", "$x = -1$ is not a solution"],
          answer: 0,
          explain: "The solutions are $x = 2$, $x = 3$ and $x = -1$. Never divide an equation by an expression that can be zero.",
        },
        {
          prompt: "Factorise $x^3 - x$ completely.",
          lines: ["x^3 - x = x(x^2 - 1)", "= x(x^2 - 1)"],
          wrong: 1,
          options: ["$x^2 - 1$ factorises again: $(x - 1)(x + 1)$", "$x^3 - x = x^2(x - 1)$", "It cannot be factorised"],
          answer: 0,
          explain: "Completely means no factor can be broken down further: $x(x - 1)(x + 1)$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.cubic.unknowns" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain the steps to factorise a cubic completely.",
      need: 2,
      ideas: [
        { id: "trial", text: "Find one factor by trying values until f(a) = 0.", keywords: [["try", "trial", "test", "factor theorem", "substitut"]] },
        { id: "divide", text: "Divide to get a quadratic.", keywords: [["divid", "division", "compar"], ["quadratic", "x^2", "x²"]] },
        { id: "quadratic", text: "Factorise the quadratic.", keywords: [["factoris", "factoriz"], ["quadratic", "x^2", "x²", "again"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Factorising and solving cubics",
        blocks: [
          { type: "rule", title: "Method", text: "1. Find a root $a$ by trial. 2. Divide by $(x - a)$. 3. Factorise the quadratic. 4. To solve, set each factor to zero." },
          {
            type: "example",
            title: "Example",
            prompt: "Solve $x^3 - 2x^2 - 5x + 6 = 0$.",
            lines: [L("f(1) = 1 - 2 - 5 + 6 = 0", undefined, "M1"), L("(x - 1)(x^2 - x - 6) = 0", undefined, "M1"), L("(x - 1)(x - 3)(x + 2) = 0"), L("x = 1, \\; x = 3, \\; x = -2", undefined, "A1")],
          },
          { type: "note", title: "Never", text: "Never divide both sides by a factor: you lose a solution." },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.cubic.factorise", "alg.cubic.solve", "alg.factor.find"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 7: partial fractions (distinct linear factors) ---------- */

const lesson7: AlgebraLesson = {
  id: "alg-7",
  title: "Lesson 7 · Partial fractions",
  body: [
    "You know how to add two fractions into one. Partial fractions does the opposite: it splits one fraction into simple pieces.",
    "You will use this in Upper Sixth for integration and series, so it is worth learning well.",
  ],
  skills: [{ id: "alg.pf", name: "Partial fractions (distinct factors)" }],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "The green and red curves are $\\frac{A}{x - 1}$ and $\\frac{B}{x + 2}$. The blue curve is their SUM. Move $A$ and $B$: one complicated curve is built from two simple ones.",
      graph: {
        x: [-6, 6],
        y: [-8, 8],
        curves: [{ expr: "A/(x - 1) + B/(x + 2)", colour: "#2f5d9c" }, { expr: "A/(x - 1)", colour: "#1d5440" }, { expr: "B/(x + 2)", colour: "#b8452b" }],
        params: [
          { name: "A", label: "A", min: -4, max: 4, step: 1, value: 2 },
          { name: "B", label: "B", min: -4, max: 4, step: 1, value: 3 },
        ],
      },
      questions: [
        { prompt: "Add: $\\frac{2}{x - 1} + \\frac{3}{x + 2} = $", options: ["$\\frac{5x + 1}{(x - 1)(x + 2)}$", "$\\frac{5}{2x + 1}$", "$\\frac{5}{(x - 1)(x + 2)}$"], answer: 0, explain: "Common denominator: $\\frac{2(x + 2) + 3(x - 1)}{(x - 1)(x + 2)} = \\frac{5x + 1}{(x - 1)(x + 2)}$." },
        { prompt: "So $\\frac{5x + 1}{(x - 1)(x + 2)}$ splits into:", options: ["$\\frac{2}{x - 1} + \\frac{3}{x + 2}$", "$\\frac{5}{x - 1} + \\frac{1}{x + 2}$", "$\\frac{5x}{x - 1} + \\frac{1}{x + 2}$"], answer: 0, explain: "Partial fractions undoes the addition. That is the whole idea." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy the method into your book. The cover-up idea comes from putting a special value of x.",
      lines: [
        L("\\frac{5x + 1}{(x - 1)(x + 2)} \\equiv \\frac{A}{x - 1} + \\frac{B}{x + 2}", "Write one fraction per factor, with unknown numbers A and B on top."),
        L("5x + 1 \\equiv A(x + 2) + B(x - 1)", "Multiply both sides by the denominator. This is true for EVERY x."),
        L("x = 1: \\; 6 = 3A \\Rightarrow A = 2", "Choose $x = 1$: the B term becomes 0."),
        L("x = -2: \\; -9 = -3B \\Rightarrow B = 3", "Choose $x = -2$: the A term becomes 0."),
        L("\\frac{5x + 1}{(x - 1)(x + 2)} = \\frac{2}{x - 1} + \\frac{3}{x + 2}", "Check by adding them back together."),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "alg.pf.distinct", seed: 7171 },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.pf.distinct", hide: [4] },
    { kind: "practice", title: "Your turn", generators: ["alg.pf.distinct"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Express $\\frac{x + 7}{(x - 1)(x + 3)}$ in partial fractions.",
          lines: ["x + 7 \\equiv A(x + 3) + B(x - 1)", "x = 1: \\; 8 = 4A \\Rightarrow A = 2", "x = -3: \\; 4 = -4B \\Rightarrow B = -1", "= \\frac{-1}{x - 1} + \\frac{2}{x + 3}"],
          wrong: 3,
          options: ["A goes over $(x - 1)$ and B over $(x + 3)$: $\\frac{2}{x - 1} - \\frac{1}{x + 3}$", "B should be 1", "A should be 4"],
          answer: 0,
          explain: "Keep each number with its own factor. $x = 1$ found A, the number over $(x - 1)$.",
        },
        {
          prompt: "Express $\\frac{3x}{(x + 1)(x - 2)}$ in partial fractions.",
          lines: ["\\equiv \\frac{Ax}{x + 1} + \\frac{Bx}{x - 2}"],
          wrong: 0,
          options: ["For linear factors the tops are just numbers: $\\frac{A}{x + 1} + \\frac{B}{x - 2}$", "It cannot be split", "You need three fractions"],
          answer: 0,
          explain: "Over a linear factor, the numerator is a constant.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.pf.distinct" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain how to split a fraction into partial fractions, and why putting special values of x works.",
      need: 2,
      ideas: [
        { id: "form", text: "Write one fraction for each factor, with a number on top.", keywords: [["fraction", "each", "one"], ["factor"]] },
        { id: "multiply", text: "Multiply both sides by the denominator.", keywords: [["multipl", "times"], ["denominator", "bottom", "both sides"]] },
        { id: "special", text: "Put x equal to the value that makes a factor zero, so the other term disappears.", keywords: [["zero", "0", "disappear", "vanish", "cancel"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Partial fractions: distinct factors",
        blocks: [
          { type: "rule", title: "Form", text: "$\\frac{px + q}{(x - a)(x - b)} \\equiv \\frac{A}{x - a} + \\frac{B}{x - b}$" },
          { type: "note", title: "Cover-up", text: "Put $x = a$ to find A, and $x = b$ to find B." },
          {
            type: "example",
            title: "Example",
            prompt: "$\\frac{5x + 1}{(x - 1)(x + 2)}$",
            lines: [L("5x + 1 \\equiv A(x + 2) + B(x - 1)", undefined, "M1"), L("A = 2, \\; B = 3", undefined, "A1 A1"), L("= \\frac{2}{x - 1} + \\frac{3}{x + 2}")],
          },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.pf.distinct"], count: 4, need: 3 },
  ],
};

/* ---------- Lesson 8: repeated factors and improper fractions ---------- */

const lesson8: AlgebraLesson = {
  id: "alg-8",
  title: "Lesson 8 · Repeated factors and improper fractions",
  body: [
    "Two special cases. A repeated factor like (x − 2)² needs two fractions. An improper fraction (top degree not smaller than bottom) needs a division first.",
    "Each case has one extra step. Learn the form first; the rest is the method you already know.",
  ],
  skills: [{ id: "alg.pf2", name: "Repeated factors and improper fractions" }],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "Here is $y = \\frac{x^2 + 1}{(x - 1)(x + 2)}$ and the line $y = 1$. Zoom out (−) and look far to the left and right.",
      graph: { x: [-8, 8], y: [-6, 6], curves: [{ expr: "(x^2 + 1)/((x - 1)(x + 2))", colour: "#2f5d9c" }, { expr: "1", colour: "#b8452b" }] },
      questions: [
        { prompt: "When x is far from 0, the curve gets close to which line?", options: ["$y = 1$", "$y = 0$", "$y = x$"], answer: 0, explain: "The top and bottom both start with $x^2$, so for big x the fraction is close to 1." },
        { prompt: "So $\\frac{x^2 + 1}{(x - 1)(x + 2)}$ is:", options: ["$1 + $ (a proper fraction)", "already a proper fraction", "a polynomial"], answer: 0, explain: "Top degree = bottom degree: it is improper. Divide first to get $1 + \\frac{\\dots}{(x - 1)(x + 2)}$." },
        { prompt: "Which form is right for $\\frac{\\dots}{(x - 1)(x + 2)^2}$?", options: ["$\\frac{A}{x - 1} + \\frac{B}{x + 2} + \\frac{C}{(x + 2)^2}$", "$\\frac{A}{x - 1} + \\frac{C}{(x + 2)^2}$", "$\\frac{A}{x - 1} + \\frac{B}{x + 2}$"], answer: 0, explain: "A repeated factor needs a fraction over the factor AND over its square." },
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "alg.pf.repeated", seed: 8181 },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.pf.improper", hide: [1, 3] },
    { kind: "practice", title: "Your turn", generators: ["alg.pf.repeated", "alg.pf.improper"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Write down the form for $\\frac{2x + 1}{(x + 1)(x - 3)^2}$.",
          lines: ["\\equiv \\frac{A}{x + 1} + \\frac{C}{(x - 3)^2}"],
          wrong: 0,
          options: ["It needs three fractions: add $\\frac{B}{x - 3}$", "It needs $\\frac{Cx}{(x - 3)^2}$", "It is correct"],
          answer: 0,
          explain: "Repeated factor $(x - 3)^2$: one fraction over $(x - 3)$ and one over $(x - 3)^2$.",
        },
        {
          prompt: "Express $\\frac{x^2 + 3x + 4}{(x + 1)(x + 2)}$ in partial fractions.",
          lines: ["\\equiv \\frac{A}{x + 1} + \\frac{B}{x + 2}", "x^2 + 3x + 4 \\equiv A(x + 2) + B(x + 1)"],
          wrong: 0,
          options: ["It is improper (degree 2 over degree 2): divide first, giving $1 + \\dots$", "The factors are wrong", "It needs a repeated factor"],
          answer: 0,
          explain: "$\\frac{x^2 + 3x + 4}{x^2 + 3x + 2} = 1 + \\frac{2}{(x + 1)(x + 2)} = 1 + \\frac{2}{x + 1} - \\frac{2}{x + 2}$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.pf.repeated" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "What is different about a repeated factor, and what must you do first with an improper fraction?",
      need: 2,
      ideas: [
        { id: "two", text: "A repeated factor needs two fractions: over the factor and over its square.", keywords: [["two", "both", "square", "squared"], ["fraction", "factor", "term"]] },
        { id: "divide", text: "An improper fraction must be divided first.", keywords: [["divid", "division"], ["first", "before"]] },
        { id: "compare", text: "Compare coefficients to find the last constant.", keywords: [["compar", "equat", "coefficient"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Repeated factors and improper fractions",
        blocks: [
          { type: "rule", title: "Repeated factor", text: "$\\frac{\\dots}{(x - a)(x - b)^2} \\equiv \\frac{A}{x - a} + \\frac{B}{x - b} + \\frac{C}{(x - b)^2}$" },
          { type: "note", title: "Finding B", text: "No single x removes B: compare the coefficients of $x^2$." },
          { type: "rule", title: "Improper", text: "If the top degree ≥ the bottom degree, divide first: $\\frac{x^2 + 3x + 4}{(x + 1)(x + 2)} = 1 + \\frac{2}{(x + 1)(x + 2)}$." },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.pf.repeated", "alg.pf.improper", "alg.pf.distinct"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 9: linear and quadratic inequalities ---------- */

const lesson9: AlgebraLesson = {
  id: "alg-9",
  title: "Lesson 9 · Linear and quadratic inequalities",
  body: [
    "An inequality has a whole range of answers, not one number. A sketch shows you that range.",
    "Ayuk sells puff-puff in Mokolo: his profit is positive only for some numbers of sales. Inequalities answer questions like that.",
  ],
  skills: [{ id: "alg.ineq", name: "Linear and quadratic inequalities" }],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "This is $y = (x - p)(x - q)$. The red part of the curve is where $y < 0$, and the red bar on the x-axis shows those x-values. Move $p$ and $q$.",
      graph: {
        x: [-6, 6],
        y: [-8, 8],
        curves: [{ expr: "(x - p)(x - q)" }],
        params: [
          { name: "p", label: "p", min: -5, max: 0, step: 1, value: -2 },
          { name: "q", label: "q", min: 1, max: 5, step: 1, value: 3 },
        ],
        highlight: "below",
        showRoots: true,
      },
      questions: [
        { prompt: "With $p = -2$ and $q = 3$, where is $y < 0$?", options: ["$-2 < x < 3$", "$x < -2$ or $x > 3$", "$x > 3$ only"], answer: 0, explain: "The U-shaped curve dips below the axis BETWEEN its roots." },
        { prompt: "So where is $(x + 2)(x - 3) > 0$?", options: ["$x < -2$ or $x > 3$", "$-2 < x < 3$", "Nowhere"], answer: 0, explain: "Above the axis means OUTSIDE the roots: two separate pieces." },
        { prompt: "Solve $-2x > 6$.", options: ["$x < -3$", "$x > -3$", "$x > 3$"], answer: 0, explain: "Divide by $-2$: dividing by a negative REVERSES the sign." },
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "alg.ineq.quad", seed: 9191 },
    { kind: "signs", title: "Sign diagram", generator: "alg.sign.poly" },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.ineq.quad", hide: [0, 3] },
    { kind: "practice", title: "Your turn", generators: ["alg.ineq.linear", "alg.ineq.quad"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Solve $5 - 3x \\le 11$.",
          lines: ["-3x \\le 6", "x \\le -2"],
          wrong: 1,
          options: ["Dividing by $-3$ reverses the sign: $x \\ge -2$", "$-3x \\le 6$ is wrong", "The answer is $x \\le 2$"],
          answer: 0,
          explain: "Check with $x = 0$: $5 \\le 11$ is true, and $0 \\ge -2$. So the answer is $x \\ge -2$.",
        },
        {
          prompt: "Solve $x^2 - 9 > 0$.",
          lines: ["x^2 > 9", "x > 3"],
          wrong: 1,
          options: ["Also $x < -3$: both $4^2$ and $(-4)^2$ are bigger than 9", "It should be $x > 9$", "It should be $-3 < x < 3$"],
          answer: 0,
          explain: "$(x - 3)(x + 3) > 0$ gives $x < -3$ or $x > 3$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.ineq.basic" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain how to solve a quadratic inequality such as $x^2 - x - 6 < 0$.",
      need: 2,
      ideas: [
        { id: "roots", text: "Find the critical values (the roots).", keywords: [["critical", "root", "factoris", "solve"]] },
        { id: "sketch", text: "Sketch the curve or use a sign diagram.", keywords: [["sketch", "graph", "curve", "sign", "diagram"]] },
        { id: "region", text: "Below the axis is between the roots, above is outside.", keywords: [["between", "outside", "below", "above"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Linear and quadratic inequalities",
        blocks: [
          { type: "rule", title: "Linear", text: "Multiplying or dividing by a NEGATIVE number reverses the inequality sign." },
          { type: "rule", title: "Quadratic (U-shaped)", text: "$< 0$: between the roots. $> 0$: outside the roots." },
          { type: "example", title: "Example", prompt: "$x^2 - x - 6 < 0$", lines: [L("(x + 2)(x - 3) < 0", undefined, "M1"), L("-2 < x < 3", undefined, "A1")] },
          { type: "sketch", title: "Sketch", graph: { x: [-5, 6], y: [-8, 8], curves: [{ expr: "(x + 2)(x - 3)" }], highlight: "below" } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.ineq.linear", "alg.ineq.quad"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 10: rational inequalities ---------- */

const lesson10: AlgebraLesson = {
  id: "alg-10",
  title: "Lesson 10 · Rational inequalities",
  body: [
    "A rational inequality has x in a denominator, like (x − 2)/(x + 1) > 0.",
    "The big rule: never multiply both sides by something whose sign you do not know. A sign diagram is the safe method.",
  ],
  skills: [{ id: "alg.ineq.rational", name: "Rational inequalities" }],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "This is $y = \\frac{x - 2}{x + 1}$. The red part is where $y < 0$. Notice the gap at $x = -1$: the curve is not defined there.",
      graph: { x: [-6, 6], y: [-6, 6], curves: [{ expr: "(x - 2)/(x + 1)" }], highlight: "below", showRoots: true },
      questions: [
        { prompt: "Where is $\\frac{x - 2}{x + 1} < 0$?", options: ["$-1 < x < 2$", "$x < 2$", "$x < -1$ or $x > 2$"], answer: 0, explain: "The red bar runs from $-1$ to $2$. At $x = -1$ the fraction does not exist." },
        { prompt: "Mbah multiplies both sides of $\\frac{x - 2}{x + 1} < 0$ by $(x + 1)$ and gets $x < 2$. What went wrong?", options: ["$(x + 1)$ can be negative, which would reverse the sign", "Nothing", "She should have added $(x + 1)$"], answer: 0, explain: "For $x < -1$, $(x + 1)$ is negative, so the sign should flip there. That is why $x < 2$ is wrong." },
        { prompt: "Is $x = -1$ ever part of the answer to $\\frac{x - 2}{x + 1} \\le 0$?", options: ["No: you cannot divide by zero", "Yes, because of the equals sign"], answer: 0, explain: "The bottom is zero at $x = -1$, so the fraction is not defined. Only $x = 2$ is included." },
      ],
    },
    { kind: "signs", title: "Sign diagram", generator: "alg.sign.rational" },
    { kind: "worked", title: "Do it with me", generator: "alg.ineq.rational", seed: 10101 },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.ineq.rational", hide: [2, 3] },
    { kind: "practice", title: "Your turn", generators: ["alg.ineq.rational"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Solve $\\frac{3}{x - 1} > 1$.",
          lines: ["3 > x - 1", "x < 4"],
          wrong: 0,
          options: ["You multiplied by $(x - 1)$, which can be negative. Bring everything to one side instead", "$3 > x - 1$ should be $3 < x - 1$", "The answer is $x > 4$"],
          answer: 0,
          explain: "$\\frac{3}{x - 1} - 1 > 0 \\Rightarrow \\frac{4 - x}{x - 1} > 0 \\Rightarrow 1 < x < 4$.",
        },
        {
          prompt: "Solve $\\frac{x + 2}{x - 3} \\ge 0$.",
          lines: ["\\text{Critical values } -2, \\; 3", "x \\le -2 \\text{ or } x \\ge 3"],
          wrong: 1,
          options: ["$x = 3$ makes the bottom zero: it must be $x > 3$", "It should be $-2 \\le x \\le 3$", "The critical values are wrong"],
          answer: 0,
          explain: "The answer is $x \\le -2$ or $x > 3$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.ineq" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Why must you not multiply both sides by $(x - 3)$, and what do you do instead?",
      need: 2,
      ideas: [
        { id: "sign", text: "(x − 3) can be negative, which would reverse the inequality.", keywords: [["negative", "sign", "reverse", "flip", "unknown"]] },
        { id: "oneSide", text: "Bring everything to one side and make one fraction.", keywords: [["one side", "single fraction", "one fraction", "subtract", "combine", "same side"]] },
        { id: "diagram", text: "Use a sign diagram with the critical values.", keywords: [["sign diagram", "sign table", "diagram", "critical"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Rational inequalities",
        blocks: [
          { type: "rule", title: "Never", text: "Never multiply by an expression whose sign you do not know." },
          { type: "rule", title: "Method", text: "1. Bring everything to one side. 2. Write one fraction. 3. Critical values: top = 0 and bottom = 0. 4. Sign diagram. 5. Bottom = 0 is never included." },
          { type: "example", title: "Example", prompt: "$\\frac{3}{x - 1} > 1$", lines: [L("\\frac{4 - x}{x - 1} > 0", undefined, "M1"), L("1 < x < 4", undefined, "A1")] },
          { type: "sketch", title: "Sketch", graph: { x: [-5, 6], y: [-6, 6], curves: [{ expr: "(4 - x)/(x - 1)" }], highlight: "above" } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.ineq.rational", "alg.ineq.quad"], count: 4, need: 3 },
  ],
};

/* ---------- Lesson 11: modulus ---------- */

const lesson11: AlgebraLesson = {
  id: "alg-11",
  title: "Lesson 11 · The modulus function",
  body: [
    "The modulus |x| is the distance of x from 0, so it is never negative: |3| = 3 and |−3| = 3.",
    "Fon lives 5 km from the Bamenda junction. Is she east or west of it? Both are possible: that is why modulus equations have two cases.",
  ],
  skills: [
    { id: "alg.mod", name: "Modulus equations and inequalities" },
    { id: "alg.mod.graph", name: "Graphs of y = |f(x)|" },
  ],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "The grey curve is $y = x^2 - c$. The green curve is $y = |x^2 - c|$: the part below the x-axis is reflected upwards. Move $c$.",
      graph: {
        x: [-5, 5],
        y: [-6, 10],
        curves: [{ expr: "|x^2 - c|", colour: "#1d5440" }, { expr: "x^2 - c", colour: "#b8c2c8" }],
        params: [{ name: "c", label: "c", min: 0, max: 6, step: 1, value: 4 }],
      },
      questions: [
        { prompt: "What happens to the part of $y = x^2 - 4$ below the x-axis?", options: ["It is reflected above the axis", "It disappears", "It moves to the right"], answer: 0, explain: "The modulus makes every negative y-value positive: the dip becomes a bump." },
        { prompt: "How many solutions does $|x^2 - 4| = 2$ have? (Imagine the line $y = 2$.)", options: ["4", "2", "3"], answer: 0, explain: "The line $y = 2$ cuts the bump twice and each arm once: 4 solutions." },
        { prompt: "Solve $|x - 3| = 5$.", options: ["$x = 8$ or $x = -2$", "$x = 8$ only", "$x = 2$ or $x = -8$"], answer: 0, explain: "$x - 3 = 5$ or $x - 3 = -5$: two cases, two answers." },
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "alg.mod.eq", seed: 11111 },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.mod.ineq", hide: [0, 1] },
    { kind: "practice", title: "Your turn", generators: ["alg.mod.eq", "alg.mod.ineq", "alg.mod.count"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Solve $|2x - 1| = 7$.",
          lines: ["2x - 1 = 7", "x = 4"],
          wrong: 1,
          options: ["There is a second case, $2x - 1 = -7$, giving $x = -3$", "$x$ should be 3", "Modulus equations have no solution"],
          answer: 0,
          explain: "Always write both cases: $x = 4$ or $x = -3$.",
        },
        {
          prompt: "Solve $|x + 2| < 5$.",
          lines: ["x + 2 < 5", "x < 3"],
          wrong: 1,
          options: ["It means $-5 < x + 2 < 5$, so $-7 < x < 3$", "It should be $x > 3$", "It should be $x < 7$"],
          answer: 0,
          explain: "Less than 5 from $-2$: between $-7$ and $3$.",
        },
        {
          prompt: "Simplify $|x - 4|$ when $x = 1$.",
          lines: ["|x - 4| = |x| - 4", "= 1 - 4 = -3"],
          wrong: 0,
          options: ["$|a - b|$ is not $|a| - |b|$: $|1 - 4| = |-3| = 3$", "The answer is $-3$", "The answer is 5"],
          answer: 0,
          explain: "A modulus is never negative. Work out the inside first, then take its size.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.mod" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain why $|x - a| = b$ has two solutions, and how you draw $y = |f(x)|$.",
      need: 2,
      ideas: [
        { id: "cases", text: "The inside can be b or −b: two cases.", keywords: [["two", "both", "case"], ["positive", "negative", "minus", "-b", "−b", "case"]] },
        { id: "distance", text: "|x| is a distance, so it is never negative.", keywords: [["distance", "never negative", "positive", "size"]] },
        { id: "reflect", text: "For y = |f(x)|, reflect the part below the x-axis.", keywords: [["reflect", "flip", "mirror"], ["below", "negative", "axis", "under"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "The modulus function",
        blocks: [
          { type: "definition", title: "Definition", text: "$|x|$ = the distance of x from 0. $|x| = x$ if $x \\ge 0$, and $-x$ if $x < 0$." },
          { type: "rule", title: "Equations", text: "$|f(x)| = b$ means $f(x) = b$ or $f(x) = -b$. $|f(x)| = |g(x)|$ means $f(x) = g(x)$ or $f(x) = -g(x)$." },
          { type: "rule", title: "Inequalities", text: "$|f(x)| < b \\iff -b < f(x) < b$. $|f(x)| > b \\iff f(x) < -b$ or $f(x) > b$." },
          { type: "sketch", title: "Sketch: y = |x² − 4|", graph: { x: [-4, 4], y: [-2, 8], curves: [{ expr: "|x^2 - 4|" }] } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.mod.eq", "alg.mod.ineq", "alg.mod.count"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 12: topic review ---------- */

const lesson12: AlgebraLesson = {
  id: "alg-12",
  title: "Lesson 12 · Algebra review and topic check",
  body: [
    "Well done for getting here. This lesson mixes everything in the topic, the way the GCE does.",
    "Take your time, work on paper, and use the skills map to see what to practise again before the exam.",
  ],
  skills: [{ id: "alg.review", name: "Mixed algebra (exam ready)" }],
  parts: [
    {
      kind: "see",
      title: "See the whole topic",
      text: "Before you start, check that you can match each question type to the right method.",
      questions: [
        { prompt: "Find the remainder when $f(x)$ is divided by $(x + 2)$.", options: ["Work out $f(-2)$", "Work out $f(2)$", "Use partial fractions"], answer: 0, explain: "Remainder theorem: the divisor is zero at $x = -2$." },
        { prompt: "Solve $\\frac{x + 1}{x - 4} < 0$.", options: ["Critical values and a sign diagram", "Multiply by $(x - 4)$", "Square both sides"], answer: 0, explain: "Never multiply by an expression of unknown sign." },
        { prompt: "Express $\\frac{4x}{(x - 1)(x + 1)^2}$ in partial fractions. How many fractions?", options: ["3", "2", "4"], answer: 0, explain: "One for $(x - 1)$, and two for the repeated factor $(x + 1)^2$." },
        { prompt: "Solve $|x - 5| \\ge 2$.", options: ["$x \\le 3$ or $x \\ge 7$", "$3 \\le x \\le 7$", "$x \\ge 7$"], answer: 0, explain: "At least 2 away from 5: outside the interval." },
      ],
    },
    {
      kind: "worked",
      title: "Do it with me: a full exam answer",
      prompt: "$f(x) = 2x^3 + x^2 - 13x + 6$. (a) Show that $(x - 2)$ is a factor. (b) Factorise $f(x)$ completely. (c) Solve $f(x) < 0$.",
      lines: [
        L("f(2) = 16 + 4 - 26 + 6 = 0 \\Rightarrow (x - 2) \\text{ is a factor}", "(a) Factor theorem. Show the substitution AND the conclusion.", "M1 A1"),
        L("f(x) = (x - 2)(2x^2 + 5x - 3)", "(b) Divide by $(x - 2)$.", "M1"),
        L("= (x - 2)(2x - 1)(x + 3)", "Factorise the quadratic.", "A1"),
        L("\\text{Critical values: } x = -3, \\; \\tfrac{1}{2}, \\; 2", "(c) Each factor is zero once.", "M1"),
        L("x < -3 \\;\\text{ or }\\; \\tfrac{1}{2} < x < 2", "Sign diagram: the cubic (positive leading coefficient) is negative on these intervals.", "A1"),
      ],
    },
    { kind: "practice", title: "Mixed practice", generators: ["alg.factor.find", "alg.cubic.solve", "alg.pf.distinct", "alg.pf.repeated", "alg.ineq.quad", "alg.ineq.rational", "alg.mod.eq", "alg.mod.ineq"], count: 6 },
    {
      kind: "traps",
      title: "Traps: the top five",
      cards: [
        { prompt: "Remainder when $f(x) = x^3 + 1$ is divided by $(x + 1)$:", lines: ["f(1) = 2"], wrong: 0, options: ["Use $f(-1) = 0$", "It is correct", "Use $f(0)$"], answer: 0, explain: "Divisor $(x + 1)$ → $x = -1$." },
        { prompt: "Solve $(x - 1)(x^2 - 4) = 0$:", lines: ["x = 1 \\text{ or } x = 2"], wrong: 0, options: ["$x^2 - 4 = 0$ also gives $x = -2$", "It is correct", "$x = 4$ is missing"], answer: 0, explain: "Three solutions: $1, 2, -2$." },
        { prompt: "Solve $\\frac{1}{x} < 2$:", lines: ["1 < 2x", "x > \\tfrac{1}{2}"], wrong: 0, options: ["Multiplying by x (sign unknown) is not allowed", "It is correct", "It should be $x < \\tfrac{1}{2}$"], answer: 0, explain: "The answer is $x < 0$ or $x > \\tfrac{1}{2}$." },
      ],
    },
    { kind: "exam", title: "Exam practice 1", generator: "exam.cubic.unknowns" },
    { kind: "exam", title: "Exam practice 2", generator: "exam.ineq" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Which part of this topic do you find hardest, and what will you do to get better at it? Name the method you will practise.",
      need: 1,
      ideas: [
        { id: "method", text: "Names a method from the topic (factor theorem, long division, partial fractions, sign diagram, modulus…).", keywords: [["factor", "remainder", "division", "partial", "fraction", "inequalit", "sign", "modulus", "cubic", "polynomial"]] },
        { id: "plan", text: "Says how they will practise.", keywords: [["practi", "revise", "redo", "again", "exercise", "every day", "past"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Topic summary page",
      page: {
        heading: "Algebra: topic summary",
        blocks: [
          { type: "rule", title: "Remainder and factor theorems", text: "Remainder on dividing by $(x - a)$ is $f(a)$. $(x - a)$ is a factor ⇔ $f(a) = 0$." },
          { type: "rule", title: "Partial fractions", text: "One fraction per linear factor; a repeated factor needs two; improper → divide first." },
          { type: "rule", title: "Inequalities", text: "Negative multiplier → reverse the sign. Quadratics: sketch. Rational: one side, sign diagram, bottom ≠ 0." },
          { type: "rule", title: "Modulus", text: "$|f| = b$: two cases. $|f| < b$: between. $|f| > b$: outside. $y = |f(x)|$: reflect the part below the axis." },
        ],
      },
    },
    {
      kind: "mastery",
      title: "Topic mastery check",
      generators: ["alg.factor.find", "alg.cubic.solve", "alg.pf.distinct", "alg.pf.repeated", "alg.ineq.quad", "alg.ineq.rational", "alg.mod.eq", "alg.mod.ineq", "alg.rem.find", "alg.poly.div"],
      count: 8,
      need: 6,
    },
  ],
};

export const lessons2: AlgebraLesson[] = [lesson5, lesson6, lesson7, lesson8, lesson9, lesson10, lesson11, lesson12];
