import type Database from 'better-sqlite3';
import type { Request, Response } from 'express';
import { type AuthContext } from './types.js';
export declare const SESSION_COOKIE_NAME = "keeply_session";
export interface NewSession {
    id: string;
    token: string;
    tokenHash: string;
    createdAt: string;
    expiresAt: string;
}
export declare function buildSession(now?: Date): NewSession;
export declare function insertSession(database: Database.Database, userId: string, session: NewSession): void;
export declare function readSessionToken(request: Request): string | null;
export declare function authenticateSession(database: Database.Database, token: string, now?: Date): AuthContext | null;
export declare function revokeSession(database: Database.Database, token: string, now?: Date): void;
export declare function setSessionCookie(response: Response, session: NewSession, secure: boolean): void;
export declare function clearSessionCookie(response: Response, secure: boolean): void;
