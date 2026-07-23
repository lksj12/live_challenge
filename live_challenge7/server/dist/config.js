import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function readPort(value) {
    if (value === undefined) {
        return 3001;
    }
    const port = Number(value);
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
        throw new Error('PORT는 1부터 65535 사이의 정수여야 합니다.');
    }
    return port;
}
function readDatabasePath(value) {
    if (value === undefined || value.trim() === '') {
        return resolve(serverRoot, 'data', 'keeply.db');
    }
    return resolve(serverRoot, value);
}
export const config = {
    host: '127.0.0.1',
    port: readPort(process.env.PORT),
    databasePath: readDatabasePath(process.env.DB_PATH),
    secureCookies: process.env.NODE_ENV === 'production',
};
//# sourceMappingURL=config.js.map