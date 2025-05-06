import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BankIcon, SavingsIcon, CDIcon } from "@/components/ui/icons";
import { Helmet } from "react-helmet";

const Accounts: React.FC = () => {
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);
  
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/accounts"]
  });
  
  const { data: accountTypes } = useQuery({
    queryKey: ["/api/account-types"]
  });
  
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/accounts", activeAccountId, "transactions"],
    enabled: !!activeAccountId
  });
  
  // Set active account when accounts are loaded
  React.useEffect(() => {
    if (accounts && accounts.length > 0 && !activeAccountId) {
      setActiveAccountId(accounts[0].id);
    }
  }, [accounts, activeAccountId]);
  
  const getAccountType = (accountTypeId: number) => {
    return accountTypes?.find(type => type.id === accountTypeId);
  };
  
  const getAccountIcon = (typeName?: string) => {
    switch (typeName) {
      case "Checking Account":
        return <BankIcon className="h-6 w-6 text-primary-600" />;
      case "Savings Account":
        return <SavingsIcon className="h-6 w-6 text-secondary-500" />;
      case "Certificate of Deposit":
        return <CDIcon className="h-6 w-6 text-amber-500" />;
      default:
        return <BankIcon className="h-6 w-6 text-primary-600" />;
    }
  };
  
  return (
    <>
      <Helmet>
        <title>My Accounts | NextGen Digital Banking</title>
        <meta 
          name="description" 
          content="View and manage your checking, savings, and certificate of deposit accounts. Check balances, transactions history, and account details."
        />
      </Helmet>
      <DashboardLayout title="Accounts">
        <div className="space-y-6">
          {/* Account Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accountsLoading ? (
              <>
                <Skeleton className="h-[180px] rounded-xl" />
                <Skeleton className="h-[180px] rounded-xl" />
                <Skeleton className="h-[180px] rounded-xl" />
              </>
            ) : accounts?.map(account => {
              const accountType = getAccountType(account.accountTypeId);
              return (
                <Card 
                  key={account.id} 
                  className={`cursor-pointer transition-all border ${activeAccountId === account.id ? 'border-primary-500 shadow-md' : 'border-gray-200'}`}
                  onClick={() => setActiveAccountId(account.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        {getAccountIcon(accountType?.name)}
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{accountType?.name}</h3>
                          <p className="text-sm text-gray-500">••••{account.accountNumber.slice(-4)}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                      <p className="text-2xl font-semibold text-gray-900 font-mono">{formatCurrency(account.available)}</p>
                    </div>
                    {accountType?.name === "Certificate of Deposit" && (
                      <div className="mt-2 text-xs text-gray-600 flex justify-between">
                        <span>APY: {accountType.interestRate}%</span>
                        <span>Matures: {new Date(account.maturityDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Account Details Tabs */}
          {activeAccountId && (
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  View transactions, details and manage your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transactions">
                  <TabsList className="mb-4">
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="details">Account Details</TabsTrigger>
                    <TabsTrigger value="statements">Statements</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="transactions">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Recent Transactions</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <span className="material-icons text-sm mr-1">filter_list</span>
                            Filter
                          </Button>
                          <Button variant="outline" size="sm">
                            <span className="material-icons text-sm mr-1">download</span>
                            Export
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactionsLoading ? (
                              <>
                                <TableRow>
                                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                </TableRow>
                              </>
                            ) : transactions?.length > 0 ? (
                              transactions.map((transaction: any) => (
                                <TableRow key={transaction.id}>
                                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                  <TableCell>{transaction.description}</TableCell>
                                  <TableCell className="capitalize">{transaction.category || 'uncategorized'}</TableCell>
                                  <TableCell className={`text-right font-medium ${transaction.amount >= 0 ? 'text-success' : 'text-error'}`}>
                                    {formatCurrency(transaction.amount)}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                                  No transactions found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details">
                    {accounts && activeAccountId && (
                      <AccountDetailsContent 
                        account={accounts.find(a => a.id === activeAccountId)} 
                        accountType={accountTypes?.find(type => type.id === accounts.find(a => a.id === activeAccountId)?.accountTypeId)}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="statements">
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <span className="material-icons text-gray-400">description</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No statements available</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Electronic statements are not yet available for this account. They will appear here once generated.
                      </p>
                      <Button variant="outline">Request Statement</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

interface AccountDetailsContentProps {
  account: any;
  accountType: any;
}

const AccountDetailsContent: React.FC<AccountDetailsContentProps> = ({ account, accountType }) => {
  if (!account) return null;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                <dd className="text-sm text-gray-900">••••{account.accountNumber.slice(-4)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                <dd className="text-sm text-gray-900">{accountType?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Current Balance</dt>
                <dd className="text-sm text-gray-900 font-medium">{formatCurrency(account.balance)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Available Balance</dt>
                <dd className="text-sm text-gray-900 font-medium">{formatCurrency(account.available)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                <dd className="text-sm text-gray-900">{accountType?.interestRate}% APY</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Date Opened</dt>
                <dd className="text-sm text-gray-900">{new Date(account.createdAt).toLocaleDateString()}</dd>
              </div>
              {account.maturityDate && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Maturity Date</dt>
                  <dd className="text-sm text-gray-900">{new Date(account.maturityDate).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {accountType?.features.map((feature: string, index: number) => (
                <li key={index} className="flex">
                  <span className="material-icons text-primary-600 mr-2 text-sm">check_circle</span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 space-y-3">
              <Button className="w-full">
                <span className="material-icons mr-2 text-sm">swap_horiz</span>
                Transfer Money
              </Button>
              <Button variant="outline" className="w-full">
                <span className="material-icons mr-2 text-sm">settings</span>
                Account Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Accounts;
