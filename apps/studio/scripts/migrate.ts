import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const migrationDirectory = join(scriptDirectory, '../db/migrations');
const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query(`CREATE TABLE IF NOT EXISTS studio_migrations (
    version text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const files = (await readdir(migrationDirectory)).filter((file) => file.endsWith('.sql')).sort();
  for (const file of files) {
    const version = file.replace(/\.sql$/, '');
    const applied = await pool.query('SELECT 1 FROM studio_migrations WHERE version = $1', [
      version,
    ]);
    if (applied.rowCount) continue;
    const sql = await readFile(join(migrationDirectory, file), 'utf8');
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query(
        'INSERT INTO studio_migrations(version) VALUES ($1) ON CONFLICT (version) DO NOTHING',
        [version],
      );
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
} finally {
  await pool.end();
}
