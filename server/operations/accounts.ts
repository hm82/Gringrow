import { storage } from "../storage";
import { detectFraudTransaction } from "./fraud";

/**
 * Transfer funds between accounts
 */
export async function transferFunds(
  fromAccountId: number,
  toAccountId: number,
  amount: number,
  description: string
) {
  try {
    // Validate accounts
    const fromAccount = await storage.getAccount(fromAccountId);
    if (!fromAccount) {
      return { success: false, message: "Source account not found" };
    }
    
    const toAccount = await storage.getAccount(toAccountId);
    if (!toAccount) {
      return { success: false, message: "Destination account not found" };
    }
    
    // Validate amount
    if (amount <= 0) {
      return { success: false, message: "Transfer amount must be positive" };
    }
    
    // Check for sufficient funds
    if (fromAccount.available < amount) {
      return { success: false, message: "Insufficient funds" };
    }
    
    // Check for fraud
    const fraudCheckResult = await detectFraudTransaction(
      {
        accountId: fromAccountId,
        amount: -amount,
        description,
        type: "withdrawal",
        date: new Date(),
        status: "pending",
        category: "transfer"
      },
      fromAccount
    );
    
    if (fraudCheckResult) {
      // Create a fraud alert
      await storage.createFraudAlert({
        userId: fromAccount.userId,
        accountId: fromAccount.id,
        alertType: "suspicious_transfer",
        description: `Suspicious transfer detected: ${amount} to account ${toAccount.accountNumber}`,
        severity: "high",
        status: "new"
      });
      
      return { success: false, message: "Transfer flagged as potentially fraudulent" };
    }
    
    // Create the transfer record
    const transfer = await storage.createTransfer({
      fromAccountId,
      toAccountId,
      amount,
      description,
      date: new Date(),
      status: "completed"
    });
    
    // Update account balances
    const fromAccountNewBalance = fromAccount.balance - amount;
    const fromAccountNewAvailable = fromAccount.available - amount;
    await storage.updateAccountBalance(fromAccountId, fromAccountNewBalance, fromAccountNewAvailable);
    
    const toAccountNewBalance = toAccount.balance + amount;
    const toAccountNewAvailable = toAccount.available + amount;
    await storage.updateAccountBalance(toAccountId, toAccountNewBalance, toAccountNewAvailable);
    
    // Create transaction records
    const withdrawalTx = await storage.createTransaction({
      accountId: fromAccountId,
      amount: -amount,
      description: `Transfer to account ${toAccount.accountNumber.slice(-4).padStart(toAccount.accountNumber.length, '•')} - ${description}`,
      type: "transfer",
      category: "transfer",
      date: new Date(),
      status: "completed",
      reference: `TRF${transfer.id}`
    });
    
    const depositTx = await storage.createTransaction({
      accountId: toAccountId,
      amount: amount,
      description: `Transfer from account ${fromAccount.accountNumber.slice(-4).padStart(fromAccount.accountNumber.length, '•')} - ${description}`,
      type: "transfer",
      category: "transfer",
      date: new Date(),
      status: "completed",
      reference: `TRF${transfer.id}`
    });
    
    return {
      success: true,
      transfer,
      transactions: {
        withdrawal: withdrawalTx,
        deposit: depositTx
      }
    };
    
  } catch (error) {
    console.error("Transfer error:", error);
    return {
      success: false,
      message: `Transfer failed: ${(error as Error).message}`
    };
  }
}
