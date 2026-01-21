import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useITR } from '../../contexts/ITRContext';
import { useState } from 'react';

const Dashboard = () => {
  const { itr1State, itr2State, resetITR1, resetITR2 } = useITR();
  const [showConfirmDialog, setShowConfirmDialog] = useState<'itr1' | 'itr2' | null>(null);

  const hasITR1Calculation = itr1State.calculated && itr1State.calculationResult !== null;
  const hasITR2Calculation = itr2State.calculated && itr2State.calculationResult !== null;

  const handleClearFiling = (type: 'itr1' | 'itr2') => {
    if (type === 'itr1') {
      resetITR1();
    } else {
      resetITR2();
    }
    setShowConfirmDialog(null);
  };

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
                  <div className="flex items-center gap-2">
                    <Link
                      to="/app/itr-1/calculate"
                      className="text-[15px] text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-hover))] font-medium transition-colors"
                    >
                      View details →
                    </Link>
                    <button
                      onClick={() => setShowConfirmDialog('itr1')}
                      className="p-2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error-bg))] rounded-lg transition-all"
                      aria-label="Clear ITR-1 filing"
                      title="Clear ITR-1 filing"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[13px] font-medium text-[rgb(var(--color-text-secondary))] mb-2">Salary Tax</p>
                    <p className="text-[24px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      ₹{formatCurrency(itr1State.calculationResult?.finalTaxSummary?.salaryPlusDebtMfTax ?? 0)}
                    </p>
                  </div>
                  <div className="p-5 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[13px] font-medium text-[rgb(var(--color-text-secondary))] mb-2">Cess (4%)</p>
                    <p className="text-[24px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      ₹{formatCurrency(itr1State.calculationResult?.finalTaxSummary?.cess ?? 0)}
                    </p>
                  </div>
                  <div className="p-5 bg-[rgb(var(--color-accent))] rounded-lg border-2 border-[rgb(var(--color-accent))]">
                    <p className="text-[13px] font-medium text-white/80 mb-2">Total Tax Liability</p>
                    <p className="text-[24px] font-semibold text-white metric-value">
                      ₹{formatCurrency(itr1State.calculationResult?.finalTaxSummary?.totalTaxLiability ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Net Payable / Refund for ITR-1 */}
                {itr1State.calculationResult?.netPayable !== undefined && (
                  <div className="mt-4">
                    {(itr1State.calculationResult.isRefund || itr1State.calculationResult.netPayable < 0) ? (
                      <div className="p-4 bg-[rgb(var(--color-success-bg))] rounded-lg border border-[rgb(var(--color-success))]">
                        <p className="text-[15px] font-semibold text-[rgb(var(--color-success))]">
                          Refund Due: ₹{formatCurrency(Math.abs(itr1State.calculationResult.netPayable))}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-[rgb(var(--color-error-bg))] rounded-lg border border-[rgb(var(--color-error))]">
                        <p className="text-[15px] font-semibold text-[rgb(var(--color-error))]">
                          Tax Payable: ₹{formatCurrency(itr1State.calculationResult.netPayable)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
                  <div className="flex items-center gap-2">
                    <Link
                      to="/app/itr-2/calculate"
                      className="text-[15px] text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-hover))] font-medium transition-colors"
                    >
                      View details →
                    </Link>
                    <button
                      onClick={() => setShowConfirmDialog('itr2')}
                      className="p-2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error-bg))] rounded-lg transition-all"
                      aria-label="Clear ITR-2 filing"
                      title="Clear ITR-2 filing"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[12px] font-medium text-[rgb(var(--color-text-secondary))] mb-0.5">Salary + Debt MF</p>
                    <p className="text-[9px] text-[rgb(var(--color-text-tertiary))] mb-1.5">(before cess)</p>
                    <p className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      ₹{formatCurrency(itr2State.calculationResult?.finalTaxSummary?.salaryPlusDebtMfTax ?? itr2State.calculationResult?.salaryTax ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[12px] font-medium text-[rgb(var(--color-text-secondary))] mb-0.5">Stock Gains</p>
                    <p className="text-[9px] text-[rgb(var(--color-text-tertiary))] mb-1.5">(before cess)</p>
                    <p className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      ₹{formatCurrency(itr2State.calculationResult?.finalTaxSummary?.stockCapitalGainsTax ?? itr2State.calculationResult?.equityStockTax ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                    <p className="text-[12px] font-medium text-[rgb(var(--color-text-secondary))] mb-0.5">MF Equity</p>
                    <p className="text-[9px] text-[rgb(var(--color-text-tertiary))] mb-1.5">(before cess)</p>
                    <p className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                      ₹{formatCurrency(itr2State.calculationResult?.finalTaxSummary?.mutualFundEquityTax ?? itr2State.calculationResult?.equityMfTax ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--color-accent))] rounded-lg border-2 border-[rgb(var(--color-accent))]">
                    <p className="text-[12px] font-medium text-white/80 mb-0.5">Total + Cess</p>
                    <p className="text-[9px] text-white/70 mb-1.5">(final liability)</p>
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--color-error-bg))] flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[rgb(var(--color-error))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[17px] font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    Clear {showConfirmDialog === 'itr1' ? 'ITR-1' : 'ITR-2'} Filing?
                  </h3>
                  <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    This will permanently delete all data including uploaded documents, calculations, and results. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmDialog(null)}
                >
                  Cancel
                </Button>
                <button
                  onClick={() => handleClearFiling(showConfirmDialog)}
                  className="px-5 py-2.5 bg-[rgb(var(--color-error))] text-white rounded-lg font-medium hover:bg-red-700 transition-all text-[15px]"
                >
                  Clear Filing
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
