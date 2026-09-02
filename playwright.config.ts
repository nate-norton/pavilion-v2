import { defineConfig, devices } from '@playwright/test';

/*
 * Some sandboxes ship a Chromium that Playwright did not download itself, so
 * its versioned lookup misses. Pointing PLAYWRIGHT_CHROMIUM_PATH at that binary
 * lets the suite run there without the repo hardcoding a container's paths.
 */
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    ...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
  /*
   * Frame mode and page mode are two different layouts of the same app, and
   * only one of them can be checked at a time. Desktop Chrome covers the frame
   * (and the presenter demo); the handset projects cover the layout that a
   * resident actually gets. iPad Mini is here to hold the line between them —
   * it is 744px tall in landscape, so it must stay in frame mode.
   *
   * Emulated devices do not emulate toolbar collapse, so the specs assert the
   * precondition for it instead: that the document is taller than the viewport
   * and therefore has something to scroll.
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /*
     * The handset projects run the iOS viewports under Chromium rather than
     * WebKit: what they assert is layout geometry, which the emulated viewport
     * and coarse-pointer media features reproduce faithfully, and Chromium is
     * the one engine present in every environment this repo builds in. The
     * behaviours that genuinely need WebKit — toolbar collapse, focus zoom,
     * keyboard insets — are not emulable at all and belong to the device pass.
     */
    {
      name: 'iphone',
      use: { ...devices['iPhone 14'], browserName: 'chromium' },
    },
    {
      name: 'iphone-landscape',
      use: { ...devices['iPhone 14 landscape'], browserName: 'chromium' },
    },
    {
      name: 'pixel',
      use: { ...devices['Pixel 7'], browserName: 'chromium' },
    },
    {
      name: 'ipad',
      use: { ...devices['iPad Mini'], browserName: 'chromium' },
    },
  ],
});
