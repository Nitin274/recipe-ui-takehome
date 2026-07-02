import { createServer } from "http";
import { readFile, writeFile } from "fs/promises";

const storeFile = new URL("./store.json", import.meta.url);
const store = await loadStore();
const delay = () =>
  new Promise((r) => setTimeout(r, 100 + Math.floor(Math.random() * 1000)));
const persist = () =>
  writeFile(
    storeFile,
    JSON.stringify(Object.fromEntries(store), null, 2),
    "utf8",
  );

async function loadStore() {
  try {
    const data = JSON.parse(await readFile(storeFile, "utf8"));
    return new Map(
      typeof data === "object" && data ? Object.entries(data) : [],
    );
  } catch (e) {
    if (e.code === "ENOENT") return new Map();
    throw e;
  }
}

createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.writeHead(204).end();

  const key = decodeURIComponent(req.url.slice(1));
  if (!key) return (await delay(), res.writeHead(400).end("key required"));

  if (req.method === "GET") {
    await delay();
    store.has(key) ? res.end(store.get(key)) : res.writeHead(404).end();
  } else if (req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      store.set(key, body);
      await persist();
      await delay();
      res.writeHead(201).end();
    });
  } else if (req.method === "DELETE") {
    const existed = store.delete(key);
    if (existed) await persist();
    await delay();
    res.writeHead(existed ? 200 : 404).end();
  } else {
    await delay();
    res.writeHead(405).end();
  }
}).listen(4000, () => console.log("listening on http://localhost:4000"));
