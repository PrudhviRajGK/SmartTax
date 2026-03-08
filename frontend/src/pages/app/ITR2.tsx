// import { useState } from 'react';
// import { Card } from '../../components/ui/Card';
// import { Button } from '../../components/ui/Button';
// import { FileUpload } from '../../components/ui/FileUpload';
// import { taxService } from '../../services/tax.service';

// interface ParsedData {
//   form16?: any;
//   equity?: any;
//   mutualFunds?: any;
// }

// const ITR2 = () => {
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [parsedData, setParsedData] = useState<ParsedData>({});
//   const [taxResult, setTaxResult] = useState<any>(null);

//   const handleForm16Upload = async (file: File) => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await taxService.parseForm16(file);
//       setParsedData((prev) => ({ ...prev, form16: data }));
//     } catch (err: any) {
//       setError(err.response?.data?.detail || 'Failed to parse Form-16');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEquityUpload = async (file: File) => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await taxService.parseGroww(file);
//       setParsedData((prev) => ({ ...prev, equity: data }));
//     } catch (err: any) {
//       setError(err.response?.data?.detail || 'Failed to parse equity report');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMFUpload = async (file: File) => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await taxService.parseMutualFund(file);
//       setParsedData((prev) => ({ ...prev, mutualFunds: data }));
//     } catch (err: any) {
//       setError(err.response?.data?.detail || 'Failed to parse mutual fund report');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCalculate = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const calculationData = {
//         gross_salary: parsedData.form16?.salary || parsedData.form16?.gross_salary || 0,
//         tds_paid: parsedData.form16?.deductions || parsedData.form16?.tds_paid || 0,
//         stcg_before: parsedData.equity?.stcg_before || 0,
//         stcg_after: parsedData.equity?.stcg_after || 0,
//         ltcg_before: parsedData.equity?.ltcg_before || 0,
//         ltcg_after: parsedData.equity?.ltcg_after || 0,
//         equity_stcg: parsedData.mutualFunds?.equity_stcg || 0,
//         equity_ltcg: parsedData.mutualFunds?.equity_ltcg || 0,
//         debt_stcg: parsedData.mutualFunds?.debt_stcg || 0,
//         debt_ltcg: parsedData.mutualFunds?.debt_ltcg || 0,
//       };
//       const result = await taxService.calculateTax(calculationData);
//       setTaxResult(result);
//       setStep(3);
//     } catch (err: any) {
//       setError(err.response?.data?.detail || 'Failed to calculate tax');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ITR-2</h1>
//         <p className="text-gray-600 dark:text-gray-400 mt-2">
//           For individuals with capital gains from equity and mutual funds
//         </p>
//       </div>

//       {/* Progress Steps */}
//       <div className="flex items-center justify-center space-x-4">
//         {[1, 2, 3].map((s) => (
//           <div key={s} className="flex items-center">
//             <div
//               className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
//                 step >= s
//                   ? 'bg-accent text-white'
//                   : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
//               }`}
//             >
//               {s}
//             </div>
//             {s < 3 && (
//               <div
//                 className={`w-16 h-1 ${
//                   step > s ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-800'
//                 }`}
//               />
//             )}
//           </div>
//         ))}
//       </div>

//       {error && (
//         <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
//           <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
//         </div>
//       )}

//       {/* Step 1: Upload */}
//       {step === 1 && (
//         <div className="space-y-6">
//           <Card>
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
//               Upload Form-16
//             </h2>
//             <FileUpload
//               label="Form-16 (PDF)"
//               accept=".pdf"
//               onFileSelect={handleForm16Upload}
//               description="Upload your Form-16 PDF"
//             />
//             {parsedData.form16 && (
//               <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
//                 <p className="text-sm text-green-600 dark:text-green-400">✓ Form-16 uploaded</p>
//               </div>
//             )}
//           </Card>

//           <Card>
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
//               Upload Equity Report
//             </h2>
//             <FileUpload
//               label="Equity Report (Excel)"
//               accept=".xlsx,.xls,.csv"
//               onFileSelect={handleEquityUpload}
//               description="Upload Groww or Zerodha equity report"
//             />
//             {parsedData.equity && (
//               <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
//                 <p className="text-sm text-green-600 dark:text-green-400">✓ Equity report uploaded</p>
//               </div>
//             )}
//           </Card>

//           <Card>
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
//               Upload Mutual Fund Report
//             </h2>
//             <FileUpload
//               label="Mutual Fund Report (Excel)"
//               accept=".xlsx,.xls,.csv"
//               onFileSelect={handleMFUpload}
//               description="Upload mutual fund capital gains report"
//             />
//             {parsedData.mutualFunds && (
//               <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
//                 <p className="text-sm text-green-600 dark:text-green-400">✓ Mutual fund report uploaded</p>
//               </div>
//             )}
//           </Card>

//           {loading && (
//             <div className="flex items-center justify-center py-4">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
//               <span className="ml-3 text-gray-600 dark:text-gray-400">Processing...</span>
//             </div>
//           )}

