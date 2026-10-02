import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: 0,
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:4173/course/',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: 'http://127.0.0.1:4173/course/',
    reuseExistingServer: false,
    timeout: 15000,
  },
});
