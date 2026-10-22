/**
 * Algebra lessons (GCE A Level Pure Mathematics, Lower Sixth). Each lesson follows the lesson rhythm:
 * see it → understand why → do it with me → fill the gaps → your turn → traps → exam style →
 * say it back → notebook page → mastery check. Maths in text goes between $…$.
 * Question generators are in ./generators.ts; hints for common errors in ./misconceptions.json.
 */
import type { LessonPart, SolutionLine } from "@/lib/maths/types";
import { lessons2 } from "./lessons-2";

export type AlgebraLesson = { id: string; title: string; body: string[]; skills: { id: string; name: string }[]; parts: LessonPart[] };

const L = (latex: string, note?: string, mark?: string): SolutionLine => ({ latex, note, mark });

/* ---------- Lesson 0: check your foundations ---------- */

const lesson0: AlgebraLesson = {
  id: "alg-0",
  title: "Lesson 0 · Check your foundations",
  body: [
    "Algebra in Upper and Lower Sixth builds on skills from Form 5: negative numbers, fractions, brackets, factorising, indices, substitution and rearranging.",
    "This short check finds any gaps. If you find one, you get a quick repair before you start. Have your exercise book and a pen ready.",
  ],
  skills: [
    { id: "pre.negatives", name: "Negative numbers" },
    { id: "pre.fractions", name: "Fractions" },
    { id: "pre.expand", name: "Expanding brackets" },
    { id: "pre.factorise", name: "Factorising quadratics" },
    { id: "pre.indices", name: "Indices (powers)" },
    { id: "pre.substitute", name: "Substitution" },
    { id: "pre.rearrange", name: "Rearranging formulae" },
  ],
  parts: [
    {
      kind: "diagnostic",
      title: "Starting check",
      perSkill: 1,
      skills: [
        {
          id: "pre.negatives",
          name: "Negative numbers",
          generator: "pre.negatives",
          explain: "Two rules: multiply or divide before you add or subtract, and two signs next to each other combine: $-(-3) = +3$, $+(-3) = -3$.",
          repair: [L("-5 - (-2) \\times 4", "Multiply first."), L("(-2) \\times 4 = -8", "Negative × positive = negative."), L("-5 - (-8) = -5 + 8 = 3", "Minus a negative = plus.")],
        },
        {
          id: "pre.fractions",
          name: "Fractions",
          generator: "pre.fractions",
          explain: "To add or subtract, use a common denominator. To multiply, multiply tops and bottoms. To divide, turn the second fraction upside down and multiply.",
          repair: [L("\\frac{2}{3} + \\frac{1}{4} = \\frac{8}{12} + \\frac{3}{12}", "Common denominator 12."), L("= \\frac{11}{12}", "Add the tops only.")],
        },
        {
          id: "pre.expand",
          name: "Expanding brackets",
          generator: "pre.expand",
          explain: "The term outside multiplies EVERY term inside. With two brackets, each term in the first multiplies each term in the second.",
          repair: [L("(x + 3)(x - 5) = x^2 - 5x + 3x - 15", "Four products."), L("= x^2 - 2x - 15", "Collect the x terms.")],
        },
        {
          id: "pre.factorise",
          name: "Factorising quadratics",
          generator: "pre.factorise",
          explain: "For $x^2 + bx + c$, find two numbers that multiply to $c$ and add to $b$. Check by expanding.",
          repair: [L("x^2 + 7x + 12", "Multiply to 12, add to 7: 3 and 4."), L("= (x + 3)(x + 4)")],
        },
        {
          id: "pre.indices",
          name: "Indices (powers)",
          generator: "pre.indices",
          explain: "Multiplying: add the powers. Dividing: subtract the powers. Power of a power: multiply the powers.",
          repair: [L("x^4 \\times x^3 = x^{7}"), L("\\frac{x^7}{x^2} = x^{5}"), L("(2x^3)^2 = 4x^{6}")],
        },
        {
          id: "pre.substitute",
          name: "Substitution",
          generator: "pre.substitute",
          explain: "Replace the letter with the number in brackets, then follow the order of operations.",
          repair: [L("x^2 - 3x \\text{ when } x = -2"), L("= (-2)^2 - 3(-2)", "Brackets!"), L("= 4 + 6 = 10")],
        },
        {
          id: "pre.rearrange",
          name: "Rearranging formulae",
          generator: "pre.rearrange",
          explain: "Do the same to both sides. Undo the operations in reverse order: last done, first undone.",
          repair: [L("y = 3x + 5"), L("y - 5 = 3x", "Subtract 5."), L("x = \\frac{y - 5}{3}", "Divide by 3.")],
        },
      ],
    },
  ],
};

