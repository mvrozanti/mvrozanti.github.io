import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const text = (s) => s.replace(/<!-- -->/g, "");
const html = text(await readFile(new URL("../out/index.html", import.meta.url), "utf8"));
const htmlPt = text(await readFile(new URL("../out/pt/index.html", import.meta.url), "utf8"));
const linked = [...new Set([...html.matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))];
const ptPdfs = linked.filter((u) => u.endsWith("-en-impact.pdf")).map((u) => u.replace("-en-impact.pdf", "-pt-impact.pdf"));
const self = linked.filter((u) => /^https:\/\/mvr\.ac\//.test(u));
const urls = [...new Set([...linked, ...ptPdfs])].filter((u) => !self.includes(u));
const UA = "Mozilla/5.0 (X11; Linux x86_64) mvr.ac link check";
const BOT_WALLED = { "linkedin.com": [999] };

test("page carries the identity and every role", () => {
  for (const needle of ["Marcelo Vironda Rozanti", "Senior Software Engineer", "SRM Asset", "C6 Bank", "Fiserv", "Conta Azul", "Grão", "Raia Drogasil", "Sys4Bank", "Mackenzie"]) {
    assert.ok(html.includes(needle), `missing: ${needle}`);
  }
});

test("page renders without undefined, NaN or object leaks", () => {
  for (const page of [html, htmlPt]) for (const bad of ["undefined", "NaN", "[object Object]", "null</"]) assert.ok(!page.includes(bad), `leaked: ${bad}`);
});

test("/pt/ is the same résumé in Portuguese, roles included", () => {
  for (const needle of ["Engenheiro de Software Sênior", "Experiência", "Desenvolvedor Backend", "Formação", "Idiomas", "Português — nativo", "registradoras B3 e CERC", "pagamento instantâneo", "obrigações fiscais", "São Paulo, Brasil", "contribuições no último ano", "-pt-impact.pdf"]) {
    assert.ok(htmlPt.includes(needle), `pt missing: ${needle}`);
  }
  assert.match(htmlPt, /hreflang="pt-BR"/i, "pt missing hreflang alternate");
  for (const english of ["Senior Software Engineer ", "Backend integrations with", "Experience<", "Education<"]) {
    assert.ok(!htmlPt.includes(english), `pt still carries: ${english}`);
  }
  for (const needle of ["SRM Asset", "C6 Bank", "Sys4Bank", "RAT-via-Telegram"]) assert.ok(htmlPt.includes(needle), `pt missing: ${needle}`);
});

test("design-system files and data ship with the export", async () => {
  for (const f of ["theme.css", "theme.js", "contributions.json", "CNAME"]) await access(new URL(`../out/${f}`, import.meta.url));
  assert.ok(html.includes('href="/theme.css"') && html.includes('src="/theme.js"'));
});

test("contribution heatmap has a full year of cells and a caption", () => {
  const cells = (html.match(/<rect class="h[0-4]"/g) || []).length;
  assert.ok(cells >= 360 && cells <= 371, `cells: ${cells}`);
  assert.match(html, /contributions in the last year/);
});

test("links into this site point at files the export contains", async () => {
  assert.ok(self.length >= 2, "expected the hreflang alternates");
  for (const u of self) {
    const rel = new URL(u).pathname.replace(/\/$/, "") + "/index.html";
    await access(new URL(`../out${rel}`, import.meta.url));
  }
});

test("the page links out", () => {
  assert.ok(linked.length >= 12, `only ${linked.length} external links`);
  assert.ok(linked.some((u) => u.endsWith("-en-impact.pdf")), "no PDF link");
  assert.equal(ptPdfs.length, 1, "the PT-BR PDF the toggle reveals must be derivable from the EN one");
  assert.ok(html.includes("mailto:"), "no mailto");
});

for (const url of urls) {
  test(`reachable: ${url}`, async () => {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const allowed = BOT_WALLED[host] || [];
    const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": UA }, signal: AbortSignal.timeout(20000) });
    assert.ok(res.ok || allowed.includes(res.status), `${res.status} ${res.statusText}`);
  });
}
