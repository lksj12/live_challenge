import type Database from 'better-sqlite3';
import { type Express } from 'express';
interface AppOptions {
    secureCookies?: boolean;
}
export declare function createApp(database: Database.Database, options?: AppOptions): Express;
export {};
