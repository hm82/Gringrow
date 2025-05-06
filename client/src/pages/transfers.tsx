import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TransferIcon } from "@/components/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Helmet } from "react-helmet";

// Transfer form schema
const transferFormSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    {
      message: "Amount must be a positive number",
    }
  ),
  description: z.string().optional(),
});

// ACH transfer form schema
const achTransferFormSchema = z.object({
  accountId: z.string(),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    {
      message: "Amount must be a positive number",
    }
  ),
  routingNumber: z.string().length(9, { message: "Routing number must be 9 digits" }),
  accountNumber: z.string().min(4, { message: "Please enter a valid account number" }),
  accountType: z.enum(["checking", "savings"]),
  description: z.string().optional(),
  direction: z.enum(["incoming", "outgoing"]),
});

const Transfers: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/accounts"],
  });
  
  // Fetch transfer history
  const { data: transfers, isLoading: transfersLoading } = useQuery({
    queryKey: ["/api/transfers"],
  });
  
  return (
    <>
      <Helmet>
        <title>Transfers | NextGen Digital Banking</title>
        <meta 
          name="description" 
          content="Transfer money between your accounts, to other banks via ACH, or set up recurring transfers. View your transfer history."
        />
      </Helmet>
      <DashboardLayout title="Transfers">
        <div className="space-y-6">
          {/* Transfer Options Tabs */}
          <Tabs defaultValue="between-accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Money</CardTitle>
                <CardDescription>
                  Move money between your accounts or to external accounts
                </CardDescription>
                <TabsList className="mt-2">
                  <TabsTrigger value="between-accounts">Between My Accounts</TabsTrigger>
                  <TabsTrigger value="ach-transfer">External Transfer (ACH)</TabsTrigger>
                  <TabsTrigger value="wire-transfer">Wire Transfer</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="between-accounts">
                  <InternalTransferForm accounts={accounts} accountsLoading={accountsLoading} />
                </TabsContent>
                
                <TabsContent value="ach-transfer">
                  <ACHTransferForm accounts={accounts} accountsLoading={accountsLoading} />
                </TabsContent>
                
                <TabsContent value="wire-transfer">
                  <div className="text-center py-8">
                    <TransferIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Wire Transfers</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Wire transfers allow you to send money quickly to any bank account around the world.
                      Please contact customer support to initiate a wire transfer.
                    </p>
                    <Button>Contact Support</Button>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
            
            {/* Transfer History */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer History</CardTitle>
                <CardDescription>
                  View your recent transfer activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transfersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : transfers && transfers.length > 0 ? (
                  <div className="space-y-4">
                    {transfers.map((transfer: any) => (
                      <TransferHistoryItem key={transfer.id} transfer={transfer} accounts={accounts} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No transfer history available
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="ml-auto">
                  <span className="material-icons mr-2 text-sm">download</span>
                  Export History
                </Button>
              </CardFooter>
            </Card>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

// Internal account transfer form
interface InternalTransferFormProps {
  accounts: any[] | undefined;
  accountsLoading: boolean;
}

const InternalTransferForm: React.FC<InternalTransferFormProps> = ({ accounts, accountsLoading }) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      fromAccountId: "",
      toAccountId: "",
      amount: "",
      description: "",
    },
  });
  
  const transferMutation = useMutation({
    mutationFn: async (values: z.infer<typeof transferFormSchema>) => {
      return apiRequest("POST", "/api/transfers", {
        fromAccountId: parseInt(values.fromAccountId),
        toAccountId: parseInt(values.toAccountId),
        amount: parseFloat(values.amount),
        description: values.description || "Transfer",
      });
    },
    onSuccess: () => {
      toast({
        title: "Transfer Successful",
        description: "Your funds have been transferred successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "An error occurred during the transfer.",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof transferFormSchema>) => {
    if (values.fromAccountId === values.toAccountId) {
      toast({
        variant: "destructive",
        title: "Invalid Transfer",
        description: "You cannot transfer money to the same account.",
      });
      return;
    }
    
    transferMutation.mutate(values);
  };
  
  if (accountsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-24 mx-auto" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fromAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Account</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={transferMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountTypeId === 1 
                          ? "Checking" 
                          : account.accountTypeId === 2 
                            ? "Savings" 
                            : "CD"} (••••{account.accountNumber.slice(-4)}) - {formatCurrency(account.available)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="toAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Account</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={transferMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountTypeId === 1 
                          ? "Checking" 
                          : account.accountTypeId === 2 
                            ? "Savings" 
                            : "CD"} (••••{account.accountNumber.slice(-4)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      {...field} 
                      className="pl-8" 
                      placeholder="0.00"
                      disabled={transferMutation.isPending}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Reason for transfer"
                    disabled={transferMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg"
            disabled={transferMutation.isPending}
          >
            {transferMutation.isPending ? (
              <><span className="material-icons mr-2 animate-spin">refresh</span> Processing...</>
            ) : (
              <><span className="material-icons mr-2">swap_horiz</span> Transfer Funds</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// ACH Transfer form
interface ACHTransferFormProps {
  accounts: any[] | undefined;
  accountsLoading: boolean;
}

const ACHTransferForm: React.FC<ACHTransferFormProps> = ({ accounts, accountsLoading }) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof achTransferFormSchema>>({
    resolver: zodResolver(achTransferFormSchema),
    defaultValues: {
      accountId: "",
      amount: "",
      routingNumber: "",
      accountNumber: "",
      accountType: "checking",
      description: "",
      direction: "outgoing",
    },
  });
  
  const achMutation = useMutation({
    mutationFn: async (values: z.infer<typeof achTransferFormSchema>) => {
      return apiRequest("POST", "/api/ach-transfers", {
        accountId: parseInt(values.accountId),
        amount: parseFloat(values.amount),
        routingNumber: values.routingNumber,
        accountNumber: values.accountNumber,
        accountType: values.accountType,
        description: values.description || "ACH Transfer",
        direction: values.direction,
      });
    },
    onSuccess: () => {
      toast({
        title: "ACH Transfer Initiated",
        description: "Your ACH transfer has been submitted and is being processed.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/ach-transfers"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "ACH Transfer Failed",
        description: error instanceof Error ? error.message : "An error occurred while initiating the transfer.",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof achTransferFormSchema>) => {
    achMutation.mutate(values);
  };
  
  if (accountsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-24 mx-auto" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <p className="text-sm text-amber-700 flex items-start">
            <span className="material-icons mr-2 text-amber-500">info</span>
            ACH transfers typically take 1-3 business days to process. For immediate transfers, please use the "Between My Accounts" option.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transfer Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={achMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="outgoing">Send Money (Outgoing)</SelectItem>
                    <SelectItem value="incoming">Receive Money (Incoming)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Account</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={achMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountTypeId === 1 
                          ? "Checking" 
                          : account.accountTypeId === 2 
                            ? "Savings" 
                            : "CD"} (••••{account.accountNumber.slice(-4)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="routingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Routing Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="9 digit routing number"
                    disabled={achMutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  The 9-digit routing number of the recipient's bank
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Account number"
                    disabled={achMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={achMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      {...field} 
                      className="pl-8" 
                      placeholder="0.00"
                      disabled={achMutation.isPending}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Reason for transfer"
                  disabled={achMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg"
            disabled={achMutation.isPending}
          >
            {achMutation.isPending ? (
              <><span className="material-icons mr-2 animate-spin">refresh</span> Processing...</>
            ) : (
              <><span className="material-icons mr-2">send</span> Submit ACH Transfer</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Transfer history item component
interface TransferHistoryItemProps {
  transfer: any;
  accounts: any[] | undefined;
}

const TransferHistoryItem: React.FC<TransferHistoryItemProps> = ({ transfer, accounts }) => {
  const fromAccount = accounts?.find(account => account.id === transfer.fromAccountId);
  const toAccount = accounts?.find(account => account.id === transfer.toAccountId);
  
  return (
    <div className="flex items-center p-4 border rounded-lg">
      <div className="bg-primary-50 rounded-full p-2 mr-4">
        <span className="material-icons text-primary-600">swap_horiz</span>
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <p className="font-medium text-gray-900">
            From: ••••{fromAccount?.accountNumber.slice(-4) || 'Unknown'} → 
            To: ••••{toAccount?.accountNumber.slice(-4) || 'Unknown'}
          </p>
          <p className="text-gray-600 text-sm">
            {new Date(transfer.date).toLocaleDateString()}
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {transfer.description || 'Transfer'} • 
          <span className={`ml-2 font-medium ${transfer.status === 'completed' ? 'text-success' : 'text-amber-600'}`}>
            {transfer.status}
          </span>
        </p>
      </div>
      <p className="text-lg font-semibold text-gray-900 font-mono ml-4">
        {formatCurrency(transfer.amount)}
      </p>
    </div>
  );
};

export default Transfers;
