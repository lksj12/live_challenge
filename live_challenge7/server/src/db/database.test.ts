import type Database from 'better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';

import { createDatabase } from './database.js';

let database: Database.Database | undefined;

afterEach(() => {
  database?.close();
  database = undefined;
});

describe('SQLite 마이그레이션', () => {
  it('필수 테이블과 첫 번째 마이그레이션을 생성한다', () => {
    database = createDatabase(':memory:');

    const tables = database
      .prepare(
        `SELECT name
         FROM sqlite_master
         WHERE type = 'table'
         ORDER BY name`,
      )
      .all() as { name: string }[];
    const tableNames = tables.map(({ name }) => name);
    const migration = database
      .prepare('SELECT version, name FROM schema_migrations')
      .get() as { version: number; name: string };

    expect(tableNames).toEqual(
      expect.arrayContaining([
        'audit_logs',
        'note_tags',
        'notes',
        'schema_migrations',
        'sessions',
        'tags',
        'users',
      ]),
    );
    expect(migration).toEqual({
      version: 1,
      name: 'initial_schema',
    });
    expect(database.pragma('foreign_keys', { simple: true })).toBe(1);
  });

  it('사용자를 삭제하면 소유한 세션과 노트도 삭제한다', () => {
    database = createDatabase(':memory:');
    const now = new Date().toISOString();

    database
      .prepare(
        `INSERT INTO users (
          id, email, display_name, password_hash, role, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        'user-1',
        'user@example.test',
        '테스트 사용자',
        'not-a-real-password-hash',
        'user',
        now,
        now,
      );
    database
      .prepare(
        `INSERT INTO sessions (
          id, user_id, token_hash, created_at, last_seen_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run('session-1', 'user-1', 'token-hash', now, now, now);
    database
      .prepare(
        `INSERT INTO notes (
          id, owner_id, title, content, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run('note-1', 'user-1', '제목', '내용', now, now);

    database.prepare('DELETE FROM users WHERE id = ?').run('user-1');

    const sessionCount = database
      .prepare('SELECT COUNT(*) AS count FROM sessions')
      .get() as { count: number };
    const noteCount = database
      .prepare('SELECT COUNT(*) AS count FROM notes')
      .get() as { count: number };

    expect(sessionCount.count).toBe(0);
    expect(noteCount.count).toBe(0);
  });
});
