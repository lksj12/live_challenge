import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuthentication } from '../middleware/authenticate.js';
const createTagSchema = z.object({
    name: z.string().trim().min(1).max(30),
});
export function createTagsRouter(database) {
    const router = Router();
    router.use(requireAuthentication(database));
    router.use(requireUserRole);
    router.get('/', (request, response) => {
        const ownerId = request.auth.user.id;
        const tags = database
            .prepare(`SELECT id, name, created_at
         FROM tags
         WHERE owner_id = ?
         ORDER BY name COLLATE NOCASE ASC`)
            .all(ownerId);
        response.json({ tags: tags.map(mapTag) });
    });
    router.post('/', (request, response) => {
        const parsed = createTagSchema.safeParse(request.body);
        if (!parsed.success) {
            respondValidationError(response);
            return;
        }
        const ownerId = request.auth.user.id;
        const existing = database
            .prepare(`SELECT id, name, created_at
         FROM tags
         WHERE owner_id = ? AND name = ? COLLATE NOCASE`)
            .get(ownerId, parsed.data.name);
        if (existing !== undefined) {
            response.status(409).json({
                error: {
                    code: 'TAG_ALREADY_EXISTS',
                    message: '이미 같은 이름의 태그가 있습니다.',
                },
            });
            return;
        }
        const tag = {
            id: randomUUID(),
            name: parsed.data.name,
            created_at: new Date().toISOString(),
        };
        database
            .prepare(`INSERT INTO tags (id, owner_id, name, created_at)
         VALUES (?, ?, ?, ?)`)
            .run(tag.id, ownerId, tag.name, tag.created_at);
        response.status(201).json({ tag: mapTag(tag) });
    });
    return router;
}
function requireUserRole(request, response, next) {
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
}
function mapTag(row) {
    return {
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
    };
}
function respondValidationError(response) {
    response.status(400).json({
        error: {
            code: 'VALIDATION_ERROR',
            message: '태그 이름은 1자 이상 30자 이하로 입력해 주세요.',
        },
    });
}
//# sourceMappingURL=tags.js.map