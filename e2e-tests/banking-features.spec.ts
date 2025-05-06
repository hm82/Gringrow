import { test, expect } from '@playwright/test';

// This test suite assumes the user is logged in
test.describe('Banking features', () => {
  // Before each test, log in
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/Username/i).fill('user');
    await page.getByLabel(/Password/i).fill('password');
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/dashboard/);
  });
  
  test('should display account balances on dashboard', async ({ page }) => {
    // Check for account balance section
    await expect(page.getByText(/Account Summary/i)).toBeVisible();
    
    // Expect at least one account card
    const accountCards = page.locator('[data-testid="account-card"]');
    await expect(accountCards.first()).toBeVisible();
    
    // Account should have a balance
    await expect(page.getByText(/Available Balance/i)).toBeVisible();
    await expect(page.getByText(/\$[0-9,]+\.[0-9]{2}/)).toBeVisible();
  });
  
  test('should navigate to transfers page', async ({ page }) => {
    // Click on Transfers in the sidebar
    await page.getByRole('link', { name: /Transfers/i }).click();
    
    // Check that we're on the transfers page
    await expect(page).toHaveURL(/transfers/);
    await expect(page.getByText(/Transfer Money/i)).toBeVisible();
    
    // Should see transfer options
    await expect(page.getByText(/Between My Accounts/i)).toBeVisible();
    await expect(page.getByText(/External Transfer/i)).toBeVisible();
  });
  
  test('should navigate to accounts page', async ({ page }) => {
    // Click on Accounts in the sidebar
    await page.getByRole('link', { name: /Accounts/i }).click();
    
    // Check that we're on the accounts page
    await expect(page).toHaveURL(/accounts/);
    
    // Should show account details
    await expect(page.getByText(/Account Details/i)).toBeVisible();
  });
  
  test('should navigate to customer service page', async ({ page }) => {
    // Click on Customer Service in the sidebar
    await page.getByRole('link', { name: /Customer Service/i }).click();
    
    // Check that we're on the customer service page
    await expect(page).toHaveURL(/customer-service/);
    
    // Should show support options
    await expect(page.getByText(/Customer Support/i)).toBeVisible();
    await expect(page.getByText(/Support Tickets/i)).toBeVisible();
    await expect(page.getByText(/FAQs/i)).toBeVisible();
  });
});