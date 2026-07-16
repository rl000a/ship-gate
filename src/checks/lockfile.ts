import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Check, CheckResult } from "../types.js";

export const lockfileCheck: Check = {
  id: "lockfile",
  title: "package.json and lockfile stay in sync",
  run(ctx): CheckResult {
    const pkgChanged =
      ctx.changedFiles.length === 0
        ? existsSync(join(ctx.root, "package.json"))
        : ctx.changedFiles.includes("package.json");

    const hasNpm = existsSync(join(ctx.root, "package-lock.json"));
    const hasPnpm = existsSync(join(ctx.root, "pnpm-lock.yaml"));
    const hasYarn = existsSync(join(ctx.root, "yarn.lock"));
    const lockChanged =
      ctx.changedFiles.length === 0
        ? hasNpm || hasPnpm || hasYarn
        : ctx.changedFiles.some((f) =>
            ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"].includes(f),
          );

    if (!existsSync(join(ctx.root, "package.json"))) {
      return {
        id: "lockfile",
        title: "package.json and lockfile stay in sync",
        ok: true,
        severity: "warn",
        messages: ["No package.json — skipped."],
      };
    }

    if (!hasNpm && !hasPnpm && !hasYarn) {
      return {
        id: "lockfile",
        title: "package.json and lockfile stay in sync",
        ok: false,
        severity: "error",
        messages: ["package.json exists but no lockfile found (package-lock.json / pnpm-lock.yaml / yarn.lock)."],
      };
    }

    if (ctx.changedFiles.length > 0 && pkgChanged && !lockChanged) {
      return {
        id: "lockfile",
        title: "package.json and lockfile stay in sync",
        ok: false,
        severity: "error",
        messages: ["package.json changed without a lockfile update."],
      };
    }

    return {
      id: "lockfile",
      title: "package.json and lockfile stay in sync",
      ok: true,
      severity: "error",
      messages: ["Lockfile present and consistent with this change set."],
    };
  },
};
