import { createApp } from './app.js';
import { config } from './config.js';
import { createDatabase } from './db/database.js';

const database = createDatabase(config.databasePath);
const app = createApp(database, {
  secureCookies: config.secureCookies,
});

const httpServer = app.listen(config.port, config.host, () => {
  console.info(
    `Keeply API가 http://${config.host}:${config.port}에서 실행 중입니다.`,
  );
});

let isShuttingDown = false;

function shutdown(): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  httpServer.close(() => {
    database.close();
    process.exit(0);
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
