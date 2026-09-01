import { defineConfig, devices } from '@playwright/test';

const memoryNamespace = `playwright-${process.pid}`;
const storage = process.env.STUDIO_E2E_STORAGE === 'neon' ? 'neon' : 'memory';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `STUDIO_TEST_AUTH=1 STUDIO_LOCAL_AUTH=1 STUDIO_STORAGE=${storage} STUDIO_MEMORY_NAMESPACE=${memoryNamespace} pnpm dev`,
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
});
