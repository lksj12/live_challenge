import type Database from 'better-sqlite3';
import { Router } from 'express';
export declare function createAdminRouter(database: Database.Database): Router;
