import { useCallback, useMemo, type ChangeEvent, type FocusEvent } from "react";
import { buttonStyles, fieldStyles, panelStyles } from "../../../components/common/classNames";
import { ComponentEditor } from "./ComponentEditor";
import { IngredientInsights, RecipeInsights } from "./RecipeInsights";
import { getDependents, isRecipe } from "../../../domain/recipes";
import type { ComponentRef, RecipeBook, RecipeItem, ValidationIssue } from "../../../types/recipe";

type Props = {
  book: RecipeBook;
  id: string;
  item: RecipeItem;
  issues: ValidationIssue[];
  onDelete: () => void;
  onDuplicate: () => void;
  onNameChange: (value: string) => void;
  onRename: (value: string) => void;
  onStatesChange: (value: string) => void;
  onComponentsChange: (components: ComponentRef[]) => void;
};

export function RecipeEditor({
  book,
  id,
  item,
  issues,
  onDelete,
  onDuplicate,
  onNameChange,
  onRename,
  onStatesChange,
  onComponentsChange,
}: Props) {
  const dependents = useMemo(() => getDependents(book, id), [book, id]);
  const isRecipeItem = isRecipe(item);
  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => onNameChange(event.target.value), [onNameChange]);
  const handleRename = useCallback((event: FocusEvent<HTMLInputElement>) => onRename(event.target.value), [onRename]);

  return (
    <article className="p-5">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="text-xs font-black uppercase text-orange-700 dark:text-orange-300">{isRecipeItem ? "Recipe" : "Ingredient"}</span>
          <h2 className="mt-1 text-3xl font-black leading-tight lg:text-5xl">{item.name || id}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className={buttonStyles.base} onClick={onDuplicate}>
            Duplicate
          </button>
          <button className={buttonStyles.danger} onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="mb-4 grid gap-2">
          {issues.map((issue) => (
            <div className={`rounded-lg px-3 py-2 font-bold ring-1 ${issue.level === "error" ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800" : "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800"}`} key={issue.message}>
              {issue.message}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)]">
        <section className={panelStyles}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-black">Details</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
              <span>Name</span>
              <input className={fieldStyles} value={item.name} onChange={handleNameChange} />
            </label>
            <label className="grid gap-2 text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
              <span>Identifier</span>
              <input className={fieldStyles} defaultValue={id} onBlur={handleRename} />
            </label>
          </div>

          {isRecipeItem ? (
            <ComponentEditor book={book} recipeId={id} components={item.components} onChange={onComponentsChange} dependents={dependents} />
          ) : (
            <IngredientEditor item={item} dependents={dependents} onStatesChange={onStatesChange} />
          )}
        </section>

        <aside className={panelStyles}>
          {isRecipeItem ? <RecipeInsights book={book} id={id} /> : <IngredientInsights id={id} item={item} dependents={dependents} />}
        </aside>
      </div>
    </article>
  );
}

function IngredientEditor({
  item,
  dependents,
  onStatesChange,
}: {
  item: Extract<RecipeItem, { states?: string[] }>;
  dependents: Array<{ id: string; name: string }>;
  onStatesChange: (value: string) => void;
}) {
  const statesValue = useMemo(() => (item.states || []).join(", "), [item.states]);
  const referencedBy = useMemo(() => dependents.map((entry) => entry.name).join(", "), [dependents]);
  const handleStatesChange = useCallback((event: FocusEvent<HTMLInputElement>) => onStatesChange(event.target.value), [onStatesChange]);

  return (
    <div className="mt-4 grid gap-3">
      <label className="grid gap-2 text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
        <span>States</span>
        <input
          className={fieldStyles}
          defaultValue={statesValue}
          onBlur={handleStatesChange}
          placeholder="raw, boiled, fried"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {item.states?.length ? item.states.map((state) => <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-bold text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200" key={state}>{state}</span>) : <span className="text-sm text-slate-500 dark:text-slate-400">No states</span>}
      </div>
      {dependents.length > 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Referenced by {referencedBy}</p>}
    </div>
  );
}
