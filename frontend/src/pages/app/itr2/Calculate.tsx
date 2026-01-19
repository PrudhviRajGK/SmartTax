import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useITR } from '../../../contexts/ITRContext';
import { taxService } from '../../../services/tax.service';
import { formatDateTime } from '../../../utils/formatters';

const ITR2Calculate = () => {
  const navigate = useNavigate();
  const { itr2State, updateITR2, validateSalaryData } = useITR();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canCalculate = itr2State.review.status === 'complete';
  const result = itr2State.calculationResult;

  // Check if this is old data without cess field
  const isOldData = result && !result.finalTaxSummary?.cess && result.finalTaxSummary?.cess !== 0;

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
      const salaryData = itr2State.salary.data!;
      const grossSalary = salaryData.gross_salary || salaryData.salary || 0;
      const tdsPaid = salaryData.tds_paid || salaryData.deductions || 0;

      if (grossSalary === 0) {
        setError('Gross salary cannot be zero. Please re-upload Form-16.');
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
      });
      
      console.log('ITR2 Calculation Result:', calculationResult);
      console.log('Final Tax Summary:', calculationResult.finalTaxSummary);
      
      updateITR2('calculationResult', calculationResult);
      updateITR2('calculated', true);
      updateITR2('lastCalculatedAt', new Date().toISOString());
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate on mount if review is complete but not calculated
  useEffect(() => {
    if (canCalculate && !itr2State.calculated) {
      handleCalculate();
    }
  }, []);

  // Auto-recalculate if old data is detected
  useEffect(() => {
    if (isOldData && !loading) {
      console.log('Detected old calculation data, forcing recalculation...');
      handleCalculate();
    }
  }, [isOldData]);

  const formatCurrency = (value: number): string => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (isoString: string | null) => {
    return isoString ? formatDateTime(isoString) : 'Not calculated';
  };

  // Early returns for different states
  if (!canCalculate) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Calculate Tax</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-[rgb(var(--color-text-secondary))]">
              Please complete and review your data first
            </p>
            <Button onClick={() => navigate('/app/itr-2/review')} className="mt-4">
              Go to Review →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Calculate Tax</h1>
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--color-accent))] mx-auto mb-4"></div>
            <p className="text-[rgb(var(--color-text-secondary))]">Calculating your tax...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Calculate Tax</h1>
        <Card>
          <div className="p-4 bg-[rgb(var(--color-error-bg))] border border-[rgb(var(--color-error))] rounded-lg">
            <p className="text-sm text-[rgb(var(--color-error))]">{error}</p>
          </div>
          <Button onClick={handleCalculate} className="mt-4">
            Retry Calculation
          </Button>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Calculate Tax</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-[rgb(var(--color-text-secondary))]">No calculation result available</p>
            <Button onClick={handleCalculate} className="mt-4">
              Calculate Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Extract tax values with fallbacks for backward compatibility
  const salaryTax = result.finalTaxSummary?.salaryPlusDebtMfTax ?? result.salaryTax ?? 0;
  const stockTax = result.finalTaxSummary?.stockCapitalGainsTax ?? result.equityStockTax ?? 0;
  const equityMfTax = result.finalTaxSummary?.mutualFundEquityTax ?? result.equityMfTax ?? 0;
  const totalTaxLiability = result.finalTaxSummary?.totalTaxLiability ?? result.totalTaxLiability ?? 0;
  const netPayable = result.netPayable ?? 0;
  const isRefund = netPayable < 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight">
            Final Tax Summary
          </h1>
          <p className="text-[15px] text-[rgb(var(--color-text-secondary))] mt-1.5">
            Last calculated: {formatDate(itr2State.lastCalculatedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {isOldData && (
            <Button onClick={handleCalculate} disabled={loading} variant="primary">
              Update Calculation
            </Button>
          )}
          <Button onClick={handleCalculate} disabled={loading} variant="secondary">
            Recalculate
          </Button>
        </div>
      </div>

      {/* Tax Summary - 4 Column Layout */}
      <div className="grid grid-cols-4 gap-3">
        <Card padding="md" hover>
          <p className="text-[13px] text-[rgb(var(--color-text-secondary))] mb-1 font-medium">
            Salary + Debt MF Tax
          </p>
          <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] mb-2">
            (before cess)
          </p>
          <p className="text-[26px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
            {formatCurrency(salaryTax)}
          </p>
        </Card>
        
        <Card padding="md" hover>
          <p className="text-[13px] text-[rgb(var(--color-text-secondary))] mb-1 font-medium">
            Stock Capital Gains Tax
          </p>
          <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] mb-2">
            (before cess)
          </p>
          <p className="text-[26px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
            {formatCurrency(stockTax)}
          </p>
        </Card>
        
        <Card padding="md" hover>
          <p className="text-[13px] text-[rgb(var(--color-text-secondary))] mb-1 font-medium">
            Mutual Fund Equity Tax
          </p>
          <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] mb-2">
            (before cess)
          </p>
          <p className="text-[26px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
            {formatCurrency(equityMfTax)}
          </p>
        </Card>
        
        <div className="p-6 bg-[rgb(var(--color-accent))] border-2 border-[rgb(var(--color-accent))] rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-180">
          <p className="text-[13px] text-white/80 mb-2 font-medium">
            Total Tax Liability
          </p>
          <p className="text-[26px] font-semibold text-white metric-value">
            {formatCurrency(totalTaxLiability)}
          </p>
        </div>
      </div>

      {/* Cess Breakdown */}
      <Card className="bg-[rgb(var(--color-bg-tertiary))]">
        <div className="flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[rgb(var(--color-text-secondary))]">Total Income Tax (before cess):</span>
              <span className="ml-2 font-semibold text-[rgb(var(--color-text-primary))]">
                {formatCurrency(result.finalTaxSummary?.totalIncomeTaxBeforeCess ?? (salaryTax + stockTax + equityMfTax))}
              </span>
            </div>
            <div>
              <span className="text-[rgb(var(--color-text-secondary))]">+ Health & Education Cess (4%):</span>
              <span className="ml-2 font-semibold text-[rgb(var(--color-text-primary))]">
                {formatCurrency(result.finalTaxSummary?.cess ?? 0)}
              </span>
            </div>
          </div>
          <div>
            <span className="text-[rgb(var(--color-text-secondary))]">= Total Tax Liability:</span>
            <span className="ml-2 font-bold text-[rgb(var(--color-text-primary))] text-[16px]">
              {formatCurrency(totalTaxLiability)}
            </span>
          </div>
        </div>
      </Card>

      {/* Net Payable / Refund */}
      <Card className={`${isRefund ? 'bg-[rgb(var(--color-success-bg))] border-[rgb(var(--color-success))]' : 'bg-[rgb(var(--color-error-bg))] border-[rgb(var(--color-error))]'} border-2`}>
        <p className={`text-[17px] font-semibold ${isRefund ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]'}`}>
          {isRefund ? 'Refund Due' : 'Tax Payable'}: {formatCurrency(Math.abs(netPayable))}
        </p>
      </Card>

      {/* Equity Stocks Breakdown */}
      {(result.parsedStockGains || result.equityStocks) && (
        <Card className="space-y-6">
          <h3 className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight">
            Equity Stocks
          </h3>
          
          <div>
            <h4 className="text-[15px] font-medium text-[rgb(var(--color-text-secondary))] mb-3">
              Parsed Stock Gains
            </h4>
            <div className="p-4 bg-[rgb(var(--color-bg-tertiary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
              <pre className="text-[13px] text-[rgb(var(--color-text-primary))] overflow-auto font-mono">
{JSON.stringify(result.parsedStockGains || {
  stcg_before: result.equityStocks?.stcgBefore ?? 0,
  stcg_after: result.equityStocks?.stcgAfter ?? 0,
  ltcg_before: result.equityStocks?.ltcgBefore ?? 0,
  ltcg_after: result.equityStocks?.ltcgAfter ?? 0
}, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-medium text-[rgb(var(--color-text-secondary))] mb-3">
              Stock Tax Computation
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[rgb(var(--color-bg-tertiary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                <p className="text-[13px] text-[rgb(var(--color-text-secondary))] mb-1.5 font-medium">STCG Tax</p>
                <p className="text-[22px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.stockTaxComputation?.stcgTax ?? result.equityStocks?.stcgTax ?? 0)}
                </p>
              </div>
              <div className="p-4 bg-[rgb(var(--color-bg-tertiary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
                <p className="text-[13px] text-[rgb(var(--color-text-secondary))] mb-1.5 font-medium">LTCG Tax</p>
                <p className="text-[22px] font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.stockTaxComputation?.ltcgTax ?? result.equityStocks?.ltcgTax ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Mutual Funds Breakdown */}
      {(result.parsedMutualFundGains || result.mutualFunds) && (
        <Card className="space-y-6">
          <h3 className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight">
            Mutual Funds
          </h3>

          <div>
            <h4 className="text-[15px] font-medium text-[rgb(var(--color-text-secondary))] mb-3">
              Parsed Mutual Fund Gains
            </h4>
            <div className="p-4 bg-[rgb(var(--color-bg-tertiary))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
              <pre className="text-[13px] text-[rgb(var(--color-text-primary))] overflow-auto font-mono">
{JSON.stringify(result.parsedMutualFundGains || {
  equity_stcg: result.mutualFunds?.equityStcg ?? 0,
  equity_ltcg: result.mutualFunds?.equityLtcg ?? 0,
  debt_stcg: result.mutualFunds?.debtStcg ?? 0,
  debt_ltcg: result.mutualFunds?.debtLtcg ?? 0
}, null, 2)}
              </pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-[15px] font-medium text-[rgb(var(--color-text-secondary))] mb-3">
              Equity Mutual Funds
            </h4>
            <div className="space-y-2.5 text-[15px]">
              <div className="flex justify-between py-2">
                <span className="text-[rgb(var(--color-text-secondary))]">STCG:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.equityMutualFunds?.stcg ?? result.parsedMutualFundGains?.equity_stcg ?? result.mutualFunds?.equityStcg ?? 0)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[rgb(var(--color-text-secondary))]">LTCG:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.equityMutualFunds?.ltcg ?? result.parsedMutualFundGains?.equity_ltcg ?? result.mutualFunds?.equityLtcg ?? 0)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[rgb(var(--color-text-secondary))]">LTCG Exemption:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.equityMutualFunds?.ltcgExemption ?? 125000)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[rgb(var(--color-text-secondary))]">Taxable LTCG:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.equityMutualFunds?.taxableLtcg ?? result.mutualFunds?.equityTaxableLtcg ?? 0)}
                </span>
              </div>
              <div className="flex justify-between py-2.5 pt-3 border-t border-[rgb(var(--color-border))]">
                <span className="text-[rgb(var(--color-text-secondary))] font-medium">Equity MF Tax:</span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.equityMutualFunds?.equityMfTax ?? result.mutualFunds?.equityMfTax ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-medium text-[rgb(var(--color-text-secondary))] mb-2">
              Debt Mutual Funds
            </h4>
            <p className="text-[13px] text-[rgb(var(--color-text-tertiary))] mb-4 leading-relaxed">
              Debt mutual fund gains are added to income and taxed as per slab under the new regime.
            </p>
            <div className="space-y-2.5 text-[15px]">
              <div className="flex justify-between py-2">
                <span className="text-[rgb(var(--color-text-secondary))]">Debt MF STCG:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.debtMutualFunds?.debtStcg ?? result.parsedMutualFundGains?.debt_stcg ?? result.mutualFunds?.debtStcg ?? 0)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[rgb(var(--color-text-secondary))]">Debt MF LTCG:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.debtMutualFunds?.debtLtcg ?? result.parsedMutualFundGains?.debt_ltcg ?? result.mutualFunds?.debtLtcg ?? 0)}
                </span>
              </div>
              <div className="flex justify-between py-2.5 pt-3 border-t border-[rgb(var(--color-border))]">
                <span className="text-[rgb(var(--color-text-secondary))] font-medium">Added to Income:</span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))] metric-value">
                  {formatCurrency(result.debtMutualFunds?.addedToIncome ?? result.mutualFunds?.debtMfIncomeAddedToSalary ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={() => navigate('/app/itr-2/review')}>
          ← Back to Review
        </Button>
        <div className="space-x-2">
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/salary')}>
            Edit Salary
          </Button>
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/equity')}>
            Edit Equity
          </Button>
          <Button variant="secondary" onClick={() => navigate('/app/itr-2/mutual-funds')}>
            Edit MF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ITR2Calculate;
