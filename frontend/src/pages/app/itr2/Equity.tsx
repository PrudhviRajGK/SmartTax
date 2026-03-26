import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FileUpload } from '../../../components/ui/FileUpload';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { useITR, type EquityUpload } from '../../../contexts/ITRContext';
import { useLang } from '../../../contexts/LanguageContext';
import { taxService } from '../../../services/tax.service';

type Broker = 'groww' | 'zerodha';

const ITR2Equity = () => {
  const navigate = useNavigate();
  const { itr2State, addEquityUpload, removeEquityUpload } = useITR();
  const { t } = useLang();
  const [broker, setBroker] = useState<Broker>('groww');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEquityUpload = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const result = await taxService.parseEquity(file, broker);
      const upload: EquityUpload = {
        broker,
        stcg_before: result.stcg_before || 0,
        stcg_after: result.stcg_after || 0,
        ltcg_before: result.ltcg_before || 0,
        ltcg_after: result.ltcg_after || 0,
        uploadedAt: new Date().toISOString(),
      };
      addEquityUpload(upload);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse equity report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-[28px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight">
          {t('eq.title')}
        </h1>
        <p className="text-[15px] text-[rgb(var(--color-text-secondary))] mt-1.5">{t('eq.subtitle')}</p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError('')} />
      )}

      <Card>
        <div className="mb-6">
          <label htmlFor="broker-select" className="block text-[15px] font-medium text-[rgb(var(--color-text-primary))] mb-2">
            {t('eq.broker_label')}
          </label>
          <select
            id="broker-select"
            value={broker}
            onChange={(e) => setBroker(e.target.value as Broker)}
            className="w-full px-4 py-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] text-[15px] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] focus:border-transparent transition-all"
          >
            <option value="groww">Groww</option>
            <option value="zerodha">Zerodha</option>
          </select>
          <p className="text-[13px] text-[rgb(var(--color-text-tertiary))] mt-2">
            {broker === 'groww' ? t('eq.broker_hint_groww') : t('eq.broker_hint_zerodha')}
          </p>
        </div>

        <FileUpload
          label={t('eq.upload_label')}
          accept=".xlsx,.xls"
          onFileSelect={handleEquityUpload}
          description={`Upload your ${broker === 'groww' ? 'Groww' : 'Zerodha'} equity trades report in Excel format`}
        />

        {loading && (
          <div className="mt-6 flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-accent))]" />
            <span className="ml-3 text-[15px] text-[rgb(var(--color-text-secondary))]">{t('eq.parsing')}</span>
          </div>
        )}

        {itr2State.equity.uploads.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-[15px] font-medium text-[rgb(var(--color-text-primary))]">
              Uploaded Reports ({itr2State.equity.uploads.length})
            </h3>
            {itr2State.equity.uploads.map((upload, index) => (
              <div
                key={index}
                className="p-4 bg-[rgb(var(--color-success-bg))] border border-[rgb(var(--color-success))] rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-[rgb(var(--color-success))]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-[15px] font-medium text-[rgb(var(--color-success))] capitalize">
                        {upload.broker}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[13px] text-[rgb(var(--color-text-secondary))]">
                      <div>STCG Before: ₹{upload.stcg_before.toLocaleString('en-IN')}</div>
                      <div>STCG After: ₹{upload.stcg_after.toLocaleString('en-IN')}</div>
                      <div>LTCG Before: ₹{upload.ltcg_before.toLocaleString('en-IN')}</div>
                      <div>LTCG After: ₹{upload.ltcg_after.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeEquityUpload(index)}
                    className="ml-4 p-2 text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error-bg))] rounded-lg transition-colors"
                    aria-label="Remove upload"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {itr2State.equity.data && (
              <div className="p-4 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-lg">
                <p className="text-[13px] font-medium text-[rgb(var(--color-text-primary))] mb-2">Total Aggregated:</p>
                <div className="grid grid-cols-2 gap-2 text-[13px] text-[rgb(var(--color-text-secondary))]">
                  <div>STCG Before: ₹{itr2State.equity.data.stcg_before.toLocaleString('en-IN')}</div>
                  <div>STCG After: ₹{itr2State.equity.data.stcg_after.toLocaleString('en-IN')}</div>
                  <div>LTCG Before: ₹{itr2State.equity.data.ltcg_before.toLocaleString('en-IN')}</div>
                  <div>LTCG After: ₹{itr2State.equity.data.ltcg_after.toLocaleString('en-IN')}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button onClick={() => navigate('/app/itr-2/salary')} variant="ghost">{t('common.back')}</Button>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/app/itr-2/mutual-funds')} variant="ghost">{t('common.skip')}</Button>
          {itr2State.equity.uploads.length > 0 && (
            <Button onClick={() => navigate('/app/itr-2/mutual-funds')}>{t('common.continue')}</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ITR2Equity;
