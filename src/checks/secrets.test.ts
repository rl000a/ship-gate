import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { secretsCheck } from "./secrets.js";

describe("secretsCheck", () => {
  it("passes clean source", async () => {
    const root = mkdtempSync(join(tmpdir(), "ship-gate-"));
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src", "ok.ts"), "export const x = 1;\n");

    const result = await secretsCheck.run({
      root,
      changedFiles: ["src/ok.ts"],
    });
    assert.equal(result.ok, true);
  });

  it("fails on AWS-looking key", async () => {
    const root = mkdtempSync(join(tmpdir(), "ship-gate-"));
    mkdirSync(join(root, "src"));
    writeFileSync(
      join(root, "src", "leak.ts"),
      'export const key = "AKIAIOSFODNN7EXAMPLE";\n',
    );

    const result = await secretsCheck.run({
      root,
      changedFiles: ["src/leak.ts"],
    });
    assert.equal(result.ok, false);
    assert.match(result.messages.join("\n"), /AWS access key/);
  });
});
