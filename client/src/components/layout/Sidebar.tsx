import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    {
      section: "Banking",
      items: [
        { name: "Dashboard", icon: "dashboard", href: "/" },
        { name: "Accounts", icon: "account_balance", href: "/accounts" },
        { name: "Transfers", icon: "swap_horiz", href: "/transfers" },
        { name: "Bill Pay", icon: "payments", href: "/bill-pay" },
        { name: "Transaction History", icon: "history", href: "/transactions" },
      ],
    },
    {
      section: "Products",
      items: [
        { name: "Cards", icon: "credit_card", href: "/cards" },
        { name: "Loans", icon: "account_balance_wallet", href: "/loans" },
        { name: "Investments", icon: "trending_up", href: "/investments" },
      ],
    },
    {
      section: "Support",
      items: [
        { name: "Customer Service", icon: "support_agent", href: "/customer-service" },
        { name: "Settings", icon: "settings", href: "/settings" },
      ],
    },
  ];
  
  // Only show Operations menu item to admin users
  if (user?.role === "admin") {
    navItems.push({
      section: "Admin",
      items: [
        { name: "Operations", icon: "admin_panel_settings", href: "/operations" },
      ],
    });
  }
  
  return (
    <aside 
      className={cn(
        "desktop-sidebar w-64 bg-primary-700 text-white h-screen fixed transition-all duration-300 z-20",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">NextGen Bank</h1>
          <button className="lg:hidden text-white" onClick={toggleSidebar}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <nav className="flex-1">
          {navItems.map((section) => (
            <div className="mb-4" key={section.section}>
              <p className="text-xs text-primary-200 uppercase font-semibold mb-2 px-3">
                {section.section}
              </p>
              
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                >
                  <a
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg mb-1",
                      location === item.href
                        ? "bg-primary-600 text-white"
                        : "text-primary-100 hover:bg-primary-600"
                    )}
                  >
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {user && (
          <div className="border-t border-primary-600 pt-4 mt-4">
            <div className="flex items-center px-3 py-2">
              <div className="bg-primary-500 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                <span className="text-white font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-primary-200">{user.email}</p>
              </div>
              <button 
                className="ml-auto text-primary-200 hover:text-white"
                onClick={logout}
                aria-label="Logout"
                title="Logout"
              >
                <span className="material-icons">logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
