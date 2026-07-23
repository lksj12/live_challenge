import type Database from 'better-sqlite3';
import { Router } from 'express';
interface AuthRouterOptions {
    secureCookies: boolean;
}
export declare function createAuthRouter(database: Database.Database, options: AuthRouterOptions): Router;
export {};
