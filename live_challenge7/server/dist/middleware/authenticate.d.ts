import type Database from 'better-sqlite3';
import type { RequestHandler } from 'express';
export declare function requireAuthentication(database: Database.Database): RequestHandler;
