import { useCallback, useMemo, type ChangeEvent, type ReactNode } from "react";
import { buttonStyles } from "../../../components/common/classNames";
import { isIngredient, isRecipe, summarizeBook } from "../../../domain/recipes";
import type { RecipeBook, RecipeItem } from "../../../types/recipe";

type Props = {
  book: RecipeBook;
  selectedId: string;
  filter: "all" | "recipe" | "ingredient";
  search: string;
  onCreate: (type: "ingredient" | "recipe") => void;
  onFilterChange: (filter: "all" | "recipe" | "ingredient") => void;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
};

export function RecipeSidebar({ book, selectedId, filter, search, onCreate, onFilterChange, onSearchChange, onSelect }: Props) {
  const stats = useMemo(() => summarizeBook(book), [book]);
  const entries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return Object.entries(book).filter(([id, item]) => {
      const matchesFilter =
        filter === "all" || (filter === "recipe" && isRecipe(item)) || (filter === "ingredient" && isIngredient(item));
      const matchesQuery = !query || id.includes(query) || item.name.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    }).sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [book, filter, search]);
  const createRecipe = useCallback(() => onCreate("recipe"), [onCreate]);
  const createIngredient = useCallback(() => onCreate("ingredient"), [onCreate]);
  const showAll = useCallback(() => onFilterChange("all"), [onFilterChange]);
  const showRecipes = useCallback(() => onFilterChange("recipe"), [onFilterChange]);
  const showIngredients = useCallback(() => onFilterChange("ingredient"), [onFilterChange]);
  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value), [onSearchChange]);

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20 xl:sticky xl:top-24 xl:max-h-[calc(100vh-110px)] xl:overflow-auto">
      <div className="flex flex-wrap items-center gap-2">
        <button className={buttonStyles.primary} onClick={createRecipe}>
          New recipe
        </button>
        <button className={buttonStyles.base} onClick={createIngredient}>
          New ingredient
        </button>
      </div>

      <label className="mt-4 grid gap-2 text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
        <span>Search</span>
        <input className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-sky-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50" value={search} onChange={handleSearchChange} placeholder="Name or id" type="search" />
      </label>

      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900" aria-label="Filter items">
        <FilterButton active={filter === "all"} onClick={showAll}>
          All {stats.total}
        </FilterButton>
        <FilterButton active={filter === "recipe"} onClick={showRecipes}>
          Recipes {stats.recipes}
        </FilterButton>
        <FilterButton active={filter === "ingredient"} onClick={showIngredients}>
          Ingredients {stats.ingredients}
        </FilterButton>
      </div>

      <div className="my-4 grid grid-cols-3 gap-2">
        <StatCard label="Recipes" value={stats.recipes} />
        <StatCard label="Ingredients" value={stats.ingredients} />
        <StatCard label="Stateful" value={stats.statefulIngredients} />
      </div>

      <nav className="grid gap-2" aria-label="Recipe book">
        {entries.length ? (
          entries.map(([id, item]) => <RecipeListItem id={id} isSelected={selectedId === id} item={item} key={id} onSelect={onSelect} />)
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">No matches</div>
        )}
      </nav>
    </aside>
  );
}

function FilterButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button className={`min-h-9 rounded-md text-xs font-extrabold transition hover:bg-white hover:text-sky-800 hover:shadow-sm active:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 dark:hover:bg-slate-800 dark:hover:text-sky-300 ${active ? "bg-white text-sky-700 shadow-sm ring-1 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800" : "text-slate-500 dark:text-slate-400"}`} onClick={onClick}>
      {children}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
      <strong className="block text-lg font-black">{value}</strong>
      <span className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

function RecipeListItem({ id, isSelected, item, onSelect }: { id: string; isSelected: boolean; item: RecipeItem; onSelect: (id: string) => void }) {
  const componentCount = isRecipe(item) ? item.components.length : item.states?.length || 0;
  const meta = isRecipe(item)
    ? `${componentCount} component${componentCount === 1 ? "" : "s"}`
    : `${componentCount} state${componentCount === 1 ? "" : "s"}`;
  const handleSelect = useCallback(() => onSelect(id), [id, onSelect]);

  return (
    <button
      className={`grid gap-2 rounded-lg border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 ${isSelected ? "border-sky-400 bg-sky-50 text-sky-950 ring-2 ring-sky-200 dark:border-sky-500 dark:bg-sky-950/70 dark:text-sky-100 dark:ring-sky-800" : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"}`}
      onClick={handleSelect}
    >
      <span className="flex items-center justify-between gap-3">
        <strong>{item.name || id}</strong>
        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">{isRecipe(item) ? "Recipe" : "Ingredient"}</span>
      </span>
      <span className="flex items-center justify-between gap-3">
        <code>{id}</code>
        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">{meta}</span>
      </span>
    </button>
  );
}
