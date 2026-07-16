import { execFileSync } from "node:child_process";

export function listChangedFiles(root: string, baseRef?: string): string[] {
  if (!baseRef) return [];

  try {
    const out = execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=ACMR", `${baseRef}...HEAD`],
      { cwd: root, encoding: "utf8" },
    );
    return out
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    // Fallback for shallow clones / first push: compare to empty tree is hard;
    // return empty so non-diff checks still run.
    return [];
  }
}
