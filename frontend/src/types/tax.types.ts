/**
 * Type definitions for tax computation and filing
 */

export type SectionStatus = 'incomplete' | 'in_progress' | 'complete';

export interface Form16Data {
  employer_name?: string;
  salary: number;
  deductions: number;
  gross_salary: number;
  tds_paid: number;
}

export interface EquityStockData {
  stcgBefore: number;
  stcgAfter: number;
  ltcgBefore: number;
  ltcgAfter: number;
}

export interface MutualFundData {
  equityStcg: number;
  equityLtcg: number;
  debtStcg: number;
  debtLtcg: number;
}

export interface EquityStockTaxBreakdown {
  stcgBefore: number;
  stcgAfter: number;
  ltcgBefore: number;
  ltcgAfter: number;
  stcgTax: number;
  ltcgTax: number;
  totalEquityStockTax: number;
  ltcgExemption: number;
  taxableLtcg: number;
}

export interface MutualFundTaxBreakdown {
  equityStcg: number;
  equityLtcg: number;
  equityLtcgExemption: number;
  equityTaxableLtcg: number;
  equityStcgTax: number;
  equityLtcgTax: number;
  equityMfTax: number;
  debtStcg: number;
  debtLtcg: number;
  debtMfIncomeAddedToSalary: number;
}

export interface ParsedStockGains {
  stcg_before: number;
  stcg_after: number;
  ltcg_before: number;
  ltcg_after: number;
}

export interface StockTaxComputation {
  stcgTax: number;
  ltcgTax: number;
}

export interface ParsedMutualFundGains {
  equity_stcg: number;
  equity_ltcg: number;
  debt_stcg: number;
  debt_ltcg: number;
}

export interface EquityMutualFunds {
  stcg: number;
  ltcg: number;
  ltcgExemption: number;
  taxableLtcg: number;
  equityMfTax: number;
}

export interface DebtMutualFunds {
  debtStcg: number;
  debtLtcg: number;
  addedToIncome: number;
}

export interface FinalTaxSummary {
  salaryPlusDebtMfTax: number;
  stockCapitalGainsTax: number;
  mutualFundEquityTax: number;
  totalIncomeTaxBeforeCess: number;
  cess: number;
  totalTaxLiability: number;
}

export interface TaxCalculationResult {
  // New structure from backend
  parsedStockGains?: ParsedStockGains;
  stockTaxComputation?: StockTaxComputation;
  parsedMutualFundGains?: ParsedMutualFundGains;
  equityMutualFunds?: EquityMutualFunds;
  debtMutualFunds?: DebtMutualFunds;
  finalTaxSummary?: FinalTaxSummary;
  
  // Legacy fields (for backward compatibility)
  grossSalary?: number;
  tdsDeducted?: number;
  taxableIncome?: number;
  salaryTax?: number;
  equityStocks?: EquityStockTaxBreakdown;
  mutualFunds?: MutualFundTaxBreakdown;
  totalTaxLiability?: number;
  capitalGainsTax?: number;
  equityStockTax?: number;
  equityMfTax?: number;
  effectiveRate?: number;
  tdsAlreadyPaid?: number;
  
  // Common fields
  netPayable: number;
  isRefund?: boolean;
  calculatedAt: string;
  employerName?: string;
}

export interface TaxCalculationRequest {
  gross_salary: number;
  tds_paid: number;
  stcg_before?: number;
  stcg_after?: number;
  ltcg_before?: number;
  ltcg_after?: number;
  equity_stcg?: number;
  equity_ltcg?: number;
  debt_stcg?: number;
  debt_ltcg?: number;
}
