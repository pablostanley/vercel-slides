import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';
import { slideDocumentSchema } from '../../../packages/document/src/schema.ts';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const generatedPath = join(
  scriptDirectory,
  '../../../packages/document/src/vercel-master-documents.generated.json',
);
const generated = JSON.parse(await readFile(generatedPath, 'utf8')) as {
  masters: Array<{
    slug: string;
    title: string;
    category: string;
    tags: string[];
    document: unknown;
  }>;
};
const masters = generated.masters.map((master, position) => ({
  ...master,
  position,
  document: slideDocumentSchema.parse(master.document),
}));
if (masters.length !== 62) throw new Error(`Expected 62 masters, received ${masters.length}`);

const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query('BEGIN');
  await pool.query(
    `INSERT INTO users(id, email, name, username, role)
     VALUES ('seed:vercel', 'slides-seed@vercel.com', 'Vercel Slides seed', 'slides-seed', 'admin')
     ON CONFLICT (id) DO NOTHING`,
  );
  await pool.query(
    `INSERT INTO template_libraries(id, slug, title, description, status)
     VALUES (
       'library:vercel', 'vercel', 'Vercel',
       'Published Vercel presentation masters', 'active'
     )
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       status = 'active',
       updated_at = now()`,
  );
  for (const master of masters) {
    const masterId = `master:vercel:${master.slug}`;
    const versionId = `master-version:vercel:${master.slug}:1`;
    await pool.query(
      `INSERT INTO master_slides(
         id, library_id, slug, title, description, category, tags, position, status
       ) VALUES ($1, 'library:vercel', $2, $3, $4, $5, $6, $7, 'active')
       ON CONFLICT (id) DO NOTHING`,
      [
        masterId,
        master.slug,
        master.title,
        `Vercel ${master.title.toLowerCase()} master slide`,
        master.category,
        master.tags,
        master.position,
      ],
    );
    await pool.query(
      `INSERT INTO master_slide_versions(
         id, master_slide_id, version, schema_version, document_json, created_by,
         status, revision, published_at
       ) VALUES ($1, $2, 1, $3, $4::jsonb, 'seed:vercel', 'published', 0, now())
       ON CONFLICT (id) DO NOTHING`,
      [versionId, masterId, master.document.schemaVersion, JSON.stringify(master.document)],
    );
    await pool.query(
      `UPDATE master_slides
       SET current_published_version_id = $2
       WHERE id = $1 AND current_published_version_id IS NULL`,
      [masterId, versionId],
    );
  }
  await pool.query(
    `INSERT INTO seed_markers(key, version)
     VALUES ('vercel-master-library', 'vercel-masters-v1')
     ON CONFLICT (key) DO UPDATE SET version = EXCLUDED.version, applied_at = now()`,
  );
  await pool.query('COMMIT');
  console.log(`Seeded ${masters.length} Vercel masters at vercel-masters-v1`);
} catch (error) {
  await pool.query('ROLLBACK');
  throw error;
} finally {
  await pool.end();
}
