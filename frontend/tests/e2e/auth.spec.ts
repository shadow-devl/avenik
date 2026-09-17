import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should render the login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check if the form renders
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
    
    // Check inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
