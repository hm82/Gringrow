import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertAccountSchema, insertTransactionSchema, 
  insertTransferSchema, insertAchTransferSchema, insertSupportTicketSchema,
  insertFraudAlertSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { formatZodError } from "./operations/utils";
import { processACHFile, generateACHFile } from "./operations/ach";
import { detectFraudTransaction } from "./operations/fraud";
import { transferFunds } from "./operations/accounts";
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const SessionStore = MemoryStore(session);
  
  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "nextgen-banking-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Authentication middleware
  const authenticate = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user in session
      req.session.userId = user.id;
      req.session.role = user.role;
      
      return res.json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      });
      
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId as number);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      });
      
    } catch (error) {
      console.error("Auth check error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      return res.status(201).json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: formatZodError(error) });
      }
      
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Account routes
  app.get("/api/accounts", authenticate, async (req, res) => {
    try {
      const accounts = await storage.getAccounts(req.session.userId as number);
      return res.json(accounts);
    } catch (error) {
      console.error("Get accounts error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/accounts/:id", authenticate, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the logged-in user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      return res.json(account);
      
    } catch (error) {
      console.error("Get account error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/accounts", authenticate, async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const account = await storage.createAccount(accountData);
      return res.status(201).json(account);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: formatZodError(error) });
      }
      
      console.error("Create account error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Transaction routes
  app.get("/api/accounts/:id/transactions", authenticate, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the logged-in user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const transactions = await storage.getTransactions(accountId);
      return res.json(transactions);
      
    } catch (error) {
      console.error("Get transactions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/accounts/:id/transactions/recent", authenticate, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 5;
      
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the logged-in user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const transactions = await storage.getRecentTransactions(accountId, limit);
      return res.json(transactions);
      
    } catch (error) {
      console.error("Get recent transactions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/accounts/:id/transactions", authenticate, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the logged-in user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        accountId
      });
      
      // Check for potential fraud
      const isFraudulent = await detectFraudTransaction(transactionData, account);
      
      if (isFraudulent) {
        // Create a fraud alert
        await storage.createFraudAlert({
          userId: account.userId,
          accountId: account.id,
          alertType: "suspicious_transaction",
          description: `Suspicious transaction detected: ${transactionData.description} for ${transactionData.amount}`,
          severity: "high",
          status: "new"
        });
        
        return res.status(400).json({ message: "Transaction flagged as potentially fraudulent" });
      }
      
      // Update account balance
      if (transactionData.type === "withdrawal" || transactionData.amount < 0) {
        const newBalance = account.balance + transactionData.amount;
        const newAvailable = account.available + transactionData.amount;
        
        if (newAvailable < 0) {
          return res.status(400).json({ message: "Insufficient funds" });
        }
        
        await storage.updateAccountBalance(accountId, newBalance, newAvailable);
      } else if (transactionData.type === "deposit" || transactionData.amount > 0) {
        const newBalance = account.balance + transactionData.amount;
        const newAvailable = account.available + transactionData.amount;
        
        await storage.updateAccountBalance(accountId, newBalance, newAvailable);
      }
      
      const transaction = await storage.createTransaction(transactionData);
      return res.status(201).json(transaction);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: formatZodError(error) });
      }
      
      console.error("Create transaction error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Transfer routes
  app.get("/api/transfers", authenticate, async (req, res) => {
    try {
      const transfers = await storage.getTransfers(req.session.userId as number);
      return res.json(transfers);
    } catch (error) {
      console.error("Get transfers error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/transfers", authenticate, async (req, res) => {
    try {
      const transferData = insertTransferSchema.parse(req.body);
      
      // Validate from account
      const fromAccount = await storage.getAccount(transferData.fromAccountId);
      
      if (!fromAccount) {
        return res.status(404).json({ message: "Source account not found" });
      }
      
      // Check if the from account belongs to the logged-in user
      if (fromAccount.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied to source account" });
      }
      
      // Validate to account
      const toAccount = await storage.getAccount(transferData.toAccountId);
      
      if (!toAccount) {
        return res.status(404).json({ message: "Destination account not found" });
      }
      
      // Process the transfer
      const result = await transferFunds(
        transferData.fromAccountId,
        transferData.toAccountId,
        transferData.amount,
        transferData.description || "Transfer"
      );
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      return res.status(201).json(result.transfer);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: formatZodError(error) });
      }
      
      console.error("Create transfer error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ACH routes
  app.get("/api/ach-transfers", authenticate, async (req, res) => {
    try {
      const achTransfers = await storage.getAchTransfers(req.session.userId as number);
      return res.json(achTransfers);
    } catch (error) {
      console.error("Get ACH transfers error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/ach-transfers", authenticate, async (req, res) => {
    try {
      const achData = insertAchTransferSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Validate account
      const account = await storage.getAccount(achData.accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the logged-in user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const achTransfer = await storage.createAchTransfer(achData);
      
      // Generate ACH file for this transfer
      const achFile = await generateACHFile([achTransfer]);
      
      // In a real system, this file would be sent to the ACH network
      console.log("Generated ACH file:", achFile);
      
      return res.status(201).json(achTransfer);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: formatZodError(error) });
      }
      
      console.error("Create ACH transfer error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ACH file processing
  app.post("/api/ach/process-file", authenticate, async (req, res) => {
    try {
      // Check if user has admin role
      if (req.session.role !== "admin") {
        return res.status(403).json({ message: "Access denied, admin role required" });
      }
      
      const { fileContent } = req.body;
      
      if (!fileContent) {
        return res.status(400).json({ message: "ACH file content is required" });
      }
      
      const result = await processACHFile(fileContent);
      
      return res.json(result);
      
    } catch (error) {
      console.error("Process ACH file error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      
      if (category) {
        const products = await storage.getProductsByCategory(category);
        return res.json(products);
      }
      
      const products = await storage.getProducts();
      return res.json(products);
      
    } catch (error) {
      console.error("Get products error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      return res.json(product);
      
    } catch (error) {
      console.error("Get product error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Account type routes
  app.get("/api/account-types", async (req, res) => {
    try {
      const accountTypes = await storage.getAccountTypes();
      return res.json(accountTypes);
    } catch (error) {
      console.error("Get account types error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Support ticket routes
  app.get("/api/support-tickets", authenticate, async (req, res) => {
    try {
      // If admin, return all tickets
      if (req.session.role === "admin") {
        const tickets = await storage.getAllSupportTickets();
        return res.json(tickets);
      }
      
      // Otherwise return only user's tickets
      const tickets = await storage.getSupportTickets(req.session.userId as number);
      return res.json(tickets);
      
    } catch (error) {
      console.error("Get support tickets error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/support-tickets", authenticate, async (req, res) => {
    try {
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const ticket = await storage.createSupportTicket(ticketData);
      return res.status(201).json(ticket);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: formatZodError(error) });
      }
      
      console.error("Create support ticket error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/support-tickets/:id/status", authenticate, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { status, assignedTo } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Only admins can update ticket status
      if (req.session.role !== "admin") {
        return res.status(403).json({ message: "Access denied, admin role required" });
      }
      
      const updatedTicket = await storage.updateSupportTicketStatus(
        ticketId,
        status,
        assignedTo
      );
      
      return res.json(updatedTicket);
      
    } catch (error) {
      console.error("Update support ticket status error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Fraud alert routes
  app.get("/api/fraud-alerts", authenticate, async (req, res) => {
    try {
      // If admin, return all alerts
      if (req.session.role === "admin") {
        const alerts = await storage.getAllFraudAlerts();
        return res.json(alerts);
      }
      
      // Otherwise return only user's alerts
      const alerts = await storage.getFraudAlerts(req.session.userId as number);
      return res.json(alerts);
      
    } catch (error) {
      console.error("Get fraud alerts error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/fraud-alerts", authenticate, async (req, res) => {
    try {
      const alertData = insertFraudAlertSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const alert = await storage.createFraudAlert(alertData);
      return res.status(201).json(alert);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: formatZodError(error) });
      }
      
      console.error("Create fraud alert error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/fraud-alerts/:id/status", authenticate, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Only admins can update alert status
      if (req.session.role !== "admin") {
        return res.status(403).json({ message: "Access denied, admin role required" });
      }
      
      const updatedAlert = await storage.updateFraudAlertStatus(alertId, status);
      return res.json(updatedAlert);
      
    } catch (error) {
      console.error("Update fraud alert status error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
