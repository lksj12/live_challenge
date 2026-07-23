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

describe('노트 API', () => {
  it('비로그인 요청을 거절한다', async () => {
    await request(app).get('/api/notes').expect(401);
    await request(app)
      .post('/api/notes')
      .send({ title: '비로그인 노트', content: '' })
      .expect(401);
  });

  it('자신의 노트를 작성하고 조회하고 수정한 뒤 휴지통으로 이동한다', async () => {
    const agent = await createUserAgent(
      app,
      'notes-user@example.test',
      '노트 사용자',
    );

    const createResponse = await agent
      .post('/api/notes')
      .send({
        title: '첫 노트',
        content: 'SQLite에 저장할 내용',
      })
      .expect(201);
    const noteId = createResponse.body.note.id as string;

    const listResponse = await agent.get('/api/notes').expect(200);
    expect(listResponse.body.notes).toHaveLength(1);
    expect(listResponse.body.notes[0].title).toBe('첫 노트');

    const updateResponse = await agent
      .patch(`/api/notes/${noteId}`)
      .send({
        title: '수정한 노트',
        content: '수정한 내용',
        color: '#bcd8f4',
        priority: 'high',
        isPinned: true,
      })
      .expect(200);
    expect(updateResponse.body.note.title).toBe('수정한 노트');
    expect(updateResponse.body.note.color).toBe('#bcd8f4');
    expect(updateResponse.body.note.priority).toBe('high');
    expect(updateResponse.body.note.isPinned).toBe(true);
    expect(updateResponse.body.note.sizeBytes).toBeGreaterThan(0);

    await agent.delete(`/api/notes/${noteId}`).expect(204);
    const activeResponse = await agent.get('/api/notes').expect(200);
    const trashResponse = await agent
      .get('/api/notes?status=trashed')
      .expect(200);

    expect(activeResponse.body.notes).toHaveLength(0);
    expect(trashResponse.body.notes).toHaveLength(1);

    await agent.delete(`/api/notes/${noteId}/permanent`).expect(204);
    const emptiedTrashResponse = await agent
      .get('/api/notes?status=trashed')
      .expect(200);
    expect(emptiedTrashResponse.body.notes).toHaveLength(0);
  });

  it('활성 노트의 즉시 영구 삭제를 거절하고 보관·복원을 처리한다', async () => {
    const agent = await createUserAgent(
      app,
      'archive-user@example.test',
      '보관 사용자',
    );
    const createResponse = await agent
      .post('/api/notes')
      .send({ title: '보관할 노트', content: '' })
      .expect(201);
    const noteId = String(createResponse.body.note.id);

    await agent.delete(`/api/notes/${noteId}/permanent`).expect(409);

    await agent
      .patch(`/api/notes/${noteId}`)
      .send({ status: 'archived' })
      .expect(200);
    const archivedResponse = await agent
      .get('/api/notes?status=archived')
      .expect(200);
    expect(archivedResponse.body.notes).toHaveLength(1);

    await agent
      .patch(`/api/notes/${noteId}`)
      .send({ status: 'active' })
      .expect(200);
    const activeResponse = await agent.get('/api/notes').expect(200);
    expect(activeResponse.body.notes).toHaveLength(1);
  });

  it('다른 사용자의 노트를 읽거나 수정할 수 없다', async () => {
    const owner = await createUserAgent(
      app,
      'owner@example.test',
      '노트 소유자',
    );
    const other = await createUserAgent(
      app,
      'other@example.test',
      '다른 사용자',
    );

    const response = await owner
      .post('/api/notes')
      .send({ title: '비공개 노트', content: '소유자만 읽기' })
      .expect(201);
    const noteId = response.body.note.id as string;

    await other.get(`/api/notes/${noteId}`).expect(404);
    await other
      .patch(`/api/notes/${noteId}`)
      .send({ title: '탈취 시도' })
      .expect(404);
    await other.delete(`/api/notes/${noteId}`).expect(404);
  });

  it('태그를 만들고 자신의 노트에 지정한다', async () => {
    const agent = await createUserAgent(
      app,
      'tag-user@example.test',
      '태그 사용자',
    );
    const tagResponse = await agent
      .post('/api/tags')
      .send({ name: '업무' })
      .expect(201);
    const noteResponse = await agent
      .post('/api/notes')
      .send({ title: '태그 노트', content: '' })
      .expect(201);

    const assignedResponse = await agent
      .put(`/api/notes/${String(noteResponse.body.note.id)}/tags`)
      .send({ tagIds: [String(tagResponse.body.tag.id)] })
      .expect(200);

    expect(assignedResponse.body.note.tags).toEqual(['업무']);
    const listResponse = await agent.get('/api/notes').expect(200);
    expect(listResponse.body.notes[0].tags).toEqual(['업무']);
  });

  it('다른 사용자가 만든 태그는 노트에 지정할 수 없다', async () => {
    const owner = await createUserAgent(
      app,
      'tag-owner@example.test',
      '태그 소유자',
    );
    const other = await createUserAgent(
      app,
      'tag-other@example.test',
      '다른 사용자',
    );
    const tagResponse = await owner
      .post('/api/tags')
      .send({ name: '비공개' })
      .expect(201);
    const noteResponse = await other
      .post('/api/notes')
      .send({ title: '다른 노트', content: '' })
      .expect(201);

    await other
      .put(`/api/notes/${String(noteResponse.body.note.id)}/tags`)
      .send({ tagIds: [String(tagResponse.body.tag.id)] })
      .expect(400);
  });
});

async function createUserAgent(
  targetApp: ReturnType<typeof createApp>,
  email: string,
  displayName: string,
): Promise<SuperAgentTest> {
  const agent = request.agent(targetApp);

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
