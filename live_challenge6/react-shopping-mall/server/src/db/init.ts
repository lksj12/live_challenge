import dotenv from 'dotenv';

import {
    databasePath,
    db,
} from './database';

import {
    initializeDatabase,
} from './schema';

dotenv.config();

initializeDatabase();

console.log(
    `SQLite database initialized: ${databasePath}`,
);

db.close();
