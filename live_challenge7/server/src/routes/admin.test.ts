import type Database from 'better-sqlite3';
import request, { type SuperAgentTest } from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { createDatabase } from '../db/database.js';

let database: Database.Database;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  database = createDatabase(':memory:');
  app = createApp(database);
});

afterEach(() => {
  database.close();
});

describe('관리자 API', () => {
  it('일반 사용자 요청은 거절하고 관리자에게 사용량을 제공한다', async () => {
    const user = await createUserAgent(
      'managed@example.test',
      '관리 대상',
    );
    await user
      .post('/api/notes')
      .send({ title: '사용량 노트', content: '저장 용량' })
      .expect(201);
    await user.get('/api/admin/users').expect(403);

    const admin = await createAdminAgent();
    const response = await admin.get('/api/admin/users').expect(200);
    const managedUser = response.body.users.find(
      (item: { email: string }) =>
        item.email === 'managed@example.test',
    );

    expect(managedUser.noteCount).toBe(1);
    expect(managedUser.storageBytes).toBeGreaterThan(0);
  });

  it('비밀번호 초기화 시 기존 세션을 revoke한다', async () => {
    const user = await createUserAgent(
      'reset-target@example.test',
      '초기화 대상',
    );
    const userId = findUserId('reset-target@example.test');
    const admin = await createAdminAgent();

    await admin
      .post(`/api/admin/users/${userId}/reset-password`)
      .send({ newPassword: 'new-safe-password-456' })
      .expect(204);

    await user.get('/api/auth/session').expect(401);
    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'reset-target@example.test',
        password: 'new-safe-password-456',
      })
      .expect(200);

    const audit = database
      .prepare(
        "SELECT action FROM audit_logs WHERE action = 'USER_PASSWORD_RESET'",
      )
      .get() as { action: string } | undefined;
    expect(audit?.action).toBe('USER_PASSWORD_RESET');
  });

  it('사용자 삭제 시 로그인 정보와 노트를 함께 삭제한다', async () => {
    const user = await createUserAgent(
      'delete-target@example.test',
      '삭제 대상',
    );
    await user
      .post('/api/notes')
      .send({ title: '삭제될 노트', content: '' })
      .expect(201);
    const userId = findUserId('delete-target@example.test');
    const admin = await createAdminAgent();

    await admin.delete(`/api/admin/users/${userId}`).expect(204);

    const userCount = database
      .prepare('SELECT COUNT(*) AS count FROM users WHERE id = ?')
      .get(userId) as { count: number };
    const noteCount = database
      .prepare('SELECT COUNT(*) AS count FROM notes WHERE owner_id = ?')
      .get(userId) as { count: number };
    const audit = database
      .prepare(
        "SELECT action FROM audit_logs WHERE action = 'USER_ACCOUNT_DELETED'",
      )
      .get() as { action: string } | undefined;

    expect(userCount.count).toBe(0);
    expect(noteCount.count).toBe(0);
    expect(audit?.action).toBe('USER_ACCOUNT_DELETED');
  });
});

async function createUserAgent(
  email: string,
  displayName: string,
): Promise<SuperAgentTest> {
  const agent = request.agent(app);
  await agent
    .post('/api/auth/register')
    .send({
      email,
      displayName,
      password: 'safe-password-123',
    })
    .expect(201);
  return agent;
}

async function createAdminAgent(): Promise<SuperAgentTest> {
  const agent = await createUserAgent(
    `admin-${crypto.randomUUID()}@example.test`,
    '테스트 관리자',
  );
  database
    .prepare("UPDATE users SET role = 'admin' WHERE email LIKE 'admin-%'")
    .run();
  return agent;
}

function findUserId(email: string): string {
  const row = database
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(email) as { id: string };
  return row.id;
}
