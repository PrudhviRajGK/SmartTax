import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FileUpload } from '../../../components/ui/FileUpload';
import { useITR } from '../../../contexts/ITRContext';
import { taxService } from '../../../services/tax.service';

type Broker = 'groww' | 'zerodha';

const ITR2Equity = () => {
  const navigate = useNavigate();
  const { itr2State, updateITR2 } = useITR();
  const [broker, setBroker] = useState<Broker>('groww');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEquityUpload = async (file: File) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await taxService.parseEquity(file, broker);
      updateITR2('equity', { status: 'complete', data: result, broker });
      navigate('/app/itr-2/mutual-funds');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse equity report');
      updateITR2('equity', { status: 'in_progress' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-[28px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight">
          Equity Stock Gains
        </h1>
        <p className="text-[15px] text-[rgb(var(--color-text-secondary))] mt-1.5">
          Upload your equity trades report from your broker
        </p>
      </div>

      {error && (
        <Card className="bg-[rgb(var(--color-error-bg))] border-[rgb(var(--color-error))]">
          <p className="text-[15px] text-[rgb(var(--color-error))]">{error}</p>
        </Card>
      )}

      <Card>
        {/* Broker Selection Dropdown */}
        <div className="mb-6">
          <label htmlFor="broker-select" className="block text-[15px] font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Select Broker
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
            {broker === 'groww' 
              ? 'Groww parser will be used to process your equity trades report' 
              : 'Zerodha parser will be used to process your equity trades report'}
          </p>
        </div>

        {/* File Upload */}
        <FileUpload
          label="Equity Trades Report (Excel)"
          accept=".xlsx,.xls"
          onFileSelect={handleEquityUpload}
          description={`Upload your ${broker === 'groww' ? 'Groww' : 'Zerodha'} equity trades report in Excel format`}
        />
        
        {loading && (
          <div className="mt-6 flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-accent))]"></div>
            <span className="ml-3 text-[15px] text-[rgb(var(--color-text-secondary))]">
              Parsing {broker === 'groww' ? 'Groww' : 'Zerodha'} report...
            </span>
          </div>
        )}

        {itr2State.equity.status === 'complete' && itr2State.equity.data && (
          <div className="mt-6 p-4 bg-[rgb(var(--color-success-bg))] border border-[rgb(var(--color-success))] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[rgb(var(--color-success))]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-[15px] font-medium text-[rgb(var(--color-success))]">
                  Equity report uploaded successfully
                </p>
              </div>
              <Button onClick={() => navigate('/app/itr-2/mutual-funds')} size="sm">
                Continue →
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button onClick={() => navigate('/app/itr-2/salary')} variant="ghost">
          ← Back
        </Button>
        <Button onClick={() => navigate('/app/itr-2/mutual-funds')} variant="ghost">
          Skip (Optional) →
        </Button>
      </div>
    </div>
  );
};

export default ITR2Equity;
