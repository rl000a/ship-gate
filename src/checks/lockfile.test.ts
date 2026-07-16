import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lockfileCheck } from "./lockfile.js";

describe("lockfileCheck", () => {
  it("fails when package.json changes without lockfile", async () => {
    const root = mkdtempSync(join(tmpdir(), "ship-gate-"));
    writeFileSync(join(root, "package.json"), '{"name":"x"}\n');
    writeFileSync(join(root, "package-lock.json"), "{}\n");

    const result = await lockfileCheck.run({
      root,
      changedFiles: ["package.json"],
    });
    assert.equal(result.ok, false);
  });

  it("passes when both change together", async () => {
    const root = mkdtempSync(join(tmpdir(), "ship-gate-"));
    writeFileSync(join(root, "package.json"), '{"name":"x"}\n');
    writeFileSync(join(root, "package-lock.json"), "{}\n");

    const result = await lockfileCheck.run({
      root,
      changedFiles: ["package.json", "package-lock.json"],
    });
    assert.equal(result.ok, true);
  });
});
