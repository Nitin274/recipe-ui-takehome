type Props = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === "dark";

  return (
    <button
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-900 active:translate-y-0 active:bg-indigo-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-indigo-400 dark:hover:bg-indigo-950"
      onClick={onToggle}
      type="button"
    >
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
