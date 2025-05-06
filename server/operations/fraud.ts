import { InsertTransaction, Account } from "@shared/schema";
import { storage } from "../storage";

/**
 * Simple fraud detection for transactions
 * In a real system, this would use machine learning models and more complex heuristics
 */
export async function detectFraudTransaction(transaction: InsertTransaction, account: Account): Promise<boolean> {
  // Get recent transactions for this account
  const recentTransactions = await storage.getRecentTransactions(account.id, 10);
  
  // Rule 1: Unusually large transactions
  const accountAverage = recentTransactions.length > 0
    ? recentTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / recentTransactions.length
    : 0;
  
  const transactionAmount = Math.abs(transaction.amount);
  
  // If the transaction is 5 times larger than the average and over $1000, flag it
  if (transactionAmount > accountAverage * 5 && transactionAmount > 1000) {
    return true;
  }
  
  // Rule 2: Transactions that would overdraw the account
  if (transaction.amount < 0 && (account.available + transaction.amount < 0)) {
    return true;
  }
  
  // Rule 3: Multiple similar transactions in a short time period
  const similarTransactions = recentTransactions.filter(tx => 
    tx.merchantName === transaction.merchantName && 
    Math.abs(tx.amount - transaction.amount) / Math.max(Math.abs(tx.amount), Math.abs(transaction.amount)) < 0.1 // Within 10% of the amount
  );
  
  if (similarTransactions.length >= 2) {
    return true;
  }
  
  // Rule 4: Transactions in unusual categories for this account
  const commonCategories = new Set(
    recentTransactions
      .map(tx => tx.category)
      .filter(Boolean)
  );
  
  if (transaction.category && !commonCategories.has(transaction.category) && recentTransactions.length > 5) {
    // This is a new category and the account has established patterns
    // Increase scrutiny but don't automatically reject
    if (transactionAmount > 500) {
      return true;
    }
  }
  
  // No fraud detected
  return false;
}

/**
 * Check for suspicious login activity
 */
export async function detectSuspiciousLogin(userId: number, ipAddress: string, deviceId: string): Promise<boolean> {
  // In a real system, this would check login patterns, IP geolocation, device fingerprinting, etc.
  // For this demo, we'll just return false to indicate no suspicious activity
  return false;
}
