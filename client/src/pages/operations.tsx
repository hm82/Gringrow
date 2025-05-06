import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Chart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";

const Operations: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect non-admin users
  if (user && user.role !== "admin") {
    return (
      <DashboardLayout title="Access Denied">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-red-100 text-red-600 rounded-full p-6 mb-4">
            <span className="material-icons text-4xl">lock</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 max-w-md text-center mb-6">
            You don't have permission to access the Operations Dashboard. This area is restricted to administrative users only.
          </p>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Operations Dashboard | NextGen Banking</title>
        <meta 
          name="description" 
          content="Admin operations dashboard for managing banking functions, fraud monitoring, and customer service operations."
        />
      </Helmet>
      <DashboardLayout title="Operations Dashboard">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Active Accounts" 
              value="243" 
              change="+12"
              trend="up"
              icon="account_balance"
            />
            <MetricCard 
              title="Daily Transactions" 
              value="1,853" 
              change="+25%"
              trend="up" 
              icon="receipt_long"
            />
            <MetricCard 
              title="Fraud Alerts" 
              value="8" 
              change="+3"
              trend="up" 
              icon="gpp_bad"
              trendColor="text-error"
            />
            <MetricCard 
              title="Support Tickets" 
              value="12" 
              change="-5"
              trend="down" 
              icon="support_agent"
            />
          </div>
          
          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="banking-operations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banking Operations</CardTitle>
                <CardDescription>
                  Manage transactions, accounts, and banking services
                </CardDescription>
                <TabsList className="mt-2">
                  <TabsTrigger value="banking-operations">Banking Operations</TabsTrigger>
                  <TabsTrigger value="fraud-management">Fraud Management</TabsTrigger>
                  <TabsTrigger value="customer-service">Customer Service</TabsTrigger>
                  <TabsTrigger value="ach-processing">ACH Processing</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="banking-operations">
                  <BankingOperationsTab />
                </TabsContent>
                
                <TabsContent value="fraud-management">
                  <FraudManagementTab />
                </TabsContent>
                
                <TabsContent value="customer-service">
                  <CustomerServiceTab />
                </TabsContent>
                
                <TabsContent value="ach-processing">
                  <ACHProcessingTab />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  trendColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon,
  trendColor
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          </div>
          <div className="bg-primary-50 rounded-full p-2">
            <span className="material-icons text-primary-600">{icon}</span>
          </div>
        </div>
        <div className={`flex items-center mt-3 text-xs ${
          trendColor || (trend === "up" ? "text-success" : "text-error")
        }`}>
          <span className="material-icons text-sm mr-1">
            {trend === "up" ? "arrow_upward" : "arrow_downward"}
          </span>
          {change} from last period
        </div>
      </CardContent>
    </Card>
  );
};

