import { useCallback, useEffect, useMemo, useState } from "react";
import { sampleRecipes } from "../data/sampleRecipes";
import {
  cloneBook,
  createUniqueId,
  getDependents,
  isRecipe,
  normalizeBook,
  toRecipeId,
  uniqueStrings,
  validateBook,
} from "../domain/recipes";
import { loadBook, saveBook, writeLocalBook } from "../services/storage";
import type { ComponentRef, RecipeBook, StorageSource } from "../types/recipe";

type SaveState = "idle" | "saving" | "saved" | "warning" | "error";

export function useRecipeBook() {
  const [book, setBook] = useState<RecipeBook>({});
  const [selectedId, setSelectedId] = useState("");
  const [source, setSource] = useState<StorageSource>("sample");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("Loading");
  const [toast, setToast] = useState<string | null>(null);

  const issues = useMemo(() => validateBook(book), [book]);
  const selected = selectedId ? book[selectedId] : undefined;

  useEffect(() => {
    let mounted = true;
    loadBook(sampleRecipes).then((result) => {
      if (!mounted) return;
      setBook(result.book);
      setSelectedId(Object.keys(result.book)[0] || "");
      setSource(result.source);
      setSaveState("saved");
      setSaveMessage(result.source === "server" ? "Loaded from server" : result.source === "browser" ? "Loaded backup" : "Loaded sample");
      if (result.warning) setToast(result.warning);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const commit = useCallback((nextBook: RecipeBook, message = "Saving") => {
    writeLocalBook(nextBook);
    setBook(nextBook);
    setSaveState("saving");
    setSaveMessage(message);
  }, []);

  const persistBook = useCallback(async (successMessage = "Saved") => {
    if (validateBook(book).some((issue) => issue.level === "error")) {
      setSaveState("error");
      setSaveMessage("Fix errors to save");
      return;
    }

    setSaveState("saving");
    setSaveMessage("Saving");
    try {
      await saveBook(book);
      setSaveState("saved");
      setSaveMessage(successMessage);
      setSource("server");
    } catch {
      setSaveState("warning");
      setSaveMessage("Saved in browser");
      setToast("Storage server is unavailable. Changes are backed up in this browser.");
    }
  }, [book]);

  useEffect(() => {
    if (!Object.keys(book).length || saveState !== "saving") return;
    const timeout = window.setTimeout(() => void persistBook("Saved"), 500);
    return () => window.clearTimeout(timeout);
  }, [book, persistBook, saveState]);

  const createItem = useCallback((type: "ingredient" | "recipe") => {
    const id = createUniqueId(book, type === "recipe" ? "new-recipe" : "new-ingredient");
    setSelectedId(id);
    commit({ ...book, [id]: type === "recipe" ? { name: "New Recipe", components: [] } : { name: "New Ingredient" } }, "Created item");
  }, [book, commit]);

  const updateSelectedName = useCallback((name: string) => {
    if (!selected) return;
    commit({ ...book, [selectedId]: { ...selected, name } }, "Updated name");
  }, [book, commit, selected, selectedId]);

  const renameSelected = useCallback((rawId: string) => {
    const nextId = toRecipeId(rawId);
    if (!nextId) return setToast("Identifier is required.");
    if (nextId === selectedId) return;
    if (book[nextId]) return setToast("That identifier already exists.");

    const nextBook: RecipeBook = {};
    Object.entries(book).forEach(([id, item]) => {
      const nextItem = cloneBook({ item }).item;
      if (isRecipe(nextItem)) {
        nextItem.components = nextItem.components.map((component) => (component.id === selectedId ? { ...component, id: nextId } : component));
      }
      nextBook[id === selectedId ? nextId : id] = nextItem;
    });

    setSelectedId(nextId);
    commit(nextBook, "Renamed item");
  }, [book, commit, selectedId]);

  const updateSelectedStates = useCallback((rawStates: string) => {
    if (!selected || isRecipe(selected)) return;
    const states = uniqueStrings(rawStates.split(","));
    const nextBook = cloneBook({ ...book, [selectedId]: states.length ? { ...selected, states } : { name: selected.name } });

    Object.values(nextBook).forEach((item) => {
      if (!isRecipe(item)) return;
      item.components = item.components.map((component) => {
        if (component.id !== selectedId || !component.state || states.includes(component.state)) return component;
        const { state: _state, ...rest } = component;
        return rest;
      });
    });

    commit(nextBook, "Updated states");
  }, [book, commit, selected, selectedId]);

  const updateComponents = useCallback((components: ComponentRef[]) => {
    if (!selected || !isRecipe(selected)) return;
    commit({ ...book, [selectedId]: { ...selected, components } }, "Updated components");
  }, [book, commit, selected, selectedId]);

  const duplicateSelected = useCallback(() => {
    if (!selected) return;
    const id = createUniqueId(book, `${selectedId}-copy`);
    setSelectedId(id);
    commit({ ...book, [id]: { ...cloneBook({ selected }).selected, name: `${selected.name} Copy` } }, "Duplicated item");
  }, [book, commit, selected, selectedId]);

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    const dependents = getDependents(book, selectedId);
    if (dependents.length) {
      setToast(`Cannot delete while referenced by ${dependents.map((item) => item.name).join(", ")}.`);
      return;
    }
    const nextBook = { ...book };
    delete nextBook[selectedId];
    setSelectedId(Object.keys(nextBook)[0] || "");
    commit(nextBook, "Deleted item");
  }, [book, commit, selected, selectedId]);

  const importBook = useCallback((jsonText: string): string[] => {
    try {
      const imported = normalizeBook(JSON.parse(jsonText));
      const errors = validateBook(imported).filter((issue) => issue.level === "error");
      if (errors.length) return errors.map((issue) => issue.message);
      setSelectedId(Object.keys(imported)[0] || "");
      commit(imported, "Imported JSON");
      return [];
    } catch (error) {
      return [error instanceof Error ? error.message : "Import failed."];
    }
  }, [commit]);

  const loadSample = useCallback(() => {
    const nextBook = cloneBook(sampleRecipes);
    setSelectedId(Object.keys(nextBook)[0] || "");
    commit(nextBook, "Loaded sample");
  }, [commit]);

  return {
    book,
    selected,
    selectedId,
    setSelectedId,
    source,
    saveState,
    saveMessage,
    issues,
    toast,
    setToast,
    createItem,
    updateSelectedName,
    renameSelected,
    updateSelectedStates,
    updateComponents,
    duplicateSelected,
    deleteSelected,
    importBook,
    loadSample,
    persistBook,
  };
}