/* ---------- Lesson 1: what is a polynomial? ---------- */

const lesson1: AlgebraLesson = {
  id: "alg-1",
  title: "Lesson 1 · What is a polynomial?",
  body: [
    "A polynomial is an expression like $3x^2 - 5x + 1$: terms made of a number times a whole-number power of x.",
    "Today you learn the words examiners use: term, coefficient, degree. First, look at the shapes polynomials make.",
  ],
  skills: [
    { id: "alg.poly.terms", name: "Terms, coefficients and degree" },
    { id: "alg.poly.evaluate", name: "Evaluating f(a)" },
  ],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "Move the sliders. The degree is the highest power of x. The leading coefficient $a$ is the number in front of it. Watch how each one changes the curve.",
      graph: {
        x: [-4, 4],
        y: [-6, 6],
        curves: [{ expr: "a*x + 1" }],
        params: [
          { name: "n", label: "Degree n", min: 1, max: 4, step: 1, value: 1 },
          { name: "a", label: "Leading coeff. a", min: -3, max: 3, step: 0.5, value: 1 },
        ],
        select: { param: "n", exprs: { "1": "a*x + 1", "2": "a*x^2 - 2", "3": "a*(x^3 - 3x)", "4": "a*(x^4 - 4x^2) + 1" } },
      },
      questions: [
        { prompt: "Set the degree to 2. What shape is the graph?", options: ["A straight line", "A U-shaped curve (a parabola)", "An S-shaped curve", "A W-shaped curve"], answer: 1, explain: "Degree 2 (a quadratic) always gives a U-shaped curve called a parabola." },
        { prompt: "Now make the leading coefficient $a$ negative. What happens?", options: ["The curve turns upside down", "The curve moves to the right", "The degree changes", "Nothing changes"], answer: 0, explain: "A negative leading coefficient reflects the curve in the x-axis: a U becomes an upside-down U." },
        { prompt: "Set the degree to 3 with $a > 0$. Where does the right-hand end of the curve go?", options: ["Up", "Down"], answer: 0, explain: "For a cubic with a positive leading coefficient, the curve goes up on the right and down on the left." },
      ],
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy these definitions into your exercise book, under the title “Polynomials”.",
      lines: [
        L("a_nx^n + a_{n-1}x^{n-1} + \\dots + a_1x + a_0", "A polynomial: the powers of x are whole numbers 0, 1, 2, … The numbers $a_n, …, a_0$ are the coefficients."),
        L("\\text{Degree} = \\text{the highest power of } x", "Degree 1 is linear, 2 quadratic, 3 cubic, 4 quartic."),
        L("\\text{Leading coefficient} = a_n", "The number in front of the highest power, with its sign."),
        L("\\text{Constant term} = a_0", "The term with no x."),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "alg.poly.parts", seed: 4242 },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.poly.evaluate", hide: [2] },
    { kind: "practice", title: "Your turn", generators: ["alg.poly.parts", "alg.poly.evaluate", "alg.poly.isPoly"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Find the degree of $5x^2 - 3x^6 + 2$.",
          lines: ["5x^2 - 3x^6 + 2", "\\text{The first term is } 5x^2", "\\text{Degree} = 2"],
          wrong: 2,
          options: ["The degree is the highest power, 6, wherever it is written", "The degree is the number of terms, 3", "The degree is the leading coefficient, −3"],
          answer: 0,
          explain: "Always look for the highest power. Here it is $x^6$, so the degree is 6.",
        },
        {
          prompt: "Find $f(-2)$ when $f(x) = x^2 - 3x$.",
          lines: ["f(-2) = -2^2 - 3(-2)", "= -4 + 6", "= 2"],
          wrong: 0,
          options: ["$(-2)^2$ needs brackets: it equals $+4$, so $f(-2) = 10$", "$-3(-2)$ should be $-6$", "The answer must be negative"],
          answer: 0,
          explain: "Without brackets, $-2^2$ means $-(2^2) = -4$. Write $(-2)^2 = 4$, so $f(-2) = 4 + 6 = 10$.",
        },
        {
          prompt: "State the leading coefficient of $4 + x - 2x^3$.",
          lines: ["4 + x - 2x^3", "\\text{The first number is } 4", "\\text{Leading coefficient} = 4"],
          wrong: 2,
          options: ["It is $-2$: the number in front of the highest power $x^3$", "It is 1: the coefficient of x", "It is 3: the highest power"],
          answer: 0,
          explain: "Rewrite in descending powers: $-2x^3 + x + 4$. The leading coefficient is $-2$, with its sign.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.poly.basics" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "In one or two sentences, explain what the degree and the leading coefficient of a polynomial are.",
      need: 2,
      ideas: [
        { id: "degree", text: "The degree is the highest power of x.", keywords: [["degree"], ["highest", "biggest", "largest", "greatest", "top"]] },
        { id: "leading", text: "The leading coefficient is the number in front of the highest power.", keywords: [["coefficient"], ["front", "number", "multipl", "attached", "goes with", "with"]] },
        { id: "order", text: "Write the powers in descending order first.", keywords: [["order", "descending", "arrange", "rewrite", "highest first", "sort"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Polynomials: the basics",
        blocks: [
          { type: "definition", title: "Definition", text: "A polynomial is a sum of terms $a x^n$ where $n$ is a whole number (0, 1, 2, …)." },
          { type: "rule", title: "Key words", text: "Degree = highest power. Leading coefficient = the number in front of the highest power. Constant term = the term with no x." },
          {
            type: "example",
            title: "Example",
            prompt: "For $4 + x - 2x^3$:",
            lines: [L("= -2x^3 + x + 4"), L("\\text{Degree } 3, \\text{ leading coefficient } -2, \\text{ constant } 4")],
          },
          { type: "sketch", title: "Sketch: a cubic with a > 0", graph: { x: [-3, 3], y: [-4, 4], curves: [{ expr: "x^3 - 3x" }] } },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.poly.parts", "alg.poly.evaluate", "alg.poly.isPoly"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 2: adding, subtracting and multiplying ---------- */

const lesson2: AlgebraLesson = {
  id: "alg-2",
  title: "Lesson 2 · Adding, subtracting and multiplying polynomials",
  body: [
    "To add or subtract polynomials, you collect like terms: $x^2$ with $x^2$, $x$ with $x$.",
    "To multiply, every term of one polynomial multiplies every term of the other. A grid (area model) keeps you organised.",
  ],
  skills: [
    { id: "alg.poly.addsub", name: "Adding and subtracting polynomials" },
    { id: "alg.poly.mul", name: "Multiplying polynomials" },
  ],
  parts: [
    {
      kind: "see",
      title: "See it",
      text: "A farm plot in Ndop is $(x + 3)$ metres long and $(x + 2)$ metres wide. Its area splits into four parts. Move the slider to change $x$.",
      visual: "area",
      questions: [
        { prompt: "How many parts is the rectangle split into?", options: ["2", "3", "4", "6"], answer: 2, explain: "Each of the 2 terms of the length meets each of the 2 terms of the width: 2 × 2 = 4 parts." },
        { prompt: "What is the area of the small part in the bottom-right corner?", options: ["5", "6", "3x", "x²"], answer: 1, explain: "It is 3 by 2, so its area is 6." },
        { prompt: "So $(x + 3)(x + 2) = $", options: ["$x^2 + 6$", "$x^2 + 5x + 6$", "$x^2 + 6x + 5$", "$2x + 5$"], answer: 1, explain: "Add the four parts: $x^2 + 2x + 3x + 6 = x^2 + 5x + 6$. Do not forget the two middle parts!" },
      ],
    },
    {
      kind: "worked",
      title: "Do it with me",
      prompt: "Simplify $(3x^2 - 2x + 5) - (x^2 - 4x - 1)$.",
      lines: [
        L("= 3x^2 - 2x + 5 - x^2 + 4x + 1", "Remove the brackets. The minus sign changes EVERY sign in the second bracket: $-x^2$, $+4x$, $+1$."),
        L("= 3x^2 - x^2 - 2x + 4x + 5 + 1", "Put like terms next to each other."),
        L("= 2x^2 + 2x + 6", "Collect like terms."),
      ],
    },
    { kind: "grid", title: "The grid method", generator: "alg.poly.mul" },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.poly.square", hide: [0, 2] },
    { kind: "practice", title: "Your turn", generators: ["alg.poly.addsub", "alg.poly.mul", "alg.poly.square"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Expand $(x + 5)^2$.",
          lines: ["(x + 5)^2", "= x^2 + 5^2", "= x^2 + 25"],
          wrong: 1,
          options: ["$(x + 5)^2 = (x + 5)(x + 5)$ has a middle term $10x$", "$5^2$ should be 10", "$x^2$ should be $2x$"],
          answer: 0,
          explain: "$(x + 5)(x + 5) = x^2 + 5x + 5x + 25 = x^2 + 10x + 25$.",
        },
        {
          prompt: "Simplify $(2x^2 + 3x) - (x^2 - 4x + 1)$.",
          lines: ["= 2x^2 + 3x - x^2 - 4x + 1", "= x^2 - x + 1"],
          wrong: 0,
          options: ["The minus changes every sign: $-(-4x) = +4x$ and $-(+1) = -1$", "$2x^2 - x^2$ should be $x$", "You should add the brackets"],
          answer: 0,
          explain: "Correct: $2x^2 + 3x - x^2 + 4x - 1 = x^2 + 7x - 1$.",
        },
        {
          prompt: "Simplify $2x^2 \\times 3x^3$.",
          lines: ["2x^2 \\times 3x^3", "= 6x^6"],
          wrong: 1,
          options: ["When multiplying, ADD the powers: $6x^5$", "The number should be 5", "It should be $5x^5$"],
          answer: 0,
          explain: "$2 \\times 3 = 6$ and $x^2 \\times x^3 = x^{2+3} = x^5$, so $6x^5$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.poly.expand" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Explain how you multiply two polynomials, and how you finish.",
      need: 2,
      ideas: [
        { id: "every", text: "Every term of the first polynomial multiplies every term of the second.", keywords: [["each", "every", "all"], ["term"]] },
        { id: "collect", text: "Then collect (add) like terms.", keywords: [["collect", "add", "combine", "group", "simplif"], ["like", "same", "similar", "together"]] },
        { id: "grid", text: "A grid helps you not to miss any product.", keywords: [["grid", "table", "box", "area"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Adding, subtracting and multiplying polynomials",
        blocks: [
          { type: "rule", title: "Subtracting", text: "A minus sign in front of a bracket changes the sign of EVERY term inside." },
          { type: "rule", title: "Multiplying", text: "Each term × each term, then collect like terms. $(a + b)^2 = a^2 + 2ab + b^2$." },
          {
            type: "example",
            title: "Example",
            prompt: "$(2x + 3)(x^2 - x + 4)$",
            lines: [L("= 2x^3 - 2x^2 + 8x + 3x^2 - 3x + 12"), L("= 2x^3 + x^2 + 5x + 12")],
          },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.poly.addsub", "alg.poly.mul", "alg.poly.square"], count: 5, need: 4 },
  ],
};

/* ---------- Lesson 3: polynomial long division ---------- */

const lesson3: AlgebraLesson = {
  id: "alg-3",
  title: "Lesson 3 · Polynomial long division",
  body: [
    "You already know long division with numbers. Dividing polynomials uses exactly the same four steps: divide, multiply, subtract, bring down.",
    "Lay it out the same way in your book. The quotient is the answer on top; the remainder is what is left at the end.",
  ],
  skills: [
    { id: "alg.div.number", name: "Long division with numbers" },
    { id: "alg.div.poly", name: "Dividing a polynomial by (x − a)" },
  ],
  parts: [
    { kind: "division", title: "See it: numbers first", generator: "num.longdiv", mode: "show" },
    {
      kind: "see",
      title: "Understand why",
      text: "Polynomial division repeats the same four steps. Instead of digits, you work with the terms of the polynomial, highest power first.",
      questions: [
        { prompt: "What are the four steps that repeat in long division, in order?", options: ["Divide, multiply, subtract, bring down", "Multiply, divide, add, bring down", "Subtract, divide, multiply, bring down"], answer: 0, explain: "Divide, multiply, subtract, bring down. Then repeat until nothing is left to bring down." },
        { prompt: "To divide $x^3 - 7x + 6$, which line do you write as the dividend?", options: ["$x^3 + 0x^2 - 7x + 6$", "$x^3 - 7x + 6$ with no gap", "$x^3 - 7x$"], answer: 0, explain: "Write $0x^2$ for the missing power so that like terms stay in the same column." },
        { prompt: "When the remainder is 0, what does it tell you?", options: ["The divisor goes in exactly: it is a factor", "You made a mistake", "The quotient is 0"], answer: 0, explain: "A remainder of 0 means the divisor divides exactly: it is a factor. You will use this in lesson 5." },
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "alg.poly.div", seed: 1717 },
    { kind: "division", title: "Fill the gaps", generator: "alg.poly.div", mode: "fill" },
    { kind: "practice", title: "Your turn", generators: ["alg.poly.div"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Divide $2x^3 - 3x^2 + 5$ by $(x - 2)$. The first stage:",
          lines: ["2x^2(x - 2) = 2x^3 - 4x^2", "(2x^3 - 3x^2) - (2x^3 - 4x^2) = -7x^2"],
          wrong: 1,
          options: ["$-(-4x^2) = +4x^2$, so $-3x^2 + 4x^2 = x^2$", "$2x^3 - 2x^3$ should be $4x^3$", "You should add the two lines"],
          answer: 0,
          explain: "Subtracting a negative term gives a plus: the result is $x^2$, not $-7x^2$.",
        },
        {
          prompt: "Divide $x^3 - 7x + 6$ by $(x - 1)$. Setting out:",
          lines: ["\\text{Dividend: } x^3 \\;\\; -7x \\;\\; +6 \\text{ (three columns)}", "x^2(x - 1) = x^3 - x^2"],
          wrong: 0,
          options: ["Write $x^3 + 0x^2 - 7x + 6$: one column for each power", "The divisor should be $(x + 1)$", "Start by dividing 6 by 1"],
          answer: 0,
          explain: "With a missing power, the columns no longer line up and the subtraction goes wrong. Always write $0x^2$.",
        },
        {
          prompt: "First step of $(x^3 + 2x^2 - 5) \\div (x + 3)$:",
          lines: ["\\frac{x^3}{x} = x^3"],
          wrong: 0,
          options: ["Dividing powers: subtract them, $\\frac{x^3}{x} = x^2$", "It should be $3x^3$", "It should be $x^4$"],
          answer: 0,
          explain: "$x^3 \\div x = x^{3-1} = x^2$. The first term of the quotient is $x^2$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.poly.divide" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "Describe, in your own words, the steps you repeat in polynomial long division.",
      need: 3,
      ideas: [
        { id: "divide", text: "Divide the first term by the first term of the divisor.", keywords: [["divid"]] },
        { id: "multiply", text: "Multiply the divisor by that term.", keywords: [["multipl", "times"]] },
        { id: "subtract", text: "Subtract (change every sign).", keywords: [["subtract", "take away", "minus"]] },
        { id: "bring", text: "Bring down the next term and repeat.", keywords: [["bring", "next term", "repeat", "again"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "Polynomial long division",
        blocks: [
          { type: "rule", title: "The four steps", text: "Divide, multiply, subtract, bring down. Repeat until the remainder has a lower degree than the divisor." },
          { type: "note", title: "Missing powers", text: "Write $0x^2$ (or $0x$) for a missing power so the columns line up." },
          { type: "rule", title: "The result", text: "$f(x) = (x - a)Q(x) + R$, where $Q(x)$ is the quotient and $R$ is the remainder." },
          {
            type: "example",
            title: "Example",
            prompt: "$(2x^3 - 3x^2 + 5) \\div (x - 2)$",
            lines: [L("2x^2(x - 2) = 2x^3 - 4x^2", "subtract → x^2"), L("x(x - 2) = x^2 - 2x", "subtract → 2x + 5"), L("2(x - 2) = 2x - 4", "subtract → 9"), L("Q(x) = 2x^2 + x + 2, \\quad R = 9")],
          },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.poly.div", "num.longdiv"], count: 4, need: 3 },
  ],
};

/* ---------- Lesson 4: the remainder theorem ---------- */

const lesson4: AlgebraLesson = {
  id: "alg-4",
  title: "Lesson 4 · The remainder theorem",
  body: [
    "Long division takes time. Is there a short cut to find only the remainder?",
    "You will divide a few times, fill a table, and discover the short cut yourself. It is called the remainder theorem.",
  ],
  skills: [{ id: "alg.rem", name: "The remainder theorem" }],
  parts: [
    {
      kind: "table",
      title: "See it: discover the pattern",
      generator: "alg.rem.table",
      question: {
        prompt: "Look at your table. What do you notice?",
        options: ["The remainder after dividing by $(x - a)$ is always equal to $f(a)$", "The remainder is always 0", "The remainder is $a - f(a)$", "There is no pattern"],
        answer: 0,
        explain: "In every row, the remainder equals $f(a)$. This is the remainder theorem.",
      },
    },
    {
      kind: "paper",
      title: "Understand why",
      instruction: "Copy the remainder theorem and its proof into your book.",
      lines: [
        L("f(x) = (x - a)Q(x) + R", "Any division by $(x - a)$ gives a quotient $Q(x)$ and a number remainder $R$."),
        L("f(a) = (a - a)Q(a) + R", "Put $x = a$ into both sides."),
        L("f(a) = 0 \\times Q(a) + R = R", "$(a - a) = 0$, so the first part disappears."),
        L("\\text{Remainder theorem: dividing } f(x) \\text{ by } (x - a) \\text{ leaves remainder } f(a)", "For $(x + a)$ use $f(-a)$. For $(bx - c)$ use $f\\left(\\frac{c}{b}\\right)$."),
      ],
    },
    { kind: "worked", title: "Do it with me", generator: "alg.rem.find", seed: 3131 },
    { kind: "gaps", title: "Fill the gaps", generator: "alg.rem.find", hide: [3] },
    { kind: "practice", title: "Your turn", generators: ["alg.rem.find"], count: 3 },
    {
      kind: "traps",
      title: "Traps",
      cards: [
        {
          prompt: "Find the remainder when $f(x) = x^3 + 2x - 5$ is divided by $(x + 2)$.",
          lines: ["x + 2 = 0 \\Rightarrow x = 2", "f(2) = 8 + 4 - 5 = 7"],
          wrong: 0,
          options: ["$x + 2 = 0$ gives $x = -2$, so use $f(-2)$", "You must use long division", "The remainder is always positive"],
          answer: 0,
          explain: "$f(-2) = -8 - 4 - 5 = -17$. The remainder is $-17$.",
        },
        {
          prompt: "Find the remainder when $f(x) = 4x^2 + x - 3$ is divided by $(2x - 1)$.",
          lines: ["2x - 1 = 0 \\Rightarrow x = 1", "f(1) = 4 + 1 - 3 = 2"],
          wrong: 0,
          options: ["$2x - 1 = 0$ gives $x = \\frac{1}{2}$, so use $f\\left(\\frac{1}{2}\\right)$", "Use $f(2)$", "Use $f(-1)$"],
          answer: 0,
          explain: "$f\\left(\\frac{1}{2}\\right) = 1 + \\frac{1}{2} - 3 = -\\frac{3}{2}$.",
        },
      ],
    },
    { kind: "exam", title: "Exam style", generator: "exam.rem.unknowns" },
    {
      kind: "sayItBack",
      title: "Say it back",
      prompt: "State the remainder theorem and explain in one sentence why it is true.",
      need: 2,
      ideas: [
        { id: "statement", text: "When f(x) is divided by (x − a), the remainder is f(a).", keywords: [["remainder"], ["f(a)", "f of a", "f(", "substitut"]] },
        { id: "zero", text: "Putting x = a makes (x − a) zero, so only R is left.", keywords: [["zero", "0", "disappear", "vanish", "cancel"]] },
        { id: "sign", text: "For (x + a), use f(−a).", keywords: [["-a", "−a", "minus a", "negative", "f(-", "f(−"]] },
      ],
    },
    {
      kind: "notebook",
      title: "Notebook page",
      page: {
        heading: "The remainder theorem",
        blocks: [
          { type: "rule", title: "Theorem", text: "When $f(x)$ is divided by $(x - a)$, the remainder is $f(a)$. For $(bx - c)$, the remainder is $f\\left(\\frac{c}{b}\\right)$." },
          { type: "example", title: "Proof", prompt: "", lines: [L("f(x) = (x - a)Q(x) + R"), L("f(a) = 0 \\times Q(a) + R = R")] },
          {
            type: "example",
            title: "Example",
            prompt: "Remainder when $x^3 - 2x + 4$ is divided by $(x + 1)$:",
            lines: [L("x + 1 = 0 \\Rightarrow x = -1", undefined, "M1"), L("f(-1) = -1 + 2 + 4 = 5", undefined, "A1")],
          },
        ],
      },
    },
    { kind: "mastery", title: "Mastery check", generators: ["alg.rem.find", "alg.poly.div", "alg.poly.evaluate"], count: 5, need: 4 },
  ],
};

export const lessons: AlgebraLesson[] = [lesson0, lesson1, lesson2, lesson3, lesson4, ...lessons2];
