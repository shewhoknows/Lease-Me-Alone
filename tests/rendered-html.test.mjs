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

test("server-renders the Lease Me Alone puzzle shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Lease Me Alone — Six-Level Vertical Slice<\/title>/i);
  assert.match(html, /Lease Me Alone/);
  assert.match(html, /First Night/);
  assert.match(html, /HOUSEHOLD GOAL/);
  assert.match(html, /Maya/);
  assert.match(html, /Dev/);
  assert.match(html, /MOVE IN/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps finished product metadata and removes starter preview code", async () => {
  const [page, layout, packageJson, concept, levelPack, gameData] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../docs/FLATMATES_GAME_CONCEPT.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/LEASE_ME_ALONE_VERTICAL_SLICE.md", import.meta.url), "utf8"),
    readFile(new URL("../lib/game/index.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /buildFailureEvents/);
  assert.match(page, /solveLevel/);
  assert.match(page, /room-mode-switch/);
  assert.match(page, /removeCharacter/);
  assert.match(page, /How Wants and Likes changed the score/);
  assert.match(page, /Harmony revealed after Move In/);
  assert.match(layout, /Lease Me Alone — Six-Level Vertical Slice/);
  assert.match(layout, /\/og\.png/);
  assert.match(packageJson, /"name": "lease-me-alone"/);
  assert.match(concept, /^# Game Concept: FLATMATES/m);
  assert.match(concept, /Finding people you can live with is the puzzle\./);
  assert.match(levelPack, /# Lease Me Alone: Vertical Slice Reference/);
  assert.match(levelPack, /Level 6: Housewarming/);
  assert.match(gameData, /export const GAME_LEVELS/);
  assert.match(gameData, /export function evaluateAssignment/);
  assert.match(gameData, /export function solveLevel/);
  await access(new URL("../public/og.png", import.meta.url));
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});

test("packages every level apartment and the preloaded Move In art", async () => {
  const artFiles = [
    "lease-me-alone-topdown-2.png",
    "lease-me-alone-topdown-3.png",
    "levels/level-03-room-to-work.png",
    "levels/level-04-balcony-rights.png",
    "levels/level-05-good-enough.png",
    "levels/level-06-housewarming.png",
    "lease-me-alone-cutaway.avif",
    "maps/chapter-01-moving-day.avif",
  ];

  for (const artFile of artFiles) {
    await access(new URL(`../public/art/${artFile}`, import.meta.url));
    await access(new URL(`../dist/client/art/${artFile}`, import.meta.url));
  }

  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /"early-bird": publicAsset\("\/art\/lease-me-alone-topdown-3\.png"\)/);
  assert.match(layout, /rel="preload"[\s\S]*lease-me-alone-cutaway\.avif/);
  assert.match(page, /SIMULATION_HOUSE_ART/);
  assert.match(page, /CHAPTER_MAP_ART/);
  assert.match(page, /simulationAssetsReady\.current = Promise\.all/);
  assert.match(page, /await simulationAssetsReady\.current/);
  assert.match(page, /\.decode\?\.\(\)/);
});
