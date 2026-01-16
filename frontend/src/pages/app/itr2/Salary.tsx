import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FileUpload } from '../../../components/ui/FileUpload';
import { useITR } from '../../../contexts/ITRContext';
import { taxService } from '../../../services/tax.service';

const ITR2Salary = () => {
  const navigate = useNavigate();
  const { itr2State, updateITR2 } = useITR();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleForm16Upload = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const result = await taxService.parseForm16(file);
      
      // Ensure we have the required fields with proper mapping
      const salaryData = {
        employer_name: result.employer_name || 'Unknown',
        salary: result.salary || result.gross_salary || 0,
        deductions: result.deductions || result.tds_paid || 0,
        gross_salary: result.gross_salary || result.salary || 0,
        tds_paid: result.tds_paid || result.deductions || 0,
      };

      // Validate that gross_salary is not zero
      if (salaryData.gross_salary === 0) {
        setError('Form-16 parsing failed: Gross salary is zero. Please check the PDF and try again.');
        updateITR2('salary', { status: 'in_progress', data: null });
        return;
      }

      updateITR2('salary', { status: 'complete', data: salaryData });
      navigate('/app/itr-2/equity');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse Form-16');
      updateITR2('salary', { status: 'in_progress', data: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Salary Income</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Upload your Form-16</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Card>
        <FileUpload
          label="Form-16 (PDF)"
          accept=".pdf"
          onFileSelect={handleForm16Upload}
          description="Upload your Form-16 PDF"
        />
        
        {loading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Parsing...</span>
          </div>
        )}

        {itr2State.salary.status === 'complete' && itr2State.salary.data && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">✓ Form-16 uploaded</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Gross Salary: ₹{(itr2State.salary.data.gross_salary || itr2State.salary.data.salary || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  TDS Paid: ₹{(itr2State.salary.data.tds_paid || itr2State.salary.data.deductions || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <Button onClick={() => navigate('/app/itr-2/equity')} size="sm">
                Continue →
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ITR2Salary;
