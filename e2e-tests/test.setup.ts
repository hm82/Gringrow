import { test as base } from '@playwright/test';

// Define a custom fixture type for authenticated state
type AuthFixtures = {
  authenticatedPage: { page: any; userId: number };
};

// Extend the base test with our custom fixture
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/');
    
    // Log in with default test user
    await page.getByLabel(/Username/i).fill('user');
    await page.getByLabel(/Password/i).fill('password');
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/);
    
    // Use a dummy user id for now
    await use({ page, userId: 1 });
  },
});

export { expect } from '@playwright/test';