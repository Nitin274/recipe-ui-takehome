export type ComponentRef = {
  id: string;
  qty: number;
  state?: string;
};

export type Ingredient = {
  name: string;
  states?: string[];
};

export type Recipe = {
  name: string;
  components: ComponentRef[];
};

export type RecipeItem = Ingredient | Recipe;

export type RecipeBook = Record<string, RecipeItem>;

export type ValidationIssue = {
  level: "error" | "warning";
  id?: string;
  message: string;
};

export type StorageSource = "server" | "browser" | "sample";
