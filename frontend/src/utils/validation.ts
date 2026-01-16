/**
 * Validation utilities for tax data
 */

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateSalaryData(data: any): ValidationResult {
  if (!data) {
    return {
      isValid: false,
      error: 'Salary data is missing',
    };
  }

  const grossSalary = data.gross_salary || data.grossSalary || 0;
  
  if (grossSalary === 0) {
    return {
      isValid: false,
      error: 'Gross salary cannot be zero',
    };
  }

  return { isValid: true };
}

export function validateTaxCalculation(
  grossSalary: number,
  salaryTax: number
): ValidationResult {
  if (grossSalary === 0 && salaryTax > 0) {
    return {
      isValid: false,
      error: 'Salary data missing. Please re-upload Form-16.',
    };
  }

  return { isValid: true };
}
