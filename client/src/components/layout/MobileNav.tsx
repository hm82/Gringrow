import React from "react";
import { Link, useLocation } from "wouter";

const MobileNav: React.FC = () => {
  const [location] = useLocation();
  
  const navItems = [
    { name: "Home", icon: "dashboard", href: "/" },
    { name: "Accounts", icon: "account_balance", href: "/accounts" },
    { name: "Transfer", icon: "swap_horiz", href: "/transfers" },
    { name: "Profile", icon: "person", href: "/profile" },
  ];
  
  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-around z-10">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <a className={`flex flex-col items-center ${location === item.href ? 'text-primary-600' : 'text-gray-500'}`}>
            <span className="material-icons">{item.icon}</span>
            <span className="text-xs mt-1">{item.name}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
};

export default MobileNav;
