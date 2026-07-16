import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { testsForSrcCheck } from "./tests-for-src.js";

describe("testsForSrcCheck", () => {
  it("fails when source has no colocated test", async () => {
    const root = mkdtempSync(join(tmpdir(), "ship-gate-"));
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src", "math.ts"), "export const add = (a:number,b:number) => a+b;\n");

    const result = await testsForSrcCheck.run({
      root,
      changedFiles: ["src/math.ts"],
    });
    assert.equal(result.ok, false);
  });

  it("passes when colocated test exists", async () => {
    const root = mkdtempSync(join(tmpdir(), "ship-gate-"));
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src", "math.ts"), "export const add = (a:number,b:number) => a+b;\n");
    writeFileSync(join(root, "src", "math.test.ts"), "import { describe } from 'node:test';\n");

    const result = await testsForSrcCheck.run({
      root,
      changedFiles: ["src/math.ts"],
    });
    assert.equal(result.ok, true);
  });
});
