const migrations = [
    {
        version: 1,
        name: 'initial_schema',
        statements: [
            `CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
        status TEXT NOT NULL DEFAULT 'active'
          CHECK (status IN ('active', 'disabled')),
        must_change_password INTEGER NOT NULL DEFAULT 0
          CHECK (must_change_password IN (0, 1)),
        last_login_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      ) STRICT`,
            `CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        revoked_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) STRICT`,
            `CREATE TABLE notes (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        color TEXT NOT NULL DEFAULT '#f7d774',
        priority TEXT NOT NULL DEFAULT 'medium'
          CHECK (priority IN ('low', 'medium', 'high')),
        status TEXT NOT NULL DEFAULT 'active'
          CHECK (status IN ('active', 'archived', 'trashed')),
        is_pinned INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1)),
        size_bytes INTEGER NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      ) STRICT`,
            `CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        name TEXT NOT NULL COLLATE NOCASE,
        created_at TEXT NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (owner_id, name)
      ) STRICT`,
            `CREATE TABLE note_tags (
        note_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (note_id, tag_id),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      ) STRICT`,
            `CREATE TABLE audit_logs (
        id TEXT PRIMARY KEY,
        actor_user_id TEXT,
        target_user_id TEXT,
        action TEXT NOT NULL,
        details_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
      ) STRICT`,
            `CREATE INDEX sessions_user_active_idx
        ON sessions (user_id, revoked_at, expires_at)`,
            `CREATE INDEX notes_owner_status_updated_idx
        ON notes (owner_id, status, updated_at DESC)`,
            `CREATE INDEX notes_owner_pinned_idx
        ON notes (owner_id, is_pinned, updated_at DESC)`,
            `CREATE INDEX tags_owner_idx ON tags (owner_id)`,
            `CREATE INDEX audit_logs_created_idx
        ON audit_logs (created_at DESC)`,
        ],
    },
];
export function applyMigrations(database) {
    database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    ) STRICT
  `);
    const latest = database
        .prepare('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1')
        .get();
    const currentVersion = latest?.version ?? 0;
    const insertMigration = database.prepare(`
    INSERT INTO schema_migrations (version, name, applied_at)
    VALUES (?, ?, ?)
  `);
    for (const migration of migrations) {
        if (migration.version <= currentVersion) {
            continue;
        }
        const runMigration = database.transaction(() => {
            for (const statement of migration.statements) {
                database.exec(statement);
            }
            insertMigration.run(migration.version, migration.name, new Date().toISOString());
        });
        runMigration();
    }
}
//# sourceMappingURL=migrations.js.map