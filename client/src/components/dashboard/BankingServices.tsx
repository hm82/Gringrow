import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BankingServices: React.FC = () => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Banking Services</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Support Card */}
        <Card className="p-6 border border-gray-100">
          <div className="flex items-start mb-4">
            <span className="material-icons text-3xl text-primary-600 mr-4">support_agent</span>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">24/7 Customer Support</h3>
              <p className="text-gray-600 text-sm">
                Our dedicated team is available around the clock to assist with any banking needs or questions.
              </p>
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-600 border-0"
            >
              <span className="material-icons mr-2 text-sm">chat</span>
              Live Chat
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-600 border-0"
            >
              <span className="material-icons mr-2 text-sm">phone</span>
              Call Us
            </Button>
          </div>
        </Card>

        {/* Security Center Card */}
        <Card className="p-6 border border-gray-100">
          <div className="flex items-start mb-4">
            <span className="material-icons text-3xl text-primary-600 mr-4">security</span>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Security Center</h3>
              <p className="text-gray-600 text-sm">
                Monitor your account activity, manage alerts, and ensure your financial information stays secure.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full bg-primary-50 hover:bg-primary-100 text-primary-600 border-0 mt-4"
          >
            Manage Security Settings
          </Button>
        </Card>
      </div>
    </section>
  );
};

export default BankingServices;
