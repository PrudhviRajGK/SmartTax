import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useITR } from '../../contexts/ITRContext';
import { useLang } from '../../contexts/LanguageContext';

// ─── Eligibility Quiz ─────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = ['quiz.q1', 'quiz.q2', 'quiz.q3', 'quiz.q4'];

function EligibilityQuiz({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const answer = (val: boolean) => {
    const next = [...answers, val];
    setAnswers(next);
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
    }
  };

  const isDone = answers.length === QUIZ_QUESTIONS.length;
  // Q2/Q3/Q4 = stocks, multiple properties, income > 50L → ITR-2
  const needsITR2 = answers[1] || answers[2] || answers[3];
  const result = needsITR2 ? 'itr2' : 'itr1';

  const retake = () => { setStep(0); setAnswers([]); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <h2 className="text-[18px] font-bold text-white">{t('quiz.title')}</h2>
          <p className="text-indigo-200 text-[13px] mt-0.5">{t('quiz.subtitle')}</p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors text-lg leading-none"
        >
          ×
        </button>

        <div className="p-6">
          {!isDone ? (
            <>
              {/* Progress bar */}
              <div className="flex gap-1.5 mb-6">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i <= step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide mb-2">
                Question {step + 1} of {QUIZ_QUESTIONS.length}
              </p>
              <p className="text-[17px] font-semibold text-gray-800 dark:text-white mb-6 leading-snug">
                {t(QUIZ_QUESTIONS[step])}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => answer(true)}
                  className="py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-[15px] hover:border-indigo-500 hover:bg-indigo-100 transition-all"
                >
                  {t('quiz.yes')}
                </button>
                <button
                  onClick={() => answer(false)}
                  className="py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-[15px] hover:border-gray-400 transition-all"
                >
                  {t('quiz.no')}
                </button>
              </div>
            </>
          ) : (
            /* Result */
            <div className="text-center py-2">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl ${
                result === 'itr1'
                  ? 'bg-emerald-100 dark:bg-emerald-900/40'
                  : 'bg-violet-100 dark:bg-violet-900/40'
              }`}>
                {result === 'itr1' ? '✓' : '📊'}
              </div>
              <h3 className={`text-[20px] font-bold mb-2 ${
                result === 'itr1'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-violet-600 dark:text-violet-400'
              }`}>
                {t(`quiz.result_${result}`)}
              </h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                {t(`quiz.result_${result}_reason`)}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={retake}
                  className="px-4 py-2 text-[14px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {t('quiz.retake')}
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate(result === 'itr1' ? '/app/itr-1/salary' : '/app/itr-2/salary');
                  }}
                  className={`px-6 py-2.5 rounded-xl text-white font-semibold text-[14px] transition-all ${
                    result === 'itr1'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-violet-600 hover:bg-violet-700'
                  }`}
                >
                  {result === 'itr1' ? t('itr1.cta') : t('itr2.cta')} →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ITR Card ─────────────────────────────────────────────────────────────────

interface ITRCardProps {
  type: 'itr1' | 'itr2';
  hasCalc: boolean;
  hasSalary: boolean;
  calcResult: any;
  lastCalcAt: string | null;
}

function ITRCard({ type, hasCalc, hasSalary, calcResult, lastCalcAt }: ITRCardProps) {
  const { t } = useLang();
  const isITR2 = type === 'itr2';

  const totalTax = calcResult?.finalTaxSummary?.totalTaxLiability ?? 0;
  const netPayable = calcResult?.netPayable ?? 0;
  const isRefund = netPayable < 0;

  const INR = (n: number) =>
    '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const ctaLabel = hasCalc
    ? t(`${type}.cta_view`)
    : hasSalary
    ? t(`${type}.cta_resume`)
    : t(`${type}.cta`);

  const urlType = type === 'itr1' ? 'itr-1' : 'itr-2';
  const ctaLink = hasCalc
    ? `/app/${urlType}/calculate`
    : `/app/${urlType}/salary`;

  return (
    <div className={`relative rounded-2xl border-2 overflow-hidden shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
      isITR2
        ? 'border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-gray-900'
        : 'border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900'
    }`}>
      {/* FY badge */}
      <div className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
        isITR2
          ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400'
          : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
      }`}>
        {t('common.fy')}
      </div>

      <div className="p-7">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">
            {t(`${type}.title`)}
          </h2>
          <p className={`text-[13px] font-semibold mt-0.5 ${isITR2 ? 'text-violet-500' : 'text-indigo-500'}`}>
            {t(`${type}.tagline`)}
          </p>
        </div>

        {/* Description */}
        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
          {t(`${type}.desc`)}
        </p>

        {/* Who should file */}
        <div className="mb-5">
          <p className="text-[12px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            {t(`${type}.who`)}
          </p>
          <ul className="space-y-1.5">
            {[1, 2, 3, 4].map(n => (
              <li key={n} className="text-[13px] text-gray-600 dark:text-gray-300">
                {t(`${type}.who${n}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Calculation preview if exists */}
        {hasCalc && calcResult && (
          <div className="mb-5 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-100 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">
                Last:{' '}
                {lastCalcAt
                  ? new Date(lastCalcAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })
                  : '—'}
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">{INR(totalTax)}</span>
            </div>
            <div className={`text-[13px] font-semibold ${
              isRefund ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
            }`}>
              {isRefund
                ? `${t('hist.refund')}: ${INR(Math.abs(netPayable))}`
                : `${t('hist.payable')}: ${INR(netPayable)}`}
            </div>
            {isITR2 && (
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                {[
                  { label: t('hist.salary'), val: calcResult.finalTaxSummary?.salaryPlusDebtMfTax ?? 0 },
                  { label: t('hist.stock'),  val: calcResult.finalTaxSummary?.stockCapitalGainsTax ?? 0 },
                  { label: t('hist.mf'),     val: calcResult.finalTaxSummary?.mutualFundEquityTax ?? 0 },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] text-gray-400 leading-tight">{item.label}</p>
                    <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
                      {INR(item.val)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        <Link
          to={ctaLink}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[15px] text-white transition-all shadow-sm hover:shadow-md ${
            isITR2 ? 'bg-violet-600 hover:bg-violet-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {ctaLabel} →
        </Link>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const { t } = useLang();
  const { itr1State, itr2State } = useITR();
  const [showQuiz, setShowQuiz] = useState(false);

  const hasITR1Calc   = itr1State.calculated && itr1State.calculationResult !== null;
  const hasITR2Calc   = itr2State.calculated && itr2State.calculationResult !== null;
  const hasITR1Salary = itr1State.salary.status === 'complete';
  const hasITR2Salary = itr2State.salary.status === 'complete';

  const COMPARISON_ROWS = [
    { feature: 'Salary Income',               itr1: true,  itr2: true,  itr2note: '' },
    { feature: 'Equity Stocks / MF Gains',    itr1: false, itr2: true,  itr2note: '' },
    { feature: 'Multiple House Properties',   itr1: false, itr2: true,  itr2note: '' },
    { feature: 'Income above ₹50 lakh',       itr1: false, itr2: true,  itr2note: '' },
    { feature: 'Foreign Assets',              itr1: false, itr2: true,  itr2note: '' },
    { feature: 'Business Income',             itr1: false, itr2: false, itr2note: 'ITR-3' },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))] pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* Hero */}
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[12px] font-semibold mb-4 uppercase tracking-wide">
            🇮🇳 {t('common.fy')} · New Tax Regime
          </div>
          <h1 className="text-[36px] md:text-[42px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
            {t('dash.title')}
          </h1>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed mb-6">
            {t('dash.subtitle')}
          </p>
          <button
            onClick={() => setShowQuiz(true)}
            className="inline-flex items-center gap-1.5 text-[14px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-all"
          >
            {t('dash.not_sure')} <span>{t('dash.take_quiz')}</span>
          </button>
        </div>

        {/* ITR Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <ITRCard
            type="itr1"
            hasCalc={hasITR1Calc}
            hasSalary={hasITR1Salary}
            calcResult={itr1State.calculationResult}
            lastCalcAt={itr1State.lastCalculatedAt}
          />
          <ITRCard
            type="itr2"
            hasCalc={hasITR2Calc}
            hasSalary={hasITR2Salary}
            calcResult={itr2State.calculationResult}
            lastCalcAt={itr2State.lastCalculatedAt}
          />
        </div>

        {/* Comparison table */}
        <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-5 text-center">
            ITR-1 vs ITR-2 — Key Differences
          </p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-3 text-[13px]">
            {/* Header */}
            <span />
            <span className="text-center text-[11px] font-bold text-indigo-500 uppercase">ITR-1</span>
            <span className="text-center text-[11px] font-bold text-violet-500 uppercase">ITR-2</span>

            {COMPARISON_ROWS.map(row => (
              <React.Fragment key={row.feature}>
                <span className="text-gray-600 dark:text-gray-400 flex items-center">{row.feature}</span>
                <span className={`text-center font-semibold ${row.itr1 ? 'text-emerald-500' : 'text-red-400'}`}>
                  {row.itr1 ? '✓' : '✗'}
                </span>
                <span className={`text-center font-semibold ${
                  row.itr2 ? 'text-emerald-500' : row.itr2note ? 'text-amber-500' : 'text-red-400'
                }`}>
                  {row.itr2 ? '✓' : row.itr2note ? `✗ (use ${row.itr2note})` : '✗'}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* History link */}
        <div className="mt-6 text-center">
          <Link
            to="/app/history"
            className="inline-flex items-center gap-2 text-[14px] text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View calculation history →
          </Link>
        </div>
      </div>

      {showQuiz && <EligibilityQuiz onClose={() => setShowQuiz(false)} />}
    </div>
  );
};

export default Dashboard;
