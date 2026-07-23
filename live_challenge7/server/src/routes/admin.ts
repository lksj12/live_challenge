import { randomUUID } from 'node:crypto';

import type Database from 'better-sqlite3';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';

import { hashPassword } from '../auth/password.js';
import { requireAuthentication } from '../middleware/authenticate.js';

const userIdSchema = z.string().uuid();
const resetPasswordSchema = z.object({
  newPassword: z.string().min(10).max(128),
});

interface ManagedUserRow {
  id: string;
  email: string;
  display_name: string;
  status: 'active' | 'disabled';
  last_login_at: string | null;
  created_at: string;
  note_count: number;
  storage_bytes: number;
}

export function createAdminRouter(database: Database.Database): Router {
  const router = Router();
  router.use(requireAuthentication(database));
  router.use(requireAdminRole);

  router.get('/users', (_request, response) => {
    const rows = database
      .prepare(
        `SELECT
          users.id,
          users.email,
          users.display_name,
          users.status,
          users.last_login_at,
          users.created_at,
          COUNT(notes.id) AS note_count,
          COALESCE(SUM(notes.size_bytes), 0) AS storage_bytes
        FROM users
        LEFT JOIN notes ON notes.owner_id = users.id
        WHERE users.role = 'user'
        GROUP BY users.id
        ORDER BY users.created_at DESC`,
      )
      .all() as ManagedUserRow[];

    response.json({ users: rows.map(mapManagedUser) });
  });

  router.post(
    '/users/:userId/reset-password',
    async (request, response) => {
      const userId = parseUserId(request.params.userId, response);
      const parsed = resetPasswordSchema.safeParse(request.body);
      if (userId === null || !parsed.success) {
        if (!parsed.success) {
          respondValidationError(response);
        }
        return;
      }

      const target = findManagedUser(database, userId);
      if (target === null) {
        respondUserNotFound(response);
        return;
      }

      const now = new Date().toISOString();
      const passwordHash = await hashPassword(parsed.data.newPassword);
      const resetPassword = database.transaction(() => {
        database
          .prepare(
            `UPDATE users
             SET password_hash = ?, must_change_password = 0, updated_at = ?
             WHERE id = ? AND role = 'user'`,
          )
          .run(passwordHash, now, userId);
        database
          .prepare(
            `UPDATE sessions
             SET revoked_at = COALESCE(revoked_at, ?)
             WHERE user_id = ?`,
          )
          .run(now, userId);
        insertAuditLog(
          database,
          request.auth!.user.id,
          userId,
          'USER_PASSWORD_RESET',
          { email: target.email },
          now,
        );
      });
      resetPassword();

      response.status(204).end();
    },
  );

  router.delete('/users/:userId', (request, response) => {
    const userId = parseUserId(request.params.userId, response);
    if (userId === null) {
      return;
    }

    const target = findManagedUser(database, userId);
    if (target === null) {
      respondUserNotFound(response);
      return;
    }

    const now = new Date().toISOString();
    const deleteUser = database.transaction(() => {
      insertAuditLog(
        database,
        request.auth!.user.id,
        userId,
        'USER_ACCOUNT_DELETED',
        { email: target.email },
        now,
      );
      database
        .prepare("DELETE FROM users WHERE id = ? AND role = 'user'")
        .run(userId);
    });
    deleteUser();

    response.status(204).end();
  });

  return router;
}

function requireAdminRole(
  request: Request,
  response: Response,
  next: () => void,
): void {
  if (request.auth?.user.role !== 'admin') {
    response.status(403).json({
      error: {
        code: 'ADMIN_ROLE_REQUIRED',
        message: '관리자 권한이 필요합니다.',
      },
    });
    return;
  }

  next();
}

function parseUserId(
  value: string | undefined,
  response: Response,
): string | null {
  const result = userIdSchema.safeParse(value);
  if (!result.success) {
    respondValidationError(response);
    return null;
  }
  return result.data;
}

function findManagedUser(
  database: Database.Database,
  userId: string,
): { id: string; email: string } | null {
  const user = database
    .prepare(
      "SELECT id, email FROM users WHERE id = ? AND role = 'user'",
    )
    .get(userId) as { id: string; email: string } | undefined;
  return user ?? null;
}

function mapManagedUser(row: ManagedUserRow) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    status: row.status,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    noteCount: row.note_count,
    storageBytes: row.storage_bytes,
  };
}

function insertAuditLog(
  database: Database.Database,
  actorUserId: string,
  targetUserId: string,
  action: string,
  details: Record<string, unknown>,
  createdAt: string,
): void {
  database
    .prepare(
      `INSERT INTO audit_logs (
        id, actor_user_id, target_user_id, action, details_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      randomUUID(),
      actorUserId,
      targetUserId,
      action,
      JSON.stringify(details),
      createdAt,
    );
}

function respondValidationError(response: Response): void {
  response.status(400).json({
    error: {
      code: 'VALIDATION_ERROR',
      message: '관리자 요청 입력값을 다시 확인해 주세요.',
    },
  });
}

function respondUserNotFound(response: Response): void {
  response.status(404).json({
    error: {
      code: 'USER_NOT_FOUND',
      message: '관리할 일반 사용자 계정을 찾을 수 없습니다.',
    },
  });
}
