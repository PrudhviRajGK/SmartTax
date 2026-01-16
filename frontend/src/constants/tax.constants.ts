/**
 * Tax computation constants for FY 2024-25
 */

export const TAX_CONSTANTS = {
  STANDARD_DEDUCTION: 75_000,
  LTCG_EXEMPTION: 125_000,
  CESS_RATE: 0.04,
  CUTOFF_DATE: '2024-07-23',
} as const;

export const TAX_RATES = {
  STCG_BEFORE_CUTOFF: 0.15,
  STCG_AFTER_CUTOFF: 0.20,
  LTCG_BEFORE_CUTOFF: 0.10,
  LTCG_AFTER_CUTOFF: 0.125,
  EQUITY_MF_STCG: 0.20,
  EQUITY_MF_LTCG: 0.125,
} as const;

export const FILING_TYPES = {
  ITR1: 'ITR-1',
  ITR2: 'ITR-2',
} as const;

export const SECTION_STATUS = {
  INCOMPLETE: 'incomplete',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
} as const;
