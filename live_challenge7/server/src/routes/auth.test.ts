import type Database from 'better-sqlite3';
import request from 'supertest';
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

describe('인증 API', () => {
  it('일반 사용자를 만들고 비밀번호 원문을 저장하지 않는다', async () => {
    const agent = request.agent(app);
    const response = await agent
      .post('/api/auth/register')
      .send({
        email: 'new-user@example.test',
        displayName: '새 사용자',
        password: 'safe-password-123',
      })
      .expect(201);

    const stored = database
      .prepare(
        'SELECT password_hash, role FROM users WHERE email = ?',
      )
      .get('new-user@example.test') as {
      password_hash: string;
      role: string;
    };

    expect(response.body.user.role).toBe('user');
    expect(stored.password_hash).not.toBe('safe-password-123');
    expect(stored.password_hash.startsWith('$argon2id$')).toBe(true);
    expect(stored.role).toBe('user');

    const sessionResponse = await agent
      .get('/api/auth/session')
      .expect(200);
    expect(sessionResponse.body.user.email).toBe('new-user@example.test');
  });

  it('올바른 비밀번호로 로그인하고 잘못된 비밀번호는 거절한다', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'login-user@example.test',
      displayName: '로그인 사용자',
      password: 'safe-password-123',
    });

    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login-user@example.test',
        password: 'wrong-password',
      })
      .expect(401);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login-user@example.test',
        password: 'safe-password-123',
      })
      .expect(200);

    expect(response.body.user.email).toBe('login-user@example.test');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('로그아웃하면 서버 세션을 폐기하고 기존 토큰을 거절한다', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'logout-user@example.test',
        displayName: '로그아웃 사용자',
        password: 'safe-password-123',
      })
      .expect(201);
    const cookie = readCookie(registerResponse.headers['set-cookie']);

    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(204);

    await request(app)
      .get('/api/auth/session')
      .set('Cookie', cookie)
      .expect(401);

    const storedSession = database
      .prepare('SELECT revoked_at FROM sessions LIMIT 1')
      .get() as { revoked_at: string | null };
    expect(storedSession.revoked_at).not.toBeNull();
  });

  it('잘못된 회원가입 입력과 중복 이메일을 거절한다', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        displayName: '가',
        password: 'short',
      })
      .expect(400);

    const payload = {
      email: 'duplicate@example.test',
      displayName: '중복 사용자',
      password: 'safe-password-123',
    };

    await request(app).post('/api/auth/register').send(payload).expect(201);
    await request(app).post('/api/auth/register').send(payload).expect(409);
  });
});

function readCookie(value: string | string[] | undefined): string {
  const rawCookie = Array.isArray(value) ? value[0] : value;

  if (rawCookie === undefined) {
    throw new Error('세션 쿠키가 응답에 없습니다.');
  }

  return rawCookie.split(';')[0] ?? rawCookie;
}
