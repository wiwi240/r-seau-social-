import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "db.json");

const EMPTY_DB = {
  users: [],
  posts: [],
  sessions: [],
};

let writeQueue = Promise.resolve();

export async function ensureDb() {
  if (!existsSync(DB_PATH)) {
    await writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
  }
}

export async function readDb() {
  await ensureDb();
  const raw = await readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeDb(nextDb) {
  await ensureDb();
  writeQueue = writeQueue.then(() => writeFile(DB_PATH, JSON.stringify(nextDb, null, 2)));
  return writeQueue;
}
