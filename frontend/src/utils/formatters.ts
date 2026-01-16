/**
 * Formatting utilities for tax calculation display
 */

const INDIAN_LOCALE = 'en-IN';
const CURRENCY_SYMBOL = '₹';
const MISSING_VALUE_PLACEHOLDER = '—';

interface RefundOrPayableDisplay {
  text: string;
  colorClass: string;
  label: string;
}

export function formatCurrency(value: number | undefined | null): string {
  if (!hasValue(value)) {
    return MISSING_VALUE_PLACEHOLDER;
  }
  
  return `${CURRENCY_SYMBOL}${value!.toLocaleString(INDIAN_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercentage(value: number | undefined | null): string {
  if (!hasValue(value)) {
    return MISSING_VALUE_PLACEHOLDER;
  }
  
  return `${value!.toFixed(2)}%`;
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) {
    return 'Not calculated';
  }
  
  try {
    const date = new Date(isoString);
    return date.toLocaleString(INDIAN_LOCALE, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

export function formatRefundOrPayable(netPayable: number | undefined | null): RefundOrPayableDisplay {
  if (!hasValue(netPayable)) {
    return {
      text: MISSING_VALUE_PLACEHOLDER,
      colorClass: 'text-gray-600 dark:text-gray-400',
      label: 'Net Payable',
    };
  }

  const value = netPayable as number;

  if (value === 0) {
    return {
      text: `${CURRENCY_SYMBOL}0 (No dues)`,
      colorClass: 'text-green-600 dark:text-green-400',
      label: 'Net Payable',
    };
  }

  if (value > 0) {
    return {
      text: formatCurrency(value),
      colorClass: 'text-red-600 dark:text-red-400',
      label: 'Tax Payable',
    };
  }

  return {
    text: formatCurrency(Math.abs(value)),
    colorClass: 'text-green-600 dark:text-green-400',
    label: 'Refund Due',
  };
}

export function hasValue(value: number | undefined | null): boolean {
  return value !== undefined && value !== null && !isNaN(value);
}

export function getGrossSalary(data: any): number {
  if (!data) return 0;
  return data.gross_salary || data.grossSalary || data.salary || 0;
}

export function getTdsPaid(data: any): number {
  if (!data) return 0;
  return data.tds_paid || data.tdsDeducted || data.tds_deducted || data.deductions || 0;
}
