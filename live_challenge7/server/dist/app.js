import cookieParser from 'cookie-parser';
import express from 'express';
import { createAuthRouter } from './routes/auth.js';
import { createAdminRouter } from './routes/admin.js';
import { createNotesRouter } from './routes/notes.js';
import { createTagsRouter } from './routes/tags.js';
export function createApp(database, options = {}) {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({ limit: '256kb' }));
    app.use(cookieParser());
    app.get('/api/health', (_request, response) => {
        database.prepare('SELECT 1').get();
        response.json({
            status: 'ok',
            database: 'ready',
        });
    });
    app.use('/api/auth', createAuthRouter(database, {
        secureCookies: options.secureCookies ?? false,
    }));
    app.use('/api/notes', createNotesRouter(database));
    app.use('/api/tags', createTagsRouter(database));
    app.use('/api/admin', createAdminRouter(database));
    app.use('/api', (_request, response) => {
        response.status(404).json({
            error: {
                code: 'NOT_FOUND',
                message: '요청한 API를 찾을 수 없습니다.',
            },
        });
    });
    return app;
}
//# sourceMappingURL=app.js.map