import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useITR } from '../../../contexts/ITRContext';

const ITR2Review = () => {
  const navigate = useNavigate();
  const { itr2State, updateITR2 } = useITR();

  const canProceed = itr2State.salary.status === 'complete';

  const handleConfirm = () => {
    // Mark review as complete to enable calculation
    updateITR2('review', { status: 'complete' });
    navigate('/app/itr-2/calculate');
  };

  if (!canProceed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Review</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Please complete the Salary section first
            </p>
            <Button onClick={() => navigate('/app/itr-2/salary')} className="mt-4">
              Go to Salary →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Review Data</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Verify all information before calculating tax
        </p>
      </div>

      {itr2State.salary.data && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Salary Income</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Gross Salary</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                ₹{itr2State.salary.data.salary?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {itr2State.equity.data && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Equity Gains</h2>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Raw Data (Debug):</p>
            <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
              {JSON.stringify(itr2State.equity.data, null, 2)}
            </pre>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">STCG</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                ₹{itr2State.equity.data.stcg?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">LTCG</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                ₹{itr2State.equity.data.ltcg?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {itr2State.mutualFunds.data && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Mutual Fund Gains</h2>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Raw Data (Debug):</p>
            <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
              {JSON.stringify(itr2State.mutualFunds.data, null, 2)}
            </pre>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Gains</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                ₹{itr2State.mutualFunds.data.totalGains?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex space-x-4">
        <Button onClick={() => navigate('/app/itr-2/salary')} variant="secondary">
          ← Edit Data
        </Button>
        <Button onClick={handleConfirm}>
          Confirm & Calculate →
        </Button>
      </div>
    </div>
  );
};

export default ITR2Review;
