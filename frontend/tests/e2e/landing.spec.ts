import { test, expect } from '@playwright/test';

test.describe('Marketing Landing Page', () => {
  test('should display the core value propositions', async ({ page }) => {
    // Start at the home page
    await page.goto('/');

    // Verify title and hero headline
    await expect(page).toHaveTitle(/Avenik/i);
    await expect(page.locator('h1')).toContainText('Autonomous OS');

    // Verify navigation links are present
    const signInLink = page.getByRole('link', { name: 'Sign In' });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute('href', '/login');

    const getStartedLink = page.getByRole('link', { name: 'Get Started' });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute('href', '/register');

    // Verify feature grid exists
    await expect(page.locator('#features')).toBeVisible();
    await expect(page.getByText('Strategic Copilot')).toBeVisible();
    await expect(page.getByText('Financial Intelligence')).toBeVisible();
    await expect(page.getByText('Zero-Trust Governance')).toBeVisible();
  });
});
