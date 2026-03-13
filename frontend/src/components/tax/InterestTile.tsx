/**
 * SmartTax — Section 234B & 234C Interest Tile
 * Shows only when balance tax payable > ₹10,000.
 *
 * Place at: src/components/tax/InterestTile.tsx
 *
 * HOW TO TEST:
 *   This tile is hidden for refund cases. To test:
 *   Enter a low TDS (e.g. ₹50,000) on the Salary page → calculate →
 *   the tile appears showing balance tax, interest, and total payable.
 */

import { useState } from 'react';
import { calc234B, calc234C } from '../../utils/interestCalc';

interface Props {
  totalTax: number;
  tds: number;
}

const INR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function InterestTile({ totalTax, tds }: Props) {
  // Hooks MUST be before any early return (React rules)
  const [filingDate, setFilingDate] = useState('2025-07-31');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const balanceTax = totalTax - tds;

  // Hidden for refund cases or when balance <= ₹10,000 (advance tax threshold)
  if (balanceTax <= 10_000) return null;

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
            <span className="text-amber-500 text-base">⚠</span>
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
              Advance Tax &amp; Interest
            </h3>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Section 234B &amp; 234C — FY 2024-25
          </p>
        </div>
        <button
          onClick={() => setShowBreakdown(v => !v)}
          className="text-xs text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
        >
          {showBreakdown ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {/* 3-number summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-amber-100 dark:border-amber-900">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Balance Tax</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{INR(balanceTax)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">total tax − TDS</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-amber-100 dark:border-amber-900">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Interest (234B+C)</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{INR(totalInterest)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">estimated penalty</p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/60 rounded-xl p-3 border border-amber-300 dark:border-amber-700">
          <p className="text-[10px] text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">Total to Pay</p>
          <p className="text-lg font-bold text-amber-900 dark:text-amber-100">{INR(grandTotal)}</p>
          <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">via Challan 280</p>
        </div>
      </div>

      {/* Filing date picker */}
      <div className="flex items-center gap-3 flex-wrap">
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
            focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-600"
        />
        <span className="text-[10px] text-gray-400">Standard due date: 31 Jul 2025</span>
      </div>

      {/* Detailed breakdown */}
      {showBreakdown && (
        <div className="space-y-5 pt-3 border-t border-amber-200 dark:border-amber-800">

          {/* 234B */}
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Section 234B — Default in advance tax payment
            </p>
            {b.applicable ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <DRow label="Balance tax (totalTax − TDS)" value={INR(b.balanceTax)} />
                <DRow label="Rate" value="1% per month" />
                <DRow
                  label="Period"
                  value={`Apr 2025 → ${new Date(filingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} (${b.monthsDelayed} months)`}
                />
                <DRow label="234B Interest" value={INR(b.interest234B)} highlight />
              </div>
            ) : (
              <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/60 rounded-lg px-3 py-2 border border-green-200 dark:border-green-900">
                Not applicable — {b.explanation}
              </p>
            )}
          </div>

          {/* 234C */}
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Section 234C — Deferment of advance tax instalments
            </p>
            {c.applicable ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden text-xs">
                <div className="grid grid-cols-5 bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                  {['Quarter', 'Due Date', 'Required', 'TDS Paid', 'Interest'].map(h => (
                    <span key={h} className="font-semibold text-[10px] text-gray-400 uppercase tracking-wide">{h}</span>
                  ))}
                </div>
                {c.quarters.map((q, i) => (
                  <div key={q.quarter} className={`grid grid-cols-5 px-3 py-2.5 border-b border-gray-50 dark:border-gray-800/60 ${i % 2 ? 'bg-gray-50/60 dark:bg-gray-800/30' : ''}`}>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{q.quarter}</span>
                    <span className="text-gray-500 dark:text-gray-400">{q.dueDate}</span>
                    <span className="text-gray-700 dark:text-gray-300">{INR(q.required)}</span>
                    <span className={q.paid < q.required ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                      {INR(q.paid)}
                    </span>
                    <span className={q.interest > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}>
                      {q.interest > 0 ? INR(q.interest) : '—'}
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-5 px-3 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-800">
                  <span className="col-span-4 text-xs font-semibold text-amber-800 dark:text-amber-200">Total 234C Interest</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{INR(c.total234C)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/60 rounded-lg px-3 py-2 border border-green-200 dark:border-green-900">
                Not applicable — {c.explanation}
              </p>
            )}
          </div>

          {/* Challan 280 instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              Pay before filing — Challan 280
            </p>
            <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Go to <span className="font-medium">incometax.gov.in → e-Pay Tax → Challan 280</span></li>
              <li>Select <span className="font-medium">Self Assessment Tax (300)</span></li>
              <li>Pay <span className="font-bold text-blue-900 dark:text-blue-200">{INR(grandTotal)}</span></li>
              <li>Save BSR code &amp; challan serial number — needed while filing ITR</li>
            </ol>
            <p className="text-[10px] text-blue-400 dark:text-blue-500">
              * Interest is estimated. Actual amount is computed by the IT portal at filing time.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

function DRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center px-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-xs font-semibold ${highlight ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {value}
      </span>
    </div>
  );
}
