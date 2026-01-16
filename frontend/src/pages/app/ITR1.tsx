import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import { taxService } from '../../services/tax.service';

interface ParsedData {
  salary?: number;
  deductions?: number;
  [key: string]: any;
}

const ITR1 = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [taxResult, setTaxResult] = useState<any>(null);

  const handleForm16Upload = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const data = await taxService.parseForm16(file);
      setParsedData(data);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse Form-16');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!parsedData) return;
    setLoading(true);
    setError('');
    try {
      const result = await taxService.calculateTax({
        gross_salary: parsedData.salary || parsedData.gross_salary || 0,
        tds_paid: parsedData.deductions || parsedData.tds_paid || 0,
      });
      setTaxResult(result);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ITR-1</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          For individuals with salary income, one house property, and other sources
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                step >= s
                  ? 'bg-accent text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 ${
                  step > s ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Upload Documents
          </h2>
          <FileUpload
            label="Form-16 (PDF)"
            accept=".pdf"
            onFileSelect={handleForm16Upload}
            description="Upload your Form-16 PDF for automatic data extraction"
          />
          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Parsing document...</span>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Review */}
      {step === 2 && parsedData && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Review Parsed Data
          </h2>
          <div className="space-y-4 mb-6">
            {parsedData.employer_name && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Employer</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {parsedData.employer_name}
                </p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Gross Salary</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ₹{(parsedData.salary || parsedData.gross_salary || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">TDS Paid</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ₹{(parsedData.deductions || parsedData.tds_paid || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => setStep(1)} variant="secondary">
              Back
            </Button>
            <Button onClick={handleCalculate} disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate Tax'}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Results */}
      {step === 3 && taxResult && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Tax Calculation Results
          </h2>
          <div className="space-y-4">
            <div className="p-6 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tax Liability</p>
              <p className="text-3xl font-bold text-accent mt-2">
                ₹{(taxResult.totalTax || taxResult.taxPayable || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Taxable Income</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ₹{(taxResult.taxableIncome || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">TDS Already Paid</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ₹{(taxResult.tdsAlreadyPaid || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Effective Tax Rate</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {taxResult.effectiveRate || 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={() => { setStep(1); setParsedData(null); setTaxResult(null); }} variant="secondary">
              Start New Filing
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ITR1;
