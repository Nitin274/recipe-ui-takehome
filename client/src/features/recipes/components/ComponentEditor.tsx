import { useCallback, useMemo, type ChangeEvent } from "react";
import { buttonStyles, fieldStyles } from "../../../components/common/classNames";
import { isIngredient, isRecipe, wouldCreateCycle } from "../../../domain/recipes";
import type { ComponentRef, RecipeBook } from "../../../types/recipe";

type Props = {
  book: RecipeBook;
  recipeId: string;
  components: ComponentRef[];
  dependents: Array<{ id: string; name: string }>;
  onChange: (components: ComponentRef[]) => void;
};

export function ComponentEditor({ book, recipeId, components, dependents, onChange }: Props) {
  const updateComponent = useCallback((index: number, patch: Partial<ComponentRef>) => {
    const nextComponents = components.map((component, componentIndex) => {
      if (componentIndex !== index) return component;

      const next = { ...component, ...patch };
      const target = book[next.id];
      if (!isIngredient(target) || !target.states?.includes(next.state || "")) {
        delete next.state;
      }
      return next;
    });

    onChange(nextComponents);
  }, [book, components, onChange]);

  const addComponent = useCallback(() => {
    const candidate = Object.keys(book).find((optionId) => !wouldCreateCycle(book, recipeId, optionId));
    if (candidate) onChange([...components, { id: candidate, qty: 1 }]);
  }, [book, components, onChange, recipeId]);
  const removeComponent = useCallback((index: number) => {
    onChange(components.filter((_, componentIndex) => componentIndex !== index));
  }, [components, onChange]);
  const usedBy = useMemo(() => dependents.map((entry) => entry.name).join(", "), [dependents]);

  return (
    <>
      <div className="mt-4 grid gap-2">
        <div className="hidden grid-cols-[minmax(190px,1.35fr)_minmax(110px,0.55fr)_minmax(120px,0.7fr)_40px] gap-2 text-xs font-black uppercase text-slate-500 dark:text-slate-400 md:grid">
          <span>Component</span>
          <span>Quantity</span>
          <span>State</span>
          <span />
        </div>

        {components.length ? (
          components.map((component, index) => (
            <ComponentRow
              book={book}
              component={component}
              index={index}
              key={`${component.id}-${index}`}
              recipeId={recipeId}
              onRemove={removeComponent}
              onUpdate={updateComponent}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">No components yet</div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={buttonStyles.base} onClick={addComponent}>
          Add component
        </button>
        {dependents.length > 0 && <span className="text-sm text-slate-500 dark:text-slate-400">Used by {usedBy}</span>}
      </div>
    </>
  );
}

function ComponentRow({
  book,
  component,
  index,
  recipeId,
  onRemove,
  onUpdate,
}: {
  book: RecipeBook;
  component: ComponentRef;
  index: number;
  recipeId: string;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<ComponentRef>) => void;
}) {
  const target = book[component.id];
  const states = useMemo(() => (isIngredient(target) ? target.states || [] : []), [target]);
  const hasStates = states.length > 0;
  const options = useMemo(() => Object.entries(book), [book]);
  const handleIdChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value;
    const nextTarget = book[nextId];
    const nextStates = isIngredient(nextTarget) ? nextTarget.states || [] : [];
    onUpdate(index, { id: nextId, state: nextStates[0] });
  }, [book, index, onUpdate]);
  const handleQtyChange = useCallback((event: ChangeEvent<HTMLInputElement>) => onUpdate(index, { qty: Number(event.target.value) }), [index, onUpdate]);
  const handleStateChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    onUpdate(index, event.target.value ? { state: event.target.value } : { state: undefined });
  }, [index, onUpdate]);
  const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);

  return (
    <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60 md:grid-cols-[minmax(190px,1.35fr)_minmax(110px,0.55fr)_minmax(120px,0.7fr)_40px] md:border-0 md:bg-transparent md:p-0 dark:md:bg-transparent">
      <select aria-label={`Component ${index + 1}`} className={fieldStyles} value={component.id} onChange={handleIdChange}>
        {options.map(([optionId, option]) => {
          const disabled = isRecipe(option) && wouldCreateCycle(book, recipeId, optionId) && optionId !== component.id;
          return (
            <option disabled={disabled} key={optionId} value={optionId}>
              {option.name} ({optionId})
            </option>
          );
        })}
      </select>
      <input
        aria-label={`Quantity ${index + 1}`}
        className={fieldStyles}
        min="0.01"
        step="any"
        type="number"
        value={component.qty}
        onChange={handleQtyChange}
      />
      <select
        aria-label={`State ${index + 1}`}
        className={`${fieldStyles} ${hasStates ? "cursor-pointer" : "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none dark:bg-slate-800 dark:text-slate-500"}`}
        disabled={!hasStates}
        value={component.state || ""}
        onChange={handleStateChange}
      >
        <option value="">{hasStates ? "Any" : "No states"}</option>
        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
      <button className={buttonStyles.icon} aria-label="Remove component" onClick={handleRemove}>
        x
      </button>
    </div>
  );
}