//           <div className="flex justify-end">
//             <Button
//               onClick={() => setStep(2)}
//               disabled={!parsedData.form16 && !parsedData.equity && !parsedData.mutualFunds}
//             >
//               Continue to Review
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Step 2: Review */}
//       {step === 2 && (
//         <Card>
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
//             Review Data
//           </h2>
//           <div className="space-y-6">
//             {parsedData.form16 && (
//               <div>
//                 <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Salary Income</h3>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <p className="text-sm text-gray-600 dark:text-gray-400">Gross Salary</p>
//                     <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
//                       ₹{(parsedData.form16.salary || parsedData.form16.gross_salary || 0).toLocaleString('en-IN')}
//                     </p>
//                   </div>
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <p className="text-sm text-gray-600 dark:text-gray-400">TDS Paid</p>
//                     <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
//                       ₹{(parsedData.form16.deductions || parsedData.form16.tds_paid || 0).toLocaleString('en-IN')}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {parsedData.equity && (
//               <div>
//                 <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Equity Gains</h3>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <p className="text-sm text-gray-600 dark:text-gray-400">STCG (After July 23)</p>
//                     <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
//                       ₹{(parsedData.equity.stcg || parsedData.equity.stcg_after || 0).toLocaleString('en-IN')}
//                     </p>
//                   </div>
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <p className="text-sm text-gray-600 dark:text-gray-400">LTCG (After July 23)</p>
//                     <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
//                       ₹{(parsedData.equity.ltcg || parsedData.equity.ltcg_after || 0).toLocaleString('en-IN')}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {parsedData.mutualFunds && (
//               <div>
//                 <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Mutual Fund Gains</h3>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <p className="text-sm text-gray-600 dark:text-gray-400">Total Gains</p>
//                     <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
//                       ₹{parsedData.mutualFunds.totalGains?.toLocaleString('en-IN') || '0'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex space-x-4 mt-6">
//             <Button onClick={() => setStep(1)} variant="secondary">
//               Back
//             </Button>
//             <Button onClick={handleCalculate} disabled={loading}>
//               {loading ? 'Calculating...' : 'Calculate Tax'}
//             </Button>
//           </div>
//         </Card>
//       )}

//       {/* Step 3: Results */}
//       {step === 3 && taxResult && (
//         <Card>
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
//             Tax Calculation Results
//           </h2>
//           <div className="space-y-4">
//             <div className="p-6 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-800">
//               <p className="text-sm text-gray-600 dark:text-gray-400">Total Tax Liability</p>
//               <p className="text-3xl font-bold text-accent mt-2">
//                 ₹{(taxResult.totalTax || taxResult.taxPayable || 0).toLocaleString('en-IN')}
//               </p>
//             </div>
//             <div className="grid md:grid-cols-3 gap-4">
//               <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Salary Tax</p>
//                 <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
//                   ₹{(taxResult.salaryTax || 0).toLocaleString('en-IN')}
//                 </p>
//               </div>
//               <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Capital Gains Tax</p>
//                 <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
//                   ₹{(taxResult.capitalGainsTax || 0).toLocaleString('en-IN')}
//                 </p>
//               </div>
//               <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Effective Rate</p>
//                 <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
//                   {taxResult.effectiveRate || 0}%
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="mt-6">
//             <Button
//               onClick={() => {
//                 setStep(1);
//                 setParsedData({});
//                 setTaxResult(null);
//               }}
//               variant="secondary"
//             >
//               Start New Filing
//             </Button>
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default ITR2;
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import { taxService } from '../../services/tax.service';

interface ParsedData {
  form16?: any;
  equity?: any;
  mutualFunds?: any;
  houseProperty?: {
    property_type: 'SOP' | 'LOP' | 'DLOP';
    gross_rent_received: number;
    expected_market_rent: number;
    municipal_taxes_paid: number;
    home_loan_interest: number;
  };
}

