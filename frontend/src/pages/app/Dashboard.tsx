import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useITR } from '../../contexts/ITRContext';

const Dashboard = () => {
  const { itr1State, itr2State } = useITR();

  const hasITR1Calculation = itr1State.calculated && itr1State.calculationResult !== null;
  const hasITR2Calculation = itr2State.calculated && itr2State.calculationResult !== null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[32px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight mb-2">
            Overview
          </h1>
          <p className="text-[15px] text-[rgb(var(--color-text-secondary))]">
            Your tax filing summary and status
          </p>
        </div>

        {/* Calculation Results */}
        {(hasITR1Calculation || hasITR2Calculation) ? (
          <div className="space-y-6 stagger-children">
            {/* ITR-1 Result */}
            {hasITR1Calculation && (
              <Card padding="lg" hover>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight">
                      ITR-1 Filing
                    </h2>
                    <p className="text-[13px] text-[rgb(var(--color-text-tertiary))] mt-1">
                      Last calculated: {formatDate(itr1State.lastCalculatedAt!)}
                    </p>
                  </div>
                  <Link
                    to="/app/itr-1/calculate"
                    className="text-[15px] text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-hover))] font-medium transition-colors"
                  >
                    View details →
                  </Link>
                </div>
              
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[13px] font-medium text-[rgb(var(--color-text-secondary))] mb-2">TDS Paid</p>
                    <p className="text-[24px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      ₹{formatCurrency(itr1State.calculationResult?.tdsAlreadyPaid ?? 0)}
                    </p>
                  </div>
                  <div className="p-5 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[13px] font-medium text-[rgb(var(--color-text-secondary))] mb-2">Effective Tax Rate</p>
                    <p className="text-[24px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      {itr1State.calculationResult?.effectiveRate ?? 0}%
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* ITR-2 Result */}
            {hasITR2Calculation && (
              <Card padding="lg" hover>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight">
                      ITR-2 Filing
                    </h2>
                    <p className="text-[13px] text-[rgb(var(--color-text-tertiary))] mt-1">
                      Last calculated: {formatDate(itr2State.lastCalculatedAt!)}
                    </p>
                  </div>
                  <Link
                    to="/app/itr-2/calculate"
                    className="text-[15px] text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-hover))] font-medium transition-colors"
                  >
                    View details →
                  </Link>
                </div>
              
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[12px] font-medium text-[rgb(var(--color-text-secondary))] mb-1.5">Salary + Debt MF</p>
                    <p className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      ₹{formatCurrency(itr2State.calculationResult?.finalTaxSummary?.salaryPlusDebtMfTax ?? itr2State.calculationResult?.salaryTax ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[12px] font-medium text-[rgb(var(--color-text-secondary))] mb-1.5">Stock Gains</p>
                    <p className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      ₹{formatCurrency(itr2State.calculationResult?.finalTaxSummary?.stockCapitalGainsTax ?? itr2State.calculationResult?.equityStockTax ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[12px] font-medium text-[rgb(var(--color-text-secondary))] mb-1.5">MF Equity</p>
                    <p className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      ₹{formatCurrency(itr2State.calculationResult?.finalTaxSummary?.mutualFundEquityTax ?? itr2State.calculationResult?.equityMfTax ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--color-accent))] rounded-lg border-2 border-[rgb(var(--color-accent))]">
                    <p className="text-[12px] font-medium text-white/80 mb-1.5">Total Liability</p>
                    <p className="text-[20px] font-semibold text-white metric-value">
                      ₹{formatCurrency(itr2State.calculationResult?.finalTaxSummary?.totalTaxLiability ?? itr2State.calculationResult?.totalTaxLiability ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Net Payable / Refund */}
                {itr2State.calculationResult?.netPayable !== undefined && (
                  <div>
                    {(itr2State.calculationResult.isRefund || itr2State.calculationResult.netPayable < 0) ? (
                      <div className="p-4 bg-[rgb(var(--color-success-bg))] rounded-lg border border-[rgb(var(--color-success))]">
                        <p className="text-[15px] font-semibold text-[rgb(var(--color-success))]">
                          Refund Due: ₹{formatCurrency(Math.abs(itr2State.calculationResult.netPayable))}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-[rgb(var(--color-error-bg))] rounded-lg border border-[rgb(var(--color-error))]">
                        <p className="text-[15px] font-semibold text-[rgb(var(--color-error))]">
                          Tax Payable: ₹{formatCurrency(itr2State.calculationResult.netPayable)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>
        ) : (
          /* No calculations yet */
          <Card padding="lg">
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
                <svg className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] mb-2 tracking-tight">
                No filings yet
              </h3>
              <p className="text-[15px] text-[rgb(var(--color-text-secondary))] mb-8 max-w-md mx-auto">
                Start your tax filing by choosing the appropriate ITR form based on your income sources
              </p>
            
              <div className="flex items-center justify-center gap-3">
                <Link
                  to="/app/itr-1/salary"
                  className="px-6 py-3 bg-[rgb(var(--color-accent))] text-white rounded-lg font-medium hover:bg-[rgb(var(--color-accent-hover))] transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] text-[15px]"
                >
                  Start ITR-1
                </Link>
                <Link
                  to="/app/itr-2/salary"
                  className="px-6 py-3 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))] rounded-lg font-medium hover:bg-[rgb(var(--color-bg-tertiary))] transition-all text-[15px]"
                >
                  Start ITR-2
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Form Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8 stagger-children">
          <Card padding="lg" hover>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[rgb(var(--color-accent-light))] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[rgb(var(--color-accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-[rgb(var(--color-text-primary))] mb-1.5 tracking-tight">ITR-1</h3>
                <p className="text-[14px] text-[rgb(var(--color-text-secondary))] leading-relaxed mb-3">
                  For individuals with salary income, one house property, and other sources
                </p>
                <Link 
                  to="/app/itr-1/salary" 
                  className="text-[14px] text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-hover))] font-medium inline-flex items-center gap-1 transition-colors"
                >
                  {hasITR1Calculation ? 'View filing' : 'Start filing'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </Card>

          <Card padding="lg" hover>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[rgb(var(--color-accent-light))] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[rgb(var(--color-accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-[rgb(var(--color-text-primary))] mb-1.5 tracking-tight">ITR-2</h3>
                <p className="text-[14px] text-[rgb(var(--color-text-secondary))] leading-relaxed mb-3">
                  For individuals with capital gains from equity stocks and mutual funds
                </p>
                <Link 
                  to="/app/itr-2/salary" 
                  className="text-[14px] text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-hover))] font-medium inline-flex items-center gap-1 transition-colors"
                >
                  {hasITR2Calculation ? 'View filing' : 'Start filing'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
