/**
 * Currency formatting utilities for Indian Rupees with K notation
 */

export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showDecimals?: boolean;
  useKNotation?: boolean;
}

export class CurrencyFormatter {
  /**
   * Format amount in Indian Rupees with K notation for thousands
   * @param amount - The amount to format
   * @param options - Formatting options
   * @returns Formatted currency string
   */
  static formatINR(amount: number, options: CurrencyFormatOptions = {}): string {
    const {
      showSymbol = true,
      showDecimals = true,
      useKNotation = true
    } = options;

    // Handle zero and negative values
    if (amount === 0) {
      return showSymbol ? '₹0' : '0';
    }

    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    
    let formattedAmount: string;
    
    if (useKNotation && absoluteAmount >= 1000) {
      // Use K notation for thousands
      if (absoluteAmount >= 10000000) {
        // For crores (10M+), use Cr notation
        const crores = absoluteAmount / 10000000;
        formattedAmount = showDecimals && crores % 1 !== 0 
          ? `${crores.toFixed(1)}Cr`
          : `${Math.floor(crores)}Cr`;
      } else if (absoluteAmount >= 100000) {
        // For lakhs (100K+), use L notation
        const lakhs = absoluteAmount / 100000;
        formattedAmount = showDecimals && lakhs % 1 !== 0 
          ? `${lakhs.toFixed(1)}L`
          : `${Math.floor(lakhs)}L`;
      } else {
        // For thousands (1K+), use K notation
        const thousands = absoluteAmount / 1000;
        formattedAmount = showDecimals && thousands % 1 !== 0 
          ? `${thousands.toFixed(1)}K`
          : `${Math.floor(thousands)}K`;
      }
    } else {
      // Regular formatting for amounts less than 1000
      formattedAmount = showDecimals && absoluteAmount % 1 !== 0
        ? absoluteAmount.toFixed(2)
        : absoluteAmount.toString();
    }

    // Add currency symbol
    const result = showSymbol ? `₹${formattedAmount}` : formattedAmount;
    
    // Add negative sign if needed
    return isNegative ? `-${result}` : result;
  }

  /**
   * Format amount with full Indian number system (Lakhs, Crores)
   * @param amount - The amount to format
   * @param options - Formatting options
   * @returns Formatted currency string with Indian number system
   */
  static formatINRFull(amount: number, options: CurrencyFormatOptions = {}): string {
    const {
      showSymbol = true,
      showDecimals = true
    } = options;

    if (amount === 0) {
      return showSymbol ? '₹0' : '0';
    }

    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    
    // Format with Indian number system
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });

    let result = formatter.format(absoluteAmount);
    
    if (!showSymbol) {
      result = result.replace('₹', '');
    }

    return isNegative ? `-${result}` : result;
  }

  /**
   * Format percentage with proper decimal places
   * @param value - The percentage value
   * @param decimals - Number of decimal places (default: 1)
   * @returns Formatted percentage string
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    if (value === 0) return '0%';
    
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    
    const formatted = absoluteValue.toFixed(decimals);
    const result = `${formatted}%`;
    
    return isNegative ? `-${result}` : `+${result}`;
  }

  /**
   * Format growth percentage with color indication
   * @param value - The growth percentage value
   * @param decimals - Number of decimal places (default: 1)
   * @returns Object with formatted string and color class
   */
  static formatGrowth(value: number, decimals: number = 1): { 
    formatted: string; 
    colorClass: string;
    isPositive: boolean;
  } {
    const formatted = this.formatPercentage(value, decimals);
    const isPositive = value > 0;
    const isNegative = value < 0;
    
    let colorClass = 'text-gray-600'; // neutral/zero
    if (isPositive) {
      colorClass = 'text-green-600';
    } else if (isNegative) {
      colorClass = 'text-red-600';
    }

    return {
      formatted,
      colorClass,
      isPositive
    };
  }

  /**
   * Parse formatted currency string back to number
   * @param formattedAmount - The formatted currency string
   * @returns Parsed number value
   */
  static parseINR(formattedAmount: string): number {
    // Remove currency symbol and spaces
    let cleanAmount = formattedAmount.replace(/₹|,|\s/g, '');
    
    // Handle K, L, Cr notations
    if (cleanAmount.includes('Cr')) {
      const value = parseFloat(cleanAmount.replace('Cr', ''));
      return value * 10000000; // 1 Crore = 10 Million
    } else if (cleanAmount.includes('L')) {
      const value = parseFloat(cleanAmount.replace('L', ''));
      return value * 100000; // 1 Lakh = 100 Thousand
    } else if (cleanAmount.includes('K')) {
      const value = parseFloat(cleanAmount.replace('K', ''));
      return value * 1000; // 1 K = 1 Thousand
    }
    
    return parseFloat(cleanAmount) || 0;
  }

  /**
   * Get appropriate currency format based on amount size
   * @param amount - The amount to check
   * @returns Recommended format type
   */
  static getRecommendedFormat(amount: number): 'compact' | 'full' | 'simple' {
    const absoluteAmount = Math.abs(amount);
    
    if (absoluteAmount >= 100000) {
      return 'compact'; // Use K/L/Cr notation
    } else if (absoluteAmount >= 10000) {
      return 'full'; // Use full Indian number system
    } else {
      return 'simple'; // Simple number formatting
    }
  }
}

// Convenience functions for common use cases
export const formatCurrency = (amount: number): string => 
  CurrencyFormatter.formatINR(amount);

export const formatCurrencyCompact = (amount: number): string => 
  CurrencyFormatter.formatINR(amount, { useKNotation: true });

export const formatCurrencyFull = (amount: number): string => 
  CurrencyFormatter.formatINRFull(amount);

export const formatPercentage = (value: number): string => 
  CurrencyFormatter.formatPercentage(value);

export const formatGrowth = (value: number) => 
  CurrencyFormatter.formatGrowth(value);