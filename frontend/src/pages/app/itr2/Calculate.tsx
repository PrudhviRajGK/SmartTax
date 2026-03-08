import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useITR } from '../../../contexts/ITRContext';
import { taxService } from '../../../services/tax.service';
import { formatDateTime } from '../../../utils/formatters';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INR = (n: number, decimals = 2) =>
  '₹' +
  Math.abs(n).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const PCT = (n: number) =>
  isNaN(n) || !isFinite(n) ? '0%' : `${n.toFixed(1)}%`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-3">
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

function WaterfallRow({
  label, value, indent = false, bold = false, highlight = false, negative = false, info,
}: {
  label: string; value: string; indent?: boolean; bold?: boolean;
  highlight?: boolean; negative?: boolean; info?: string;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div
      className={`flex items-center justify-between py-2.5 px-4 rounded-lg ${
        highlight
          ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800'
          : ''
      } ${indent ? 'ml-4' : ''}`}
    >
      <div className="flex items-center gap-2">
        {indent && (
          <span className="text-gray-300 dark:text-gray-600 text-xs select-none">└</span>
        )}
        <span
          className={`text-[14px] ${
            bold
              ? 'font-semibold text-gray-800 dark:text-gray-100'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {label}
        </span>
        {info && (
          <span className="relative">
            <button
              onMouseEnter={() => setTip(true)}
              onMouseLeave={() => setTip(false)}
              className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
            >
              ?
            </button>
            {tip && (
              <div className="absolute left-6 top-0 z-20 w-60 p-2.5 bg-gray-900 text-white text-[12px] rounded-lg shadow-xl leading-relaxed pointer-events-none">
                {info}
              </div>
            )}
          </span>
        )}
      </div>
      <span
        className={`text-[14px] font-semibold tabular-nums ${
          negative
            ? 'text-red-500'
            : bold
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-700 dark:text-gray-300'
        } ${highlight ? 'text-indigo-700 dark:text-indigo-300 text-[15px]' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

function SourceBar({
  label, amount, pct, color, sublabel,
}: {
  label: string; amount: number; pct: number; color: string; sublabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
          {sublabel && (
            <span className="text-gray-400 dark:text-gray-500 text-[11px]">({sublabel})</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 tabular-nums w-10 text-right">{PCT(pct)}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100 w-28 text-right tabular-nums">
            {INR(amount)}
          </span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${Math.max(pct, pct > 0 ? 1 : 0)}%` }}
        />
      </div>
    </div>
  );
}

// ─── HP payload builder ───────────────────────────────────────────────────────

function buildHpPayload(itr2State: any) {
  const agg = itr2State.houseProperty?.aggregate;
  if (!agg || agg.properties.length === 0 || agg.net_hp_income === 0) {
    return {
      hp_property_type: 'SOP',
      hp_gross_rent_received: 0,
      hp_expected_market_rent: 0,
      hp_municipal_taxes_paid: 0,
      hp_home_loan_interest: 0,
    };
  }
  const nav = agg.net_hp_income / 0.7;
  return {
    hp_property_type: 'LOP',
    hp_gross_rent_received: nav,
    hp_expected_market_rent: nav,
    hp_municipal_taxes_paid: 0,
    hp_home_loan_interest: 0,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

const ITR2Calculate = () => {
  const navigate = useNavigate();
  const { itr2State, updateITR2, validateSalaryData } = useITR();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canCalculate = itr2State.review.status === 'complete';
  const result = itr2State.calculationResult;
  const isOldData =
    result && !result.finalTaxSummary?.cess && result.finalTaxSummary?.cess !== 0;

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    const validation = validateSalaryData('itr2');
    if (!validation.isValid) {
      setError(validation.error || 'Invalid salary data');
      setLoading(false);
      return;
    }
    try {
      const sd = itr2State.salary.data!;
      const grossSalary = sd.gross_salary || sd.salary || 0;
      const tdsPaid = sd.tds_paid || sd.deductions || 0;
      if (grossSalary === 0) {
        setError('Gross salary cannot be zero.');
        setLoading(false);
        return;
      }
      const calculationResult = await taxService.calculateTax({
        gross_salary: grossSalary,
        tds_paid: tdsPaid,
        stcg_before: itr2State.equity.data?.stcg_before ?? 0,
        stcg_after: itr2State.equity.data?.stcg_after ?? 0,
        ltcg_before: itr2State.equity.data?.ltcg_before ?? 0,
        ltcg_after: itr2State.equity.data?.ltcg_after ?? 0,
        equity_stcg: itr2State.mutualFunds.data?.equity_stcg ?? 0,
        equity_ltcg: itr2State.mutualFunds.data?.equity_ltcg ?? 0,
        debt_stcg: itr2State.mutualFunds.data?.debt_stcg ?? 0,
        debt_ltcg: itr2State.mutualFunds.data?.debt_ltcg ?? 0,
        ...buildHpPayload(itr2State),
      });
      updateITR2('calculationResult', calculationResult);
      updateITR2('calculated', true);
      updateITR2('lastCalculatedAt', new Date().toISOString());
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canCalculate && !itr2State.calculated) handleCalculate();
  }, []);
  useEffect(() => {
    if (isOldData && !loading) handleCalculate();
  }, [isOldData]);

  // ── Guard states ─────────────────────────────────────────────────────────────

  if (!canCalculate)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Calculate Tax</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-[rgb(var(--color-text-secondary))] mb-4">
              Please complete and review your data first
            </p>
            <Button onClick={() => navigate('/app/itr-2/review')}>Go to Review →</Button>
          </div>
        </Card>
      </div>
    );

  if (loading)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Calculate Tax</h1>
        <Card>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" />
            <p className="text-[rgb(var(--color-text-secondary))] font-medium">
              Calculating your tax liability…
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Applying FY 2024-25 New Tax Regime rules
            </p>
          </div>
        </Card>
      </div>
    );

  if (error)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Calculate Tax</h1>
        <Card>
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
          <Button onClick={handleCalculate}>Retry Calculation</Button>
        </Card>
      </div>
    );

  if (!result)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Calculate Tax</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-[rgb(var(--color-text-secondary))] mb-4">No calculation result yet</p>
            <Button onClick={handleCalculate}>Calculate Now</Button>
          </div>
        </Card>
      </div>
    );

  // ── Extract values ───────────────────────────────────────────────────────────

  const sd = itr2State.salary.data!;
  const grossSalary = sd.gross_salary || sd.salary || 0;
  const tdsPaid = sd.tds_paid || sd.deductions || 0;
  const stdDeduction = 75_000;
  const hpNetIncome = itr2State.houseProperty?.aggregate?.net_hp_income ?? 0;
  const hpTotalLoss = itr2State.houseProperty?.aggregate?.total_hp_loss ?? 0;
  const debtMfIncome = result.debtMutualFunds?.addedToIncome ?? 0;
  const taxableIncome = Math.max(0, grossSalary - stdDeduction + hpNetIncome + debtMfIncome);

  const salaryTax = result.finalTaxSummary?.salaryPlusDebtMfTax ?? 0;
  const stockTax = result.finalTaxSummary?.stockCapitalGainsTax ?? 0;
  const equityMfTax = result.finalTaxSummary?.mutualFundEquityTax ?? 0;
  const totalBeforeCess =
    result.finalTaxSummary?.totalIncomeTaxBeforeCess ?? salaryTax + stockTax + equityMfTax;
  const cess = result.finalTaxSummary?.cess ?? 0;
  const totalTax = result.finalTaxSummary?.totalTaxLiability ?? 0;
  const netPayable = result.netPayable ?? 0;
  const isRefund = netPayable < 0;

  const salaryPct = totalBeforeCess > 0 ? (salaryTax / totalBeforeCess) * 100 : 0;
  const stockPct = totalBeforeCess > 0 ? (stockTax / totalBeforeCess) * 100 : 0;
  const mfPct = totalBeforeCess > 0 ? (equityMfTax / totalBeforeCess) * 100 : 0;
  const effectiveRate = taxableIncome > 0 ? (salaryTax / taxableIncome) * 100 : 0;

  const stcgBefore = result.parsedStockGains?.stcg_before ?? 0;
  const stcgAfter = result.parsedStockGains?.stcg_after ?? 0;
  const ltcgBefore = result.parsedStockGains?.ltcg_before ?? 0;
  const ltcgAfter = result.parsedStockGains?.ltcg_after ?? 0;
  const stcgTax = result.stockTaxComputation?.stcgTax ?? 0;
  const ltcgTax = result.stockTaxComputation?.ltcgTax ?? 0;

  const eqStcg = result.equityMutualFunds?.stcg ?? 0;
  const eqLtcg = result.equityMutualFunds?.ltcg ?? 0;
  const eqTaxableLtcg = result.equityMutualFunds?.taxableLtcg ?? 0;
  const eqMfTax = result.equityMutualFunds?.equityMfTax ?? 0;
  const debtStcg = result.debtMutualFunds?.debtStcg ?? 0;
  const debtLtcg = result.debtMutualFunds?.debtLtcg ?? 0;

  const hpProperties = itr2State.houseProperty?.aggregate?.properties ?? [];
  const hasEquity = stcgBefore + stcgAfter + ltcgBefore + ltcgAfter !== 0;
  const hasMF = eqStcg + eqLtcg + debtStcg + debtLtcg !== 0;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-1 max-w-3xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight">
            Your Tax Summary
          </h1>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">
            FY 2024–25 &nbsp;·&nbsp; New Tax Regime &nbsp;·&nbsp; ITR-2 &nbsp;·&nbsp; Last
            calculated:{' '}
            {itr2State.lastCalculatedAt ? formatDateTime(itr2State.lastCalculatedAt) : '—'}
          </p>
        </div>
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="flex items-center gap-1.5 text-[13px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          ↻ Recalculate
        </button>
      </div>

      {/* HERO GRID */}
      <div className="grid grid-cols-3 gap-3">
        {/* Left 2×2 */}
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {/* Total liability */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Total Tax Liability
            </p>
            <p className="text-[28px] font-bold text-gray-900 dark:text-white tabular-nums">
              {INR(totalTax)}
            </p>
            <p className="text-[12px] text-gray-400 mt-1">incl. 4% cess ({INR(cess)})</p>
          </div>
          {/* Effective rate */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Effective Tax Rate
            </p>
            <p className="text-[28px] font-bold text-gray-900 dark:text-white">{PCT(effectiveRate)}</p>
            <p className="text-[12px] text-gray-400 mt-1">
              on taxable income {INR(taxableIncome, 0)}
            </p>
          </div>
          {/* Refund / payable */}
          <div
            className={`rounded-xl border-2 p-5 shadow-sm ${
              isRefund
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700'
            }`}
          >
            <p
              className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
                isRefund
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {isRefund ? 'Refund Due' : 'Tax Payable'}
            </p>
            <p
              className={`text-[28px] font-bold tabular-nums ${
                isRefund
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {INR(Math.abs(netPayable))}
            </p>
            <p
              className={`text-[12px] mt-1 ${
                isRefund ? 'text-emerald-500' : 'text-red-400'
              }`}
            >
              {isRefund
                ? 'Will be credited to your bank account'
                : 'Pay via Challan 280 before filing'}
            </p>
          </div>
          {/* TDS paid */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
              TDS Already Paid
            </p>
            <p className="text-[28px] font-bold text-gray-900 dark:text-white tabular-nums">
              {INR(tdsPaid)}
            </p>
            <p className="text-[12px] text-gray-400 mt-1">deducted by employer (Form-16)</p>
          </div>
        </div>

        {/* Right — TDS vs Tax mini chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex flex-col">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-4">
            TDS vs Tax Due
          </p>
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-gray-500">Tax Liability</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                  {INR(totalTax, 0)}
                </span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-gray-500">TDS Paid</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                  {INR(tdsPaid, 0)}
                </span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isRefund ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  style={{ width: `${Math.min((tdsPaid / Math.max(totalTax, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div
            className={`mt-4 p-2.5 rounded-lg text-center text-[12px] font-semibold ${
              isRefund
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
            }`}
          >
            {isRefund
              ? `Excess: ${INR(Math.abs(netPayable), 0)}`
              : `Still to pay: ${INR(netPayable, 0)}`}
          </div>
        </div>
      </div>

      {/* TAX SOURCE BREAKDOWN */}
      <SectionLabel>Where your tax comes from</SectionLabel>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <SourceBar
          label="Salary + Debt MF"
          amount={salaryTax}
          pct={salaryPct}
          color="bg-indigo-500"
          sublabel="slab tax"
        />
        <SourceBar
          label="Equity Stock Gains"
          amount={stockTax}
          pct={stockPct}
          color="bg-violet-500"
          sublabel="STCG + LTCG"
        />
        <SourceBar
          label="Equity Mutual Funds"
          amount={equityMfTax}
          pct={mfPct}
          color="bg-sky-500"
          sublabel="STCG + LTCG"
        />
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-500">Sub-total (before cess)</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
              {INR(totalBeforeCess)}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-500">+ Health &amp; Education Cess (4%)</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
              {INR(cess)}
            </span>
          </div>
          <div className="flex justify-between text-[14px] font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
            <span className="text-gray-800 dark:text-white">Total Tax Liability</span>
            <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">{INR(totalTax)}</span>
          </div>
        </div>
      </div>

      {/* SALARY WATERFALL */}
      <SectionLabel>Salary income → taxable income → tax</SectionLabel>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <p className="text-[13px] text-gray-400 leading-relaxed">
            Under the{' '}
            <strong className="text-gray-600 dark:text-gray-300">New Tax Regime</strong>, you
            get a flat ₹75,000 standard deduction. No 80C/HRA/NPS deductions are available.
          </p>
        </div>
        <div className="px-2 pb-4 space-y-0.5">
          <WaterfallRow
            label="Gross Salary (Form-16)"
            value={INR(grossSalary)}
            bold
            info="Your total CTC before any deductions, as reported by your employer in Form-16."
          />
          <WaterfallRow
            label="Less: Standard Deduction (Sec 16)"
            value={`− ${INR(stdDeduction)}`}
            indent
            negative
            info="Flat ₹75,000 standard deduction for all salaried individuals under New Regime (Budget 2024)."
          />
          {hpNetIncome > 0 && (
            <WaterfallRow
              label="Add: Net House Property Income"
              value={`+ ${INR(hpNetIncome)}`}
              indent
              info="Positive rental income (after 30% standard deduction and home loan interest) added to total income."
            />
          )}
          {debtMfIncome > 0 && (
            <WaterfallRow
              label="Add: Debt MF Gains (treated as income)"
              value={`+ ${INR(debtMfIncome)}`}
              indent
              info="Post Apr 2023, all debt mutual fund gains are taxed as normal income at your applicable slab rate."
            />
          )}
          <WaterfallRow
            label="Taxable Income (Salary Head)"
            value={INR(taxableIncome)}
            bold
            highlight
            info="Net income after deductions. Progressive slab tax is applied on this amount."
          />

          {/* Slab table */}
          <div className="mx-4 my-2 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-lg border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              New Regime Slabs
            </p>
            <div className="space-y-1 text-[12px]">
              {[
                { range: 'Up to ₹4,00,000', rate: '0%' },
                { range: '₹4,00,001 – ₹8,00,000', rate: '5%' },
                { range: '₹8,00,001 – ₹12,00,000', rate: '10%' },
                { range: '₹12,00,001 – ₹16,00,000', rate: '15%' },
                { range: '₹16,00,001 – ₹20,00,000', rate: '20%' },
                { range: '₹20,00,001 – ₹24,00,000', rate: '25%' },
                { range: 'Above ₹24,00,000', rate: '30%' },
              ].map((s) => (
                <div key={s.range} className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>{s.range}</span>
                  <span className="font-medium text-gray-600 dark:text-gray-300">{s.rate}</span>
                </div>
              ))}
            </div>
            {taxableIncome <= 1_200_000 && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Section 87A Rebate applied — income ≤ ₹12,00,000, full tax waived
              </div>
            )}
          </div>

          <WaterfallRow
            label="Tax on Salary + Debt MF (before cess)"
            value={INR(salaryTax)}
            bold
            highlight
            info="Tax after applying progressive slabs and Section 87A rebate (if income ≤ ₹12L)."
          />
        </div>
      </div>

      {/* EQUITY STOCKS */}
      {hasEquity && (
        <>
          <SectionLabel>Equity stocks — capital gains tax</SectionLabel>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3">
              <p className="text-[13px] text-gray-400 leading-relaxed">
                Tax rates changed on{' '}
                <strong className="text-gray-600 dark:text-gray-300">July 23, 2024</strong>{' '}
                (Budget 2024). STCG: 15% → 20%; LTCG: 10% → 12.5%. Your gains are split by date.
              </p>
            </div>
            <div className="px-2 pb-4 space-y-0.5">
              {stcgBefore !== 0 && (
                <WaterfallRow
                  label="STCG — before Jul 23, 2024"
                  value={INR(stcgBefore)}
                  indent
                  info="Short-term gains on equity held &lt;12 months, sold before Jul 23 2024. Taxed at 15%."
                />
              )}
              {stcgAfter !== 0 && (
                <WaterfallRow
                  label="STCG — after Jul 23, 2024"
                  value={INR(stcgAfter)}
                  indent
                  info="Short-term gains on equity held &lt;12 months, sold on/after Jul 23 2024. Taxed at 20%."
                />
              )}
              {ltcgBefore !== 0 && (
                <WaterfallRow
                  label="LTCG — before Jul 23, 2024"
                  value={INR(ltcgBefore)}
                  indent
                  info="Long-term gains on equity held 12+ months, sold before Jul 23 2024. Taxed at 10% after ₹1.25L exemption."
                />
              )}
              {ltcgAfter !== 0 && (
                <WaterfallRow
                  label="LTCG — after Jul 23, 2024"
                  value={INR(ltcgAfter)}
                  indent
                  info="Long-term gains on equity held 12+ months, sold on/after Jul 23 2024. Taxed at 12.5% after ₹1.25L exemption."
                />
              )}
              <WaterfallRow label="STCG Tax" value={INR(stcgTax)} bold />
              <WaterfallRow
                label="LTCG Tax"
                value={INR(ltcgTax)}
                bold
                info="₹1,25,000 annual exemption applied proportionally across pre/post-July gains."
              />
              <WaterfallRow
                label="Total Equity Stock Tax"
                value={INR(stockTax)}
                bold
                highlight
              />
            </div>
          </div>
        </>
      )}

      {/* MUTUAL FUNDS */}
      {hasMF && (
        <>
          <SectionLabel>Mutual funds — capital gains tax</SectionLabel>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3">
              <p className="text-[13px] text-gray-400 leading-relaxed">
                <strong className="text-gray-600 dark:text-gray-300">Equity MFs</strong> are
                taxed separately (STCG 20%, LTCG 12.5% after ₹1.25L exemption).{' '}
                <strong className="text-gray-600 dark:text-gray-300">Debt MFs</strong> (post
                Apr 2023) are added to income and taxed at your slab rate.
              </p>
            </div>
            <div className="px-2 pb-4 space-y-0.5">
              {(eqStcg + eqLtcg) > 0 && (
                <>
                  <WaterfallRow
                    label="Equity MF — STCG"
                    value={INR(eqStcg)}
                    indent
                    info="Short-term equity MF gains. Taxed at flat 20%."
                  />
                  <WaterfallRow
                    label="Equity MF — LTCG"
                    value={INR(eqLtcg)}
                    indent
                    info="Long-term equity MF gains before exemption."
                  />
                  <WaterfallRow
                    label="Less: LTCG Exemption (Sec 112A)"
                    value={`− ${INR(125_000)}`}
                    indent
                    negative
                    info="₹1,25,000 annual exemption on equity & equity MF LTCG combined. Shared with equity stocks."
                  />
                  <WaterfallRow
                    label="Taxable Equity MF LTCG"
                    value={INR(eqTaxableLtcg)}
                    bold
                  />
                  <WaterfallRow
                    label="Equity MF Tax"
                    value={INR(eqMfTax)}
                    bold
                    highlight
                  />
                </>
              )}
              {(debtStcg + debtLtcg) > 0 && (
                <>
                  <div className="mx-4 my-2 h-px bg-gray-100 dark:bg-gray-700" />
                  <WaterfallRow
                    label="Debt MF — STCG"
                    value={INR(debtStcg)}
                    indent
                    info="Added to income. Taxed at slab rate — no special flat rate applies."
                  />
                  <WaterfallRow
                    label="Debt MF — LTCG"
                    value={INR(debtLtcg)}
                    indent
                    info="Added to income. Indexation benefit removed post Apr 2023 — taxed at slab rate."
                  />
                  <WaterfallRow
                    label="Total added to Salary income"
                    value={INR(debtMfIncome)}
                    bold
                    info="This is included in the Salary waterfall above, increasing your taxable slab income."
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* HOUSE PROPERTY */}
      {hpProperties.length > 0 && (
        <>
          <SectionLabel>House property income / loss</SectionLabel>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3">
              <p className="text-[13px] text-gray-400 leading-relaxed">
                Under the{' '}
                <strong className="text-gray-600 dark:text-gray-300">New Regime</strong>, only{' '}
                <em>positive</em> HP income is added to your taxable income. HP losses{' '}
                <strong>cannot</strong> be set off against salary — only carried forward 8 years
                against future HP income.
              </p>
            </div>
            <div className="px-4 pb-4 space-y-3">
              {hpProperties.map((entry: any) => {
                if (!entry.result) return null;
                const r = entry.result;
                const isLoss = r.hp_income_or_loss < 0;
                return (
                  <div
                    key={entry.input.id}
                    className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-lg border border-gray-100 dark:border-gray-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                        {entry.input.label}
                        <span className="ml-2 text-[11px] font-normal text-gray-400">
                          (
                          {r.property_type === 'SOP'
                            ? 'Self-Occupied'
                            : r.property_type === 'LOP'
                            ? 'Let Out'
                            : 'Deemed Let Out'}
                          )
                        </span>
                      </span>
                      <span
                        className={`text-[13px] font-bold ${
                          isLoss ? 'text-red-500' : 'text-emerald-600'
                        }`}
                      >
                        {isLoss ? '− ' : '+ '}
                        {INR(Math.abs(r.hp_income_or_loss))}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] text-gray-500 dark:text-gray-400">
                      <span>GAV: {INR(r.gross_annual_value, 0)}</span>
                      <span>Municipal taxes: − {INR(r.municipal_taxes_paid, 0)}</span>
                      <span>NAV: {INR(r.net_annual_value, 0)}</span>
                      <span>Std deduction (30%): − {INR(r.standard_deduction_24a, 0)}</span>
                      <span className="col-span-2">
                        Home loan interest Sec 24(b): − {INR(r.interest_deduction_24b, 0)}
                      </span>
                    </div>
                    {isLoss && (
                      <p className="text-[11px] text-red-400">
                        ✗ Loss of {INR(Math.abs(r.hp_income_or_loss), 0)} cannot be set off
                        against salary &nbsp;·&nbsp; Carry forward {r.carryforward_years} years
                      </p>
                    )}
                  </div>
                );
              })}
              {hpNetIncome > 0 && (
                <WaterfallRow
                  label="Net HP Income added to taxable income"
                  value={INR(hpNetIncome)}
                  bold
                  highlight
                />
              )}
              {hpTotalLoss > 0 && (
                <WaterfallRow
                  label="Total HP Loss (carry forward only)"
                  value={`− ${INR(hpTotalLoss)}`}
                  negative
                  info="HP losses under New Regime cannot reduce your salary tax. Carry forward 8 years, usable only against future HP income."
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* FINAL RECONCILIATION */}
      <SectionLabel>Final tax reconciliation</SectionLabel>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-2 py-4 space-y-0.5">
          <WaterfallRow label="Tax on Salary + Debt MF" value={INR(salaryTax)} />
          <WaterfallRow label="Tax on Equity Stock Gains" value={INR(stockTax)} />
          <WaterfallRow label="Tax on Equity Mutual Funds" value={INR(equityMfTax)} />
          <WaterfallRow label="Sub-total (before cess)" value={INR(totalBeforeCess)} bold />
          <WaterfallRow
            label="Health & Education Cess (4%)"
            value={INR(cess)}
            indent
            info="4% cess on total income tax. Funds health and education schemes. Non-deductible."
          />
          <WaterfallRow label="Total Tax Liability" value={INR(totalTax)} bold highlight />
          <div className="mx-4 my-1 h-px bg-gray-200 dark:bg-gray-700" />
          <WaterfallRow
            label="Less: TDS Already Deducted (Form-16)"
            value={`− ${INR(tdsPaid)}`}
            negative
            info="Tax Deducted at Source by your employer throughout the year and deposited to the government."
          />
          <WaterfallRow
            label={isRefund ? 'Refund Due to You' : 'Balance Tax Payable'}
            value={INR(Math.abs(netPayable))}
            bold
            highlight
          />
        </div>

        {/* Action tip */}
        {!isRefund && netPayable > 0 ? (
          <div className="mx-6 mb-5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
            Pay <strong>{INR(netPayable)}</strong> as Self-Assessment Tax via{' '}
            <strong>Challan 280</strong> on the Income Tax e-filing portal before submitting
            your ITR to avoid interest charges under Sec 234B / 234C.
          </div>
        ) : (
          <div className="mx-6 mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[12px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
            Your refund of <strong>{INR(Math.abs(netPayable))}</strong> will be credited to
            your pre-validated bank account after ITR processing — typically within 30–45 days
            of filing.
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="secondary" onClick={() => navigate('/app/itr-2/review')}>
          ← Back to Review
        </Button>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/salary')}>
            Edit Salary
          </Button>
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/equity')}>
            Edit Equity
          </Button>
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/mutual-funds')}>
            Edit MF
          </Button>
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/house-property')}>
            Edit HP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ITR2Calculate;
