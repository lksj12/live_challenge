import { randomUUID } from 'node:crypto';

import type Database from 'better-sqlite3';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';

import { requireAuthentication } from '../middleware/authenticate.js';

const noteStatusSchema = z.enum(['active', 'archived', 'trashed']);
const notePrioritySchema = z.enum(['low', 'medium', 'high']);
const colorSchema = z.string().regex(/^#[0-9a-f]{6}$/i);

const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(50_000).default(''),
  color: colorSchema.optional(),
  priority: notePrioritySchema.optional(),
});

const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().max(50_000).optional(),
    color: colorSchema.optional(),
    priority: notePrioritySchema.optional(),
    isPinned: z.boolean().optional(),
    status: noteStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

const noteIdSchema = z.string().uuid();
const setNoteTagsSchema = z.object({
  tagIds: z.array(z.string().uuid()).max(20),
});

interface NoteRow {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'archived' | 'trashed';
  is_pinned: 0 | 1;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

interface NoteResponse {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  color: string;
  priority: NoteRow['priority'];
  status: NoteRow['status'];
  isPinned: boolean;
  tags: string[];
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export function createNotesRouter(database: Database.Database): Router {
  const router = Router();
  router.use(requireAuthentication(database));

  router.use((request, response, next) => {
    if (request.auth?.user.role !== 'user') {
      response.status(403).json({
        error: {
          code: 'USER_ROLE_REQUIRED',
          message: '일반 사용자 계정에서 사용할 수 있는 기능입니다.',
        },
      });
      return;
    }

    next();
  });

  router.get('/', (request, response) => {
    const statusResult = noteStatusSchema.safeParse(request.query.status);
    const status = statusResult.success ? statusResult.data : 'active';
    const ownerId = getOwnerId(request, response);
    if (ownerId === null) {
      return;
    }

    const rows = database
      .prepare(
        `SELECT *
         FROM notes
         WHERE owner_id = ? AND status = ?
         ORDER BY is_pinned DESC, updated_at DESC`,
      )
      .all(ownerId, status) as NoteRow[];

    response.json({
      notes: rows.map((row) => mapNote(database, row)),
    });
  });

  router.get('/:noteId', (request, response) => {
    const noteId = parseNoteId(request.params.noteId, response);
    const ownerId = getOwnerId(request, response);
    if (noteId === null || ownerId === null) {
      return;
    }

    const note = findOwnedNote(database, noteId, ownerId);
    if (note === null) {
      respondNotFound(response);
      return;
    }

    response.json({ note: mapNote(database, note) });
  });

  router.post('/', (request, response) => {
    const parsed = createNoteSchema.safeParse(request.body);
    const ownerId = getOwnerId(request, response);
    if (!parsed.success || ownerId === null) {
      if (!parsed.success) {
        respondValidationError(response);
      }
      return;
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const color = parsed.data.color ?? '#f7d774';
    const priority = parsed.data.priority ?? 'medium';
    const sizeBytes = getNoteSize(parsed.data.title, parsed.data.content);

    database
      .prepare(
        `INSERT INTO notes (
          id,
          owner_id,
          title,
          content,
          color,
          priority,
          size_bytes,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        ownerId,
        parsed.data.title,
        parsed.data.content,
        color,
        priority,
        sizeBytes,
        now,
        now,
      );

    const note = findOwnedNote(database, id, ownerId);
    response.status(201).json({ note: mapNote(database, note!) });
  });

  router.patch('/:noteId', (request, response) => {
    const parsed = updateNoteSchema.safeParse(request.body);
    if (!parsed.success) {
      respondValidationError(response);
      return;
    }

    const noteId = parseNoteId(request.params.noteId, response);
    const ownerId = getOwnerId(request, response);
    if (noteId === null || ownerId === null) {
      return;
    }

    const current = findOwnedNote(database, noteId, ownerId);
    if (current === null) {
      respondNotFound(response);
      return;
    }

    const updated = {
      title: parsed.data.title ?? current.title,
      content: parsed.data.content ?? current.content,
      color: parsed.data.color ?? current.color,
      priority: parsed.data.priority ?? current.priority,
      isPinned: parsed.data.isPinned ?? current.is_pinned === 1,
      status: parsed.data.status ?? current.status,
      updatedAt: new Date().toISOString(),
    };

    database
      .prepare(
        `UPDATE notes
         SET
           title = ?,
           content = ?,
           color = ?,
           priority = ?,
           is_pinned = ?,
           status = ?,
           size_bytes = ?,
           updated_at = ?
         WHERE id = ? AND owner_id = ?`,
      )
      .run(
        updated.title,
        updated.content,
        updated.color,
        updated.priority,
        updated.isPinned ? 1 : 0,
        updated.status,
        getNoteSize(updated.title, updated.content),
        updated.updatedAt,
        noteId,
        ownerId,
      );

    response.json({
      note: mapNote(database, findOwnedNote(database, noteId, ownerId)!),
    });
  });

  router.put('/:noteId/tags', (request, response) => {
    const parsed = setNoteTagsSchema.safeParse(request.body);
    if (!parsed.success) {
      respondValidationError(response);
      return;
    }

    const noteId = parseNoteId(request.params.noteId, response);
    const ownerId = getOwnerId(request, response);
    if (noteId === null || ownerId === null) {
      return;
    }

    const note = findOwnedNote(database, noteId, ownerId);
    if (note === null) {
      respondNotFound(response);
      return;
    }

    const uniqueTagIds = [...new Set(parsed.data.tagIds)];
    if (uniqueTagIds.length > 0) {
      const placeholders = uniqueTagIds.map(() => '?').join(', ');
      const ownedTagCount = database
        .prepare(
          `SELECT COUNT(*) AS count
           FROM tags
           WHERE owner_id = ? AND id IN (${placeholders})`,
        )
        .get(ownerId, ...uniqueTagIds) as { count: number };

      if (ownedTagCount.count !== uniqueTagIds.length) {
        response.status(400).json({
          error: {
            code: 'INVALID_TAG',
            message: '사용할 수 없는 태그가 포함되어 있습니다.',
          },
        });
        return;
      }
    }

    const replaceTags = database.transaction(() => {
      database.prepare('DELETE FROM note_tags WHERE note_id = ?').run(noteId);
      const insert = database.prepare(
        `INSERT INTO note_tags (note_id, tag_id, created_at)
         VALUES (?, ?, ?)`,
      );
      const now = new Date().toISOString();
      for (const tagId of uniqueTagIds) {
        insert.run(noteId, tagId, now);
      }
      database
        .prepare('UPDATE notes SET updated_at = ? WHERE id = ?')
        .run(now, noteId);
    });
    replaceTags();

    response.json({
      note: mapNote(database, findOwnedNote(database, noteId, ownerId)!),
    });
  });

  router.delete('/:noteId', (request, response) => {
    const noteId = parseNoteId(request.params.noteId, response);
    const ownerId = getOwnerId(request, response);
    if (noteId === null || ownerId === null) {
      return;
    }

    const result = database
      .prepare(
        `UPDATE notes
         SET status = 'trashed', updated_at = ?
         WHERE id = ? AND owner_id = ?`,
      )
      .run(new Date().toISOString(), noteId, ownerId);

    if (result.changes === 0) {
      respondNotFound(response);
      return;
    }

    response.status(204).end();
  });

  router.delete('/:noteId/permanent', (request, response) => {
    const noteId = parseNoteId(request.params.noteId, response);
    const ownerId = getOwnerId(request, response);
    if (noteId === null || ownerId === null) {
      return;
    }

    const note = findOwnedNote(database, noteId, ownerId);
    if (note === null) {
      respondNotFound(response);
      return;
    }
    if (note.status !== 'trashed') {
      response.status(409).json({
        error: {
          code: 'NOTE_NOT_TRASHED',
          message: '휴지통에 있는 노트만 영구 삭제할 수 있습니다.',
        },
      });
      return;
    }

    database
      .prepare('DELETE FROM notes WHERE id = ? AND owner_id = ?')
      .run(noteId, ownerId);
    response.status(204).end();
  });

  return router;
}

function findOwnedNote(
  database: Database.Database,
  noteId: string,
  ownerId: string,
): NoteRow | null {
  const row = database
    .prepare('SELECT * FROM notes WHERE id = ? AND owner_id = ?')
    .get(noteId, ownerId) as NoteRow | undefined;

  return row ?? null;
}

function mapNote(
  database: Database.Database,
  row: NoteRow,
): NoteResponse {
  const tags = database
    .prepare(
      `SELECT tags.name
       FROM tags
       INNER JOIN note_tags ON note_tags.tag_id = tags.id
       WHERE note_tags.note_id = ?
       ORDER BY tags.name COLLATE NOCASE ASC`,
    )
    .all(row.id) as { name: string }[];

  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    content: row.content,
    color: row.color,
    priority: row.priority,
    status: row.status,
    isPinned: row.is_pinned === 1,
    tags: tags.map((tag) => tag.name),
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getOwnerId(request: Request, response: Response): string | null {
  const ownerId = request.auth?.user.id;

  if (ownerId === undefined) {
    response.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: '로그인이 필요합니다.',
      },
    });
    return null;
  }

  return ownerId;
}

function parseNoteId(
  value: string | undefined,
  response: Response,
): string | null {
  const result = noteIdSchema.safeParse(value);
  if (!result.success) {
    respondValidationError(response);
    return null;
  }

  return result.data;
}

function getNoteSize(title: string, content: string): number {
  return Buffer.byteLength(title, 'utf8') + Buffer.byteLength(content, 'utf8');
}

function respondValidationError(response: Response): void {
  response.status(400).json({
    error: {
      code: 'VALIDATION_ERROR',
      message: '노트 입력값을 다시 확인해 주세요.',
    },
  });
}

function respondNotFound(response: Response): void {
  response.status(404).json({
    error: {
      code: 'NOTE_NOT_FOUND',
      message: '노트를 찾을 수 없습니다.',
    },
  });
}
