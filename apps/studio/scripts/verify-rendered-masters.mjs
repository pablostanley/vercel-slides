import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { VERCEL_MASTER_DEFINITIONS } from '../../../packages/document/src/vercel-master-definitions.ts';

const repositoryRoot = resolve(import.meta.dirname, '../../..');
const studioUrl = process.env.STUDIO_URL ?? 'http://127.0.0.1:3100';
const sourceDirectory = resolve(
  process.env.VERCEL_MASTER_SOURCE_SCREENSHOTS ?? '.artifacts/vercel-master-source',
);
const renderedDirectory = resolve(
  process.env.VERCEL_MASTER_RENDERED_SCREENSHOTS ?? '.artifacts/vercel-master-rendered',
);
const reportPath = resolve(
  repositoryRoot,
  process.env.VERCEL_MASTER_VISUAL_REPORT ??
    'packages/document/src/vercel-master-visual-report.generated.json',
);
const normalizedDirectory = resolve(renderedDirectory, '.normalized');

function digest(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function normalize(source, destination) {
  const result = spawnSync('magick', [source, '-resize', '960x540!', destination], {
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(result.stderr || `Could not normalize ${source}`);
}

function compare(source, rendered) {
  const result = spawnSync('magick', ['compare', '-metric', 'RMSE', source, rendered, 'null:'], {
    encoding: 'utf8',
  });
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(result.stderr || `Could not compare ${source}`);
  }
  const match = result.stderr.match(/([\d.]+) \(([\deE+.-]+)\)/);
  if (!match) throw new Error(`Could not parse ImageMagick result: ${result.stderr}`);
  return {
    absoluteRmse: Number.parseFloat(match[1]),
    normalizedRmse: Number.parseFloat(match[2]),
  };
}

await rm(renderedDirectory, { recursive: true, force: true });
await mkdir(normalizedDirectory, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  reducedMotion: 'reduce',
});

try {
  const session = await page.request.post(`${studioUrl}/api/auth/test-session`, {
    data: {
      id: 'test:master-visual-verifier',
      email: 'master-visual-verifier@vercel.com',
      name: 'Master Visual Verifier',
      role: 'admin',
    },
  });
  if (!session.ok()) throw new Error(`Test session failed with ${session.status()}`);

  const comparisons = [];
  for (const [index, master] of VERCEL_MASTER_DEFINITIONS.entries()) {
    const filename = `${String(index + 1).padStart(2, '0')}-${master.slug}.png`;
    const sourcePath = resolve(sourceDirectory, filename);
    const renderedPath = resolve(renderedDirectory, filename);
    const normalizedSource = resolve(normalizedDirectory, `source-${filename}`);
    const normalizedRendered = resolve(normalizedDirectory, `rendered-${filename}`);

    await page.goto(`${studioUrl}/admin/templates/vercel/masters/${master.slug}`, {
      waitUntil: 'networkidle',
    });
    const canvas = page.locator('.canvas-frame svg').first();
    await canvas.waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) => (image.complete ? undefined : image.decode())),
      );
    });
    await canvas.screenshot({ path: renderedPath, animations: 'disabled' });

    normalize(sourcePath, normalizedSource);
    normalize(renderedPath, normalizedRendered);
    const metrics = compare(normalizedSource, normalizedRendered);
    comparisons.push({
      position: index,
      slug: master.slug,
      ...metrics,
      sourceSha256: digest(await readFile(sourcePath)),
      renderedSha256: digest(await readFile(renderedPath)),
    });
  }

  const averageNormalizedRmse =
    comparisons.reduce((sum, entry) => sum + entry.normalizedRmse, 0) / comparisons.length;
  const report = {
    schemaVersion: 1,
    masterCount: comparisons.length,
    comparisonSize: { width: 960, height: 540 },
    averageNormalizedRmse,
    maximumNormalizedRmse: Math.max(...comparisons.map((entry) => entry.normalizedRmse)),
    masters: comparisons,
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Verified ${comparisons.length} rendered masters; average normalized RMSE ${averageNormalizedRmse.toFixed(6)}`,
  );
} finally {
  await browser.close();
  await rm(normalizedDirectory, { recursive: true, force: true });
}
