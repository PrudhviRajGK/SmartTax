import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useITR } from '../../../contexts/ITRContext';
import { useLang } from '../../../contexts/LanguageContext';
import { taxService } from '../../../services/tax.service';
import { formatDateTime } from '../../../utils/formatters';

const INR = (n: number, decimals = 2) =>
  '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const PCT = (n: number) => (isNaN(n) || !isFinite(n) ? '0%' : `${n.toFixed(1)}%`);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-3">
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{children}</span>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

function WaterfallRow({ label, value, indent = false, bold = false, highlight = false, negative = false, info }: {
  label: string; value: string; indent?: boolean; bold?: boolean; highlight?: boolean; negative?: boolean; info?: string;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div className={`flex items-center justify-between py-2.5 px-4 rounded-lg ${highlight ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800' : ''} ${indent ? 'ml-4' : ''}`}>
      <div className="flex items-center gap-2">
        {indent && <span className="text-gray-300 dark:text-gray-600 text-xs select-none">└</span>}
        <span className={`text-[14px] ${bold ? 'font-semibold text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
        {info && (
          <span className="relative">
            <button onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)} className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">?</button>
            {tip && <div className="absolute left-6 top-0 z-20 w-60 p-2.5 bg-gray-900 text-white text-[12px] rounded-lg shadow-xl leading-relaxed pointer-events-none">{info}</div>}
          </span>
        )}
      </div>
      <span className={`text-[14px] font-semibold tabular-nums ${negative ? 'text-red-500' : bold ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'} ${highlight ? 'text-indigo-700 dark:text-indigo-300 text-[15px]' : ''}`}>{value}</span>
    </div>
  );
}

function SourceBar({ label, amount, pct, color, sublabel }: { label: string; amount: number; pct: number; color: string; sublabel?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
          {sublabel && <span className="text-gray-400 dark:text-gray-500 text-[11px]">({sublabel})</span>}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 tabular-nums w-10 text-right">{PCT(pct)}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100 w-28 text-right tabular-nums">{INR(amount)}</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.max(pct, pct > 0 ? 1 : 0)}%` }} />
      </div>
    </div>
  );
}

function buildHpPayload(itr2State: any) {
  const agg = itr2State.houseProperty?.aggregate;
  if (!agg || agg.properties.length === 0 || agg.net_hp_income === 0) {
    return { hp_property_type: 'SOP', hp_gross_rent_received: 0, hp_expected_market_rent: 0, hp_municipal_taxes_paid: 0, hp_home_loan_interest: 0 };
  }
  const nav = agg.net_hp_income / 0.7;
  return { hp_property_type: 'LOP', hp_gross_rent_received: nav, hp_expected_market_rent: nav, hp_municipal_taxes_paid: 0, hp_home_loan_interest: 0 };
}

const ITR2Calculate = () => {
  const navigate = useNavigate();
  const { itr2State, updateITR2, validateSalaryData } = useITR();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canCalculate = itr2State.review.status === 'complete';
  const result = itr2State.calculationResult;
  const isOldData = result && !result.finalTaxSummary?.cess && result.finalTaxSummary?.cess !== 0;

  const handleCalculate = async () => {
    setLoading(true); setError('');
    const validation = validateSalaryData('itr2');
    if (!validation.isValid) { setError(validation.error || 'Invalid salary data'); setLoading(false); return; }
    try {
      const sd = itr2State.salary.data!;
      const grossSalary = sd.gross_salary || sd.salary || 0;
      const tdsPaid = sd.tds_paid || sd.deductions || 0;
      if (grossSalary === 0) { setError('Gross salary cannot be zero.'); setLoading(false); return; }
      const calculationResult = await taxService.calculateTax({
        gross_salary: grossSalary, tds_paid: tdsPaid,
        stcg_before: itr2State.equity.data?.stcg_before ?? 0, stcg_after: itr2State.equity.data?.stcg_after ?? 0,
        ltcg_before: itr2State.equity.data?.ltcg_before ?? 0, ltcg_after: itr2State.equity.data?.ltcg_after ?? 0,
        equity_stcg: itr2State.mutualFunds.data?.equity_stcg ?? 0, equity_ltcg: itr2State.mutualFunds.data?.equity_ltcg ?? 0,
        debt_stcg: itr2State.mutualFunds.data?.debt_stcg ?? 0, debt_ltcg: itr2State.mutualFunds.data?.debt_ltcg ?? 0,
        ...buildHpPayload(itr2State),
      });
      updateITR2('calculationResult', calculationResult);
      updateITR2('calculated', true);
      updateITR2('lastCalculatedAt', new Date().toISOString());
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate tax');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (canCalculate && !itr2State.calculated) handleCalculate(); }, []);
  useEffect(() => { if (isOldData && !loading) handleCalculate(); }, [isOldData]);

  if (!canCalculate) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{t('c2.title')}</h1>
      <Card><div className="text-center py-12"><p className="text-[rgb(var(--color-text-secondary))] mb-4">{t('c2.complete_first')}</p><Button onClick={() => navigate('/app/itr-2/review')}>{t('c2.go_review')}</Button></div></Card>
    </div>
  );

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{t('c2.title')}</h1>
      <Card><div className="text-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" /><p className="text-[rgb(var(--color-text-secondary))] font-medium">{t('c2.calculating')}</p><p className="text-sm text-gray-400 mt-1">{t('c2.applying_rules')}</p></div></Card>
    </div>
  );

  if (error) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{t('c2.title')}</h1>
      <Card><div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg mb-4"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div><Button onClick={handleCalculate}>{t('c2.retry')}</Button></Card>
    </div>
  );

  if (!result) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{t('c2.title')}</h1>
      <Card><div className="text-center py-12"><p className="text-[rgb(var(--color-text-secondary))] mb-4">{t('c2.no_result')}</p><Button onClick={handleCalculate}>{t('c2.calc_now')}</Button></div></Card>
    </div>
  );

  // ── Extract values ──────────────────────────────────────────────────────────
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
  const totalBeforeCess = result.finalTaxSummary?.totalIncomeTaxBeforeCess ?? salaryTax + stockTax + equityMfTax;
  const cess = result.finalTaxSummary?.cess ?? 0;
  const totalTax = result.finalTaxSummary?.totalTaxLiability ?? 0;
  const netPayable = result.netPayable ?? 0;
  const isRefund = netPayable < 0;
  const salaryPct = totalBeforeCess > 0 ? (salaryTax / totalBeforeCess) * 100 : 0;
  const stockPct = totalBeforeCess > 0 ? (stockTax / totalBeforeCess) * 100 : 0;
  const mfPct = totalBeforeCess > 0 ? (equityMfTax / totalBeforeCess) * 100 : 0;
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
  // Effective rate = total tax / total gross income (salary head + all capital gains)
  const totalGrossIncome = taxableIncome
    + Math.max(0, stcgBefore) + Math.max(0, stcgAfter)
    + Math.max(0, ltcgBefore) + Math.max(0, ltcgAfter)
    + Math.max(0, eqStcg) + Math.max(0, eqLtcg)
    + Math.max(0, debtStcg) + Math.max(0, debtLtcg);
  const effectiveRate = totalGrossIncome > 0 ? (totalTax / totalGrossIncome) * 100 : 0;
  const hpProperties = itr2State.houseProperty?.aggregate?.properties ?? [];
  const hasEquity = stcgBefore + stcgAfter + ltcgBefore + ltcgAfter !== 0;
  const hasMF = eqStcg + eqLtcg + debtStcg + debtLtcg !== 0;

  const propTypeLabel = (type: string) => {
    if (type === 'SOP') return t('c2.self_occ');
    if (type === 'LOP') return t('c2.let_out');
    return t('c2.deemed_let_out');
  };

  return (
    <div className="space-y-1 max-w-3xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight">{t('c2.title')}</h1>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">
            {t('c2.subtitle')} &nbsp;·&nbsp; {t('common.calculated_on')}: {itr2State.lastCalculatedAt ? formatDateTime(itr2State.lastCalculatedAt) : '—'}
          </p>
        </div>
        <button onClick={handleCalculate} disabled={loading} className="flex items-center gap-1.5 text-[13px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50">
          {t('common.recalculate')}
        </button>
      </div>

      {/* HERO GRID */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{t('c2.total_tax')}</p>
            <p className="text-[28px] font-bold text-gray-900 dark:text-white tabular-nums">{INR(totalTax)}</p>
            <p className="text-[12px] text-gray-400 mt-1">{t('c2.incl_cess')} ({INR(cess)})</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{t('c2.eff_rate')}</p>
            <p className="text-[28px] font-bold text-gray-900 dark:text-white">{PCT(effectiveRate)}</p>
            <p className="text-[12px] text-gray-400 mt-1">{t('c2.on_taxable')} {INR(taxableIncome, 0)}</p>
          </div>
          <div className={`rounded-xl border-2 p-5 shadow-sm ${isRefund ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700'}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${isRefund ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {isRefund ? t('common.refund_due') : t('common.tax_payable')}
            </p>
            <p className={`text-[28px] font-bold tabular-nums ${isRefund ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>{INR(Math.abs(netPayable))}</p>
            <p className={`text-[12px] mt-1 ${isRefund ? 'text-emerald-500' : 'text-red-400'}`}>
              {isRefund ? t('c2.refund_bank') : t('c2.payable_challan')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{t('c2.tds_paid')}</p>
            <p className="text-[28px] font-bold text-gray-900 dark:text-white tabular-nums">{INR(tdsPaid)}</p>
            <p className="text-[12px] text-gray-400 mt-1">{t('c2.tds_employer')}</p>
          </div>
          {/* HP contribution tile — only shown if HP was entered */}
          {(hpNetIncome !== 0 || hpTotalLoss !== 0) && (
            <div className={`col-span-2 rounded-xl border-2 p-5 shadow-sm flex items-center justify-between ${hpNetIncome > 0 ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700' : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700'}`}>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${hpNetIncome > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}`}>
                  HOUSE PROPERTY
                </p>
                {hpNetIncome > 0 && (
                  <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                    + {INR(hpNetIncome, 0)}
                  </p>
                )}
                {hpTotalLoss > 0 && (
                  <p className="text-[22px] font-bold text-red-600 dark:text-red-400 tabular-nums">
                    − {INR(hpTotalLoss, 0)}
                  </p>
                )}
                <p className="text-[12px] mt-1 text-gray-400">
                  {hpNetIncome > 0 ? 'added to taxable income' : 'carry forward only — cannot set off salary'}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-[11px] font-medium px-3 py-1.5 rounded-lg ${hpNetIncome > 0 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
                  {hpNetIncome > 0 ? '↑ Increases tax base' : '↷ Carry fwd 8 years'}
                </div>
                {itr2State.houseProperty?.aggregate?.properties?.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1.5">{itr2State.houseProperty.aggregate.properties.length} propert{itr2State.houseProperty.aggregate.properties.length === 1 ? 'y' : 'ies'}</p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex flex-col">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-4">{t('c2.tds_vs_tax')}</p>
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-gray-500">{t('c2.tax_liability')}</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{INR(totalTax, 0)}</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full w-full" /></div>
            </div>
            <div>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-gray-500">{t('c2.tds_paid')}</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{INR(tdsPaid, 0)}</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isRefund ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${Math.min((tdsPaid / Math.max(totalTax, 1)) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
          <div className={`mt-4 p-2.5 rounded-lg text-center text-[12px] font-semibold ${isRefund ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
            {isRefund ? `${t('c2.excess')} ${INR(Math.abs(netPayable), 0)}` : `${t('c2.still_pay')} ${INR(netPayable, 0)}`}
          </div>
        </div>
      </div>

      {/* TAX SOURCE */}
      <SectionLabel>{t('c2.where_from')}</SectionLabel>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <SourceBar label={t('c2.salary_debt')} amount={salaryTax} pct={salaryPct} color="bg-indigo-500" sublabel={t('c2.slab_tax')} />
        <SourceBar label={t('c2.stock_gains')} amount={stockTax} pct={stockPct} color="bg-violet-500" sublabel={t('c2.stcg_ltcg')} />
        <SourceBar label={t('c2.eq_mf')} amount={equityMfTax} pct={mfPct} color="bg-sky-500" sublabel={t('c2.stcg_ltcg')} />
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
          <div className="flex justify-between text-[13px]"><span className="text-gray-500">{t('c2.subtotal')}</span><span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{INR(totalBeforeCess)}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-gray-500">{t('c2.cess_line')}</span><span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{INR(cess)}</span></div>
          <div className="flex justify-between text-[14px] font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
            <span className="text-gray-800 dark:text-white">{t('common.total_tax')}</span>
            <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">{INR(totalTax)}</span>
          </div>
        </div>
      </div>

      {/* SALARY WATERFALL */}
      <SectionLabel>{t('c2.salary_section')}</SectionLabel>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-3"><p className="text-[13px] text-gray-400 leading-relaxed">{t('c2.new_regime_note')}</p></div>
        <div className="px-2 pb-4 space-y-0.5">
          <WaterfallRow label={t('c2.gross_salary')} value={INR(grossSalary)} bold />
          <WaterfallRow label={t('c2.std_dedn')} value={`− ${INR(stdDeduction)}`} indent negative />
          {hpNetIncome > 0 && <WaterfallRow label={t('c2.add_hp')} value={`+ ${INR(hpNetIncome)}`} indent />}
          {debtMfIncome > 0 && <WaterfallRow label={t('c2.add_debt')} value={`+ ${INR(debtMfIncome)}`} indent />}
          <WaterfallRow label={t('c2.taxable_income')} value={INR(taxableIncome)} bold highlight />
          <div className="mx-4 my-2 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-lg border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('c2.slabs_title')}</p>
            <div className="space-y-1 text-[12px]">
              {[
                { range: 'Up to ₹4,00,000', rate: '0%' }, { range: '₹4,00,001 – ₹8,00,000', rate: '5%' },
                { range: '₹8,00,001 – ₹12,00,000', rate: '10%' }, { range: '₹12,00,001 – ₹16,00,000', rate: '15%' },
                { range: '₹16,00,001 – ₹20,00,000', rate: '20%' }, { range: '₹20,00,001 – ₹24,00,000', rate: '25%' },
                { range: 'Above ₹24,00,000', rate: '30%' },
              ].map(s => (
                <div key={s.range} className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>{s.range}</span><span className="font-medium text-gray-600 dark:text-gray-300">{s.rate}</span>
                </div>
              ))}
            </div>
            {taxableIncome <= 1_200_000 && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">{t('c2.rebate_87a')}</div>
            )}
          </div>
          <WaterfallRow label={t('c2.salary_tax_row')} value={INR(salaryTax)} bold highlight />
        </div>
      </div>

      {/* EQUITY */}
      {hasEquity && (
        <>
          <SectionLabel>{t('c2.equity_section')}</SectionLabel>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3"><p className="text-[13px] text-gray-400 leading-relaxed">{t('c2.equity_note')}</p></div>
            <div className="px-2 pb-4 space-y-0.5">
              {stcgBefore !== 0 && <WaterfallRow label={t('c2.stcg_before')} value={INR(stcgBefore)} indent />}
              {stcgAfter !== 0 && <WaterfallRow label={t('c2.stcg_after')} value={INR(stcgAfter)} indent />}
              {ltcgBefore !== 0 && <WaterfallRow label={t('c2.ltcg_before')} value={INR(ltcgBefore)} indent />}
              {ltcgAfter !== 0 && <WaterfallRow label={t('c2.ltcg_after')} value={INR(ltcgAfter)} indent />}
              <WaterfallRow label={t('c2.stcg_tax')} value={INR(stcgTax)} bold />
              <WaterfallRow label={t('c2.ltcg_tax')} value={INR(ltcgTax)} bold />
              <WaterfallRow label={t('c2.total_stock_tax')} value={INR(stockTax)} bold highlight />
            </div>
          </div>
        </>
      )}

      {/* MF */}
      {hasMF && (
        <>
          <SectionLabel>{t('c2.mf_section')}</SectionLabel>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3"><p className="text-[13px] text-gray-400 leading-relaxed">{t('c2.mf_note')}</p></div>
            <div className="px-2 pb-4 space-y-0.5">
              {(eqStcg + eqLtcg) > 0 && (
                <>
                  <WaterfallRow label={t('c2.eq_mf_stcg')} value={INR(eqStcg)} indent />
                  <WaterfallRow label={t('c2.eq_mf_ltcg')} value={INR(eqLtcg)} indent />
                  <WaterfallRow label={t('c2.ltcg_exemption')} value={`− ${INR(125_000)}`} indent negative />
                  <WaterfallRow label={t('c2.taxable_eq_ltcg')} value={INR(eqTaxableLtcg)} bold />
                  <WaterfallRow label={t('c2.eq_mf_tax')} value={INR(eqMfTax)} bold highlight />
                </>
              )}
              {(debtStcg + debtLtcg) > 0 && (
                <>
                  <div className="mx-4 my-2 h-px bg-gray-100 dark:bg-gray-700" />
                  <WaterfallRow label={t('c2.debt_stcg')} value={INR(debtStcg)} indent />
                  <WaterfallRow label={t('c2.debt_ltcg')} value={INR(debtLtcg)} indent />
                  <WaterfallRow label={t('c2.debt_added')} value={INR(debtMfIncome)} bold />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* HP */}
      {hpProperties.length > 0 && (
        <>
          <SectionLabel>{t('c2.hp_section')}</SectionLabel>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3"><p className="text-[13px] text-gray-400 leading-relaxed">{t('c2.hp_note')}</p></div>
            <div className="px-4 pb-4 space-y-3">
              {hpProperties.map((entry: any) => {
                if (!entry.result) return null;
                const r = entry.result;
                const isLoss = r.hp_income_or_loss < 0;
                return (
                  <div key={entry.input.id} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-lg border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                        {entry.input.label}
                        <span className="ml-2 text-[11px] font-normal text-gray-400">({propTypeLabel(r.property_type)})</span>
                      </span>
                      <span className={`text-[13px] font-bold ${isLoss ? 'text-red-500' : 'text-emerald-600'}`}>
                        {isLoss ? '− ' : '+ '}{INR(Math.abs(r.hp_income_or_loss))}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] text-gray-500 dark:text-gray-400">
                      <span>{t('c2.gav')} {INR(r.gross_annual_value, 0)}</span>
                      <span>{t('c2.muni_tax')} − {INR(r.municipal_taxes_paid, 0)}</span>
                      <span>{t('c2.nav')} {INR(r.net_annual_value, 0)}</span>
                      <span>{t('c2.std_dedn30')} − {INR(r.standard_deduction_24a, 0)}</span>
                      <span className="col-span-2">{t('c2.loan_int')} − {INR(r.interest_deduction_24b, 0)}</span>
                    </div>
                    {isLoss && (
                      <p className="text-[11px] text-red-400">
                        ✗ {t('c2.loss_carry').replace('{amt}', INR(Math.abs(r.hp_income_or_loss), 0)).replace('{n}', String(r.carryforward_years))}
                      </p>
                    )}
                  </div>
                );
              })}
              {hpNetIncome > 0 && <WaterfallRow label={t('c2.hp_net_added')} value={INR(hpNetIncome)} bold highlight />}
              {hpTotalLoss > 0 && <WaterfallRow label={t('c2.hp_loss_carry')} value={`− ${INR(hpTotalLoss)}`} negative />}
            </div>
          </div>
        </>
      )}

      {/* FINAL RECONCILIATION */}
      <SectionLabel>{t('c2.final_section')}</SectionLabel>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-2 py-4 space-y-0.5">
          <WaterfallRow label={t('c2.salary_row')} value={INR(salaryTax)} />
          <WaterfallRow label={t('c2.stock_row')} value={INR(stockTax)} />
          <WaterfallRow label={t('c2.mf_row')} value={INR(equityMfTax)} />
          <WaterfallRow label={t('c2.subtotal')} value={INR(totalBeforeCess)} bold />
          <WaterfallRow label={t('c2.cess_row')} value={INR(cess)} indent />
          <WaterfallRow label={t('common.total_tax')} value={INR(totalTax)} bold highlight />
          <div className="mx-4 my-1 h-px bg-gray-200 dark:bg-gray-700" />
          <WaterfallRow label={t('c2.less_tds')} value={`− ${INR(tdsPaid)}`} negative />
          <WaterfallRow label={isRefund ? t('c2.refund_label') : t('c2.payable_label')} value={INR(Math.abs(netPayable))} bold highlight />
        </div>
        {!isRefund && netPayable > 0 ? (
          <div className="mx-6 mb-5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
            {t('c2.challan_tip').replace('{amt}', INR(netPayable))}
          </div>
        ) : (
          <div className="mx-6 mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[12px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
            {t('c2.refund_tip').replace('{amt}', INR(Math.abs(netPayable)))}
          </div>
        )}
      </div>

      {/* NAV */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="secondary" onClick={() => navigate('/app/itr-2/review')}>{t('c2.back_review')}</Button>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/salary')}>{t('c2.edit_salary')}</Button>
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/equity')}>{t('c2.edit_equity')}</Button>
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/mutual-funds')}>{t('c2.edit_mf')}</Button>
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/house-property')}>{t('c2.edit_hp')}</Button>
        </div>
      </div>
    </div>
  );
};

export default ITR2Calculate;
