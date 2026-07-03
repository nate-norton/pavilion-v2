import { test, expect } from '@playwright/test';

test('walk every tab and open key sheets without crashing', async ({ page }) => {
  await page.goto('/');
  for (const tab of ['Commons', 'Reserve', 'HOA', 'Today']) {
    await page.getByRole('button', { name: tab }).click();
  }
  await page.getByRole('button', { name: /review & pay/i }).click();
  await expect(page.getByText(/july assessment/i)).toBeVisible();
  await page.locator('[data-testid="sheet-scrim"]').click({ position: { x: 10, y: 10 } });
  await page.getByRole('button', { name: 'Penny' }).first().click();
  await expect(page.getByText(/ask me anything about juniper ridge/i)).toBeVisible();
});
