import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useITR } from '../../../contexts/ITRContext';

const ITR1Review = () => {
  const navigate = useNavigate();
  const { itr1State, updateITR1 } = useITR();

  const canProceed = itr1State.salary.status === 'complete';

  const handleConfirm = () => {
    updateITR1('review', { status: 'complete' });
    navigate('/app/itr-1/calculate');
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
            <Button onClick={() => navigate('/app/itr-1/salary')} className="mt-4">
              Go to Salary →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const salaryData = itr1State.salary.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Review Data</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Verify your information before calculating tax
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Salary Income
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Gross Salary</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              ₹{salaryData?.salary?.toLocaleString('en-IN') || '0'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Deductions</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              ₹{salaryData?.deductions?.toLocaleString('en-IN') || '0'}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex space-x-4">
        <Button onClick={() => navigate('/app/itr-1/salary')} variant="secondary">
          ← Edit Salary
        </Button>
        <Button onClick={handleConfirm}>
          Confirm & Calculate →
        </Button>
      </div>
    </div>
  );
};

export default ITR1Review;
