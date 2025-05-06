import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import AccountsSummary from "@/components/dashboard/AccountsSummary";
import QuickActions from "@/components/dashboard/QuickActions";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ProductsSection from "@/components/dashboard/ProductsSection";
import BankingServices from "@/components/dashboard/BankingServices";
import { Helmet } from "react-helmet";

const Dashboard: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | NextGen Digital Banking</title>
        <meta 
          name="description" 
          content="View your financial summary, account balances, recent transactions, and recommended products in one place."
        />
      </Helmet>
      <DashboardLayout title="Dashboard">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Accounts Summary Section */}
        <AccountsSummary />

        {/* Quick Actions Section */}
        <QuickActions />

        {/* Financial Overview & Transactions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Financial Overview */}
          <div className="lg:col-span-2">
            <FinancialOverview />
          </div>

          {/* Recent Transactions */}
          <div>
            <RecentTransactions />
          </div>
        </div>

        {/* Banking Products */}
        <ProductsSection />

        {/* Banking Services Section */}
        <BankingServices />
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
