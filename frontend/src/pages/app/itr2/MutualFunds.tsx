import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FileUpload } from '../../../components/ui/FileUpload';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { useITR } from '../../../contexts/ITRContext';
import { useLang } from '../../../contexts/LanguageContext';
import { taxService } from '../../../services/tax.service';

const ITR2MutualFunds = () => {
  const navigate = useNavigate();
  const { itr2State, updateITR2 } = useITR();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMFUpload = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const result = await taxService.parseMutualFund(file);
      updateITR2('mutualFunds', { status: 'complete', data: result });
      navigate('/app/itr-2/house-property');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse mutual fund report');
      updateITR2('mutualFunds', { status: 'in_progress' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-[28px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight">
          {t('mf.title')}
        </h1>
        <p className="text-[15px] text-[rgb(var(--color-text-secondary))] mt-1.5">{t('mf.subtitle')}</p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError('')} />
      )}

      <Card>
        <FileUpload
          label={t('mf.upload_label')}
          accept=".xlsx,.xls,.csv"
          onFileSelect={handleMFUpload}
          description={t('mf.upload_desc')}
        />
        {loading && (
          <div className="mt-6 flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-accent))]" />
            <span className="ml-3 text-[15px] text-[rgb(var(--color-text-secondary))]">{t('mf.parsing')}</span>
          </div>
        )}
        {itr2State.mutualFunds.status === 'complete' && itr2State.mutualFunds.data && (
          <div className="mt-6 p-4 bg-[rgb(var(--color-success-bg))] border border-[rgb(var(--color-success))] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[rgb(var(--color-success))]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-[15px] font-medium text-[rgb(var(--color-success))]">{t('mf.success')}</p>
              </div>
              <Button onClick={() => navigate('/app/itr-2/house-property')} size="sm">{t('common.continue')}</Button>
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button onClick={() => navigate('/app/itr-2/equity')} variant="ghost">{t('common.back')}</Button>
        <Button onClick={() => navigate('/app/itr-2/house-property')} variant="ghost">{t('common.skip')}</Button>
      </div>
    </div>
  );
};

export default ITR2MutualFunds;
