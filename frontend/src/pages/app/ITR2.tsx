import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import { taxService } from '../../services/tax.service';

interface ParsedData {
  form16?: any;
  equity?: any;
  mutualFunds?: any;
}

const ITR2 = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData>({});
  const [taxResult, setTaxResult] = useState<any>(null);

  const handleForm16Upload = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const data = await taxService.parseForm16(file);
      setParsedData((prev) => ({ ...prev, form16: data }));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse Form-16');
    } finally {
      setLoading(false);
    }
  };

  const handleEquityUpload = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const data = await taxService.parseGroww(file);
      setParsedData((prev) => ({ ...prev, equity: data }));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse equity report');
    } finally {
      setLoading(false);
    }
  };

  const handleMFUpload = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const data = await taxService.parseMutualFund(file);
      setParsedData((prev) => ({ ...prev, mutualFunds: data }));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse mutual fund report');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const calculationData = {
        gross_salary: parsedData.form16?.salary || parsedData.form16?.gross_salary || 0,
        tds_paid: parsedData.form16?.deductions || parsedData.form16?.tds_paid || 0,
        stcg_before: parsedData.equity?.stcg_before || 0,
        stcg_after: parsedData.equity?.stcg_after || 0,
        ltcg_before: parsedData.equity?.ltcg_before || 0,
        ltcg_after: parsedData.equity?.ltcg_after || 0,
        equity_stcg: parsedData.mutualFunds?.equity_stcg || 0,
        equity_ltcg: parsedData.mutualFunds?.equity_ltcg || 0,
        debt_stcg: parsedData.mutualFunds?.debt_stcg || 0,
        debt_ltcg: parsedData.mutualFunds?.debt_ltcg || 0,
      };
      const result = await taxService.calculateTax(calculationData);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ITR-2</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          For individuals with capital gains from equity and mutual funds
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
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Upload Form-16
            </h2>
            <FileUpload
              label="Form-16 (PDF)"
              accept=".pdf"
              onFileSelect={handleForm16Upload}
              description="Upload your Form-16 PDF"
            />
            {parsedData.form16 && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">✓ Form-16 uploaded</p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Upload Equity Report
            </h2>
            <FileUpload
              label="Equity Report (Excel)"
              accept=".xlsx,.xls,.csv"
              onFileSelect={handleEquityUpload}
              description="Upload Groww or Zerodha equity report"
            />
            {parsedData.equity && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">✓ Equity report uploaded</p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Upload Mutual Fund Report
            </h2>
            <FileUpload
              label="Mutual Fund Report (Excel)"
              accept=".xlsx,.xls,.csv"
              onFileSelect={handleMFUpload}
              description="Upload mutual fund capital gains report"
            />
            {parsedData.mutualFunds && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">✓ Mutual fund report uploaded</p>
              </div>
            )}
          </Card>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Processing...</span>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!parsedData.form16 && !parsedData.equity && !parsedData.mutualFunds}
            >
              Continue to Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Review Data
          </h2>
          <div className="space-y-6">
            {parsedData.form16 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Salary Income</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gross Salary</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      ₹{(parsedData.form16.salary || parsedData.form16.gross_salary || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">TDS Paid</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      ₹{(parsedData.form16.deductions || parsedData.form16.tds_paid || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {parsedData.equity && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Equity Gains</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">STCG (After July 23)</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      ₹{(parsedData.equity.stcg || parsedData.equity.stcg_after || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">LTCG (After July 23)</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      ₹{(parsedData.equity.ltcg || parsedData.equity.ltcg_after || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {parsedData.mutualFunds && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Mutual Fund Gains</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Gains</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      ₹{parsedData.mutualFunds.totalGains?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 mt-6">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Salary Tax</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ₹{(taxResult.salaryTax || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Capital Gains Tax</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ₹{(taxResult.capitalGainsTax || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Effective Rate</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {taxResult.effectiveRate || 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => {
                setStep(1);
                setParsedData({});
                setTaxResult(null);
              }}
              variant="secondary"
            >
              Start New Filing
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ITR2;
