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
      passingCount: report.solutions.filter((solution) => solution.result.passed).length,
      warnings: report.warnings,
    }))));
  `;
  const { stdout } = await run(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", script], {
    cwd: new URL("../", import.meta.url),
  });
  const reports = JSON.parse(stdout.trim());

  assert.equal(reports.length, 6);
  assert.deepEqual(
    reports.map(({ permutations, hardValidCount, maxHarmony, passingCount }) => ({ permutations, hardValidCount, maxHarmony, passingCount })),
    [
      { permutations: 2, hardValidCount: 1, maxHarmony: 100, passingCount: 1 },
      { permutations: 6, hardValidCount: 2, maxHarmony: 100, passingCount: 2 },
      { permutations: 24, hardValidCount: 2, maxHarmony: 100, passingCount: 2 },
      { permutations: 24, hardValidCount: 2, maxHarmony: 89, passingCount: 2 },
      { permutations: 24, hardValidCount: 4, maxHarmony: 92, passingCount: 1 },
      { permutations: 24, hardValidCount: 2, maxHarmony: 100, passingCount: 2 },
    ],
  );
  assert.deepEqual(reports.flatMap((report) => report.warnings), []);
});
