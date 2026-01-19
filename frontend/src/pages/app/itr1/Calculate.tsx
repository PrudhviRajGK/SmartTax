import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useITR } from '../../../contexts/ITRContext';
import { taxService } from '../../../services/tax.service';
import { formatDateTime } from '../../../utils/formatters';

const ITR1Calculate = () => {
  const navigate = useNavigate();
  const { itr1State, updateITR1, validateSalaryData } = useITR();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canCalculate = itr1State.review.status === 'complete';
  const result = itr1State.calculationResult;

  // Check if this is old data without cess field
  const isOldData = result && !result.finalTaxSummary?.cess && result.finalTaxSummary?.cess !== 0;

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    
    const validation = validateSalaryData('itr1');
    if (!validation.isValid) {
      setError(validation.error || 'Invalid salary data');
      setLoading(false);
      return;
    }

    try {
      const salaryData = itr1State.salary.data!;
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
        stcg_before: 0,
        stcg_after: 0,
        ltcg_before: 0,
        ltcg_after: 0,
        equity_stcg: 0,
        equity_ltcg: 0,
        debt_stcg: 0,
        debt_ltcg: 0,
      });
      
      console.log('ITR1 Calculation Result:', calculationResult);
      console.log('Final Tax Summary:', calculationResult.finalTaxSummary);
      
      updateITR1('calculationResult', calculationResult);
      updateITR1('calculated', true);
      updateITR1('lastCalculatedAt', new Date().toISOString());
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate on mount if review is complete but not calculated
  useEffect(() => {
    if (canCalculate && !itr1State.calculated) {
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

  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return '—';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Not calculated';
    return formatDateTime(isoString);
  };

  if (!canCalculate) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calculate Tax</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Please complete and review your data first
            </p>
            <Button onClick={() => navigate('/app/itr-1/review')} className="mt-4">
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calculate Tax</h1>
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Calculating your tax...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calculate Tax</h1>
        <Card>
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calculate Tax</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No calculation result available
            </p>
            <Button onClick={handleCalculate} className="mt-4">
              Calculate Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Extract values from backend response
  const salaryTaxBeforeCess = result.finalTaxSummary?.salaryPlusDebtMfTax ?? result.salaryTax ?? 0;
  const cess = result.finalTaxSummary?.cess ?? 0;
  const totalTaxLiability = result.finalTaxSummary?.totalTaxLiability ?? 0;
  const netPayable = result.netPayable ?? 0;

  console.log('Display values:', { salaryTaxBeforeCess, cess, totalTaxLiability, netPayable });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Final Tax Summary (New Regime)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last calculated: {formatDate(itr1State.lastCalculatedAt)}
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

      {/* Tax Summary - Simple Layout for ITR-1 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Salary Tax (before cess)</span>
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(salaryTaxBeforeCess)}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Health & Education Cess (4%)</span>
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(cess)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-medium text-gray-900 dark:text-gray-100">Total Tax Liability</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(totalTaxLiability)}
            </span>
          </div>
        </div>
      </Card>

      {/* Net Payable / Refund */}
      {netPayable < 0 ? (
        <Card className="p-6 bg-green-50 dark:bg-green-950 border-2 border-green-500">
          <p className="text-lg font-semibold text-green-900 dark:text-green-100">
            Refund Due: {formatCurrency(Math.abs(netPayable))}
          </p>
        </Card>
      ) : (
        <Card className="p-6 bg-red-50 dark:bg-red-950 border-2 border-red-500">
          <p className="text-lg font-semibold text-red-900 dark:text-red-100">
            Tax Payable: {formatCurrency(netPayable)}
          </p>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={() => navigate('/app/itr-1/review')}>
          ← Back to Review
        </Button>
        <Button variant="secondary" onClick={() => navigate('/app/itr-1/salary')}>
          Edit Salary Details
        </Button>
      </div>
    </div>
  );
};

export default ITR1Calculate;
