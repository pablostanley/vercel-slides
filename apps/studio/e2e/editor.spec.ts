import { expect, type Page, test } from '@playwright/test';

const runId = Date.now().toString(36);

function captureConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function signIn(page: Page, identity = 'owner', role: 'user' | 'admin' = 'user') {
  const response = await page.request.post('/api/auth/test-session', {
    data: {
      id: `test:${runId}:${identity}`,
      email: `${runId}-${identity}@vercel.com`,
      name: identity === 'owner' ? 'Test Owner' : 'Test Viewer',
      role,
    },
  });
  expect(response.ok()).toBe(true);
  return (await response.json()).session as { csrfToken: string };
}

test('opens a loopback-only local authoring session', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'Desktop local authoring workflow');
  await page.goto('/');
  await page.getByRole('button', { name: 'Open local studio' }).click();
  await expect(page.getByRole('heading', { name: 'What are you making?' })).toBeVisible();
  await expect(page.getByText('Local author', { exact: true })).toBeVisible();
  await expect(page.getByText('admin', { exact: true })).toBeVisible();
  const response = await page.request.get('/api/auth/session');
  expect(response.ok()).toBe(true);
  expect((await response.json()).session).toMatchObject({ id: 'local:author', role: 'admin' });
});

test('creates, edits, persists, structures, presents, and shares a deck', async ({
  page,
  browser,
}) => {
  test.skip(test.info().project.name !== 'desktop', 'Desktop critical workflow');
  const consoleErrors = captureConsoleErrors(page);
  await signIn(page);
  await page.goto('/');
  await page.getByLabel('Presentation name').fill('Hosted editor story');
  await page.getByRole('button', { name: 'Create presentation' }).click();
  await expect(page.getByRole('heading', { name: 'Add your first slide' })).toBeVisible();

  await page.getByRole('button', { name: 'Browse slide templates' }).click();
  await expect(page.getByRole('dialog', { name: 'Add a slide' })).toBeVisible();
  await page.getByPlaceholder('Search layouts').fill('cover');
  await page.getByRole('option', { name: /^Cover/ }).dblclick();
  await expect(page.getByRole('button', { name: 'Save state: saved' })).toBeVisible();

  const headline = page.locator('.canvas-frame textarea').filter({ hasText: '' }).nth(1);
  await headline.fill('The hosted Vercel editor');
  await expect(page.getByRole('button', { name: 'Save state: saved' })).toBeVisible({
    timeout: 10_000,
  });
  await page.reload();
  await expect(page.locator('.canvas-frame textarea').filter({ hasText: '' }).nth(1)).toHaveValue(
    'The hosted Vercel editor',
  );

  await page.getByRole('button', { name: 'Add slide' }).first().click();
  await page.getByPlaceholder('Search layouts').fill('chart');
  await page.getByRole('option', { name: /^Chart/ }).dblclick();
  await page.getByRole('button', { name: 'Move slide up' }).click();
  await page.getByRole('button', { name: 'Duplicate slide' }).click();
  await page.getByRole('button', { name: 'Delete slide' }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(page.getByRole('button', { name: 'Save state: saved' })).toBeVisible({
    timeout: 10_000,
  });

  const imageSave = page.waitForResponse(
    (response) =>
      response.url().includes('/api/decks/') &&
      response.url().endsWith('/slides') &&
      response.request().method() === 'PUT' &&
      response.ok(),
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: 'test-upload.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z8i8AAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await expect(page.locator('.canvas-frame img[alt="test-upload.png"]')).toBeVisible();
  await imageSave;
  await page.reload();
  await page.getByRole('button', { name: 'Select slide 2' }).click();
  await expect(page.locator('.canvas-frame img[alt="test-upload.png"]')).toBeVisible();

  await page.locator('.canvas-frame img[alt="test-upload.png"]').click();
  const replacementUrl =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="2" height="2"%3E%3Crect width="2" height="2" fill="black"/%3E%3C/svg%3E';
  const replacementSave = page.waitForResponse(
    (response) =>
      response.url().includes('/api/decks/') &&
      response.url().endsWith('/slides') &&
      response.request().method() === 'PUT' &&
      response.ok(),
  );
  await page.getByLabel('Image URL').fill(replacementUrl);
  await replacementSave;
  await page.reload();
  await page.getByRole('button', { name: 'Select slide 2' }).click();
  await expect(page.locator('.canvas-frame img[alt="test-upload.png"]')).toHaveAttribute(
    'src',
    replacementUrl,
  );

  const deckUrl = page.url();
  await page.getByRole('button', { name: 'Share' }).click();
  const shareDialog = page.getByRole('dialog', { name: 'Share presentation' });
  await shareDialog.getByLabel('Email').fill(`${runId}-viewer@vercel.com`);
  await shareDialog.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(page.getByText('pending sign-in')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('link', { name: 'Present', exact: true }).click();
  await expect(page.getByText('Hosted editor story')).toBeVisible();
  await expect(page.locator('.presentation-stage')).toBeVisible();

  const viewerContext = await browser.newContext();
  const viewerPage = await viewerContext.newPage();
  const viewerConsoleErrors = captureConsoleErrors(viewerPage);
  await signIn(viewerPage, 'viewer');
  await viewerPage.goto(deckUrl);
  await expect(viewerPage.getByLabel('Presentation title')).toHaveAttribute('readonly', '');
  await expect(viewerPage.getByRole('button', { name: 'Add slide' })).toHaveCount(0);
  expect(viewerConsoleErrors).toEqual([]);
  await viewerContext.close();
  expect(consoleErrors).toEqual([]);
});

test('publishes an admin draft without changing an inserted slide', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'Desktop admin workflow');
  const consoleErrors = captureConsoleErrors(page);
  await signIn(page, 'master-owner');
  await page.goto('/');
  await page.getByLabel('Presentation name').fill('Master isolation story');
  await page.getByRole('button', { name: 'Create presentation' }).click();
  await page.getByRole('button', { name: 'Browse slide templates' }).click();
  await expect(page.getByRole('option')).toHaveCount(62);
  await page.getByRole('option', { name: /^Cover/ }).dblclick();
  await expect(page.locator('.canvas-frame textarea').nth(1)).toHaveValue('Build what comes next.');
  await expect(page.getByRole('button', { name: 'Save state: saved' })).toBeVisible({
    timeout: 10_000,
  });
  const deckUrl = page.url();

  await signIn(page, 'master-admin', 'admin');
  await page.goto('/admin/templates/vercel');
  await expect(page.locator('.admin-master-card')).toHaveCount(62);
  await page.locator('.admin-master-card').first().getByRole('link').click();
  await page.getByRole('button', { name: 'Create draft' }).click();
  const updatedHeadline = `Published master ${runId}`;
  await page.locator('.canvas-frame textarea').nth(1).fill(updatedHeadline);
  await expect(page.getByText('saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /Publish v2/ }).click();
  await expect(page.getByRole('button', { name: 'Create draft' })).toBeVisible();

  await signIn(page, 'master-owner');
  await page.goto(deckUrl);
  await expect(page.locator('.canvas-frame textarea').nth(1)).toHaveValue('Build what comes next.');
  await page.getByRole('button', { name: 'Add slide' }).first().click();
  await page.getByPlaceholder('Search layouts').fill('cover');
  await page.getByRole('option', { name: /^Cover/ }).dblclick();
  await expect(page.locator('.canvas-frame textarea').nth(1)).toHaveValue(updatedHeadline);
  expect(consoleErrors).toEqual([]);
});

test('keeps the editor within a 390px viewport', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile', 'Mobile-only layout assertion');
  const consoleErrors = captureConsoleErrors(page);
  await signIn(page, 'mobile-owner');
  await page.goto('/');
  await page.getByLabel('Presentation name').fill('Mobile deck');
  await page.getByRole('button', { name: 'Create presentation' }).click();
  await page.getByRole('button', { name: 'Browse slide templates' }).click();
  await page.getByRole('option', { name: /^Cover/ }).dblclick();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole('button', { name: 'Add slide' })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
