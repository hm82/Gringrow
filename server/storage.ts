import {
  users, accounts, accountTypes, transactions,
  transfers, products, supportTickets, fraudAlerts, achTransfers,
  type User, type InsertUser, type Account, type InsertAccount,
  type AccountType, type InsertAccountType, type Transaction, type InsertTransaction,
  type Transfer, type InsertTransfer, type Product, type InsertProduct,
  type SupportTicket, type InsertSupportTicket, type FraudAlert, type InsertFraudAlert,
  type AchTransfer, type InsertAchTransfer
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account operations
  getAccounts(userId: number): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByNumber(accountNumber: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(id: number, balance: number, available: number): Promise<Account>;
  
  // Account types
  getAccountTypes(): Promise<AccountType[]>;
  getAccountType(id: number): Promise<AccountType | undefined>;
  createAccountType(accountType: InsertAccountType): Promise<AccountType>;
  
  // Transaction operations
  getTransactions(accountId: number): Promise<Transaction[]>;
  getRecentTransactions(accountId: number, limit: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Transfer operations
  getTransfers(userId: number): Promise<Transfer[]>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransferStatus(id: number, status: string): Promise<Transfer>;
  
  // ACH operations
  getAchTransfers(userId: number): Promise<AchTransfer[]>;
  createAchTransfer(ach: InsertAchTransfer): Promise<AchTransfer>;
  updateAchTransferStatus(id: number, status: string, traceNumber?: string, batchId?: string): Promise<AchTransfer>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Support operations
  getSupportTickets(userId: number): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicketStatus(id: number, status: string, assignedTo?: number): Promise<SupportTicket>;
  
  // Fraud operations
  getFraudAlerts(userId: number): Promise<FraudAlert[]>;
  getAllFraudAlerts(): Promise<FraudAlert[]>;
  createFraudAlert(alert: InsertFraudAlert): Promise<FraudAlert>;
  updateFraudAlertStatus(id: number, status: string): Promise<FraudAlert>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private accountTypes: Map<number, AccountType>;
  private transactions: Map<number, Transaction>;
  private transfers: Map<number, Transfer>;
  private achTransfers: Map<number, AchTransfer>;
  private products: Map<number, Product>;
  private supportTickets: Map<number, SupportTicket>;
  private fraudAlerts: Map<number, FraudAlert>;
  
  // Current IDs for auto-increment
  private currentUserId: number;
  private currentAccountId: number;
  private currentAccountTypeId: number;
  private currentTransactionId: number;
  private currentTransferId: number;
  private currentAchTransferId: number;
  private currentProductId: number;
  private currentSupportTicketId: number;
  private currentFraudAlertId: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.accountTypes = new Map();
    this.transactions = new Map();
    this.transfers = new Map();
    this.achTransfers = new Map();
    this.products = new Map();
    this.supportTickets = new Map();
    this.fraudAlerts = new Map();
    
    this.currentUserId = 1;
    this.currentAccountId = 1;
    this.currentAccountTypeId = 1;
    this.currentTransactionId = 1;
    this.currentTransferId = 1;
    this.currentAchTransferId = 1;
    this.currentProductId = 1;
    this.currentSupportTicketId = 1;
    this.currentFraudAlertId = 1;
    
    // Seed initial data
    this.seedInitialData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Account operations
  async getAccounts(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(
      (account) => account.userId === userId
    );
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }
  
  async getAccountByNumber(accountNumber: string): Promise<Account | undefined> {
    return Array.from(this.accounts.values()).find(
      (account) => account.accountNumber === accountNumber
    );
  }
  
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const account: Account = {
      ...insertAccount,
      id,
      createdAt: new Date()
    };
    this.accounts.set(id, account);
    return account;
  }
  
  async updateAccountBalance(id: number, balance: number, available: number): Promise<Account> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`Account with ID ${id} not found`);
    }
    
    const updatedAccount: Account = {
      ...account,
      balance,
      available
    };
    
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  // Account types
  async getAccountTypes(): Promise<AccountType[]> {
    return Array.from(this.accountTypes.values());
  }
  
  async getAccountType(id: number): Promise<AccountType | undefined> {
    return this.accountTypes.get(id);
  }
  
  async createAccountType(insertAccountType: InsertAccountType): Promise<AccountType> {
    const id = this.currentAccountTypeId++;
    const accountType: AccountType = {
      ...insertAccountType,
      id
    };
    this.accountTypes.set(id, accountType);
    return accountType;
  }
  
  // Transaction operations
  async getTransactions(accountId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getRecentTransactions(accountId: number, limit: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Transfer operations
  async getTransfers(userId: number): Promise<Transfer[]> {
    // Find accounts owned by the user
    const userAccounts = Array.from(this.accounts.values())
      .filter(account => account.userId === userId)
      .map(account => account.id);
      
    // Find transfers involving those accounts
    return Array.from(this.transfers.values())
      .filter(transfer => 
        userAccounts.includes(transfer.fromAccountId) || 
        userAccounts.includes(transfer.toAccountId)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const id = this.currentTransferId++;
    const transfer: Transfer = {
      ...insertTransfer,
      id
    };
    this.transfers.set(id, transfer);
    return transfer;
  }
  
  async updateTransferStatus(id: number, status: string): Promise<Transfer> {
    const transfer = this.transfers.get(id);
    if (!transfer) {
      throw new Error(`Transfer with ID ${id} not found`);
    }
    
    const updatedTransfer: Transfer = {
      ...transfer,
      status
    };
    
    this.transfers.set(id, updatedTransfer);
    return updatedTransfer;
  }
  
  // ACH operations
  async getAchTransfers(userId: number): Promise<AchTransfer[]> {
    return Array.from(this.achTransfers.values())
      .filter(ach => ach.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createAchTransfer(insertAch: InsertAchTransfer): Promise<AchTransfer> {
    const id = this.currentAchTransferId++;
    const ach: AchTransfer = {
      ...insertAch,
      id,
      date: new Date(),
      traceNumber: this.generateTraceNumber(),
      batchId: this.generateBatchId()
    };
    this.achTransfers.set(id, ach);
    return ach;
  }
  
  async updateAchTransferStatus(id: number, status: string, traceNumber?: string, batchId?: string): Promise<AchTransfer> {
    const ach = this.achTransfers.get(id);
    if (!ach) {
      throw new Error(`ACH transfer with ID ${id} not found`);
    }
    
    const updatedAch: AchTransfer = {
      ...ach,
      status,
      ...(traceNumber && { traceNumber }),
      ...(batchId && { batchId })
    };
    
    this.achTransfers.set(id, updatedAch);
    return updatedAch;
  }
  
  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.category === category);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...insertProduct,
      id
    };
    this.products.set(id, product);
    return product;
  }
  
  // Support operations
  async getSupportTickets(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values())
      .filter(ticket => ticket.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.currentSupportTicketId++;
    const now = new Date();
    const ticket: SupportTicket = {
      ...insertTicket,
      id,
      createdAt: now,
      updatedAt: now,
      assignedTo: null
    };
    this.supportTickets.set(id, ticket);
    return ticket;
  }
  
  async updateSupportTicketStatus(id: number, status: string, assignedTo?: number): Promise<SupportTicket> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) {
      throw new Error(`Support ticket with ID ${id} not found`);
    }
    
    const updatedTicket: SupportTicket = {
      ...ticket,
      status,
      assignedTo: assignedTo !== undefined ? assignedTo : ticket.assignedTo,
      updatedAt: new Date()
    };
    
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }
  
  // Fraud operations
  async getFraudAlerts(userId: number): Promise<FraudAlert[]> {
    return Array.from(this.fraudAlerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getAllFraudAlerts(): Promise<FraudAlert[]> {
    return Array.from(this.fraudAlerts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createFraudAlert(insertAlert: InsertFraudAlert): Promise<FraudAlert> {
    const id = this.currentFraudAlertId++;
    const alert: FraudAlert = {
      ...insertAlert,
      id,
      createdAt: new Date()
    };
    this.fraudAlerts.set(id, alert);
    return alert;
  }
  
  async updateFraudAlertStatus(id: number, status: string): Promise<FraudAlert> {
    const alert = this.fraudAlerts.get(id);
    if (!alert) {
      throw new Error(`Fraud alert with ID ${id} not found`);
    }
    
    const updatedAlert: FraudAlert = {
      ...alert,
      status
    };
    
    this.fraudAlerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  // Helper methods
  private generateTraceNumber(): string {
    return `ACH${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
  
  private generateBatchId(): string {
    return `BATCH${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
  
  // Seed initial data
  private seedInitialData() {
    // Seed a default user
    const defaultUser: InsertUser = {
      username: "johndoe",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "user",
    };
    const user = this.createUser(defaultUser);
    
    // Seed account types
    const checkingType: InsertAccountType = {
      name: "Checking Account",
      description: "Standard checking account with no minimum balance requirement",
      interestRate: 0.01,
      minimumBalance: 0,
      monthlyFee: 0,
      features: ["Free online and mobile banking", "Unlimited transactions", "Free debit card"]
    };
    
    const savingsType: InsertAccountType = {
      name: "Savings Account",
      description: "High-yield savings account with competitive interest rates",
      interestRate: 4.5,
      minimumBalance: 100,
      monthlyFee: 0,
      features: ["Competitive interest rates", "FDIC insured", "Unlimited deposits"]
    };
    
    const cdType: InsertAccountType = {
      name: "Certificate of Deposit",
      description: "12-month CD with guaranteed returns",
      interestRate: 5.0,
      minimumBalance: 1000,
      monthlyFee: 0,
      features: ["Fixed interest rate", "FDIC insured", "Early withdrawal penalties may apply"]
    };
    
    this.createAccountType(checkingType);
    this.createAccountType(savingsType);
    this.createAccountType(cdType);
    
    // Seed products
    const checkingProduct: InsertProduct = {
      name: "Premium Checking",
      description: "Enhanced banking experience with no ATM fees",
      category: "checking",
      interestRate: 0.25,
      minimumDeposit: 0,
      monthlyFee: 0,
      features: ["No ATM fees worldwide", "0.25% APY on all balances", "Premium customer support"],
      isActive: true
    };
    
    const savingsProduct: InsertProduct = {
      name: "High-Yield Savings",
      description: "Earn more on your savings with competitive rates",
      category: "savings",
      interestRate: 4.5,
      minimumDeposit: 0,
      monthlyFee: 0,
      features: ["No monthly fees or minimum balance", "FDIC insured up to $250,000", "Easy transfers between accounts"],
      isActive: true
    };
    
    const cdProduct: InsertProduct = {
      name: "12-Month CD",
      description: "Guaranteed returns with a fixed rate for 12 months",
      category: "cd",
      interestRate: 5.0,
      minimumDeposit: 1000,
      monthlyFee: 0,
      features: ["Minimum deposit of $1,000", "Fixed rate for entire term", "FDIC insured up to $250,000"],
      isActive: true
    };
    
    this.createProduct(checkingProduct);
    this.createProduct(savingsProduct);
    this.createProduct(cdProduct);
    
    // Create accounts for the default user
    const checkingAccount: InsertAccount = {
      userId: 1,
      accountTypeId: 1,
      accountNumber: "1234567890",
      balance: 12347.58,
      available: 12347.58,
      isActive: true,
      maturityDate: null
    };
    
    const savingsAccount: InsertAccount = {
      userId: 1,
      accountTypeId: 2,
      accountNumber: "1234567891",
      balance: 45129.72,
      available: 45129.72,
      isActive: true,
      maturityDate: null
    };
    
    const cdAccount: InsertAccount = {
      userId: 1,
      accountTypeId: 3,
      accountNumber: "1234567892",
      balance: 25000.00,
      available: 0, // CDs typically have no available balance for withdrawal
      isActive: true,
      maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1 year from now
    };
    
    this.createAccount(checkingAccount);
    this.createAccount(savingsAccount);
    this.createAccount(cdAccount);
    
    // Create some transactions
    const transactions: InsertTransaction[] = [
      {
        accountId: 1, // Checking account
        amount: -84.32,
        description: "Whole Foods Market",
        type: "withdrawal",
        category: "groceries",
        date: new Date(new Date().setDate(new Date().getDate() - 3)),
        status: "completed",
        merchantName: "Whole Foods Market",
        merchantCategory: "groceries",
        reference: "POS12345"
      },
      {
        accountId: 1, // Checking account
        amount: 3245.42,
        description: "Direct Deposit - ACME Inc",
        type: "deposit",
        category: "income",
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        status: "completed",
        merchantName: "ACME Inc",
        merchantCategory: "employer",
        reference: "DD12345"
      },
      {
        accountId: 1, // Checking account
        amount: -1850.00,
        description: "Mortgage Payment",
        type: "withdrawal",
        category: "housing",
        date: new Date(new Date().setDate(new Date().getDate() - 10)),
        status: "completed",
        merchantName: "Bank of America",
        merchantCategory: "mortgage",
        reference: "MORT12345"
      },
      {
        accountId: 1, // Checking account
        amount: -54.89,
        description: "Shell Gas Station",
        type: "withdrawal",
        category: "transportation",
        date: new Date(new Date().setDate(new Date().getDate() - 12)),
        status: "completed",
        merchantName: "Shell",
        merchantCategory: "gas",
        reference: "POS67890"
      }
    ];
    
    for (const tx of transactions) {
      this.createTransaction(tx);
    }
  }
}

export const storage = new MemStorage();
