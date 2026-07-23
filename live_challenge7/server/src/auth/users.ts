import type Database from 'better-sqlite3';

import type { UserRecord } from './types.js';

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
  must_change_password: 0 | 1;
}

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
    mustChangePassword: row.must_change_password === 1,
  };
}

export function findUserByEmail(
  database: Database.Database,
  email: string,
): UserRecord | null {
  const row = database
    .prepare(
      `SELECT
        id,
        email,
        display_name,
        password_hash,
        role,
        status,
        must_change_password
      FROM users
      WHERE email = ?`,
    )
    .get(email) as UserRow | undefined;

  return row === undefined ? null : mapUser(row);
}

export function findUserBySessionTokenHash(
  database: Database.Database,
  tokenHash: string,
  now: string,
  idleCutoff: string,
): { sessionId: string; user: UserRecord } | null {
  const row = database
    .prepare(
      `SELECT
        sessions.id AS session_id,
        users.id,
        users.email,
        users.display_name,
        users.password_hash,
        users.role,
        users.status,
        users.must_change_password
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
        AND sessions.revoked_at IS NULL
        AND sessions.expires_at > ?
        AND sessions.last_seen_at > ?
        AND users.status = 'active'`,
    )
    .get(tokenHash, now, idleCutoff) as
    | (UserRow & { session_id: string })
    | undefined;

  if (row === undefined) {
    return null;
  }

  return {
    sessionId: row.session_id,
    user: mapUser(row),
  };
}
