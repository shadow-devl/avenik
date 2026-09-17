import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should render the login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check if the page title/header renders
    await expect(page.locator('h1')).toContainText('Sign in');
    
    // Check OAuth buttons
    const googleButton = page.getByRole('button', { name: /Sign in with Google/i });
    const microsoftButton = page.getByRole('button', { name: /Sign in with Microsoft/i });
    const demoButton = page.getByRole('button', { name: /Sign in as Demo Entrepreneur/i });
    
    await expect(googleButton).toBeVisible();
    await expect(microsoftButton).toBeVisible();
    await expect(demoButton).toBeVisible();
  });
});
