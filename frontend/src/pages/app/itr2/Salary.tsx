// ─────────────────────────────────────────────────────────────────────────────
// ITR2 Salary.tsx  →  frontend/src/pages/app/itr2/Salary.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FileUpload } from '../../../components/ui/FileUpload';
import { useITR } from '../../../contexts/ITRContext';
import { useLang } from '../../../contexts/LanguageContext';
import { taxService } from '../../../services/tax.service';

const ITR2_FAQS = [
  {
    q: "Why is Form-16 needed for ITR-2?",
    a: "Even for ITR-2, salary income is declared using data from Form-16. The equity and mutual fund data is uploaded separately on the next pages. Start here with your Form-16 PDF.",
  },
  {
    q: "What documents will I need for all of ITR-2?",
    a: "Form-16 PDF (this page), equity trades Excel from Groww or Zerodha, mutual fund capital gains report in Excel/CSV, and property details for any house property income.",
  },
  {
    q: "What is the ₹75,000 standard deduction?",
    a: "Under the New Tax Regime for FY 2024-25, every salaried individual gets a flat ₹75,000 deduction on gross salary. Applied automatically — you do not need to enter it.",
  },
  {
    q: "What changes in STCG and LTCG rates after July 23, 2024?",
    a: "Budget 2024 changed STCG from 15% to 20%, and LTCG from 10% to 12.5% for equity assets sold after July 23, 2024. SmartTax splits your gains by sale date and applies the correct rate to each portion.",
  },
  {
    q: "What is the ₹1.25L LTCG exemption?",
    a: "Under Section 112A, the first ₹1,25,000 of long-term capital gains from equity shares and equity mutual funds (combined) each year is fully exempt. Applied automatically across all your reports.",
  },
  {
    q: "How is house property loss treated under New Regime?",
    a: "Under the New Tax Regime, House Property losses cannot be set off against salary in the same year. They carry forward for up to 8 years and can only be set off against future HP income (intra-head).",
  },
];

export const ITR2Salary = () => {
  const navigate = useNavigate();
  const { itr2State, updateITR2 } = useITR();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleForm16Upload = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const result = await taxService.parseForm16(file);
      const salaryData = {
        employer_name: result.employer_name || 'Unknown',
        salary: result.salary || result.gross_salary || 0,
        deductions: result.deductions || result.tds_paid || 0,
        gross_salary: result.gross_salary || result.salary || 0,
        tds_paid: result.tds_paid || result.deductions || 0,
      };
      if (salaryData.gross_salary === 0) {
        setError('Form-16 parsing failed: Gross salary is zero. Please check the PDF and try again.');
        updateITR2('salary', { status: 'in_progress', data: null });
        return;
      }
      updateITR2('salary', { status: 'complete', data: salaryData });
      navigate('/app/itr-2/equity');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse Form-16');
      updateITR2('salary', { status: 'in_progress', data: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('s2.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('s2.subtitle')}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ITR-2 step progress strip */}
      <div className="flex items-center gap-0 overflow-x-auto">
        {[
          { label: "Salary", step: 1, active: true },
          { label: "Equity", step: 2, active: false },
          { label: "Mutual Funds", step: 3, active: false },
          { label: "House Property", step: 4, active: false },
          { label: "Review", step: 5, active: false },
          { label: "Calculate", step: 6, active: false },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${s.active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-400 dark:text-gray-600'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${s.active ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>{s.step}</span>
              {s.label}
            </div>
            {i < 5 && <div className="w-4 h-px bg-gray-200 dark:bg-gray-700 mx-0.5" />}
          </div>
        ))}
      </div>

      {/* Two-column layout: upload left, FAQ right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* Left — Upload card */}
        <div className="xl:col-span-2">
          <Card>
            <FileUpload
              label={t('s2.upload_label')}
              accept=".pdf"
              onFileSelect={handleForm16Upload}
              description={t('s2.upload_desc')}
            />
            {loading && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">{t('s2.parsing')}</span>
              </div>
            )}
            {itr2State.salary.status === 'complete' && itr2State.salary.data && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">{t('s2.success')}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {t('common.gross_salary')}: ₹{(itr2State.salary.data.gross_salary || itr2State.salary.data.salary || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {t('common.tds_paid')}: ₹{(itr2State.salary.data.tds_paid || itr2State.salary.data.deductions || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Button onClick={() => navigate('/app/itr-2/equity')} size="sm">{t('common.continue')}</Button>
                </div>
              </div>
            )}
          </Card>

          {/* What we extract strip */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Employer Name", desc: "Auto-detected from Form-16" },
              { label: "Gross Salary", desc: "Before standard deduction" },
              { label: "TDS Deducted", desc: "Pre-paid tax by employer" },
            ].map(item => (
              <div key={item.label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Next steps preview */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">After this step, you will enter</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Equity Gains", "STCG and LTCG from Groww/Zerodha"],
                ["Mutual Fund Gains", "Equity and Debt MF capital gains"],
                ["House Property", "Income or loss from property"],
                ["Final Review", "Verify all figures before compute"],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — FAQ panel */}
        <div className="xl:col-span-1">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Frequently Asked</p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {ITR2_FAQS.map((faq, i) => (
                <div key={faq.q}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-4 py-3 flex justify-between items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{faq.q}</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}><path d="M6 9l6 6 6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ITR-2 key rules card */}
          <div className="mt-4 rounded-xl border border-violet-100 dark:border-violet-900 bg-violet-50 dark:bg-violet-950 p-4">
            <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wide mb-3">Key FY 2024-25 Rules</p>
            <div className="space-y-2">
              {[
                "₹75,000 standard deduction on salary",
                "STCG: 15% → 20% from Jul 23, 2024",
                "LTCG: 10% → 12.5% from Jul 23, 2024",
                "₹1.25L LTCG exemption (equity + equity MF)",
                "Debt MF gains taxed at slab rate",
                "HP losses cannot offset salary income",
              ].map(rule => (
                <div key={rule} className="flex gap-2 items-start">
                  <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="6.5" fill="#ede9fe"/>
                    <path d="M4 6.5l2 2 3-3" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-violet-800 dark:text-violet-300 leading-snug">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ITR2Salary;
