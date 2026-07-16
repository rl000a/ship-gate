import type { Check, CheckContext, CheckResult } from "./types.js";
import { secretsCheck } from "./checks/secrets.js";
import { testsForSrcCheck } from "./checks/tests-for-src.js";
import { lockfileCheck } from "./checks/lockfile.js";

export const defaultChecks: Check[] = [secretsCheck, testsForSrcCheck, lockfileCheck];

export async function runChecks(
  ctx: CheckContext,
  checks: Check[] = defaultChecks,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const check of checks) {
    results.push(await check.run(ctx));
  }
  return results;
}

export function summarize(results: CheckResult[]): { ok: boolean; failed: CheckResult[] } {
  const failed = results.filter((r) => !r.ok && r.severity === "error");
  return { ok: failed.length === 0, failed };
}
