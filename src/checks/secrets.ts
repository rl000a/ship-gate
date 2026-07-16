import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Check, CheckResult } from "../types.js";

/** High-signal patterns — enough for a teaching demo, not a full secret scanner. */
const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "AWS access key", re: /AKIA[0-9A-Z]{16}/g },
  { name: "GitHub PAT", re: /ghp_[A-Za-z0-9]{36}/g },
  {
    name: "Generic API key assignment",
    re: /(?:api[_-]?key|secret[_-]?key)\s*[:=]\s*['"][^'"]{16,}['"]/gi,
  },
  { name: "Private key block", re: /-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----/g },
];

const SKIP =
  /(^|\/)(node_modules|dist|\.git|coverage|\.next)(\/|$)|\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/i;

function filesToScan(root: string, changedFiles: string[]): string[] {
  if (changedFiles.length === 0) {
    return walkSourceFiles(root);
  }
  return changedFiles
    .filter((f) => !SKIP.test(f))
    .filter((f) => existsSync(join(root, f)));
}

function walkSourceFiles(root: string): string[] {
  const candidates = ["src", "lib", "app", "package.json", ".env.example", "README.md"];
  const out: string[] = [];
  for (const c of candidates) {
    const full = join(root, c);
    if (!existsSync(full)) continue;
    collectFiles(full, root, out);
  }
  return out;
}

function collectFiles(path: string, root: string, out: string[]): void {
  const st = statSync(path);
  if (st.isFile()) {
    const rel = path.slice(root.length + 1);
    if (!SKIP.test(rel)) out.push(rel);
    return;
  }
  if (!st.isDirectory()) return;
  for (const name of readdirSync(path)) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    collectFiles(join(path, name), root, out);
  }
}

export const secretsCheck: Check = {
  id: "secrets",
  title: "No secrets in changed files",
  run(ctx): CheckResult {
    const files = filesToScan(ctx.root, ctx.changedFiles);
    const messages: string[] = [];

    for (const rel of files) {
      let text: string;
      try {
        text = readFileSync(join(ctx.root, rel), "utf8");
      } catch {
        continue;
      }
      for (const { name, re } of PATTERNS) {
        re.lastIndex = 0;
        if (re.test(text)) {
          messages.push(`${rel}: possible ${name}`);
        }
      }
    }

    return {
      id: "secrets",
      title: "No secrets in changed files",
      ok: messages.length === 0,
      severity: "error",
      messages:
        messages.length === 0
          ? [`Scanned ${files.length} file(s) — no high-signal secrets.`]
          : messages,
    };
  },
};
