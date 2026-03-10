/**
 * SmartTax — Section 234B & 234C Interest Tile
 * Shows only when balance tax > ₹10,000.
 *
 * Place at: src/components/tax/InterestTile.tsx
 */

import { useState } from 'react';
import { calc234B, calc234C } from '../../utils/interestCalc';

interface Props {
  totalTax: number;
  tds: number;
}

const INR = (n: number) =>
  '₹' + Math.round(n).toLocaleString('en-IN');

export default function InterestTile({ totalTax, tds }: Props) {
  const balanceTax = totalTax - tds;

  // Only show when balance tax > ₹10,000 AND it's payable (not refund)
  if (balanceTax <= 10_000) return null;

  const [filingDate, setFilingDate] = useState('2025-07-31');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const filing = new Date(filingDate);
  const b = calc234B(totalTax, tds, filing);
  const c = calc234C(totalTax, tds);

  const totalInterest = b.interest234B + c.total234C;
  const grandTotal = balanceTax + totalInterest;

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-5 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 text-lg">⚠</span>
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
              Advance Tax &amp; Interest
            </h3>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            Section 234B &amp; 234C — FY 2024-25
          </p>
        </div>
        <button
          onClick={() => setShowBreakdown(v => !v)}
          className="text-xs text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
        >
          {showBreakdown ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-amber-100 dark:border-amber-900">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Balance Tax</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{INR(balanceTax)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">tax − TDS</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-amber-100 dark:border-amber-900">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Interest (234B+C)</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{INR(totalInterest)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">estimated penalty</p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/60 rounded-xl p-3 border border-amber-300 dark:border-amber-700">
          <p className="text-[10px] text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">Total Payable</p>
          <p className="text-lg font-bold text-amber-900 dark:text-amber-100">{INR(grandTotal)}</p>
          <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">if filed on due date</p>
        </div>
      </div>

      {/* Filing date picker */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
          Expected filing date:
        </label>
        <input
          type="date"
          min="2025-04-01"
          max="2025-12-31"
          value={filingDate}
          onChange={e => setFilingDate(e.target.value)}
          className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5
            bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
            focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <span className="text-[10px] text-gray-400">
          Due date: 31 Jul 2025
        </span>
      </div>

      {/* Detailed breakdown */}
      {showBreakdown && (
        <div className="space-y-4 pt-2 border-t border-amber-200 dark:border-amber-800">

          {/* 234B */}
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Section 234B — Default in payment of advance tax
            </p>
            {b.applicable ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                <Row label="Balance tax (totalTax − TDS)" value={INR(b.balanceTax)} />
                <Row label="Rate" value="1% per month" />
                <Row label="Period" value={`Apr 2025 → ${filing.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} (${b.monthsDelayed} months)`} />
                <Row label="234B Interest" value={INR(b.interest234B)} highlight />
              </div>
            ) : (
              <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 rounded-lg px-3 py-2">
                ✓ {b.explanation}
              </p>
            )}
          </div>

          {/* 234C */}
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Section 234C — Deferment of advance tax instalments
            </p>
            {c.applicable ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="grid grid-cols-5 bg-gray-50 dark:bg-gray-800 px-3 py-2">
                  {['Quarter', 'Due Date', 'Required', 'TDS Paid', 'Interest'].map(h => (
                    <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
                  ))}
                </div>
                {c.quarters.map((q, i) => (
                  <div key={q.quarter} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{q.quarter}</span>
                    <span className="text-gray-500">{q.dueDate}</span>
                    <span className="text-gray-700 dark:text-gray-300">{INR(q.required)}</span>
                    <span className={q.paid < q.required ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                      {INR(q.paid)}
                    </span>
                    <span className={q.interest > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}>
                      {q.interest > 0 ? INR(q.interest) : '—'}
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-5 px-3 py-2 bg-amber-50 dark:bg-amber-950 border-t border-amber-200 dark:border-amber-800">
                  <span className="col-span-4 text-xs font-semibold text-amber-800 dark:text-amber-200">Total 234C Interest</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{INR(c.total234C)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 rounded-lg px-3 py-2">
                ✓ {c.explanation}
              </p>
            )}
          </div>

          {/* What to do */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">What to do before filing</p>
            <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
              <li>Go to incometax.gov.in → e-Pay Tax → Challan 280</li>
              <li>Select <strong>Self Assessment Tax (300)</strong></li>
              <li>Pay <strong>{INR(grandTotal)}</strong> (balance tax + estimated interest)</li>
              <li>Note BSR code &amp; challan serial number — you'll need this while filing</li>
            </ol>
            <p className="text-[10px] text-blue-500 dark:text-blue-500 mt-2">
              * Interest is estimated. Actual interest is computed by the IT portal at time of filing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center px-3 py-2">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-xs font-semibold ${highlight ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {value}
      </span>
    </div>
  );
}
