import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";

const run = promisify(execFile);

test("the authored six-level pack passes the developer solver", async () => {
  const script = `
    import { validateAllLevels } from './lib/game/index.ts';
    console.log(JSON.stringify(validateAllLevels().map((report) => ({
      levelId: report.levelId,
      permutations: report.permutations,
      hardValidCount: report.hardValidCount,
      maxHarmony: report.maxHarmony,
      perfectCount: report.perfectCount,
      warnings: report.warnings,
    }))));
  `;
  const { stdout } = await run(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", script], {
    cwd: new URL("../", import.meta.url),
  });
  const reports = JSON.parse(stdout.trim());

  assert.equal(reports.length, 6);
  assert.deepEqual(
    reports.map(({ permutations, hardValidCount, maxHarmony }) => ({ permutations, hardValidCount, maxHarmony })),
    [
      { permutations: 2, hardValidCount: 1, maxHarmony: 100 },
      { permutations: 6, hardValidCount: 2, maxHarmony: 100 },
      { permutations: 24, hardValidCount: 1, maxHarmony: 100 },
      { permutations: 24, hardValidCount: 1, maxHarmony: 86 },
      { permutations: 24, hardValidCount: 1, maxHarmony: 89 },
      { permutations: 24, hardValidCount: 2, maxHarmony: 100 },
    ],
  );
  assert.deepEqual(reports.flatMap((report) => report.warnings), []);
});
