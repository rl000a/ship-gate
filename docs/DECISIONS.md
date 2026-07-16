# Architecture decisions

Short record of choices that shaped ship-gate. Read with the root README.

## ADR-001 — Policy engine as a CLI, Actions as a host

**Status:** Accepted

**Context:** Need automated merge policy on GitHub without building a CI platform.

**Decision:** Implement checks as a Node CLI; invoke from a workflow and optionally wrap with `action.yml`.

**Consequences:**

- Same binary path locally and in CI → easier debugging  
- Not coupled to Actions APIs for core logic  
- Publishing as an Action is packaging, not the product  

## ADR-002 — Diff-scoped checks when a base ref exists

**Status:** Accepted

**Context:** Whole-repo scans on every PR are slow and noisy; local runs may not have a meaningful base.

**Decision:** `--base` enables `git diff --name-only base...HEAD`. Without `--base`, skip diff-dependent rules (`tests-for-src`) and scan a bounded set of paths for secrets/lockfile.

**Consequences:**

- PR mode is the authoritative enforcement path  
- Local mode remains useful for secrets smoke checks  
- Shallow clones without history break diff mode → workflow uses `fetch-depth: 0`  

## ADR-003 — Fail closed on few high-confidence rules

**Status:** Accepted

**Context:** Policy noise trains people to ignore CI.

**Decision:** Ship three error-severity checks only. Prefer clear failure messages over broad heuristics.

**Consequences:**

- Incomplete coverage by design  
- Extension is additive (new check modules)  
- Reviewers can trust a red X more than a long warn list  

## ADR-004 — Do not special-case agent PRs

**Status:** Accepted

**Context:** AI-assisted changes are a throughput multiplier, not a separate trust domain.

**Decision:** No `if: actor == bot` relaxations. Same gates for every author.

**Consequences:**

- Aligns with “agent output is untrusted until verified”  
- Avoids a two-class merge culture that bypasses policy under pressure  

## ADR-005 — Dogfood on this repository

**Status:** Accepted

**Context:** Reference pipelines that never run on themselves drift from reality.

**Decision:** `.github/workflows/ci.yml` runs ship-gate after lint/test/build on this repo.

**Consequences:**

- Broken policy logic fails this project’s own PRs  
- README examples stay honest  
