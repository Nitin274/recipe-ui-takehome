# Take-home: Recipe Composer

A recipe defines what a dish is made of, like ingredients (egg, salt, flour) and/or other recipes. For example, a meatball is beef + breadcrumbs + egg + seasoning. See the provided `recipes.json`, a flat dictionary, for the format.

- Ingredient doesn't have `components`. It might contain a `states` field indicating the possible states it can hold.
- Recipe has `components`. Each component can be either an ingredient or a recipe, referenced by its `id` (the dictionary key), each with a `qty` (quantity), and sometimes a `state` (the state is always defined in the `states` array of the referred ingredient).

Consider the user to be someone who needs a recipe book where it's easy to create, edit, and view all the recipes. It should support importing and exporting recipes in the same JSON format as `recipes.json`.

This is a UI-focused task. Non-UI concerns (databases, backend) are not evaluated. Pick your own tech stack (React is preferred).

## Server

A simple key-value server is provided (`npm run server`, port 4000). Treat it like localStorage: `GET /<key>` reads, `POST /<key>` writes, `DELETE /<key>` deletes — values are stringified JSON. Don't worry about the backend; no need to modify the server code.

## Deliverable

A HTML-based web app that runs locally. Add a documentation file if you want to explain your design and reasoning.
