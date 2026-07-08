import { useMemo } from "react";
import { aggregateIngredients, buildRecipeTree, type IngredientTotal, type RecipeTreeNode } from "../../../domain/recipes";
import type { RecipeBook, RecipeItem } from "../../../types/recipe";

type IngredientInsightProps = {
  id: string;
  item: Extract<RecipeItem, { states?: string[] }>;
  dependents: Array<{ id: string; name: string }>;
};

export function IngredientInsights({ id, item, dependents }: IngredientInsightProps) {
  const dependentNames = useMemo(() => dependents.map((entry) => entry.name), [dependents]);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-black">Ingredient</h3>
      </div>
      <dl className="mb-5 grid gap-2">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 dark:border-slate-700">
          <dt className="font-bold text-slate-500 dark:text-slate-400">Identifier</dt>
          <dd className="m-0 font-black">
            <code>{id}</code>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 dark:border-slate-700">
          <dt className="font-bold text-slate-500 dark:text-slate-400">States</dt>
          <dd className="m-0 font-black">{item.states?.length || 0}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 dark:border-slate-700">
          <dt className="font-bold text-slate-500 dark:text-slate-400">References</dt>
          <dd className="m-0 font-black">{dependents.length}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        {dependents.length ? dependentNames.map((name) => <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200" key={name}>{name}</span>) : <span className="text-sm text-slate-500 dark:text-slate-400">Not used by a recipe</span>}
      </div>
    </>
  );
}

export function RecipeInsights({ book, id }: { book: RecipeBook; id: string }) {
  const tree = useMemo(() => buildRecipeTree(book, id), [book, id]);
  const totals = useMemo(() => [...aggregateIngredients(book, id).values()], [book, id]);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-black">Recipe view</h3>
      </div>
      <div className="mt-5 grid gap-3">
        <h4 className="font-black">Nested structure</h4>
        {tree && <TreeNode node={tree} />}
      </div>
      <div className="mt-5 grid gap-3">
        <h4 className="font-black">Ingredient totals</h4>
        <div>
          {totals.length ? totals.map((total) => <TotalRow key={`${total.id}-${total.state || ""}`} total={total} />) : <span className="text-sm text-slate-500 dark:text-slate-400">No ingredients</span>}
        </div>
      </div>
    </>
  );
}

function TreeNode({ node }: { node: RecipeTreeNode }) {
  return (
    <ul className="m-0 pl-4">
      <li className="my-2">
        <span className="inline-flex flex-wrap items-center gap-2">
          <strong>{node.name}</strong>
          {node.localQty ? <small className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">x {formatQty(node.localQty)}</small> : null}
          {node.state ? <em className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold not-italic text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{node.state}</em> : null}
        </span>
        {node.children.map((child) => (
          <TreeNode key={`${child.id}-${child.localQty}-${child.state || ""}`} node={child} />
        ))}
      </li>
    </ul>
  );
}

function TotalRow({ total }: { total: IngredientTotal }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 dark:border-slate-700">
      <span className="inline-flex flex-wrap items-center gap-2">
        {total.name}
        {total.state ? <em className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold not-italic text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{total.state}</em> : null}
      </span>
      <strong>{formatQty(total.qty)}</strong>
    </div>
  );
}

function formatQty(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
}
