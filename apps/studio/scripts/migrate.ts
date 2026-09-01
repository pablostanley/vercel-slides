import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const migration = await readFile(
  join(scriptDirectory, '../db/migrations/0001_initial.sql'),
  'utf8',
);
const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query(migration);
} finally {
  await pool.end();
}
