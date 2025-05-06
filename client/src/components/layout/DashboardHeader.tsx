import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  title?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const [notificationCount] = useState(3);
  
  return (
    <header className="hidden md:flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-gray-700 mr-4 relative">
              <span className="material-icons">notifications</span>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <NotificationItem 
                title="Security Alert" 
                description="A new device was used to log in to your account." 
                time="5 minutes ago" 
                type="security"
              />
              <NotificationItem 
                title="Transaction Alert" 
                description="Your payment of $54.89 to Shell Gas Station was completed." 
                time="2 hours ago" 
                type="transaction"
              />
              <NotificationItem 
                title="Account Alert" 
                description="Your account statement for June is now available." 
                time="1 day ago" 
                type="account"
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <span className="text-primary-600 text-sm font-medium">View All Notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="border-l border-gray-300 h-6 mx-4"></div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer">
              <div className="bg-primary-600 rounded-full h-9 w-9 flex items-center justify-center mr-3">
                <span className="text-white font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === "admin" ? "Administrator" : "Personal Account"}
                </p>
              </div>
              <span className="material-icons text-gray-500 ml-2">arrow_drop_down</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="material-icons mr-2 text-gray-500 text-sm">person</span>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="material-icons mr-2 text-gray-500 text-sm">settings</span>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="material-icons mr-2 text-gray-500 text-sm">security</span>
              Security
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <span className="material-icons mr-2 text-gray-500 text-sm">logout</span>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  type: "security" | "transaction" | "account" | "other";
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  title, 
  description, 
  time, 
  type 
}) => {
  const getIcon = () => {
    switch (type) {
      case "security":
        return "security";
      case "transaction":
        return "payment";
      case "account":
        return "account_balance";
      default:
        return "notifications";
    }
  };
  
  const getIconColor = () => {
    switch (type) {
      case "security":
        return "text-error";
      case "transaction":
        return "text-primary-600";
      case "account":
        return "text-secondary-500";
      default:
        return "text-gray-500";
    }
  };
  
  return (
    <div className="p-3 hover:bg-gray-50 cursor-pointer">
      <div className="flex">
        <div className={`${getIconColor()} mr-3`}>
          <span className="material-icons">{getIcon()}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
          <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
