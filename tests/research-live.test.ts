import { test } from "node:test";
import assert from "node:assert/strict";
import fixture from "./fixtures/openalex-works.json" with { type: "json" };
import { apaName, invertedToText, liveQuery, openAlexUrl, toSource, toSources } from "@/lib/research/live";
import { apaInText, plainReference } from "@/lib/research/apa";
import { abstractRoles } from "@/lib/research/reading";
import { isAcademic } from "@/lib/research/search";

test("live query: Google operators removed, OpenAlex separators removed, quotes kept", () => {
  assert.deepEqual(liveQuery('"mobile money" traders, Buea filetype:pdf site:repository'), { text: '"mobile money" traders Buea', openAccess: true });
  assert.equal(liveQuery("• drug: abuse (students)").text, "drug abuse students");
  assert.equal(liveQuery("x".repeat(500)).text.length, 200);
});

test("OpenAlex URL: title and abstract search, scopes, free full text, key", () => {
  const u = new URL(openAlexUrl("drug abuse students", { scope: "cm", key: "k123" })!);
  assert.equal(u.origin + u.pathname, "https://api.openalex.org/works");
  assert.equal(u.searchParams.get("filter"), "title_and_abstract.search:drug abuse students,authorships.countries:CM");
  assert.equal(u.searchParams.get("api_key"), "k123");
  assert.equal(u.searchParams.get("per_page"), "10");
  assert.ok(u.searchParams.get("select")!.includes("abstract_inverted_index"));
  assert.match(new URL(openAlexUrl("malaria", { scope: "africa" })!).searchParams.get("filter")!, /institutions\.continent:africa$/);
  assert.match(new URL(openAlexUrl("malaria filetype:pdf")!).searchParams.get("filter")!, /open_access\.is_oa:true$/);
  assert.equal(new URL(openAlexUrl("malaria")!).searchParams.get("api_key"), null, "no key: no parameter");
  assert.equal(openAlexUrl("a"), null);
  assert.equal(openAlexUrl('""'), null);
  assert.equal(openAlexUrl("filetype:pdf"), null);
});

test("abstracts rebuilt from OpenAlex's word positions", () => {
  assert.equal(invertedToText({ Abstract: [0], This: [1], study: [2], works: [3], ".": [4] }), "This study works.");
  assert.equal(invertedToText(null), "");
});

test("author names in APA style", () => {
  assert.equal(apaName("Peter T. Ngwa"), "Ngwa, P. T.");
  assert.equal(apaName("Marie-Claire Ngo"), "Ngo, M.-C.");
  assert.equal(apaName("Hamidu Naabo Adishetu"), "Adishetu, H. N.");
  assert.equal(apaName("UNESCO"), "UNESCO");
  assert.equal(apaName("N. M. (Ndiseh) Fekun"), "Fekun, N. M.");
});

test("real OpenAlex results become sources the course can show, guide, save and cite", () => {
  const list = toSources(fixture as unknown as Parameters<typeof toSources>[0]);
  assert.equal(list.length, 3);
  for (const s of list) {
    assert.match(s.id, /^live-W\d+$/);
    assert.ok(isAcademic(s), s.title);
    assert.ok(s.title && s.year > 1990 && s.authors.length >= 1, s.title);
    assert.ok(s.abstract.length > 100 && !/^abstract/i.test(s.abstract), "abstract rebuilt, label dropped");
    assert.ok(s.snippet.endsWith("…") && s.snippet.length < 260);
    assert.match(s.link, /^https:\/\//);
    assert.ok(!s.url.includes("https://"), "breadcrumb, not a raw link");
    // The reading guide finds an aim in every real abstract.
    assert.ok(abstractRoles(s.abstract).some((x) => x.role === "aim"), s.title);
    assert.ok(!/undefined|NaN/.test(plainReference(s)), plainReference(s));
    assert.match(apaInText(s), /^\([A-Z][^,]+, \d{4}\)$|^\([A-Z][^,]+ (&|et al\.)/);
  }
  const ghana = list.find((s) => /Ghana/.test(s.title))!;
  assert.equal(ghana.pages, "2000–2014");
  assert.equal(ghana.volume, "30(3)");
  assert.equal(ghana.venue, "Review of Development Economics");
  assert.match(plainReference(ghana), /Review of Development Economics, 30\(3\), 2000–2014\.$/);
});

test("odd OpenAlex records are skipped or filled safely", () => {
  assert.equal(toSource({ id: "https://openalex.org/W1", display_name: "" }), null);
  assert.equal(toSource({ display_name: "No id" }), null);
  const bare = toSource({ id: "https://openalex.org/W9", display_name: "A <i>bare</i> record", type: "dissertation" })!;
  assert.equal(bare.title, "A bare record");
  assert.equal(bare.kind, "thesis");
  assert.equal(bare.link, "https://openalex.org/W9");
  assert.equal(bare.abstract, "");
  assert.deepEqual(toSources(null), []);
  assert.deepEqual(toSources({}), []);
});
