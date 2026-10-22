import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyMapping, compositeOrder, describeSingle, horizontalHits, isFunctionMapping, mapPoint, rangeOn, runBackwards, runChain, transformLabel, transformedValue, verticalHits, IDENTITY } from "@/lib/maths/functions";
import { checkAnswer } from "@/lib/maths/answer";
import { normaliseAnswer, parseExpr, parseStatement, previewLatex, evaluate } from "@/lib/maths/expr";
import { exprEquivalent, sameSolutionSet } from "@/lib/maths/equiv";

test("mapping diagrams: one-to-one, many-to-one, one-to-many", () => {
  assert.equal(classifyMapping([[0, 0], [1, 1], [2, 2]]), "oneToOne");
  assert.equal(classifyMapping([[0, 0], [1, 0], [2, 1]]), "manyToOne");
  assert.equal(classifyMapping([[0, 0], [0, 1], [1, 2]]), "oneToMany");
  assert.equal(classifyMapping([[0, 0], [0, 1], [1, 1]]), "manyToMany");
  assert.ok(isFunctionMapping("manyToOne") && !isFunctionMapping("oneToMany"));
});

test("function machines: fg means g first; running backwards undoes the chain", () => {
  const m = [
    { name: "f", expr: "2x + 3", inverse: "(x - 3)/2" },
    { name: "g", expr: "x^2", inverse: "sqrt(x)" },
  ];
  assert.deepEqual(compositeOrder("fg"), ["g", "f"]);
  assert.deepEqual(runChain(m, compositeOrder("fg"), 3), [9, 21]); // fg(3) = f(9) = 21
  assert.deepEqual(runChain(m, compositeOrder("gf"), 3), [9, 81]); // gf(3) = g(9) = 81
  assert.deepEqual(runBackwards(m, ["f"], 11), [4]);
  assert.deepEqual(runBackwards(m, compositeOrder("fg"), 21), [9, 3]);
});

test("line tests: a function meets a vertical line once; one-to-one meets a horizontal line once", () => {
  assert.equal(verticalHits({ expr: "x^2" }, 1.5), 1);
  assert.equal(verticalHits({ x: "3cos(t)", y: "3sin(t)", t: [0, 6.2831] }, 1), 2); // a circle is not a function
  assert.equal(verticalHits({ x: "t^2", y: "t", t: [-3, 3] }, 4), 2); // x = y²
  assert.equal(horizontalHits({ expr: "x^2" }, 4, [-5, 5]), 2); // many-to-one
  assert.equal(horizontalHits({ expr: "x^3 + x" }, 2, [-5, 5]), 1); // one-to-one
});

test("transformations: points move the right way, with exam wording", () => {
  const p = { x: 2, y: 5 };
  assert.deepEqual(mapPoint({ ...IDENTITY, C: 3 }, p), { x: -1, y: 5 }); // f(x + 3): LEFT by 3
  assert.deepEqual(mapPoint({ ...IDENTITY, D: -4 }, p), { x: 2, y: 1 });
  assert.deepEqual(mapPoint({ ...IDENTITY, A: 2 }, p), { x: 2, y: 10 });
  assert.deepEqual(mapPoint({ ...IDENTITY, B: 2 }, p), { x: 1, y: 5 }); // f(2x): x-coordinate halves
  assert.deepEqual(mapPoint({ ...IDENTITY, A: -1 }, p), { x: 2, y: -5 });
  assert.deepEqual(mapPoint({ ...IDENTITY, B: -1 }, p), { x: -2, y: 5 });
  // The mapped point really is on the transformed curve.
  const f = (x: number) => x * x + 1;
  for (const t of [{ A: 2, B: 1, C: 1, D: -3 }, { A: -1, B: 2, C: 0, D: 1 }, { A: 0.5, B: -1, C: -2, D: 0 }]) {
    for (const x of [-2, 0.5, 3]) {
      const m = mapPoint(t, { x, y: f(x) });
      assert.ok(Math.abs(transformedValue(t, f, m.x) - m.y) < 1e-9);
    }
  }
  assert.equal(describeSingle("inside", 3), "Translation by the vector (-3, 0)");
  assert.equal(describeSingle("up", -2), "Translation by the vector (0, -2)");
  assert.equal(describeSingle("stretchX", 2), "Stretch parallel to the x-axis, scale factor 1/2");
  assert.equal(describeSingle("stretchY", 3), "Stretch parallel to the y-axis, scale factor 3");
  assert.equal(transformLabel({ A: 2, B: 1, C: 1, D: -3 }), "2f(x + 1) - 3");
  assert.equal(transformLabel({ A: -1, B: -1, C: 0, D: 0 }), "-f(-x)");
});

test("ranges on a restricted domain", () => {
  assert.deepEqual(rangeOn("x^2 - 4x + 1", 0, 5), [-3, 6]);
  assert.deepEqual(rangeOn("2x + 1", -1, 3), [-1, 7]);
});

test("answers: interval notation, ranges in f(x), ≠, and fg(x) = … prefixes", () => {
  assert.equal(normaliseAnswer("[2, ∞)"), "x >= 2");
  assert.equal(normaliseAnswer("(−∞, 3]"), "x <= 3");
  assert.equal(normaliseAnswer("x ∈ (1, 4]"), "1 < x <= 4");
  assert.ok(checkAnswer({ kind: "relation", value: "x < 1 or x > 3" }, "(-∞, 1) ∪ (3, ∞)").ok);
  assert.ok(checkAnswer({ kind: "relation", value: "x >= 2" }, "[2, ∞)").ok);
  assert.ok(checkAnswer({ kind: "relation", value: "x < 2 or x > 2" }, "x ≠ 2").ok);
  assert.ok(sameSolutionSet(parseStatement("x != 2"), parseStatement("x < 2 or x > 2")));
  // Ranges: f(x) ≥ 3 or y ≥ 3 is right; x ≥ 3 is the classic slip.
  assert.ok(checkAnswer({ kind: "range", value: "y >= 3" }, "f(x) >= 3").ok);
  assert.ok(checkAnswer({ kind: "range", value: "y >= 3" }, "y ≥ 3").ok);
  assert.ok(checkAnswer({ kind: "range", value: "-1 <= y <= 7" }, "-1 <= f(x) <= 7").ok);
  const slip = checkAnswer({ kind: "range", value: "y >= 3" }, "x >= 3");
  assert.equal(slip.ok, false);
  assert.equal(slip.mis, "rangeInX");
  assert.ok(checkAnswer({ kind: "expr", value: "4x^2 + 1" }, "fg(x) = 4x^2 + 1").ok);
  assert.ok(checkAnswer({ kind: "expr", value: "(x - 3)/2" }, "f⁻¹(x) = (x-3)/2").ok);
  assert.ok(checkAnswer({ kind: "expr", value: "(x - 3)/2" }, "f^-1(x) = (x-3)/2").ok);
  assert.ok(!checkAnswer({ kind: "expr", value: "ln(x)" }, "y").ok, "ln(x) is not a function name");
  assert.equal(previewLatex("[2, ∞)"), "x \\ge 2");
});

test("equivalence works for functions defined only for larger x (square roots)", () => {
  assert.ok(exprEquivalent(parseExpr("3 + sqrt(x - 7)"), parseExpr("sqrt(x - 7) + 3")));
  assert.ok(!exprEquivalent(parseExpr("3 + sqrt(x - 7)"), parseExpr("3 - sqrt(x - 7)")));
  assert.ok(Number.isNaN(evaluate(parseExpr("sqrt(x - 7)"), { x: 2 })));
});
