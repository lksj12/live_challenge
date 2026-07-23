import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { applyMigrations } from './migrations.js';
export function createDatabase(filename) {
    if (filename !== ':memory:') {
        mkdirSync(dirname(filename), { recursive: true });
    }
    const database = new Database(filename);
    database.pragma('foreign_keys = ON');
    if (filename !== ':memory:') {
        database.pragma('journal_mode = WAL');
    }
    applyMigrations(database);
    return database;
}
//# sourceMappingURL=database.js.map