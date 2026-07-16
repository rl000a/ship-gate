import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import type { Check, CheckResult } from "../types.js";

const SRC_RE = /(^|\/)(src|lib|app)\//;
const TEST_RE = /\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/;
const SKIP = /(^|\/)(node_modules|dist|\.git)(\/|$)/;

function isSourceFile(file: string): boolean {
  if (SKIP.test(file) || TEST_RE.test(file)) return false;
  if (!SRC_RE.test(file)) return false;
  return /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file);
}

function hasSiblingOrColocatedTest(root: string, sourceFile: string): boolean {
  const dir = dirname(sourceFile);
  const base = basename(sourceFile).replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, "");
  const candidates = [
    join(dir, `${base}.test.ts`),
    join(dir, `${base}.test.js`),
    join(dir, `${base}.spec.ts`),
    join(dir, "__tests__", `${base}.test.ts`),
    join("tests", `${base}.test.ts`),
    join("test", `${base}.test.ts`),
  ];
  return candidates.some((rel) => existsSync(join(root, rel)));
}

export const testsForSrcCheck: Check = {
  id: "tests-for-src",
  title: "Source changes include tests",
  run(ctx): CheckResult {
    const sources = (ctx.changedFiles.length ? ctx.changedFiles : []).filter(isSourceFile);

    // Whole-repo / no-diff mode: don't fail the demo on every local run.
    if (ctx.changedFiles.length === 0) {
      return {
        id: "tests-for-src",
        title: "Source changes include tests",
        ok: true,
        severity: "warn",
        messages: ["No changed-file list provided — skipped (pass --base for PR mode)."],
      };
    }

    const missing = sources.filter((f) => !hasSiblingOrColocatedTest(ctx.root, f));

    return {
      id: "tests-for-src",
      title: "Source changes include tests",
      ok: missing.length === 0,
      severity: "error",
      messages:
        missing.length === 0
          ? sources.length === 0
            ? ["No source files changed."]
            : [`${sources.length} source file(s) have colocated tests.`]
          : missing.map((f) => `Missing test for ${f} (add ${basename(f).replace(/\.\w+$/, "")}.test.ts)`),
    };
  },
};
