import React, { useState } from "react";
import { Chart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

type TimeRange = "monthly" | "quarterly" | "yearly";

const FinancialOverview: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  
  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/accounts/1/transactions"],
    enabled: !!accounts && accounts.length > 0,
  });
  
  // Calculate income and expenses
  const financialData = React.useMemo(() => {
    if (!transactions) return { income: 0, expenses: 0, netChange: 0 };
    
    let income = 0;
    let expenses = 0;
    
    transactions.forEach((tx: any) => {
      if (tx.amount > 0) {
        income += tx.amount;
      } else {
        expenses += Math.abs(tx.amount);
      }
    });
    
    return {
      income,
      expenses,
      netChange: income - expenses
    };
  }, [transactions]);
  
  // Generate chart data based on time range
  const chartData = React.useMemo(() => {
    // We would normally fetch different data based on the time range
    // For this demo, we'll generate synthetic data
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const chartData = [];
    
    for (let i = 0; i < 10; i++) {
      // Add income bar
      chartData.push({
        name: months[i],
        value: Math.random() * 5000 + 3000, // Random value between 3000 and 8000
        category: "income",
        color: "#3B82F6"
      });
      
      // Add spending bar right after
      chartData.push({
        name: months[i],
        value: Math.random() * 3000 + 2000, // Random value between 2000 and 5000
        category: "spending",
        color: "#0D9488"
      });
    }
    
    return chartData;
  }, [timeRange]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              timeRange === "monthly" 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-500"
            }`}
            onClick={() => setTimeRange("monthly")}
          >
            Monthly
          </button>
          <button 
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              timeRange === "quarterly" 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-500"
            }`}
            onClick={() => setTimeRange("quarterly")}
          >
            Quarterly
          </button>
          <button 
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              timeRange === "yearly" 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-500"
            }`}
            onClick={() => setTimeRange("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Chart Area */}
      {isLoadingTransactions ? (
        <Skeleton className="h-[200px] w-full mb-4" />
      ) : (
        <Chart
          data={chartData}
          height={200}
          type="bar"
          showLegend={true}
          className="mb-4"
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Total Income</p>
          {isLoadingTransactions ? (
            <Skeleton className="h-7 w-32" />
          ) : (
            <p className="text-xl font-semibold text-gray-900 font-mono">
              {formatCurrency(financialData.income)}
            </p>
          )}
          <p className="text-xs text-success flex items-center mt-1">
            <span className="material-icons text-xs mr-1">arrow_upward</span>
            +5.6% from last month
          </p>
        </div>
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          {isLoadingTransactions ? (
            <Skeleton className="h-7 w-32" />
          ) : (
            <p className="text-xl font-semibold text-gray-900 font-mono">
              {formatCurrency(financialData.expenses)}
            </p>
          )}
          <p className="text-xs text-error flex items-center mt-1">
            <span className="material-icons text-xs mr-1">arrow_upward</span>
            +2.8% from last month
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
