/**
 * SmartTax — Section 234B & 234C Interest Calculator
 * FY 2024-25 (AY 2025-26)
 *
 * Place at: src/utils/interestCalc.ts
 */

// ── Filing date assumption: 31 July 2025 (standard due date for non-audit) ──
// User can override this.

export interface AdvanceTaxSchedule {
  quarter: string;
  dueDate: string;         // display
  dueDateMs: number;       // for comparison
  requiredCumPct: number;  // cumulative % of tax due by this date
}

export const ADVANCE_TAX_SCHEDULE: AdvanceTaxSchedule[] = [
  { quarter: 'Q1', dueDate: '15 Jun 2024', dueDateMs: new Date('2024-06-15').getTime(), requiredCumPct: 15 },
  { quarter: 'Q2', dueDate: '15 Sep 2024', dueDateMs: new Date('2024-09-15').getTime(), requiredCumPct: 45 },
  { quarter: 'Q3', dueDate: '15 Dec 2024', dueDateMs: new Date('2024-12-15').getTime(), requiredCumPct: 75 },
  { quarter: 'Q4', dueDate: '15 Mar 2025', dueDateMs: new Date('2025-03-15').getTime(), requiredCumPct: 100 },
];

export interface Calc234BResult {
  applicable: boolean;       // false if balance tax <= 10000
  balanceTax: number;        // totalTax - TDS
  monthsDelayed: number;     // Apr 1 to filing date
  interest234B: number;      // 1% per month, rounded up
  explanation: string;
}

export interface Calc234CQuarter {
  quarter: string;
  dueDate: string;
  required: number;          // required advance tax by this date
  paid: number;              // TDS paid so far (proxy — we use 0 for salaried)
  shortfall: number;
  interest: number;          // 1% for 3 months
}

export interface Calc234CResult {
  applicable: boolean;
  quarters: Calc234CQuarter[];
  total234C: number;
  explanation: string;
}

/**
 * Section 234B — Interest for default in payment of advance tax.
 * Applies if balance tax (totalTax - TDS) > ₹10,000.
 * Rate: 1% per month (or part thereof) from 1 Apr to date of filing.
 *
 * NOTE: For fully salaried employees where employer deducts TDS on salary,
 * 234B typically does NOT apply because TDS counts as advance tax.
 * It applies only when balance tax > ₹10,000 after TDS credit.
 */
export function calc234B(
  totalTax: number,
  tds: number,
  filingDate: Date = new Date('2025-07-31'),
): Calc234BResult {
  const balanceTax = Math.max(0, totalTax - tds);

  if (balanceTax <= 10_000) {
    return {
      applicable: false,
      balanceTax,
      monthsDelayed: 0,
      interest234B: 0,
      explanation: `Balance tax ₹${balanceTax.toLocaleString('en-IN')} ≤ ₹10,000 — Section 234B not applicable.`,
    };
  }

  const apr1 = new Date('2025-04-01');
  const msPerMonth = 30.44 * 24 * 60 * 60 * 1000;
  const rawMonths = (filingDate.getTime() - apr1.getTime()) / msPerMonth;
  const monthsDelayed = Math.ceil(rawMonths); // part month counts as full month
  const interest234B = Math.round(balanceTax * 0.01 * monthsDelayed);

  return {
    applicable: true,
    balanceTax,
    monthsDelayed,
    interest234B,
    explanation:
      `Balance tax ₹${balanceTax.toLocaleString('en-IN')} > ₹10,000. ` +
      `Interest @ 1%/month × ${monthsDelayed} months (Apr 2025 → filing date).`,
  };
}

/**
 * Section 234C — Deferment of advance tax instalments.
 * For salaried individuals: TDS deducted by employer is treated as advance tax paid.
 * We approximate advance tax paid by quarter as a proportion of annual TDS.
 *
 * In practice, most salaried employees get 234C waived because:
 * - Their TDS is deducted evenly across the year
 * - As long as each quarter's TDS ≥ required %, no shortfall
 *
 * For this calculator we show the honest picture:
 * - If TDS per quarter is insufficient for the required %, interest applies.
 */
export function calc234C(
  totalTax: number,
  tds: number,
  advanceTaxPaid: number = 0, // any self-paid advance tax (challan 280)
): Calc234CResult {
  const balanceTax = Math.max(0, totalTax - tds);

  if (balanceTax <= 10_000) {
    return {
      applicable: false,
      quarters: [],
      total234C: 0,
      explanation: 'Balance tax ≤ ₹10,000 — Section 234C not applicable.',
    };
  }

  // TDS is treated as advance tax distributed evenly across quarters
  // const totalAdvance = tds + advanceTaxPaid;
  // Assume TDS is proportional to quarter (each quarter = 25% of annual TDS)
  const tdsPerQuarter = tds / 4;

  const quarters: Calc234CQuarter[] = ADVANCE_TAX_SCHEDULE.map((q, i) => {
    // Cumulative TDS paid by end of this quarter
    const paidSoFar = tdsPerQuarter * (i + 1) + advanceTaxPaid;
    const required = totalTax * (q.requiredCumPct / 100);
    const shortfall = Math.max(0, required - paidSoFar);
    // 234C interest: 1% per month × 3 months on shortfall (Q4: 1 month)
    const months = q.quarter === 'Q4' ? 1 : 3;
    const interest = shortfall > 0 ? Math.round(shortfall * 0.01 * months) : 0;

    return {
      quarter: q.quarter,
      dueDate: q.dueDate,
      required: Math.round(required),
      paid: Math.round(paidSoFar),
      shortfall: Math.round(shortfall),
      interest,
    };
  });

  const total234C = quarters.reduce((s, q) => s + q.interest, 0);

  return {
    applicable: total234C > 0,
    quarters,
    total234C,
    explanation:
      total234C === 0
        ? 'TDS deducted by employer covers all advance tax instalments — Section 234C not applicable.'
        : `Advance tax shortfall detected across quarters. Total 234C interest: ₹${total234C.toLocaleString('en-IN')}.`,
  };
}
