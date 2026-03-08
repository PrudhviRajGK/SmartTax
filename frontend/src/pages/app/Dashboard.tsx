import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useITR } from '../../contexts/ITRContext';
import { useLang } from '../../contexts/LanguageContext';

// ─── Eligibility Quiz ─────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  'quiz.q1','quiz.q2','quiz.q3','quiz.q4','quiz.q5',
  'quiz.q6','quiz.q7','quiz.q8','quiz.q9','quiz.q10',
];

function EligibilityQuiz({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const answer = (val: boolean) => {
    const next = [...answers, val];
    setAnswers(next);
    // Early exit: if Q2/Q3/Q4/Q5/Q6 → ITR-2 confirmed, skip remaining
    const needsITR2Early = val && [1,2,3,4,5].includes(step);
    if (needsITR2Early || step === QUIZ_QUESTIONS.length - 1) {
      setAnswers([...next, ...new Array(QUIZ_QUESTIONS.length - next.length).fill(false)]);
    } else if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
    }
  };

  const isDone = answers.length === QUIZ_QUESTIONS.length;
  const needsITR2 = answers[1] || answers[2] || answers[3] || answers[4] || answers[5] || answers[8];
  const noSalary  = answers[0] === false;
  const result    = noSalary ? 'neither' : needsITR2 ? 'itr2' : 'itr1';

  const retake = () => { setStep(0); setAnswers([]); };

  const RESULT_CONFIG = {
    itr1:    { icon: '✓', color: 'emerald', title: t('quiz.result_itr1'),    reason: t('quiz.result_itr1_reason'),    cta: t('itr1.cta'), path: '/app/itr-1/salary' },
    itr2:    { icon: '→', color: 'violet',  title: t('quiz.result_itr2'),    reason: t('quiz.result_itr2_reason'),    cta: t('itr2.cta'), path: '/app/itr-2/salary' },
    neither: { icon: '!', color: 'amber',   title: t('quiz.result_neither'), reason: t('quiz.result_neither_reason'), cta: t('quiz.consult_ca'), path: '/info' },
  };
  const cfg = isDone ? RESULT_CONFIG[result as keyof typeof RESULT_CONFIG] : null;

  // Progress: show step even if early-exited
  const displayStep = isDone ? QUIZ_QUESTIONS.length : step;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <h2 className="text-[18px] font-bold text-white">{t('quiz.title')}</h2>
          <p className="text-indigo-200 text-[13px] mt-0.5">{t('quiz.subtitle')}</p>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors text-lg leading-none"
        >×</button>

        <div className="p-6">
          {!isDone ? (
            <>
              {/* Progress */}
              <div className="flex gap-1 mb-5">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                ))}
              </div>
              <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide mb-2">
                Question {step + 1} of {QUIZ_QUESTIONS.length}
              </p>
              <p className="text-[17px] font-semibold text-gray-800 dark:text-white mb-2 leading-snug">
                {t(QUIZ_QUESTIONS[step])}
              </p>
              {/* Hint text */}
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mb-5 leading-relaxed">
                {t(`quiz.q${step+1}_hint`)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => answer(true)} className="py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-[15px] hover:border-indigo-500 hover:bg-indigo-100 transition-all">
                  {t('quiz.yes')}
                </button>
                <button onClick={() => answer(false)} className="py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-[15px] hover:border-gray-400 transition-all">
                  {t('quiz.no')}
                </button>
              </div>
              {/* Skip to result if already clear */}
              {step >= 1 && (
                <p className="text-center text-[11px] text-gray-400 mt-4 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => setAnswers([...answers, ...new Array(QUIZ_QUESTIONS.length - answers.length).fill(false)])}>
                  Skip remaining questions →
                </p>
              )}
            </>
          ) : cfg && (
            <div className="text-center py-2">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold
                ${cfg.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                  : cfg.color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600'}`}>
                {cfg.icon}
              </div>
              <h3 className={`text-[20px] font-bold mb-2
                ${cfg.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400'
                  : cfg.color === 'violet' ? 'text-violet-600 dark:text-violet-400'
                  : 'text-amber-600 dark:text-amber-400'}`}>
                {cfg.title}
              </h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{cfg.reason}</p>

              {/* Answer summary */}
              <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Your answers</p>
                {QUIZ_QUESTIONS.slice(0, Math.min(displayStep, 6)).map((qKey, i) => (
                  <div key={qKey} className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[11px] font-bold ${answers[i] ? 'text-indigo-500' : 'text-gray-400'}`}>{answers[i] ? 'Yes' : 'No'}</span>
                    <span className="text-[12px] text-gray-500 dark:text-gray-400">{t(qKey)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={retake} className="px-4 py-2 text-[14px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {t('quiz.retake')}
                </button>
                <button
                  onClick={() => { onClose(); navigate(cfg.path); }}
                  className={`px-6 py-2.5 rounded-xl text-white font-semibold text-[14px] transition-all
                    ${cfg.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700'
                      : cfg.color === 'violet' ? 'bg-violet-600 hover:bg-violet-700'
                      : 'bg-amber-600 hover:bg-amber-700'}`}
                >{cfg.cta} →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ITR Card — NO history preview ────────────────────────────────────────────

interface ITRCardProps {
  type: 'itr1' | 'itr2';
  hasSalary: boolean;
  hasCalc: boolean;
}

function ITRCard({ type, hasSalary, hasCalc }: ITRCardProps) {
  const { t } = useLang();
  const isITR2 = type === 'itr2';

  const ctaLabel = hasCalc
    ? t(`${type}.cta_view`)
    : hasSalary
    ? t(`${type}.cta_resume`)
    : t(`${type}.cta`);

  const urlType  = type === 'itr1' ? 'itr-1' : 'itr-2';
  const ctaLink  = hasCalc ? `/app/${urlType}/calculate` : `/app/${urlType}/salary`;

  return (
    <div className={`relative rounded-2xl border-2 overflow-hidden shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col
      ${isITR2
        ? 'border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-gray-900'
        : 'border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900'
      }`}>

      <div className="p-7 flex flex-col flex-1">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">
            {t(`${type}.title`)}
          </h2>
          <p className={`text-[13px] font-semibold mt-0.5 ${isITR2 ? 'text-violet-500' : 'text-indigo-500'}`}>
            {t(`${type}.tagline`)}
          </p>
        </div>

        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
          {t(`${type}.desc`)}
        </p>

        <div className="mb-5">
          <p className="text-[12px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            {t(`${type}.who`)}
          </p>
          <ul className="space-y-1.5">
            {[1,2,3,4].map(n => (
              <li key={n} className="text-[13px] text-gray-600 dark:text-gray-300">
                {t(`${type}.who${n}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Status indicator — only shows progress, NO tax result */}
        {(hasSalary || hasCalc) && (
          <div className={`mb-4 px-3 py-2 rounded-lg text-[12px] font-medium
            ${hasCalc
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}>
            {hasCalc ? 'Calculation complete — view full result on this page' : 'In progress — resume where you left off'}
          </div>
        )}

        <div className="mt-auto">
          <Link
            to={ctaLink}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[15px] text-white transition-all shadow-sm hover:shadow-md
              ${isITR2 ? 'bg-violet-600 hover:bg-violet-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {ctaLabel} →
          </Link>
        </div>
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

        {/* Hero — no FY badge */}
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[12px] font-semibold mb-4 uppercase tracking-wide">
            New Tax Regime · AY 2025-26
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

        {/* ITR Cards — equal height via flex */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <ITRCard type="itr1" hasSalary={hasITR1Salary} hasCalc={hasITR1Calc} />
          <ITRCard type="itr2" hasSalary={hasITR2Salary} hasCalc={hasITR2Calc} />
        </div>

        {/* Comparison table */}
        <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-5 text-center">
            ITR-1 vs ITR-2 — Key Differences
          </p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-3 text-[13px]">
            <span />
            <span className="text-center text-[11px] font-bold text-indigo-500 uppercase">ITR-1</span>
            <span className="text-center text-[11px] font-bold text-violet-500 uppercase">ITR-2</span>
            {COMPARISON_ROWS.map(row => (
              <React.Fragment key={row.feature}>
                <span className="text-gray-600 dark:text-gray-400 flex items-center">{row.feature}</span>
                <span className={`text-center font-semibold ${row.itr1 ? 'text-emerald-500' : 'text-red-400'}`}>
                  {row.itr1 ? '✓' : '✗'}
                </span>
                <span className={`text-center font-semibold ${row.itr2 ? 'text-emerald-500' : row.itr2note ? 'text-amber-500' : 'text-red-400'}`}>
                  {row.itr2 ? '✓' : row.itr2note ? `✗ (use ${row.itr2note})` : '✗'}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* History link only */}
        <div className="mt-6 text-center">
          <Link
            to="/app/history"
            className="inline-flex items-center gap-2 text-[14px] text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View full calculation history →
          </Link>
        </div>
      </div>

      {showQuiz && <EligibilityQuiz onClose={() => setShowQuiz(false)} />}
    </div>
  );
};

export default Dashboard;
