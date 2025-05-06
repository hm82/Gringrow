import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a date in a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get initials from a name
 */
export function getInitials(firstName: string = '', lastName: string = ''): string {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

/**
 * Calculate time remaining until a future date
 */
export function timeUntil(futureDate: Date): string {
  const now = new Date();
  const diff = futureDate.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} remaining`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Mask account number except for last 4 digits
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return '';
  const visible = accountNumber.slice(-4);
  return '•'.repeat(accountNumber.length - 4) + visible;
}

/**
 * Generate random ID for temporary use
 */
export function generateTempId(): string {
  return Math.random().toString(36).substring(2, 10);
}
