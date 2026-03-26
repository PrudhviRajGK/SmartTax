import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FileUpload } from '../../../components/ui/FileUpload';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { useITR } from '../../../contexts/ITRContext';
import { useLang } from '../../../contexts/LanguageContext';
import { taxService } from '../../../services/tax.service';

const ITR1_FAQS = [
  {
    q: "What is Form-16?",
    a: "Form-16 is a TDS certificate issued by your employer each financial year. It contains your gross salary, standard deduction, and the TDS deducted on your behalf. SmartTax reads this automatically.",
  },
  {
    q: "What if my Form-16 has two parts?",
    a: "Upload Part-B (the salary breakdown). If you have both Part-A and Part-B in a single PDF, upload that combined file — our parser handles both formats.",
  },
  {
    q: "Which file format is accepted?",
    a: "Only PDF files are accepted for Form-16. If your employer gave you a password-protected PDF, you will need to remove the password before uploading.",
  },
  {
    q: "What is the ₹75,000 standard deduction?",
    a: "Under the New Tax Regime for FY 2024-25, every salaried individual gets a flat ₹75,000 deduction on gross salary. This is applied automatically — you don't need to enter it.",
  },
  {
    q: "What is Section 87A rebate?",
    a: "If your total taxable income is ₹12,00,000 or below under the New Regime, your entire income tax liability becomes zero (including cess). SmartTax checks and applies this automatically.",
  },
  {
    q: "I have capital gains under ₹1.25L. Do I need ITR-2?",
    a: "If your long-term capital gains from equity or equity mutual funds are within the ₹1.25L annual exemption, they are tax-free and need not be declared separately. ITR-1 may still be sufficient. Use ITR-2 if you have taxable gains beyond this exemption.",
  },
];

const ITR1Salary = () => {
  const navigate = useNavigate();
  const { itr1State, updateITR1 } = useITR();
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
        updateITR1('salary', { status: 'in_progress', data: null });
        return;
      }
      updateITR1('salary', { status: 'complete', data: salaryData });
      navigate('/app/itr-1/review');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse Form-16');
      updateITR1('salary', { status: 'in_progress', data: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('s1.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('s1.subtitle')}</p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError('')} />
      )}
        </div>
      )}

      {/* Two-column layout: upload left, FAQ right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* Left — Upload card (takes 2/3 width) */}
        <div className="xl:col-span-2">
          <Card>
            <FileUpload
              label={t('s1.upload_label')}
              accept=".pdf"
              onFileSelect={handleForm16Upload}
              description={t('s1.upload_desc')}
            />

            {loading && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">{t('s1.parsing')}</span>
              </div>
            )}

            {itr1State.salary.status === 'complete' && itr1State.salary.data && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">{t('s1.success')}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {t('common.gross_salary')}: ₹{(itr1State.salary.data.gross_salary || itr1State.salary.data.salary || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {t('common.tds_paid')}: ₹{(itr1State.salary.data.tds_paid || itr1State.salary.data.deductions || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Button onClick={() => navigate('/app/itr-1/review')} size="sm">
                    {t('s1.continue_review')}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* What we extract info strip */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Employer Name", desc: "Auto-detected from Form-16" },
              { label: "Gross Salary", desc: "Before standard deduction" },
              { label: "TDS Deducted", desc: "Pre-paid tax by employer" },
            ].map(item => (
              <div key={item.label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-600 text-gray-800 dark:text-gray-200 font-semibold">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — FAQ panel (takes 1/3 width) */}
        <div className="xl:col-span-1">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-700 text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">Frequently Asked</p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {ITR1_FAQS.map((faq, i) => (
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

          {/* ITR-1 quick rules card */}
          <div className="mt-4 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-4">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-3">ITR-1 applies if</p>
            <div className="space-y-2">
              {[
                "Salary is your only income source",
                "Total income is below ₹50 lakh",
                "No taxable capital gains beyond ₹1.25L LTCG",
                "At most one house property",
              ].map(rule => (
                <div key={rule} className="flex gap-2 items-start">
                  <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="6.5" fill="#dbeafe"/>
                    <path d="M4 6.5l2 2 3-3" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-blue-800 dark:text-blue-300 leading-snug">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ITR1Salary;
