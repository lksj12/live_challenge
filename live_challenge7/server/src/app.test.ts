import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from './app.js';
import { createDatabase } from './db/database.js';

const database = createDatabase(':memory:');
const app = createApp(database);

afterAll(() => {
  database.close();
});

describe('GET /api/health', () => {
  it('API와 SQLite 준비 상태를 반환한다', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      database: 'ready',
    });
  });
});
