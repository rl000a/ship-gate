#!/usr/bin/env node
import { resolve } from "node:path";
import { listChangedFiles } from "./git.js";
import { runChecks, summarize } from "./run.js";

function parseArgs(argv: string[]) {
  let root = process.cwd();
  let base: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root" && argv[i + 1]) {
      root = resolve(argv[++i]!);
    } else if (a === "--base" && argv[i + 1]) {
      base = argv[++i];
    } else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return { root, base };
}

function printHelp() {
  console.log(`ship-gate — same merge gates for humans and agents

Usage:
  ship-gate [--root <path>] [--base <git-ref>]

Options:
  --root   Repo root (default: cwd)
  --base   Git ref to diff against (e.g. origin/main). Enables PR-mode checks.

Exit codes:
  0  all error-severity checks passed
  1  one or more checks failed
`);
}

function formatResult(ok: boolean): string {
  return ok ? "PASS" : "FAIL";
}

async function main() {
  const { root, base } = parseArgs(process.argv.slice(2));
  const changedFiles = listChangedFiles(root, base);

  console.log(`ship-gate`);
  console.log(`  root: ${root}`);
  console.log(`  base: ${base ?? "(none — local mode)"}`);
  console.log(`  changed files: ${changedFiles.length || "(all / n/a)"}`);
  console.log("");

  const results = await runChecks({ root, changedFiles });
  for (const r of results) {
    console.log(`[${formatResult(r.ok)}] ${r.title}`);
    for (const m of r.messages) {
      console.log(`       ${m}`);
    }
    console.log("");
  }

  const { ok, failed } = summarize(results);
  if (!ok) {
    console.error(`ship-gate failed (${failed.length} check(s)).`);
    process.exit(1);
  }
  console.log("ship-gate passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
