import type { ComponentRef, Ingredient, RecipeBook, RecipeItem, ValidationIssue } from "../types/recipe";

export const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function cloneBook(book: RecipeBook): RecipeBook {
  return structuredClone(book);
}

export function isRecipe(item: RecipeItem | undefined): item is Extract<RecipeItem, { components: ComponentRef[] }> {
  return Array.isArray((item as { components?: ComponentRef[] } | undefined)?.components);
}

export function isIngredient(item: RecipeItem | undefined): item is Ingredient {
  return Boolean(item) && !isRecipe(item);
}

export function toRecipeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function createUniqueId(book: RecipeBook, base: string): string {
  const root = toRecipeId(base) || "item";
  let candidate = root;
  let suffix = 2;

  while (book[candidate]) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function normalizeBook(rawBook: unknown): RecipeBook {
  if (!rawBook || typeof rawBook !== "object" || Array.isArray(rawBook)) {
    throw new Error("Imported data must be a JSON object keyed by item id.");
  }

  return Object.entries(rawBook).reduce<RecipeBook>((book, [id, rawItem]) => {
    if (!idPattern.test(id)) {
      throw new Error(`"${id}" is not valid. Use lowercase words separated by hyphens.`);
    }

    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) {
      throw new Error(`"${id}" must be an object.`);
    }

    const record = rawItem as Record<string, unknown>;
    const item: RecipeItem = {
      name: String(record.name || "").trim(),
    };

    if (Array.isArray(record.states)) {
      item.states = uniqueStrings(record.states);
    }

    if (Array.isArray(record.components)) {
      book[id] = {
        ...item,
        components: record.components.map((component) => {
          const componentRecord = component as Record<string, unknown>;
          const normalized: ComponentRef = {
            id: String(componentRecord.id || "").trim(),
            qty: Number(componentRecord.qty),
          };

          if (componentRecord.state !== undefined && componentRecord.state !== "") {
            normalized.state = String(componentRecord.state).trim();
          }

          return normalized;
        }),
      };
      return book;
    }

    book[id] = item;
    return book;
  }, {});
}

export function validateBook(book: RecipeBook): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = Object.keys(book);

  if (ids.length === 0) {
    issues.push({ level: "error", message: "Recipe book cannot be empty." });
  }

  ids.forEach((id) => {
    const item = book[id];

    if (!idPattern.test(id)) {
      issues.push({ level: "error", id, message: "Identifier must use lowercase letters, numbers, and hyphens." });
    }

    if (!item.name.trim()) {
      issues.push({ level: "error", id, message: "Name is required." });
    }

    if (isIngredient(item) && item.states && uniqueStrings(item.states).length !== item.states.length) {
      issues.push({ level: "warning", id, message: "States should be unique." });
    }

    if (!isRecipe(item)) return;

    if (item.components.length === 0) {
      issues.push({ level: "warning", id, message: "Recipe has no components yet." });
    }

    item.components.forEach((component, index) => {
      const target = book[component.id];
      const label = `${item.name || id}, row ${index + 1}`;

      if (!target) {
        issues.push({ level: "error", id, message: `${label} references a missing item.` });
      }

      if (!Number.isFinite(component.qty) || component.qty <= 0) {
        issues.push({ level: "error", id, message: `${label} needs a quantity greater than zero.` });
      }

      if (target && isRecipe(target) && component.state) {
        issues.push({ level: "error", id, message: `${label} cannot set state on a recipe component.` });
      }

      if (target && isIngredient(target) && component.state && !target.states?.includes(component.state)) {
        issues.push({ level: "error", id, message: `${label} uses a state not defined on ${target.name}.` });
      }
    });

    if (hasCycle(book, id)) {
      issues.push({ level: "error", id, message: "Recipe cannot include itself through nested recipes." });
    }
  });

  return issues;
}

export function hasCycle(book: RecipeBook, recipeId: string, seen = new Set<string>()): boolean {
  if (seen.has(recipeId)) return true;
  seen.add(recipeId);

  const item = book[recipeId];
  if (!isRecipe(item)) return false;

  return item.components.some((component) => {
    const target = book[component.id];
    return isRecipe(target) && hasCycle(book, component.id, new Set(seen));
  });
}

export function wouldCreateCycle(book: RecipeBook, recipeId: string, componentId: string): boolean {
  if (recipeId === componentId) return true;

  const visit = (id: string, seen = new Set<string>()): boolean => {
    if (id === recipeId) return true;
    if (seen.has(id)) return false;
    seen.add(id);

    const item = book[id];
    if (!isRecipe(item)) return false;

    return item.components.some((component) => visit(component.id, seen));
  };

  return visit(componentId);
}

export function getDependents(book: RecipeBook, id: string): Array<{ id: string; name: string }> {
  return Object.entries(book)
    .filter(([, item]) => isRecipe(item) && item.components.some((component) => component.id === id))
    .map(([dependentId, item]) => ({ id: dependentId, name: item.name }));
}

export type RecipeTreeNode = {
  id: string;
  name: string;
  type: "recipe" | "ingredient";
  qty: number;
  localQty?: number;
  state?: string;
  children: RecipeTreeNode[];
};

export function buildRecipeTree(book: RecipeBook, id: string, multiplier = 1, trail: string[] = []): RecipeTreeNode | null {
  const item = book[id];
  if (!item) return null;

  const node: RecipeTreeNode = {
    id,
    name: item.name,
    type: isRecipe(item) ? "recipe" : "ingredient",
    qty: multiplier,
    children: [],
  };

  if (!isRecipe(item) || trail.includes(id)) return node;

  node.children = item.components
    .map((component) => {
      const child = buildRecipeTree(book, component.id, multiplier * component.qty, [...trail, id]);
      if (!child) return null;
      return {
        ...child,
        state: component.state,
        localQty: component.qty,
      };
    })
    .filter(Boolean) as RecipeTreeNode[];

  return node;
}

export type IngredientTotal = {
  id: string;
  name: string;
  qty: number;
  state?: string;
};

export function aggregateIngredients(
  book: RecipeBook,
  id: string,
  multiplier = 1,
  totals = new Map<string, IngredientTotal>(),
  trail: string[] = [],
): Map<string, IngredientTotal> {
  const item = book[id];
  if (!item || trail.includes(id)) return totals;

  if (isIngredient(item)) {
    const current = totals.get(id) || { id, name: item.name, qty: 0 };
    current.qty += multiplier;
    totals.set(id, current);
    return totals;
  }

  item.components.forEach((component) => {
    const target = book[component.id];
    if (!target) return;

    if (isIngredient(target)) {
      const key = `${component.id}::${component.state || ""}`;
      const current = totals.get(key) || {
        id: component.id,
        name: target.name,
        qty: 0,
        state: component.state,
      };
      current.qty += multiplier * component.qty;
      totals.set(key, current);
      return;
    }

    aggregateIngredients(book, component.id, multiplier * component.qty, totals, [...trail, id]);
  });

  return totals;
}

export function summarizeBook(book: RecipeBook) {
  const entries = Object.values(book);
  return {
    total: entries.length,
    ingredients: entries.filter(isIngredient).length,
    recipes: entries.filter(isRecipe).length,
    statefulIngredients: entries.filter((item) => isIngredient(item) && item.states?.length).length,
  };
}

export function uniqueStrings(values: unknown[]): string[] {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}
