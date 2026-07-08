import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { buttonStyles } from "../../../components/common/classNames";
import type { RecipeBook } from "../../../types/recipe";

type Props = {
  book: RecipeBook;
  mode: "import" | "export";
  onClose: () => void;
  onImport: (jsonText: string) => string[];
  onLoadSample: () => void;
  onToast: (message: string) => void;
};

export function ImportExportDialog({ book, mode, onClose, onImport, onLoadSample, onToast }: Props) {
  const exportText = useMemo(() => JSON.stringify(book, null, 2), [book]);
  const [jsonText, setJsonText] = useState(exportText);
  const [errors, setErrors] = useState<string[]>([]);

  const handleTextChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => setJsonText(event.target.value), []);
  const handleImport = useCallback(() => {
    const nextErrors = onImport(jsonText);
    setErrors(nextErrors);
  }, [jsonText, onImport]);

  const copyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      onToast("JSON copied.");
    } catch {
      onToast("Clipboard is unavailable in this browser.");
    }
  }, [exportText, onToast]);

  const downloadJson = useCallback(() => {
    const blob = new Blob([exportText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "recipes.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [exportText]);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/35 p-4 backdrop-blur-sm">
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-auto rounded-lg border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-800" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black" id="dialog-title">{mode === "import" ? "Import JSON" : "Export JSON"}</h2>
          <button className={buttonStyles.icon} onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <textarea
          className="min-h-[430px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-950 outline-none transition hover:border-sky-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
          readOnly={mode === "export"}
          spellCheck={false}
          value={mode === "export" ? exportText : jsonText}
          onChange={handleTextChange}
        />

        {errors.length > 0 && (
          <div className="mt-3 grid gap-2">
            {errors.map((error) => (
              <div className="rounded-lg bg-red-100 px-3 py-2 font-bold text-red-700 dark:bg-red-950 dark:text-red-300" key={error}>
                {error}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          {mode === "import" ? (
            <>
              <button className={buttonStyles.base} onClick={onLoadSample}>
                Use sample
              </button>
              <button className={buttonStyles.primary} onClick={handleImport}>
                Import
              </button>
            </>
          ) : (
            <>
              <button className={buttonStyles.base} onClick={copyJson}>
                Copy
              </button>
              <button className={buttonStyles.primary} onClick={downloadJson}>
                Download
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
