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

async function signIn(page: Page, identity = 'owner') {
  const response = await page.request.post('/api/auth/test-session', {
    data: {
      id: `test:${runId}:${identity}`,
      email: `${runId}-${identity}@vercel.com`,
      name: identity === 'owner' ? 'Test Owner' : 'Test Viewer',
      role: 'user',
    },
  });
  expect(response.ok()).toBe(true);
  return (await response.json()).session as { csrfToken: string };
}

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
  await page.getByRole('option', { name: /Cover — What will you ship/ }).dblclick();
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
  await page.getByPlaceholder('Search layouts').fill('bar chart');
  await page.getByRole('option', { name: /Data — Bar chart/ }).dblclick();
  await page.getByRole('button', { name: 'Move slide up' }).click();
  await page.getByRole('button', { name: 'Duplicate slide' }).click();
  await page.getByRole('button', { name: 'Delete slide' }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(page.getByRole('button', { name: 'Save state: saved' })).toBeVisible({
    timeout: 10_000,
  });

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

test('keeps the editor within a 390px viewport', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile', 'Mobile-only layout assertion');
  const consoleErrors = captureConsoleErrors(page);
  await signIn(page, 'mobile-owner');
  await page.goto('/');
  await page.getByLabel('Presentation name').fill('Mobile deck');
  await page.getByRole('button', { name: 'Create presentation' }).click();
  await page.getByRole('button', { name: 'Browse slide templates' }).click();
  await page.getByRole('option', { name: /Cover — What will you ship/ }).dblclick();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole('button', { name: 'Add slide' })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
