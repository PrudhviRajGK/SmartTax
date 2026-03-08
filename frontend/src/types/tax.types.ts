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

  // House property (aggregated result passed to tax engine)
  houseProperty?: HousePropertyResult;
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
  // HP fields — aggregated across all properties
  hp_property_type?: string;
  hp_gross_rent_received?: number;
  hp_expected_market_rent?: number;
  hp_municipal_taxes_paid?: number;
  hp_home_loan_interest?: number;
}

// ============================================================
// HOUSE PROPERTY TYPES
// ============================================================

export type PropertyType = 'SOP' | 'LOP' | 'DLOP';

export interface HousePropertyInput {
  id: string;                      // uuid for keying each property card
  label: string;                   // e.g. "Property 1"
  property_type: PropertyType;
  gross_rent_received: number;
  expected_market_rent: number;
  municipal_taxes_paid: number;
  home_loan_interest: number;
}

export interface HousePropertyResult {
  property_type: string;
  gross_annual_value: number;
  municipal_taxes_paid: number;
  net_annual_value: number;
  standard_deduction_24a: number;
  interest_deduction_24b: number;
  hp_income_or_loss: number;
  can_setoff_against_salary: boolean;
  carryforward_years: number;
  notes: string[];
}

/** Per-property entry stored in context */
export interface HousePropertyEntry {
  input: HousePropertyInput;
  result: HousePropertyResult | null;
}

/** Aggregate totals across all properties — passed to /calculate/tax */
export interface HousePropertyAggregate {
  /** net HP income (positive only — losses not set-offable under new regime) */
  net_hp_income: number;
  /** total HP loss carry-forward */
  total_hp_loss: number;
  properties: HousePropertyEntry[];
}