// Banking Operations Tab
const BankingOperationsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState("weekly");
  
  const chartData = [
    { name: "Mon", value: 5240, category: "transactions" },
    { name: "Tue", value: 4800, category: "transactions" },
    { name: "Wed", value: 6100, category: "transactions" },
    { name: "Thu", value: 5700, category: "transactions" },
    { name: "Fri", value: 7200, category: "transactions" },
    { name: "Sat", value: 3800, category: "transactions" },
    { name: "Sun", value: 3200, category: "transactions" },
  ];
  
  const recentTransactionsData = [
    { id: 1, accountNumber: "1234567890", amount: 1250.00, type: "deposit", date: new Date(), status: "completed" },
    { id: 2, accountNumber: "2345678901", amount: -845.32, type: "withdrawal", date: new Date(Date.now() - 3600000), status: "completed" },
    { id: 3, accountNumber: "3456789012", amount: 4500.00, type: "transfer", date: new Date(Date.now() - 7200000), status: "pending" },
    { id: 4, accountNumber: "4567890123", amount: -120.50, type: "payment", date: new Date(Date.now() - 10800000), status: "completed" },
    { id: 5, accountNumber: "5678901234", amount: -1875.00, type: "withdrawal", date: new Date(Date.now() - 14400000), status: "failed" },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Transaction Volume</h3>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === "daily" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("daily")}
          >
            Daily
          </Button>
          <Button 
            variant={timeRange === "weekly" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("weekly")}
          >
            Weekly
          </Button>
          <Button 
            variant={timeRange === "monthly" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("monthly")}
          >
            Monthly
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Chart data={chartData} height={250} type="bar" />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactionsData.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">••••{tx.accountNumber.slice(-4)}</TableCell>
                      <TableCell className="capitalize">{tx.type}</TableCell>
                      <TableCell className={tx.amount >= 0 ? "text-success" : "text-error"}>
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          tx.status === "completed" ? "default" :
                          tx.status === "pending" ? "outline" : "destructive"
                        }>
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition cursor-pointer">
                <div>
                  <p className="font-medium">New Account Requests</p>
                  <p className="text-sm text-gray-500">5 pending approvals</p>
                </div>
                <Button size="sm">Review</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition cursor-pointer">
                <div>
                  <p className="font-medium">Account Closures</p>
                  <p className="text-sm text-gray-500">2 pending requests</p>
                </div>
                <Button size="sm">Review</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition cursor-pointer">
                <div>
                  <p className="font-medium">Limit Adjustments</p>
                  <p className="text-sm text-gray-500">8 pending requests</p>
                </div>
                <Button size="sm">Review</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition cursor-pointer">
                <div>
                  <p className="font-medium">Overdraft Protection</p>
                  <p className="text-sm text-gray-500">3 accounts at risk</p>
                </div>
                <Button size="sm">Manage</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Fraud Management Tab
