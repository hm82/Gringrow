import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Check that we're on the login page
    await expect(page).toHaveTitle(/Login | NextGen Digital Banking/);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/Username/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });
  
  test('should log in with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Enter credentials and submit
    await page.getByLabel(/Username/i).fill('user');
    await page.getByLabel(/Password/i).fill('password');
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Check that we're redirected to the dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
    
    // Should see account summary
    await expect(page.getByText(/Account Summary/i)).toBeVisible();
  });
  
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Enter invalid credentials and submit
    await page.getByLabel(/Username/i).fill('wronguser');
    await page.getByLabel(/Password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Check that we're still on the login page with an error message
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/Invalid username or password/i)).toBeVisible();
  });
  
  test('should log out successfully', async ({ page }) => {
    await page.goto('/');
    
    // Log in first
    await page.getByLabel(/Username/i).fill('user');
    await page.getByLabel(/Password/i).fill('password');
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Check that we're on dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Click logout
    await page.getByRole('button', { name: /Logout/i }).click();
    
    // Check that we're redirected back to login
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });
});