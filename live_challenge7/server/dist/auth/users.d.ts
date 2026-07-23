import type Database from 'better-sqlite3';
import type { UserRecord } from './types.js';
export declare function findUserByEmail(database: Database.Database, email: string): UserRecord | null;
export declare function findUserBySessionTokenHash(database: Database.Database, tokenHash: string, now: string, idleCutoff: string): {
    sessionId: string;
    user: UserRecord;
} | null;
