import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatDate, 
  truncateText, 
  getInitials, 
  maskAccountNumber,
  formatPercentage
} from '@/lib/utils';

describe('Utility functions', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
      expect(formatCurrency(-0.99)).toBe('-$0.99');
    });

    it('should handle decimal places correctly', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50');
      expect(formatCurrency(1234.567)).toBe('$1,234.57'); // Should round
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      // Note: this test assumes en-US locale
      const dateStr = '2023-05-15T14:30:00Z';
      expect(formatDate(dateStr)).toMatch(/\w+ \d{1,2}, \d{4}/);
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 10)).toBe('This is a...');
      expect(truncateText(longText, 20)).toBe('This is a very long...');
    });

    it('should not truncate text shorter than maxLength', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });
  });

  describe('getInitials', () => {
    it('should get initials from first and last name', () => {
      expect(getInitials('John', 'Doe')).toBe('JD');
      expect(getInitials('Alice', 'Smith')).toBe('AS');
    });

    it('should handle missing names', () => {
      expect(getInitials('John', '')).toBe('J');
      expect(getInitials('', 'Doe')).toBe('D');
      expect(getInitials('', '')).toBe('');
    });
  });

  describe('maskAccountNumber', () => {
    it('should mask all but last 4 digits', () => {
      expect(maskAccountNumber('1234567890')).toBe('******7890');
      expect(maskAccountNumber('987654321')).toBe('*****4321');
    });

    it('should handle short account numbers', () => {
      expect(maskAccountNumber('1234')).toBe('1234');
      expect(maskAccountNumber('123')).toBe('123');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%');
      expect(formatPercentage(1)).toBe('100.00%');
      expect(formatPercentage(0)).toBe('0.00%');
    });

    it('should respect decimal places parameter', () => {
      expect(formatPercentage(0.1234, 1)).toBe('12.3%');
      expect(formatPercentage(0.1234, 3)).toBe('12.340%');
      expect(formatPercentage(0.1, 0)).toBe('10%');
    });
  });
});