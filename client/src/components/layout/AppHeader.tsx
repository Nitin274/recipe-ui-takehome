import type { StorageSource, ValidationIssue } from "../../types/recipe";
import { buttonStyles } from "../common/classNames";
import { ThemeToggle } from "../common/ThemeToggle";

type Props = {
  issues: ValidationIssue[];
  saveState: string;
  saveMessage: string;
  source: StorageSource;
  theme: "light" | "dark";
  onImport: () => void;
  onExport: () => void;
  onSave: () => void;
  onToggleTheme: () => void;
};

export function AppHeader({ issues, saveState, saveMessage, source, theme, onImport, onExport, onSave, onToggleTheme }: Props) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-200/80 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800/95 dark:shadow-black/20 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-56 items-center gap-3">
        <div className="grid size-11 place-items-center rounded-lg bg-sky-500 font-extrabold text-white shadow-sm dark:bg-sky-400 dark:text-slate-950">
          RC
        </div>
        <div>
          <h1 className="text-lg font-black">Recipe Composer</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Production-minded nested recipe editor</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <QualityBadge issues={issues} />
        <span className={getSaveBadgeClassName(saveState)}>{saveMessage}</span>
        <span className="inline-flex min-h-8 items-center rounded-full bg-slate-100 px-3 text-xs font-extrabold capitalize text-slate-600 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600">
          {source}
        </span>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button className={buttonStyles.base} onClick={onImport}>
          Import
        </button>
        <button className={buttonStyles.base} onClick={onExport}>
          Export
        </button>
        <button className={buttonStyles.primary} onClick={onSave}>
          Save
        </button>
      </div>
    </header>
  );
}

function QualityBadge({ issues }: { issues: ValidationIssue[] }) {
  const errors = issues.filter((issue) => issue.level === "error").length;
  const warnings = issues.filter((issue) => issue.level === "warning").length;
  const className = errors
    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800"
    : warnings
      ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800"
      : "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800";
  const label = errors ? `${errors} error${errors === 1 ? "" : "s"}` : warnings ? `${warnings} warning${warnings === 1 ? "" : "s"}` : "Valid book";

  return <span className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-extrabold ${className}`}>{label}</span>;
}

function getSaveBadgeClassName(saveState: string) {
  const tone =
    saveState === "saved"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800"
      : saveState === "error"
        ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800"
        : "bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800";

  return `inline-flex min-h-8 items-center rounded-full px-3 text-xs font-extrabold ${tone}`;
}
