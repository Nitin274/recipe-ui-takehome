import { readdir, readFile, stat } from "fs/promises";
import { extname, join } from "path";

const root = process.cwd();
const maxLines = 400;
const ignoredDirectories = new Set([".git", "dist", "node_modules"]);
const ignoredFiles = new Set(["package-lock.json"]);
const checkedExtensions = new Set([".css", ".html", ".js", ".json", ".ts", ".tsx"]);

const files = await collectFiles(root);
const oversized = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  const lines = text.split("\n").length;
  if (lines > maxLines) {
    oversized.push(`${file.replace(`${root}/`, "")}: ${lines} lines`);
  }
}

if (oversized.length) {
  console.error(`Files must stay at or below ${maxLines} lines:`);
  oversized.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry)) continue;
    if (ignoredFiles.has(entry)) continue;

    const path = join(directory, entry);
    const details = await stat(path);

    if (details.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (checkedExtensions.has(extname(path))) {
      files.push(path);
    }
  }

  return files;
}
