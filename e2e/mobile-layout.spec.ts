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
  test('no scroll container sits above the document', async ({ page }, testInfo) => {
    await page.goto('/');
    test.skip(!(await isPageMode(page)), 'frame layout — the frame owns the scroll by design');

    // The mechanism, asserted directly: in page mode a tab's root must not be
    // a scroller of its own. A nested scroller is exactly what kept the
    // browser toolbar pinned open, and it would do so again whether or not
    // this particular tab happens to have enough content to overflow.
    for (const tab of TABS) {
      await tabButton(page, tab).click();
      const nested = await page.evaluate(() =>
        [...document.querySelectorAll('.pav-tabscroll')]
          .filter((el) => (el as HTMLElement).offsetParent !== null || el.clientHeight > 0)
          .filter((el) => el.scrollHeight > el.clientHeight + 1).length,
      );
      expect(nested, `${tab} still scrolls inside a box (${testInfo.project.name})`).toBe(0);
    }
  });

  test('a content-heavy tab gives the document something to scroll', async ({ page }) => {
    await page.goto('/');
    test.skip(!(await isPageMode(page)), 'frame layout');

    // Today is the longest tab on every device in the matrix; if the document
    // cannot scroll here, the toolbar has nothing to collapse in response to.
    await tabButton(page, 'Today').click();
    await expect.poll(() => documentScrolls(page)).toBe(true);
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

  test('an open sheet covers everything behind it', async ({ page }) => {
    await page.goto('/');
    await page.getByText(/review & pay/i).click();
    const scrim = page.locator('[data-testid="sheet-scrim"]');
    await expect(scrim).toBeVisible();
    const box = (await scrim.boundingBox())!;

    // Page mode measures the scrim against the viewport, because the sheet is
    // fixed to it. Frame mode measures it against the frame, which is what the
    // sheet is a layer over there — asserting the viewport would only be
    // asserting that the frame fills the window, which it deliberately doesn't.
    const target = (await isPageMode(page))
      ? page.viewportSize()!.height
      : (await page.locator('[data-testid="phone-frame"]').boundingBox())!.height;
    expect(box.height).toBeGreaterThanOrEqual(target - 1);
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
