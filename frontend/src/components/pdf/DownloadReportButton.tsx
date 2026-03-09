/**
 * DownloadReportButton
 * Drop-in button for ITR-1 and ITR-2 Calculate pages.
 *
 * Place at:  src/components/pdf/DownloadReportButton.tsx
 *
 * Usage in itr1_Calculate.tsx  (add near top of return, after the header):
 *   import DownloadReportButton from '../../../components/pdf/DownloadReportButton';
 *   <DownloadReportButton itrType="itr1" itr1State={itr1State} />
 *
 * Usage in itr2_Calculate.tsx:
 *   import DownloadReportButton from '../../../components/pdf/DownloadReportButton';
 *   <DownloadReportButton itrType="itr2" itr2State={itr2State} />
 */

import React, { useState, useCallback } from 'react';
// If this import fails, run: npm install @react-pdf/renderer
// Requires: npm install @react-pdf/renderer
// If you see "Generation failed" — run: npm install @react-pdf/renderer
import { pdf } from '@react-pdf/renderer';
import TaxReportPDF from './TaxReportPDF';

interface Props {
  itrType: 'itr1' | 'itr2';
  itr1State?: any;
  itr2State?: any;
}

type GenState = 'idle' | 'generating' | 'done' | 'error';

export default function DownloadReportButton({ itrType, itr1State, itr2State }: Props) {
  const [genState, setGenState] = useState<GenState>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleDownload = useCallback(async () => {
    setGenState('generating');
    try {
      // Generate PDF blob entirely in browser — no server call
      const blob = await pdf(
        <TaxReportPDF itrType={itrType} itr1State={itr1State} itr2State={itr2State} />
      ).toBlob();

      // Build filename: SmartTax_ITR2_FY2024-25_20260310.pdf
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `SmartTax_${itrType.toUpperCase()}_FY2024-25_${dateStr}.pdf`;

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setGenState('done');
      // Reset back to idle after 3s
      setTimeout(() => setGenState('idle'), 3000);
    } catch (err: any) {
      // Log full error so developer can diagnose font/render issues
      console.error('PDF generation failed:', err);
      console.error('Error details:', err?.message, err?.stack);
      setErrMsg(err?.message ?? String(err));
      setGenState('error');
      setTimeout(() => { setGenState('idle'); setErrMsg(''); }, 5000);
    }
  }, [itrType, itr1State, itr2State]);

  const labels: Record<GenState, string> = {
    idle:       'Download PDF Report',
    generating: 'Generating PDF…',
    done:       '✓ Downloaded!',
    error:      'Generation failed — retry',
  };

  const icons: Record<GenState, React.ReactNode> = {
    idle: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
        <path d="M12 3v13M7 11l5 5 5-5M3 19h18" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    generating: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"
          strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
      </svg>
    ),
    done: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    error: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  const colorMap: Record<GenState, string> = {
    idle:       'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600',
    generating: 'bg-indigo-400 text-white border-indigo-400 cursor-not-allowed',
    done:       'bg-emerald-600 text-white border-emerald-600',
    error:      'bg-red-600 hover:bg-red-700 text-white border-red-600',
  };

  return (
    <>
      {/* Spinner keyframe — injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <button
        onClick={handleDownload}
        disabled={genState === 'generating'}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg border
          text-[13px] font-semibold transition-all duration-200 shadow-sm
          disabled:opacity-70 select-none
          ${colorMap[genState]}
        `}
      >
        {icons[genState]}
        {labels[genState]}
      </button>
      {genState === 'error' && errMsg && (
        <p className="text-[11px] text-red-500 mt-1.5 max-w-xs">
          Error: {errMsg.slice(0, 120)}
        </p>
      )}
    </>
  );
}
