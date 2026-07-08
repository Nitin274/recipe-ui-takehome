# Recipe Composer

A production-minded React + Vite implementation of the recipe-book editor described in [`task/TASK.md`](task/TASK.md).

## What It Supports

- View, create, edit, duplicate, and delete ingredients and recipes.
- Compose recipes from ingredients or other recipes.
- Validate missing references, invalid quantities, invalid states, and cyclic recipes.
- Import and export the same flat JSON format as [`task/recipes.json`](task/recipes.json).
- Persist to the provided key-value server, with browser storage as a graceful fallback.
- Show nested recipe structure and aggregated ingredient totals.
- Switch between persistent light and dark themes.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS for component styling
- ESLint + TypeScript checks
- Custom line-count guard to keep authored files at 400 lines or fewer

## Run Locally

Install dependencies:

```bash
npm install
```

Start the provided key-value server in one terminal:

```bash
npm run server
```

If port `4000` is already in use, the server is probably already running. You can either keep using it or start another copy on a different port:

```bash
PORT=4001 npm run server
```

Start the app in another terminal:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Quality Checks

```bash
npm run lint
npm run build
```

`npm run lint` runs the 400-line file limit, ESLint, and TypeScript.

## Structure

```txt
client/
  src/
    components/          shared UI and layout components
    data/                bundled sample recipe data
    domain/              recipe normalization, validation, graph traversal
    features/recipes/    recipe-book screens and feature components
    hooks/               app state and persistence orchestration
    services/            storage client for the provided server
    types/               shared TypeScript models
    styles.css           Tailwind entrypoint only
  index.html
  vite.config.ts
  tailwind.config.js
server/
  server.js              provided key-value server
scripts/
  check-line-count.js    repository line-count guard
```
