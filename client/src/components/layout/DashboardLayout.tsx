import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import DashboardHeader from "./DashboardHeader";
import { useAuth } from "@/lib/auth";
import { useLocation, useRouter } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  title = "Dashboard"
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const [location, navigate] = useLocation();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // If not authenticated, show login form
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">NextGen Bank</h1>
            <p className="text-gray-500 mt-2">Please log in to access your account</p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo credentials:</p>
            <p>Username: johndoe | Password: password123</p>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile header */}
      <header className="bg-white shadow-sm px-4 py-2 flex items-center justify-between md:hidden">
        <div className="flex items-center">
          <button 
            className="text-gray-700"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="ml-3 text-lg font-semibold text-primary-600">NextGen Bank</h1>
        </div>
        <div className="flex items-center">
          <button className="relative text-gray-700 mr-2">
            <span className="material-icons">notifications</span>
            <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          <button className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center">
            <span className="material-icons text-gray-700">person</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <main className="flex-1 ml-0 md:ml-64 bg-gray-50 min-h-screen">
          {/* Desktop header */}
          <DashboardHeader title={title} />

          {/* Dashboard content */}
          <div className="px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  );
};

// Login form component
const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("johndoe");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [_, navigate] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </Button>
      </div>
    </form>
  );
};

export default DashboardLayout;
