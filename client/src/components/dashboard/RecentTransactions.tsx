import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const RecentTransactions: React.FC = () => {
  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });
  
  const primaryAccountId = accounts?.[0]?.id;
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/accounts", primaryAccountId, "transactions/recent"],
    enabled: !!primaryAccountId,
  });
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <a href="#" className="text-primary-600 text-sm font-medium flex items-center">
          View All
          <span className="material-icons text-sm ml-1">chevron_right</span>
        </a>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </>
        ) : transactions && transactions.length > 0 ? (
          transactions.map((transaction: any) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No recent transactions found
          </div>
        )}
      </div>
    </div>
  );
};

interface TransactionItemProps {
  transaction: any;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isPositive = transaction.amount > 0;
  
  const getCategoryIcon = () => {
    if (transaction.type === "deposit" || transaction.amount > 0) {
      return "attach_money";
    }
    
    switch (transaction.category) {
      case "groceries":
        return "shopping_bag";
      case "housing":
        return "home";
      case "transportation":
        return "local_gas_station";
      case "utilities":
        return "power";
      case "entertainment":
        return "movie";
      case "dining":
        return "restaurant";
      case "healthcare":
        return "local_hospital";
      case "transfer":
        return "swap_horiz";
      default:
        return "payment";
    }
  };
  
  return (
    <div className="transaction-item flex items-center p-2 rounded-lg transition cursor-pointer">
      <div className="bg-primary-50 rounded-full p-2 mr-3">
        <span className="material-icons text-primary-600">{getCategoryIcon()}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
        <p className="text-xs text-gray-500">
          {formatDate(transaction.date)} · {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <p className={`text-sm font-semibold font-mono ${isPositive ? 'text-success' : 'text-error'}`}>
        {isPositive ? '+' : ''}{formatCurrency(transaction.amount)}
      </p>
    </div>
  );
};

const TransactionSkeleton = () => (
  <div className="flex items-center p-2">
    <Skeleton className="h-10 w-10 rounded-full mr-3" />
    <div className="flex-1">
      <Skeleton className="h-4 w-32 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-4 w-16" />
  </div>
);

export default RecentTransactions;
