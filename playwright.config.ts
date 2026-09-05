import { chromium, defineConfig, devices } from '@playwright/test';
import { existsSync } from 'fs';

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;

// Тесты запускаются в Chromium, который скачивается командой `npx playwright install chromium`.
// Если он не скачан, используем установленный в системе Google Chrome.
const isBundledChromiumInstalled = existsSync(chromium.executablePath());
const browserChannel = isBundledChromiumInstalled ? undefined : 'chrome';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.pl.{ts,tsx}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: browserChannel }
    }
  ],
  webServer: {
    command: `npm run start -- --no-open --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
});
