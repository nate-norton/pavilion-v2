import { test, expect, type Page } from '@playwright/test';

/**
 * Page mode — the layout a resident gets in a phone browser.
 *
 * The load-bearing assertion is `documentScrolls`. Safari and Chrome collapse
 * their toolbars only when the root document scroller moves, so "the document
 * is taller than the viewport" is the machine-checkable precondition for the
 * toolbar ever going away. It fails on the frame layout by construction, which
 * is exactly why it is worth asserting.
 */

const TABS = ['Today', 'Commons', 'Reserve', 'HOA'] as const;

/** Tab labels also appear on cards, so always click the one in the dock. */
function tabButton(page: Page, tab: string) {
  return page
    .locator('nav[aria-label="Main"]')
    .getByRole('button', { name: tab, exact: true });
}

async function isPageMode(page: Page) {
  return page.evaluate(
    () =>
      window.matchMedia('(max-width: 500px), (pointer: coarse) and (max-height: 500px)')
        .matches,
  );
}

async function documentScrolls(page: Page) {
  return page.evaluate(() => {
    const el = document.scrollingElement!;
    return el.scrollHeight > el.clientHeight + 1;
  });
}

test.describe('mobile web layout', () => {
  test('tab screens scroll the document, so the browser toolbar can collapse', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    test.skip(!(await isPageMode(page)), 'frame layout — the document is not the scroller');

    for (const tab of TABS) {
      await tabButton(page, tab).click();
      await expect
        .poll(() => documentScrolls(page), {
          message: `${tab} must give the document something to scroll (${testInfo.project.name})`,
        })
        .toBe(true);
    }
  });

  test('a tab opens at the top even though the document carries the scroll', async ({
    page,
  }) => {
    await page.goto('/');
    test.skip(!(await isPageMode(page)), 'frame layout');

    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    await tabButton(page, 'Commons').click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });

  test('the nav dock stays inside the viewport on every tab', async ({ page }) => {
    await page.goto('/');
    const dock = page.locator('nav[aria-label="Main"] > div');

    for (const tab of TABS) {
      await tabButton(page, tab).click();
      const box = await dock.boundingBox();
      expect(box).not.toBeNull();
      const viewport = page.viewportSize()!;
      expect(box!.y + box!.height, `dock is cut off on ${tab}`).toBeLessThanOrEqual(
        viewport.height + 1,
      );
      expect(box!.y).toBeGreaterThanOrEqual(0);
    }
  });

  test('the last row of a tab clears the nav dock', async ({ page }) => {
    await page.goto('/');
    const dock = page.locator('nav[aria-label="Main"] > div');

    for (const tab of TABS) {
      await tabButton(page, tab).click();
      await page.evaluate(() => {
        const el = document.scrollingElement!;
        el.scrollTop = el.scrollHeight;
        document.querySelectorAll('.pav-tabscroll').forEach((n) => {
          n.scrollTop = n.scrollHeight;
        });
      });
      const dockBox = (await dock.boundingBox())!;
      const bottom = await page.evaluate(() => {
        const scope = document.querySelector('.pav-tabscroll');
        const last = scope?.lastElementChild;
        return last ? last.getBoundingClientRect().bottom : 0;
      });
      expect(bottom, `content runs under the dock on ${tab}`).toBeLessThanOrEqual(
        dockBox.y + 1,
      );
    }
  });

  test('nothing overflows sideways', async ({ page }) => {
    await page.goto('/');
    for (const tab of TABS) {
      await tabButton(page, tab).click();
      const overflow = await page.evaluate(() => {
        const el = document.scrollingElement!;
        return el.scrollWidth - el.clientWidth;
      });
      expect(overflow, `${tab} overflows horizontally`).toBeLessThanOrEqual(1);
    }
  });

  test('an open sheet covers the whole viewport', async ({ page }) => {
    await page.goto('/');
    await page.getByText(/review & pay/i).click();
    const scrim = page.locator('[data-testid="sheet-scrim"]');
    await expect(scrim).toBeVisible();
    const box = (await scrim.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.height).toBeGreaterThanOrEqual(viewport.height - 1);
    expect(box.y).toBeLessThanOrEqual(1);
  });

  test('form fields are at least 16px, so iOS does not zoom on focus', async ({ page }) => {
    await page.goto('/');
    test.skip(!(await isPageMode(page)), 'frame layout keeps the design type scale');

    await tabButton(page, 'Commons').click();
    const tooSmall = await page.evaluate(() =>
      [...document.querySelectorAll('input, textarea, select')]
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16).length,
    );
    expect(tooSmall).toBe(0);
  });
});
