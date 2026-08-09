import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Flatmates puzzle shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Flatmates — The Night Owl Problem<\/title>/i);
  assert.match(html, /The Night Owl Problem/);
  assert.match(html, /HOUSEHOLD GOAL/);
  assert.match(html, /Tara/);
  assert.match(html, /Kabir/);
  assert.match(html, /MOVE IN/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps finished product metadata and removes starter preview code", async () => {
  const [page, layout, packageJson, concept] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../docs/FLATMATES_GAME_CONCEPT.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /buildSimulation/);
  assert.match(page, /Open Flat 4B chat/);
  assert.match(layout, /Flatmates — The Night Owl Problem/);
  assert.match(layout, /\/og\.png/);
  assert.match(packageJson, /"name": "lease-me-alone"/);
  assert.match(concept, /^# Game Concept: FLATMATES/m);
  assert.match(concept, /Finding people you can live with is the puzzle\./);
  await access(new URL("../public/og.png", import.meta.url));
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});
