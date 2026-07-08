import { cloneBook, normalizeBook } from "../domain/recipes";
import type { RecipeBook, StorageSource } from "../types/recipe";

const apiBase = "http://localhost:4000";
const apiKey = "recipe-composer-book";
const localKey = "recipe-composer-book";

export type LoadResult = {
  book: RecipeBook;
  source: StorageSource;
  warning?: string;
};

export async function loadBook(sampleBook: RecipeBook): Promise<LoadResult> {
  try {
    const response = await fetch(`${apiBase}/${apiKey}`);

    if (response.ok) {
      const text = await response.text();
      return {
        book: normalizeBook(JSON.parse(text)),
        source: "server",
      };
    }

    if (response.status !== 404) {
      throw new Error(`Storage server returned ${response.status}`);
    }
  } catch {
    const local = readLocalBook();
    if (local) {
      return {
        book: local,
        source: "browser",
        warning: "Using browser backup because the storage server is unavailable.",
      };
    }
  }

  return {
    book: cloneBook(sampleBook),
    source: "sample",
  };
}

export async function saveBook(book: RecipeBook): Promise<void> {
  writeLocalBook(book);

  const response = await fetch(`${apiBase}/${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    throw new Error(`Storage server returned ${response.status}`);
  }
}

export function readLocalBook(): RecipeBook | null {
  try {
    const raw = localStorage.getItem(localKey);
    return raw ? normalizeBook(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeLocalBook(book: RecipeBook): void {
  localStorage.setItem(localKey, JSON.stringify(book));
}
