import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useITR } from '../../contexts/ITRContext';
import { useLang } from '../../contexts/LanguageContext';

const INR = (n: number) =>
  '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface HistoryCardProps {
  type: 'ITR-1' | 'ITR-2';
  calcResult: any;
  lastCalcAt: string;
  onDelete: () => void;
}

function HistoryCard({ type, calcResult, lastCalcAt, onDelete }: HistoryCardProps) {
  const { t } = useLang();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalTax = calcResult?.finalTaxSummary?.totalTaxLiability ?? 0;
  const netPayable = calcResult?.netPayable ?? 0;
  const isRefund = netPayable < 0;
  const salaryTax = calcResult?.finalTaxSummary?.salaryPlusDebtMfTax ?? 0;
  const stockTax = calcResult?.finalTaxSummary?.stockCapitalGainsTax ?? 0;
  const mfTax = calcResult?.finalTaxSummary?.mutualFundEquityTax ?? 0;
  const cess = calcResult?.finalTaxSummary?.cess ?? 0;
  const isITR2 = type === 'ITR-2';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all duration-200 ${
      isITR2 ? 'border-violet-500' : 'border-indigo-500'
    }`}>
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide ${
              isITR2
                ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'
                : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
            }`}>
              {type}
            </span>
            <span className="text-[13px] text-gray-400 dark:text-gray-500">
              {t('common.calculated_on')} {formatDate(lastCalcAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/app/${type.toLowerCase().replace('-', '-')}/calculate`}
              className="text-[13px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
            >
              {t('hist.view')} →
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title={t('hist.delete')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
              {t('hist.total_tax')}
            </p>
            <p className="text-[24px] font-bold text-gray-900 dark:text-white tabular-nums">
              {INR(totalTax)}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">incl. cess {INR(cess)}</p>
          </div>
          <div className={`p-3 rounded-xl ${
            isRefund
              ? 'bg-emerald-50 dark:bg-emerald-950/30'
              : 'bg-red-50 dark:bg-red-950/30'
          }`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
              isRefund ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
            }`}>
              {isRefund ? `${t('hist.refund')}` : `${t('hist.payable')}`}
            </p>
            <p className={`text-[22px] font-bold tabular-nums ${
              isRefund ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'
            }`}>
              {INR(Math.abs(netPayable))}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className={`grid gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 ${
          isITR2 ? 'grid-cols-3' : 'grid-cols-1'
        }`}>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">{t('hist.salary')}</p>
            <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-200 tabular-nums">{INR(salaryTax)}</p>
          </div>
          {isITR2 && (
            <>
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">{t('hist.stock')}</p>
                <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-200 tabular-nums">{INR(stockTax)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">{t('hist.mf')}</p>
                <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-200 tabular-nums">{INR(mfTax)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 bg-red-50 dark:bg-red-950/30 rounded-b-2xl">
          <p className="text-[14px] font-semibold text-red-600 dark:text-red-400 mb-1">
            {t('hist.confirm_delete')}
          </p>
          <p className="text-[13px] text-gray-500 mb-3">{t('hist.confirm_delete_sub')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-1.5 text-[13px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors"
            >
              {t('Cancel')}
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-1.5 text-[13px] bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              {t('hist.delete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main History Page ────────────────────────────────────────────────────────

const History = () => {
  const { t } = useLang();
  const { itr1State, itr2State, resetITR1, resetITR2 } = useITR();

  const entries: Array<{
    type: 'ITR-1' | 'ITR-2';
    calcResult: any;
    lastCalcAt: string;
    onDelete: () => void;
  }> = [];

  if (itr1State.calculated && itr1State.calculationResult && itr1State.lastCalculatedAt) {
    entries.push({
      type: 'ITR-1',
      calcResult: itr1State.calculationResult,
      lastCalcAt: itr1State.lastCalculatedAt,
      onDelete: resetITR1,
    });
  }
  if (itr2State.calculated && itr2State.calculationResult && itr2State.lastCalculatedAt) {
    entries.push({
      type: 'ITR-2',
      calcResult: itr2State.calculationResult,
      lastCalcAt: itr2State.lastCalculatedAt,
      onDelete: resetITR2,
    });
  }

  // Sort by most recent first
  entries.sort((a, b) => new Date(b.lastCalcAt).getTime() - new Date(a.lastCalcAt).getTime());

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))] pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
              {t('hist.title')}
            </h1>
            <p className="text-[14px] text-gray-400 dark:text-gray-500 mt-1">
              {t('hist.subtitle')}
            </p>
          </div>
          <Link
            to="/app/dashboard"
            className="text-[14px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
          >
            ← Back
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[18px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('hist.empty')}
            </p>
            <p className="text-[14px] text-gray-400 mb-6">{t('hist.empty_sub')}</p>
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-[14px] hover:bg-indigo-700 transition-colors"
            >
              Start Filing →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {entries.map(entry => (
              <HistoryCard key={entry.type} {...entry} />
            ))}
          </div>
        )}

        {/* Info note */}
        {entries.length > 0 && (
          <p className="text-center text-[12px] text-gray-400 mt-8">
            History is saved locally on this device. Clearing browser data will remove it.
          </p>
        )}
      </div>
    </div>
  );
};

export default History;
