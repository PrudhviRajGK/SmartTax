import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useITR } from '../../../contexts/ITRContext';
import { useLang } from '../../../contexts/LanguageContext';

const ITR1Review = () => {
  const navigate = useNavigate();
  const { itr1State, updateITR1 } = useITR();
  const { t } = useLang();

  const canProceed = itr1State.salary.status === 'complete';

  const handleConfirm = () => {
    updateITR1('review', { status: 'complete' });
    navigate('/app/itr-1/calculate');
  };

  if (!canProceed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('r1.title')}</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{t('r1.incomplete')}</p>
            <Button onClick={() => navigate('/app/itr-1/salary')} className="mt-4">
              {t('r1.go_salary')}
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('r1.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('r1.subtitle')}</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('r1.salary_section')}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.gross_salary')}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              ₹{(salaryData?.gross_salary || salaryData?.salary || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.deductions')}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              ₹{(salaryData?.tds_paid || salaryData?.deductions || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex space-x-4">
        <Button onClick={() => navigate('/app/itr-1/salary')} variant="secondary">
          {t('r1.edit_salary')}
        </Button>
        <Button onClick={handleConfirm}>{t('r1.confirm')}</Button>
      </div>
    </div>
  );
};

export default ITR1Review;
