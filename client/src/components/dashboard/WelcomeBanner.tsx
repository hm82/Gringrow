import React from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const WelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };
  
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 mb-6 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Good {getTimeOfDay()}, {user?.firstName || 'there'}
          </h2>
          <p className="text-primary-100">
            Here's your financial summary for today, {formattedDate}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="secondary"
            className="bg-white text-primary-700 hover:bg-gray-100 shadow-sm"
          >
            <span className="material-icons mr-2 text-sm">add_circle</span>
            New Transfer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
