import { test, expect } from '@playwright/test';

test.describe('API endpoints', () => {
  let authCookie: string;
  
  // Before running API tests, get authenticated
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'user',
        password: 'password'
      }
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    
    // Store auth cookie for subsequent requests
    const cookies = await loginResponse.headerValue('set-cookie');
    if (cookies) {
      authCookie = cookies;
    }
  });
  
  test('GET /api/accounts should return user accounts', async ({ request }) => {
    const response = await request.get('/api/accounts', {
      headers: {
        Cookie: authCookie
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const accounts = await response.json();
    expect(Array.isArray(accounts)).toBeTruthy();
    expect(accounts.length).toBeGreaterThan(0);
    
    // Check account structure
    const account = accounts[0];
    expect(account).toHaveProperty('id');
    expect(account).toHaveProperty('userId');
    expect(account).toHaveProperty('accountNumber');
    expect(account).toHaveProperty('balance');
    expect(account).toHaveProperty('available');
  });
  
  test('GET /api/products should return available products', async ({ request }) => {
    const response = await request.get('/api/products');
    
    expect(response.ok()).toBeTruthy();
    
    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);
    
    // Check product structure
    const product = products[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('category');
  });
  
  test('GET /api/transactions should require authentication', async ({ request }) => {
    // Try accessing without auth cookie
    const response = await request.get('/api/transactions');
    
    expect(response.status()).toBe(401);
    
    const error = await response.json();
    expect(error).toHaveProperty('message', 'Unauthorized');
  });
  
  test('POST /api/support-tickets should create a support ticket', async ({ request }) => {
    const response = await request.post('/api/support-tickets', {
      headers: {
        Cookie: authCookie
      },
      data: {
        subject: 'Test Ticket',
        description: 'This is a test support ticket created during E2E testing',
        category: 'technical',
        priority: 'medium'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const ticket = await response.json();
    expect(ticket).toHaveProperty('id');
    expect(ticket).toHaveProperty('subject', 'Test Ticket');
    expect(ticket).toHaveProperty('status', 'open');
  });
});