const ITR2 = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData>({});
  const [taxResult, setTaxResult] = useState<any>(null);

  // House Property form state
  const [hpForm, setHpForm] = useState({
    property_type: 'SOP' as 'SOP' | 'LOP' | 'DLOP',
    gross_rent_received: 0,
    expected_market_rent: 0,
    municipal_taxes_paid: 0,
    home_loan_interest: 0,
  });

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

  const handleHpFieldChange = (field: string, value: any) => {
    setHpForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveHouseProperty = () => {
    setParsedData(prev => ({ ...prev, houseProperty: hpForm }));
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
        // House Property fields
        hp_property_type: parsedData.houseProperty?.property_type || 'SOP',
        hp_gross_rent_received: parsedData.houseProperty?.gross_rent_received || 0,
        hp_expected_market_rent: parsedData.houseProperty?.expected_market_rent || 0,
        hp_municipal_taxes_paid: parsedData.houseProperty?.municipal_taxes_paid || 0,
        hp_home_loan_interest: parsedData.houseProperty?.home_loan_interest || 0,
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

  const isRented = hpForm.property_type === 'LOP' || hpForm.property_type === 'DLOP';

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

          {/* NEW: House Property Manual Input */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              House Property Income (Optional)
            </h2>

            {/* Property Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'SOP', label: 'Self-Occupied', hint: 'You live here' },
                  { value: 'LOP', label: 'Let Out', hint: 'Rented out' },
                  { value: 'DLOP', label: 'Deemed Let Out', hint: '2+ houses' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleHpFieldChange('property_type', opt.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      hpForm.property_type === opt.value
                        ? 'border-accent bg-indigo-50 dark:bg-indigo-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {opt.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SOP Warning */}
            {hpForm.property_type === 'SOP' && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-sm text-amber-800 dark:text-amber-300">
                ⚠️ <strong>New Tax Regime:</strong> Self-occupied property has NAV = ₹0 and no home loan interest deduction.
              </div>
            )}

            {/* Rental Fields (LOP/DLOP only) */}
            {isRented && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {hpForm.property_type === 'LOP' && (
                  <NumberInput
                    label="Gross Rent Received (Annual)"
                    value={hpForm.gross_rent_received}
                    onChange={(v) => handleHpFieldChange('gross_rent_received', v)}
                  />
                )}
                <NumberInput
                  label="Expected Market Rent"
                  value={hpForm.expected_market_rent}
                  onChange={(v) => handleHpFieldChange('expected_market_rent', v)}
                  hint={hpForm.property_type === 'LOP' ? 'GAV = higher of actual or market rent' : undefined}
                />
                <NumberInput
                  label="Municipal Taxes Paid"
                  value={hpForm.municipal_taxes_paid}
                  onChange={(v) => handleHpFieldChange('municipal_taxes_paid', v)}
                  hint="Only if paid by owner"
                />
                <NumberInput
                  label="Home Loan Interest Paid"
                  value={hpForm.home_loan_interest}
                  onChange={(v) => handleHpFieldChange('home_loan_interest', v)}
                  hint="Section 24(b) — fully deductible"
                />
              </div>
            )}

            <Button onClick={handleSaveHouseProperty} variant="secondary">
              Save House Property
            </Button>
            {parsedData.houseProperty && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ House Property data saved ({parsedData.houseProperty.property_type})
                </p>
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
                  <DataCard
                    label="Gross Salary"
                    value={parsedData.form16.salary || parsedData.form16.gross_salary || 0}
                  />
                  <DataCard
                    label="TDS Paid"
                    value={parsedData.form16.deductions || parsedData.form16.tds_paid || 0}
                  />
                </div>
              </div>
            )}

            {parsedData.equity && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Equity Gains</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <DataCard
                    label="STCG (After July 23)"
                    value={parsedData.equity.stcg || parsedData.equity.stcg_after || 0}
                  />
                  <DataCard
                    label="LTCG (After July 23)"
                    value={parsedData.equity.ltcg || parsedData.equity.ltcg_after || 0}
                  />
                </div>
              </div>
            )}

            {parsedData.mutualFunds && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Mutual Fund Gains</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <DataCard label="Total Gains" value={parsedData.mutualFunds.totalGains || 0} />
                </div>
              </div>
            )}

            {/* NEW: House Property Review */}
            {parsedData.houseProperty && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">House Property</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Property Type</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      {parsedData.houseProperty.property_type}
                    </p>
                  </div>
                  {parsedData.houseProperty.property_type !== 'SOP' && (
                    <DataCard
                      label="Expected Rent"
                      value={parsedData.houseProperty.expected_market_rent}
                    />
                  )}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {taxResult.isRefund ? 'Tax Refund' : 'Total Tax Liability'}
              </p>
              <p className="text-3xl font-bold text-accent mt-2">
                ₹{Math.abs(taxResult.netPayable || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <DataCard
                label="Salary Tax"
                value={taxResult.finalTaxSummary?.salaryPlusDebtMfTax || 0}
              />
              <DataCard
                label="Capital Gains Tax"
                value={
                  (taxResult.finalTaxSummary?.stockCapitalGainsTax || 0) +
                  (taxResult.finalTaxSummary?.mutualFundEquityTax || 0)
                }
              />
              <DataCard
                label="Total Tax (incl. Cess)"
                value={taxResult.finalTaxSummary?.totalTaxLiability || 0}
              />
            </div>

            {/* House Property Result */}
            {taxResult.houseProperty && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  House Property Income
                </h3>
                <p className={`text-lg font-semibold ${
                  taxResult.houseProperty.hpIncomeOrLoss < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {taxResult.houseProperty.hpIncomeOrLoss < 0 ? 'Loss: ' : 'Income: '}
                  ₹{Math.abs(taxResult.houseProperty.hpIncomeOrLoss).toLocaleString('en-IN')}
                </p>
                {taxResult.houseProperty.notes?.map((note: string, i: number) => (
                  <p key={i} className="text-xs text-gray-500 dark:text-gray-400 mt-1">{note}</p>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button
              onClick={() => {
                setStep(1);
                setParsedData({});
                setTaxResult(null);
                setHpForm({
                  property_type: 'SOP',
                  gross_rent_received: 0,
                  expected_market_rent: 0,
                  municipal_taxes_paid: 0,
                  home_loan_interest: 0,
                });
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

// Helper Components
function NumberInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent outline-none"
        placeholder="0"
      />
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function DataCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
        ₹{value.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

export default ITR2;