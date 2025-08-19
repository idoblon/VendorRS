/**
 * Utility functions for currency formatting
 */

/**
 * Format a number as Nepali Rupees (NPR)
 * @param amount - The amount to format
 * @returns Formatted string with NPR symbol
 */
export const formatNepaliCurrency = (amount: number | string): string => {
  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with Nepali Rupees symbol (₨) and thousands separator
  return `₨ ${numAmount.toLocaleString('en-NP', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  })}`;
};

/**
 * Format a number as Nepali Rupees (NPR) in short form (K for thousands, M for millions)
 * @param amount - The amount to format
 * @returns Formatted string with NPR symbol and abbreviated value
 */
export const formatNepaliCurrencyShort = (amount: number | string): string => {
  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with abbreviations
  if (numAmount >= 1000000) {
    return `₨ ${(numAmount / 1000000).toFixed(1)}M`;
  } else if (numAmount >= 1000) {
    return `₨ ${(numAmount / 1000).toFixed(1)}K`;
  } else {
    return `₨ ${numAmount.toFixed(0)}`;
  }
};