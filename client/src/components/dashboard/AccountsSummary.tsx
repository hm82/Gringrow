import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const AccountsSummary: React.FC = () => {
  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ["/api/accounts"],
  });

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Accounts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AccountSkeleton />
          <AccountSkeleton />
          <AccountSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load accounts. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Accounts</h2>
        <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
          View All
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts?.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </section>
  );
};

interface AccountCardProps {
  account: any;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { data: accountTypes } = useQuery({
    queryKey: ["/api/account-types"],
  });

  const accountType = accountTypes?.find(
    (type) => type.id === account.accountTypeId
  );

  const getAccountTypeIcon = () => {
    switch (accountType?.name) {
      case "Checking Account":
        return "account_balance";
      case "Savings Account":
        return "savings";
      case "Certificate of Deposit":
        return "diamond";
      default:
        return "account_balance";
    }
  };

  const getAccountTypeColor = () => {
    switch (accountType?.name) {
      case "Checking Account":
        return "text-primary-600";
      case "Savings Account":
        return "text-secondary-500";
      case "Certificate of Deposit":
        return "text-amber-500";
      default:
        return "text-primary-600";
    }
  };

  return (
    <div className="account-card bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">
            {accountType?.name || "Account"}
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            •••• {account.accountNumber.slice(-4)}
          </p>
        </div>
        <span className={`material-icons ${getAccountTypeColor()}`}>
          {getAccountTypeIcon()}
        </span>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-500">Available Balance</p>
        <p className="text-2xl font-semibold text-gray-900 font-mono">
          {formatCurrency(account.available)}
        </p>
      </div>
      
      {accountType?.name === "Certificate of Deposit" ? (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>APY: {accountType.interestRate}%</span>
            <span>
              Matures: {account.maturityDate 
                ? new Date(account.maturityDate).toLocaleDateString() 
                : "N/A"}
            </span>
          </div>
          <button className="w-full bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium py-2 px-3 rounded-lg transition">
            View Details
          </button>
        </>
      ) : (
        <div className="flex space-x-2">
          <button className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium py-2 px-3 rounded-lg transition">
            Transfer
          </button>
          <button className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium py-2 px-3 rounded-lg transition">
            {accountType?.name === "Checking Account" ? "Deposit" : "Details"}
          </button>
        </div>
      )}
    </div>
  );
};

const AccountSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-32 mt-1" />
      </div>
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
    <div className="mb-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-40 mt-1" />
    </div>
    <div className="flex space-x-2">
      <Skeleton className="h-10 flex-1 rounded-lg" />
      <Skeleton className="h-10 flex-1 rounded-lg" />
    </div>
  </div>
);

export default AccountsSummary;