const FraudManagementTab: React.FC = () => {
  const { data: fraudAlerts, isLoading } = useQuery({
    queryKey: ["/api/fraud-alerts"],
  });
  
  const { toast } = useToast();
  
  const updateFraudAlertMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return apiRequest("PATCH", `/api/fraud-alerts/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Fraud alert updated",
        description: "The fraud alert status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fraud-alerts"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating the fraud alert.",
      });
    },
  });
  
  const handleStatusChange = (id: number, status: string) => {
    updateFraudAlertMutation.mutate({ id, status });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Suspicious Transactions" 
          value="18" 
          change="+3"
          trend="up" 
          icon="gpp_bad"
          trendColor="text-error"
        />
        <MetricCard 
          title="Blocked Transactions" 
          value="4" 
          change="-1"
          trend="down" 
          icon="block"
        />
        <MetricCard 
          title="Security Alerts" 
          value="12" 
          change="+5"
          trend="up" 
          icon="security"
          trendColor="text-amber-600"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fraud Alerts</CardTitle>
          <CardDescription>
            Review and manage potential fraud cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : fraudAlerts && fraudAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fraudAlerts.map((alert: any) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">User #{alert.userId}</TableCell>
                      <TableCell>{alert.alertType.replace('_', ' ')}</TableCell>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>
                        <Badge variant={
                          alert.severity === "high" ? "destructive" :
                          alert.severity === "medium" ? "default" : "outline"
                        }>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(alert.createdAt)}</TableCell>
                      <TableCell>{alert.status.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={alert.status}
                          onValueChange={(value) => handleStatusChange(alert.id, value)}
                          disabled={updateFraudAlertMutation.isPending}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="false_positive">False Positive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No fraud alerts found
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fraud Rules Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Transaction Amount Threshold</p>
                  <p className="text-sm text-gray-500">Flag transactions over $5,000</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Unusual Location Detection</p>
                  <p className="text-sm text-gray-500">Flag transactions from new locations</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Rapid Transaction Monitoring</p>
                  <p className="text-sm text-gray-500">Flag multiple transactions in short period</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">High-Risk Merchant Categories</p>
                  <p className="text-sm text-gray-500">Flag transactions with high-risk merchants</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Manual Fraud Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">User ID</label>
                  <Input placeholder="Enter user ID" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Alert Type</label>
                  <Select defaultValue="suspicious_transaction">
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suspicious_transaction">Suspicious Transaction</SelectItem>
                      <SelectItem value="login_attempt">Suspicious Login</SelectItem>
                      <SelectItem value="account_change">Account Change</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Severity</label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Account ID (Optional)</label>
                  <Input placeholder="Enter account ID" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea placeholder="Describe the fraud alert details" rows={3} />
              </div>
              
              <Button className="w-full">Create Fraud Alert</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Customer Service Tab
const CustomerServiceTab: React.FC = () => {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["/api/support-tickets"],
  });
  
  const { toast } = useToast();
  
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status, assignedTo }: { id: number, status: string, assignedTo?: number }) => {
      return apiRequest("PATCH", `/api/support-tickets/${id}/status`, { status, assignedTo });
    },
    onSuccess: () => {
      toast({
        title: "Ticket updated",
        description: "The support ticket has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating the ticket.",
      });
    },
  });
  
  const handleStatusChange = (id: number, status: string) => {
    updateTicketMutation.mutate({ id, status, assignedTo: 1 });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Open Tickets" 
          value="8" 
          change="+2"
          trend="up" 
          icon="inbox"
        />
        <MetricCard 
          title="In Progress" 
          value="4" 
          change="-1"
          trend="down" 
          icon="pending_actions"
        />
        <MetricCard 
          title="Resolved Today" 
          value="12" 
          change="+5"
          trend="up" 
          icon="task_alt"
        />
        <MetricCard 
          title="Avg. Response Time" 
          value="1.8h" 
          change="-0.3h"
          trend="down" 
          icon="schedule"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Support Tickets</CardTitle>
          <CardDescription>
            Manage customer support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket: any) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id}</TableCell>
                      <TableCell>User #{ticket.userId}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{ticket.category}</TableCell>
                      <TableCell>
                        <Badge variant={
                          ticket.priority === "high" ? "destructive" :
                          ticket.priority === "medium" ? "default" : "outline"
                        }>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                      <TableCell>{ticket.status.replace('-', ' ')}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={ticket.status}
                          onValueChange={(value) => handleStatusChange(ticket.id, value)}
                          disabled={updateTicketMutation.isPending}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No support tickets found
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center">
                  <div className="bg-primary-50 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-medium">JD</span>
                  </div>
                  <div>
                    <p className="font-medium">Jane Doe</p>
                    <p className="text-xs text-gray-500">Senior Support Agent</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">24 tickets</p>
                  <p className="text-xs text-gray-500">1.5h avg. response</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center">
                  <div className="bg-primary-50 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-medium">MS</span>
                  </div>
                  <div>
                    <p className="font-medium">Mike Smith</p>
                    <p className="text-xs text-gray-500">Support Agent</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">18 tickets</p>
                  <p className="text-xs text-gray-500">2.1h avg. response</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center">
                  <div className="bg-primary-50 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-medium">SJ</span>
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Support Agent</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">16 tickets</p>
                  <p className="text-xs text-gray-500">1.8h avg. response</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Common Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Password Reset</span>
                  <span className="text-sm text-gray-500">32%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: "32%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Transfer Issues</span>
                  <span className="text-sm text-gray-500">24%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: "24%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Account Access</span>
                  <span className="text-sm text-gray-500">18%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: "18%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Bill Pay Problems</span>
                  <span className="text-sm text-gray-500">14%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: "14%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Other Issues</span>
                  <span className="text-sm text-gray-500">12%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: "12%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ACH Processing Tab
const ACHProcessingTab: React.FC = () => {
  const [achFileContent, setAchFileContent] = useState("");
  const { toast } = useToast();
  
  const processAchFileMutation = useMutation({
    mutationFn: async (fileContent: string) => {
      return apiRequest("POST", "/api/ach/process-file", { fileContent });
    },
    onSuccess: (data) => {
      toast({
        title: "ACH file processed",
        description: `Successfully processed ${data.processed} entries. Failed: ${data.failed}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred while processing the ACH file.",
      });
    },
  });
  
  const handleProcessFile = () => {
    if (!achFileContent) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "ACH file content is required",
      });
      return;
    }
    
    processAchFileMutation.mutate(achFileContent);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Pending ACH Files" 
          value="3" 
          change="+1"
          trend="up" 
          icon="file_present"
        />
        <MetricCard 
          title="Processed Today" 
          value="12" 
          change="+4"
          trend="up" 
          icon="check_circle"
        />
        <MetricCard 
          title="Failed Entries" 
          value="2" 
          change="-1"
          trend="down" 
          icon="error"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Process ACH File</CardTitle>
            <CardDescription>
              Upload and process ACH/NACHA files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <span className="material-icons text-gray-400 text-3xl mb-2">upload_file</span>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag & drop an ACH file or paste content below
                  </p>
                  <Button variant="outline" size="sm">
                    Select File
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ACH File Content (JSON format)
                </label>
                <Textarea 
                  placeholder="Paste ACH file content here..." 
                  rows={8} 
                  value={achFileContent}
                  onChange={(e) => setAchFileContent(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  For demo purposes, use JSON format. Example:
                  <br />
                  {`{"entries": [{"id": "123", "accountNumber": "1234567890", "direction": "credit", "amount": 100, "companyName": "ABC Corp", "description": "Payroll"}]}`}
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleProcessFile}
                disabled={processAchFileMutation.isPending}
              >
                {processAchFileMutation.isPending ? (
                  <><span className="material-icons mr-2 animate-spin">refresh</span> Processing...</>
                ) : (
                  <><span className="material-icons mr-2 text-sm">play_arrow</span> Process ACH File</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ACH Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-md bg-green-50 border-green-200">
                <div className="flex items-center">
                  <span className="material-icons text-green-600 mr-3">check_circle</span>
                  <div>
                    <p className="font-medium">Morning Batch</p>
                    <p className="text-xs text-gray-500">Processed 86 transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Today, 9:15 AM</p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md bg-amber-50 border-amber-200">
                <div className="flex items-center">
                  <span className="material-icons text-amber-600 mr-3">pending</span>
                  <div>
                    <p className="font-medium">Afternoon Batch</p>
                    <p className="text-xs text-gray-500">Processing 42 transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Today, 2:30 PM</p>
                  <p className="text-xs text-amber-600">In Progress</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center">
                  <span className="material-icons text-gray-400 mr-3">schedule</span>
                  <div>
                    <p className="font-medium">Evening Batch</p>
                    <p className="text-xs text-gray-500">Scheduled for 8:00 PM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Today, 8:00 PM</p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mt-6 mb-2">Recent Issues</h3>
              
              <div className="flex justify-between items-center p-3 border rounded-md bg-red-50 border-red-200">
                <div className="flex items-center">
                  <span className="material-icons text-red-600 mr-3">error</span>
                  <div>
                    <p className="font-medium">Invalid Account Number</p>
                    <p className="text-xs text-gray-500">2 entries in morning batch</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md bg-red-50 border-red-200">
                <div className="flex items-center">
                  <span className="material-icons text-red-600 mr-3">error</span>
                  <div>
                    <p className="font-medium">Insufficient Funds</p>
                    <p className="text-xs text-gray-500">1 entry in morning batch</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate ACH Files</CardTitle>
          <CardDescription>
            Create outgoing ACH/NACHA files for bank processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col border rounded-md p-4 hover:bg-gray-50 transition cursor-pointer">
                <span className="material-icons text-primary-600 mb-2">request_page</span>
                <h3 className="font-medium mb-1">Direct Deposits</h3>
                <p className="text-xs text-gray-500 mb-3">Generate payroll ACH file</p>
                <p className="text-sm mt-auto">45 pending entries</p>
              </div>
              
              <div className="flex flex-col border rounded-md p-4 hover:bg-gray-50 transition cursor-pointer">
                <span className="material-icons text-primary-600 mb-2">request_page</span>
                <h3 className="font-medium mb-1">Bill Payments</h3>
                <p className="text-xs text-gray-500 mb-3">Generate bill payment ACH file</p>
                <p className="text-sm mt-auto">28 pending entries</p>
              </div>
              
              <div className="flex flex-col border rounded-md p-4 hover:bg-gray-50 transition cursor-pointer">
                <span className="material-icons text-primary-600 mb-2">request_page</span>
                <h3 className="font-medium mb-1">Account Transfers</h3>
                <p className="text-xs text-gray-500 mb-3">Generate transfer ACH file</p>
                <p className="text-sm mt-auto">12 pending entries</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button>
                <span className="material-icons mr-2 text-sm">generate</span>
                Generate Selected Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Operations;
