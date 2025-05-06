import { AchTransfer, InsertTransaction } from "@shared/schema";
import { storage } from "../storage";

/**
 * Process an ACH file (NACHA format) and execute the contained transfers
 */
export async function processACHFile(fileContent: string) {
  // In a real system, this would parse the NACHA format file
  // For this example, we'll simulate the process with a simple JSON format
  
  try {
    const achData = JSON.parse(fileContent);
    
    if (!Array.isArray(achData.entries)) {
      return {
        success: false,
        message: "Invalid ACH file format: entries array is missing",
        processed: 0,
        failed: 0
      };
    }
    
    const results = {
      processed: 0,
      failed: 0,
      entries: [] as Array<{
        id: string;
        status: string;
        message?: string;
      }>
    };
    
    for (const entry of achData.entries) {
      try {
        // Find account by routing and account number
        const account = await storage.getAccountByNumber(entry.accountNumber);
        
        if (!account) {
          results.failed++;
          results.entries.push({
            id: entry.id,
            status: "failed",
            message: "Account not found"
          });
          continue;
        }
        
        // Create a transaction
        const transaction: InsertTransaction = {
          accountId: account.id,
          amount: entry.direction === "credit" ? entry.amount : -entry.amount,
          description: entry.description || `ACH ${entry.direction} - ${entry.companyName}`,
          type: entry.direction === "credit" ? "deposit" : "withdrawal",
          category: "ach",
          date: new Date(),
          status: "completed",
          merchantName: entry.companyName,
          merchantCategory: "financial",
          reference: entry.traceNumber
        };
        
        // Update account balance
        const newBalance = account.balance + transaction.amount;
        const newAvailable = account.available + transaction.amount;
        
        await storage.updateAccountBalance(account.id, newBalance, newAvailable);
        await storage.createTransaction(transaction);
        
        results.processed++;
        results.entries.push({
          id: entry.id,
          status: "processed"
        });
        
      } catch (error) {
        console.error("Error processing ACH entry:", error);
        results.failed++;
        results.entries.push({
          id: entry.id,
          status: "failed",
          message: (error as Error).message
        });
      }
    }
    
    return {
      success: true,
      ...results
    };
    
  } catch (error) {
    console.error("Error processing ACH file:", error);
    return {
      success: false,
      message: "Failed to process ACH file: " + (error as Error).message,
      processed: 0,
      failed: 0
    };
  }
}

/**
 * Generate an ACH file in NACHA format for outgoing transfers
 */
export async function generateACHFile(achTransfers: AchTransfer[]) {
  // In a real system, this would generate a proper NACHA format file
  // For this example, we'll create a simple JSON representation
  
  const fileHeader = {
    immediateDestination: "123456789", // Receiving bank's routing number
    immediateOrigin: "987654321",      // Originating bank's routing number
    fileCreationDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    fileCreationTime: new Date().toTimeString().slice(0, 8).replace(/:/g, ""),
    fileIdModifier: "A",
    recordSize: "094",
    blockingFactor: "10",
    formatCode: "1",
    immediateDestinationName: "RECEIVING BANK",
    immediateOriginName: "NEXTGEN BANK"
  };
  
  const batchHeader = {
    serviceClassCode: "200",
    companyName: "NEXTGEN BANK",
    companyDiscretionaryData: "",
    companyId: "1234567890",
    standardEntryClassCode: "PPD",
    companyEntryDescription: "PAYMENT",
    companyDescriptiveDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    effectiveEntryDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    originatorStatusCode: "1",
    originatingDfiId: "12345678",
    batchNumber: "1"
  };
  
  const entries = await Promise.all(achTransfers.map(async (transfer) => {
    // Get account for additional data
    const account = await storage.getAccount(transfer.accountId);
    const user = await storage.getUser(transfer.userId);
    
    return {
      transactionCode: transfer.direction === "incoming" ? "22" : "27", // 22=checking credit, 27=checking debit
      receivingDfiId: transfer.routingNumber.slice(0, 8),
      checkDigit: transfer.routingNumber.slice(8, 9),
      dfiAccountNumber: transfer.accountNumber,
      amount: Math.abs(transfer.amount).toFixed(2).replace(".", "").padStart(10, "0"),
      individualIdNumber: transfer.userId.toString().padStart(15, "0"),
      individualName: `${user?.lastName}, ${user?.firstName}`.slice(0, 22).padEnd(22, " "),
      discretionaryData: "",
      addendaRecordIndicator: "0",
      traceNumber: transfer.traceNumber
    };
  }));
  
  const batchControl = {
    serviceClassCode: "200",
    entryAddendaCount: entries.length.toString().padStart(6, "0"),
    entryHash: entries.reduce((hash, entry) => hash + parseInt(entry.receivingDfiId.slice(0, 8)), 0).toString().slice(-10).padStart(10, "0"),
    totalDebit: achTransfers
      .filter(t => t.direction === "outgoing")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      .toFixed(2).replace(".", "").padStart(12, "0"),
    totalCredit: achTransfers
      .filter(t => t.direction === "incoming")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      .toFixed(2).replace(".", "").padStart(12, "0"),
    companyId: batchHeader.companyId,
    messageAuthenticationCode: "",
    reserved: "",
    originatingDfiId: batchHeader.originatingDfiId,
    batchNumber: batchHeader.batchNumber
  };
  
  const fileControl = {
    batchCount: "1".padStart(6, "0"),
    blockCount: Math.ceil((1 + 1 + entries.length + 1 + 1) / 10).toString().padStart(6, "0"),
    entryAddendaCount: entries.length.toString().padStart(8, "0"),
    entryHash: batchControl.entryHash.padStart(10, "0"),
    totalDebit: batchControl.totalDebit.padStart(12, "0"),
    totalCredit: batchControl.totalCredit.padStart(12, "0"),
    reserved: "".padEnd(39, " ")
  };
  
  // Format into a JSON object representing the ACH file
  const achFile = {
    fileHeader,
    batches: [
      {
        batchHeader,
        entries,
        batchControl
      }
    ],
    fileControl
  };
  
  return achFile;
}
