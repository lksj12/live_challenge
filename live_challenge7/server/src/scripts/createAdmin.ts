import { randomUUID } from 'node:crypto';

import { z } from 'zod';

import { hashPassword } from '../auth/password.js';
import { config } from '../config.js';
import { createDatabase } from '../db/database.js';

const adminInputSchema = z.object({
  email: z.string().trim().email().max(254),
  displayName: z.string().trim().min(2).max(50),
  password: z.string().min(10).max(128),
});

const input = adminInputSchema.safeParse({
  email: readArgument('--email'),
  displayName: readArgument('--name'),
  password: readArgument('--password'),
});

if (!input.success) {
  console.error(
    '사용법: npm run create-admin --workspace @keeply/server -- ' +
      '--email admin@example.com --name 관리자 --password "10자 이상 비밀번호"',
  );
  process.exitCode = 1;
} else {
  const database = createDatabase(config.databasePath);

  try {
    const existing = database
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(input.data.email.toLowerCase());
    if (existing !== undefined) {
      throw new Error('이미 같은 이메일의 계정이 있습니다.');
    }

    const now = new Date().toISOString();
    const passwordHash = await hashPassword(input.data.password);
    database
      .prepare(
        `INSERT INTO users (
          id,
          email,
          display_name,
          password_hash,
          role,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, 'admin', ?, ?)`,
      )
      .run(
        randomUUID(),
        input.data.email.toLowerCase(),
        input.data.displayName,
        passwordHash,
        now,
        now,
      );

    console.info(`관리자 계정 ${input.data.email.toLowerCase()}을 생성했습니다.`);
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : '관리자 계정을 생성하지 못했습니다.',
    );
    process.exitCode = 1;
  } finally {
    database.close();
  }
}

function readArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}
