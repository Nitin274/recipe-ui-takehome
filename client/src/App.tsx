import { useCallback, useMemo, useState } from "react";
import { Toast } from "./components/common/Toast";
import { AppHeader } from "./components/layout/AppHeader";
import { ImportExportDialog } from "./features/recipes/components/ImportExportDialog";
import { RecipeEditor } from "./features/recipes/components/RecipeEditor";
import { RecipeSidebar } from "./features/recipes/components/RecipeSidebar";
import { useRecipeBook } from "./hooks/useRecipeBook";
import { useTheme } from "./hooks/useTheme";

type DialogState = "import" | "export" | null;

export function App() {
  const recipeBook = useRecipeBook();
  const { theme, toggleTheme } = useTheme();
  const [filter, setFilter] = useState<"all" | "recipe" | "ingredient">("all");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const {
    book,
    createItem,
    deleteSelected,
    duplicateSelected,
    importBook: importRecipeBook,
    issues,
    loadSample: loadSampleBook,
    persistBook,
    renameSelected,
    saveMessage,
    saveState,
    selected,
    selectedId,
    setSelectedId,
    setToast,
    source,
    toast,
    updateComponents,
    updateSelectedName,
    updateSelectedStates,
  } = recipeBook;
  const hasLoadedBook = useMemo(() => Object.keys(book).length > 0, [book]);
  const selectedIssues = useMemo(() => issues.filter((issue) => issue.id === selectedId), [issues, selectedId]);

  const openImportDialog = useCallback(() => setDialog("import"), []);
  const openExportDialog = useCallback(() => setDialog("export"), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const saveBook = useCallback(() => void persistBook("Saved"), [persistBook]);
  const createRecipe = useCallback(() => createItem("recipe"), [createItem]);
  const createIngredient = useCallback(() => createItem("ingredient"), [createItem]);
  const importBook = useCallback((jsonText: string) => {
    const errors = importRecipeBook(jsonText);
    if (!errors.length) setDialog(null);
    return errors;
  }, [importRecipeBook]);
  const loadSample = useCallback(() => {
    loadSampleBook();
    setDialog(null);
  }, [loadSampleBook]);

  if (!hasLoadedBook && saveState === "idle") {
    return (
      <main className="grid min-h-screen place-content-center bg-sky-50 text-center text-slate-950 dark:bg-slate-900 dark:text-slate-50">
        <div className="mx-auto grid size-11 place-items-center rounded-lg bg-sky-500 font-extrabold text-white shadow-sm dark:bg-sky-400 dark:text-slate-950">
          RC
        </div>
        <h1 className="mt-5 text-2xl font-black">Recipe Composer</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Loading recipe book</p>
      </main>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-3 text-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:text-slate-50 lg:p-5">
        <AppHeader
          issues={issues}
          saveState={saveState}
          saveMessage={saveMessage}
          source={source}
          theme={theme}
          onImport={openImportDialog}
          onExport={openExportDialog}
          onSave={saveBook}
          onToggleTheme={toggleTheme}
        />

        <main className="mt-5 grid gap-5 xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          <RecipeSidebar
            book={book}
            selectedId={selectedId}
            filter={filter}
            search={search}
            onCreate={createItem}
            onFilterChange={setFilter}
            onSearchChange={setSearch}
            onSelect={setSelectedId}
          />

          <section className="min-h-[calc(100vh-110px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20">
            {selected ? (
              <RecipeEditor
                book={book}
                id={selectedId}
                item={selected}
                issues={selectedIssues}
                onDelete={deleteSelected}
                onDuplicate={duplicateSelected}
                onNameChange={updateSelectedName}
                onRename={renameSelected}
                onStatesChange={updateSelectedStates}
                onComponentsChange={updateComponents}
              />
            ) : (
              <div className="grid min-h-[calc(100vh-110px)] place-content-center gap-4 rounded-lg border border-dashed border-slate-300 bg-sky-50/40 p-6 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-400">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">No recipe selected</h2>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button className="min-h-10 rounded-lg border border-sky-500 bg-sky-500 px-4 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-600 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200" onClick={createRecipe}>
                    New recipe
                  </button>
                  <button className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" onClick={createIngredient}>
                    New ingredient
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {dialog && (
        <ImportExportDialog
          book={book}
          mode={dialog}
          onClose={closeDialog}
          onImport={importBook}
          onLoadSample={loadSample}
          onToast={setToast}
        />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}
