import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dataDirectory = path.resolve(process.cwd(), "data");

mkdirSync(dataDirectory, {
    recursive: true,
});

export const databasePath = path.join(dataDirectory, "shop.db");

export const db = new Database(databasePath);

db.pragma("foreign_keys = ON");
