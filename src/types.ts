export type CheckSeverity = "error" | "warn";

export type CheckResult = {
  id: string;
  title: string;
  ok: boolean;
  severity: CheckSeverity;
  messages: string[];
};

export type CheckContext = {
  root: string;
  /** Paths relative to root that changed (empty = check whole repo). */
  changedFiles: string[];
};

export type Check = {
  id: string;
  title: string;
  run: (ctx: CheckContext) => Promise<CheckResult> | CheckResult;
};
