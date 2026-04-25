/**
 * SmartTax — Tax Computation Report
 * Generates a complete PDF summary for ITR-1 and ITR-2
 *
 * Install dependency:  npm install @react-pdf/renderer
 * Place file at:       src/components/pdf/TaxReportPDF.tsx
 *
 * Usage (from Calculate page):
 *   import { PDFDownloadLink } from '@react-pdf/renderer';
 *   import TaxReportPDF from '../../components/pdf/TaxReportPDF';
 *
 *   <PDFDownloadLink
 *     document={<TaxReportPDF itrType="itr2" itr2State={itr2State} />}
 *     fileName={`SmartTax_ITR2_FY2024-25_${Date.now()}.pdf`}
 *   >
 *     {({ loading }) => loading ? 'Generating…' : 'Download PDF Report'}
 *   </PDFDownloadLink>
 */

import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer';
import type { HousePropertyEntry } from '../../types/tax.types';

// ─── Fonts ───────────────────────────────────────────────────────────────────
// Using jsDelivr CDN which sets correct CORS headers for browser fetch
// No external fonts — use react-pdf built-ins (zero network calls)
// Helvetica / Helvetica-Bold are always available in @react-pdf/renderer
Font.registerHyphenationCallback(word => [word]);

// ─── Colours ──────────────────────────────────────────────────────────────────
const BLUE   = '#1d4ed8';
const INDIGO = '#4f46e5';
const GREEN  = '#15803d';
const RED    = '#dc2626';
const AMBER  = '#b45309';
const GRAY1  = '#0f172a';
const GRAY2  = '#1e293b';
const GRAY3  = '#475569';
const GRAY4  = '#94a3b8';
const GRAY5  = '#e2e8f0';
const GRAY6  = '#f8fafc';
const WHITE  = '#ffffff';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const INR = (n: number, dec = 0) =>
  // Uses 'Rs.' because Helvetica (react-pdf built-in) lacks the U+20B9 rupee glyph
  // The glyph renders as '1' in PDF without a custom font. Rs. is the safe fallback.
  'Rs.' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const PCT = (n: number) =>
  isNaN(n) || !isFinite(n) ? '0.0%' : `${n.toFixed(1)}%`;

const fmtDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const propTypeLabel = (t: string) =>
  t === 'SOP' ? 'Self-Occupied' : t === 'LOP' ? 'Let Out' : 'Deemed Let Out';

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    // fontFamily defaults to Helvetica in react-pdf
    fontSize: 9,
    color: GRAY2,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 44,
    backgroundColor: WHITE,
  },

  // ── Header / Footer ─────────────────────────────────────────
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { width: 28, height: 28, backgroundColor: BLUE, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: WHITE, fontSize: 13, fontWeight: 700 },
  brandName: { fontSize: 16, fontWeight: 700, color: GRAY1 },
  headerRight: { textAlign: 'right' },
  headerMeta: { fontSize: 8, color: GRAY4 },

  footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: GRAY5, paddingTop: 8 },
  footerText: { fontSize: 7.5, color: GRAY4 },

  // ── Cover page ──────────────────────────────────────────────
  coverPage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverGradientBar: { width: '100%', height: 6, backgroundColor: BLUE, borderRadius: 3, marginBottom: 40 },
  coverTitle: { fontSize: 26, fontWeight: 700, color: GRAY1, textAlign: 'center', marginBottom: 6 },
  coverSubtitle: { fontSize: 12, color: GRAY3, textAlign: 'center', marginBottom: 36 },
  coverMetaBox: { backgroundColor: GRAY6, borderRadius: 10, padding: 24, width: '80%', borderWidth: 1, borderColor: GRAY5 },
  coverMetaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: GRAY5 },
  coverMetaLabel: { fontSize: 9, color: GRAY4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  coverMetaValue: { fontSize: 9, fontWeight: 600, color: GRAY2 },
  coverBadge: { marginTop: 24, backgroundColor: '#eff6ff', borderRadius: 100, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  coverBadgeText: { fontSize: 9, color: BLUE, fontWeight: 600 },
  coverDisclaimer: { marginTop: 28, fontSize: 7.5, color: GRAY4, textAlign: 'center', maxWidth: '75%', lineHeight: 1.5 },

  // ── Section heading ─────────────────────────────────────────
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 10 },
  sectionBar: { width: 4, height: 16, backgroundColor: BLUE, borderRadius: 2 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: GRAY1 },
  sectionNote: { fontSize: 8, color: GRAY4, marginBottom: 10, lineHeight: 1.6 },

  // ── Summary cards ───────────────────────────────────────────
  cardGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  card: { flex: 1, backgroundColor: GRAY6, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: GRAY5 },
  cardLabel: { fontSize: 7.5, fontWeight: 600, color: GRAY4, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: 700, color: GRAY1 },
  cardSub: { fontSize: 7.5, color: GRAY4, marginTop: 3 },
  cardGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  cardRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  cardAmber: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  cardGreenValue: { color: GREEN },
  cardRedValue: { color: RED },
  cardAmberValue: { color: AMBER },

  // ── Table ───────────────────────────────────────────────────
  table: { borderWidth: 1, borderColor: GRAY5, borderRadius: 8, overflow: 'hidden', marginBottom: 14 },
  tableHead: { flexDirection: 'row', backgroundColor: GRAY6, paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: GRAY5 },
  tableHeadCell: { fontSize: 7.5, fontWeight: 700, color: GRAY4, textTransform: 'uppercase', letterSpacing: 0.4 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: GRAY5 },
  tableRowAlt: { backgroundColor: '#fafbfc' },
  tableRowLast: { borderBottomWidth: 0 },
  tableCell: { fontSize: 9, color: GRAY2 },
  tableCellBold: { fontWeight: 600, color: GRAY1 },
  tableCellRight: { textAlign: 'right' },
  tableCellGreen: { color: GREEN, fontWeight: 600 },
  tableCellRed: { color: RED, fontWeight: 600 },
  tableCellIndigo: { color: INDIGO, fontWeight: 700 },

  // ── Waterfall rows ──────────────────────────────────────────
  wfRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: GRAY5 },
  wfRowHighlight: { backgroundColor: '#eef2ff', borderRadius: 6, marginHorizontal: 4 },
  wfLabel: { fontSize: 9, color: GRAY3 },
  wfLabelBold: { fontWeight: 600, color: GRAY1 },
  wfValue: { fontSize: 9, fontWeight: 600, color: GRAY2, textAlign: 'right' },
  wfValueNeg: { color: RED },
  wfValuePos: { color: GREEN },
  wfValueHighlight: { color: INDIGO, fontSize: 10 },
  wfIndent: { paddingLeft: 24 },
  wfNote: { fontSize: 7.5, color: GRAY4, paddingHorizontal: 12, paddingBottom: 6, fontStyle: 'italic' },

  // ── Slab table ──────────────────────────────────────────────
  slabBox: { backgroundColor: GRAY6, borderRadius: 6, padding: 10, marginHorizontal: 12, marginVertical: 6, borderWidth: 1, borderColor: GRAY5 },
  slabTitle: { fontSize: 7.5, fontWeight: 700, color: GRAY4, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  slabRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2.5 },
  slabRange: { fontSize: 8, color: GRAY3 },
  slabRate: { fontSize: 8, fontWeight: 600, color: GRAY2 },
  rebateBadge: { backgroundColor: '#dcfce7', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start' },
  rebateText: { fontSize: 7.5, color: GREEN, fontWeight: 600 },

  // ── Divider ─────────────────────────────────────────────────
  divider: { borderTopWidth: 1, borderTopColor: GRAY5, marginVertical: 10 },
  thinDivider: { borderTopWidth: 1, borderTopColor: GRAY5, marginVertical: 4 },

  // ── HP property card ────────────────────────────────────────
  hpCard: { borderWidth: 1, borderColor: GRAY5, borderRadius: 8, overflow: 'hidden', marginBottom: 10 },
  hpCardHead: { backgroundColor: GRAY6, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: GRAY5 },
  hpCardTitle: { fontSize: 9, fontWeight: 700, color: GRAY1 },
  hpTypeBadge: { fontSize: 7.5, fontWeight: 600, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  hpTypeSOP: { backgroundColor: '#eff6ff', color: BLUE },
  hpTypeLOP: { backgroundColor: '#f0fdf4', color: GREEN },
  hpTypeDLOP: { backgroundColor: '#faf5ff', color: '#7c3aed' },
  hpLossBox: { backgroundColor: '#fef2f2', borderRadius: 6, padding: 8, margin: 12, borderWidth: 1, borderColor: '#fecaca' },
  hpLossText: { fontSize: 7.5, color: RED, lineHeight: 1.6 },

  // ── Final reconciliation table ───────────────────────────────
  reconcileBox: { backgroundColor: GRAY6, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: GRAY5 },
  reconcileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: GRAY5 },
  reconcileRowLast: { borderBottomWidth: 0 },
  reconcileLabel: { fontSize: 9, color: GRAY3 },
  reconcileValue: { fontSize: 9, fontWeight: 600, color: GRAY2 },
  reconcileFinalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, marginTop: 4 },
  reconcileFinalLabel: { fontSize: 11, fontWeight: 700, color: GRAY1 },
  reconcileFinalValue: { fontSize: 11, fontWeight: 700 },

  // ── Challan / refund tip box ─────────────────────────────────
  tipBox: { borderRadius: 8, padding: 12, marginTop: 10, borderWidth: 1 },
  tipBoxGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  tipBoxAmber: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  tipTitle: { fontSize: 8.5, fontWeight: 700, marginBottom: 4 },
  tipTitleGreen: { color: GREEN },
  tipTitleAmber: { color: AMBER },
  tipText: { fontSize: 8, lineHeight: 1.65 },
  tipTextGreen: { color: '#166534' },
  tipTextAmber: { color: '#78350f' },

  // ── Misc ────────────────────────────────────────────────────
  pageNum: { fontSize: 7.5, color: GRAY4 },
  bold: { fontWeight: 700 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
});

// ─── Reusable Components ──────────────────────────────────────────────────────

const PageHeader = ({ itrType }: { itrType: string; page: number }) => (
  <View style={S.header} fixed>
    <View style={S.headerLeft}>
      {/* Header wordmark — SMART bold navy + tax regular blue */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={[S.brandName, { fontWeight: 700, letterSpacing: -0.3 }]}>SMART</Text>
        <Text style={[S.brandName, { fontWeight: 400, color: '#2563eb', letterSpacing: -0.3 }]}>tax</Text>
      </View>
    </View>
    <View style={S.headerRight}>
      <Text style={S.headerMeta}>{itrType.toUpperCase()} · FY 2024–25 · New Tax Regime</Text>
      <Text style={[S.headerMeta, S.mt4]}>AY 2025–26</Text>
    </View>
  </View>
);

const PageFooter = () => (
  <View style={S.footer} fixed>
    <Text style={S.footerText}>
      Generated by SmartTax · smarttax.in · This is a computation summary, not an official ITR filing.
    </Text>
    <Text style={S.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

const SectionHeading = ({ title }: { title: string }) => (
  <View style={S.sectionHeading}>
    <View style={S.sectionBar} />
    <Text style={S.sectionTitle}>{title}</Text>
  </View>
);

const WRow = ({
  label, value, indent = false, bold = false, highlight = false, neg = false, pos = false,
}: {
  label: string; value: string; indent?: boolean; bold?: boolean;
  highlight?: boolean; neg?: boolean; pos?: boolean;
}) => (
  <View style={[S.wfRow, highlight ? S.wfRowHighlight : {}, indent ? S.wfIndent : {}]}>
    <Text style={[S.wfLabel, bold ? S.wfLabelBold : {}]}>{label}</Text>
    <Text style={[
      S.wfValue,
      neg ? S.wfValueNeg : {},
      pos ? S.wfValuePos : {},
      highlight ? S.wfValueHighlight : {},
    ]}>{value}</Text>
  </View>
);

const Divider = () => <View style={S.divider} />;

// ─── Cover Page ───────────────────────────────────────────────────────────────

const CoverPage = ({
  itrType, grossSalary, totalTax, netPayable, isRefund, calculatedAt,
}: {
  itrType: string; grossSalary: number; totalTax: number;
  netPayable: number; isRefund: boolean; calculatedAt: string | null;
}) => (
  <Page size="A4" style={S.page}>
    <View style={S.coverPage}>
      {/* Cover wordmark — clean, no mark needed */}
      <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 40, fontWeight: 700, color: '#1e3a8a', letterSpacing: -0.8 }}>SMART</Text>
          <Text style={{ fontSize: 42, fontWeight: 400, color: '#2563eb', letterSpacing: -0.8 }}>tax</Text>
        </View>
        <Text style={{ fontSize: 9, color: GRAY4, letterSpacing: 3.6, marginTop: 3 }}>I N D I A ' S  S I M P L E S T  T A X  E N G I N E</Text>
      </View>
      <Text style={{ fontSize: 10, color: GRAY4, marginBottom: 40 }}>Free · Accurate · Made in India</Text>

      {/* Gradient bar */}
      <View style={[S.coverGradientBar, { marginBottom: 32 }]} />

      <Text style={S.coverTitle}>Income Tax Computation Report</Text>
      <Text style={S.coverSubtitle}>{itrType.toUpperCase()} · FY 2024–25 · Assessment Year 2025–26</Text>

      {/* Meta box */}
      <View style={S.coverMetaBox}>
        {[
          ['Form Type',       itrType.toUpperCase()],
          ['Financial Year',  'FY 2024–25  (April 2024 – March 2025)'],
          ['Assessment Year', 'AY 2025–26'],
          ['Tax Regime',      'New Tax Regime (Default)'],
          ['Residential Status', 'Resident Individual'],
          ['Filing Status',   'Original Return'],
          ['PAN',             'XXXXX0000X  (masked for privacy)'],
          ['Gross Salary',    INR(grossSalary)],
          ['Total Tax Liability', INR(totalTax)],
          [isRefund ? 'Refund Due' : 'Balance Payable', INR(Math.abs(netPayable))],
          ['Calculated On',   fmtDate(calculatedAt)],
        ].map(([label, value], i, arr) => (
          <View key={label} style={[S.coverMetaRow, i === arr.length - 1 ? { borderBottomWidth: 0 } : {}]}>
            <Text style={S.coverMetaLabel}>{label}</Text>
            <Text style={[S.coverMetaValue, label === 'Refund Due' ? { color: GREEN } : label === 'Balance Payable' ? { color: RED } : {}]}>
              {value}
            </Text>
          </View>
        ))}
      </View>

      {/* Regime badge */}
      <View style={S.coverBadge}>
        <Text style={S.coverBadgeText}>✓ Budget 2024 · Section 87A · Standard Deduction Rs.75,000</Text>
      </View>

      <Text style={S.coverDisclaimer}>
        This document is a tax computation summary generated by SmartTax.
      </Text>
    </View>
    <PageFooter />
  </Page>
);

// ─── ITR-1 Report ─────────────────────────────────────────────────────────────

const ITR1Report = ({ state }: { state: any }) => {
  const sd = state.salary?.data;
  if (!sd || !state.calculationResult) return null;
  const r = state.calculationResult;

  const grossSalary    = sd.gross_salary || sd.salary || 0;
  const tds            = sd.tds_paid || sd.deductions || 0;
  const stdDeduction   = 75_000;
  const taxableIncome  = Math.max(0, grossSalary - stdDeduction);
  const salaryTax      = r.finalTaxSummary?.salaryPlusDebtMfTax ?? r.salaryTax ?? 0;
  const cess           = r.finalTaxSummary?.cess ?? 0;
  const totalTax       = r.finalTaxSummary?.totalTaxLiability ?? r.totalTaxLiability ?? 0;
  const netPayable     = r.netPayable ?? 0;
  const isRefund       = netPayable < 0;
  const effRate        = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return (
    <>
      <CoverPage
        itrType="itr-1" grossSalary={grossSalary} totalTax={totalTax}
        netPayable={netPayable} isRefund={isRefund}
        calculatedAt={state.lastCalculatedAt}
      />

      {/* ── PAGE 2: Income & Tax Computation ── */}
      <Page size="A4" style={S.page}>
        <PageHeader itrType="ITR-1" page={2} />

        <SectionHeading title="Summary" />
        <View style={S.cardGrid}>
          <View style={S.card}>
            <Text style={S.cardLabel}>Total Tax Liability</Text>
            <Text style={S.cardValue}>{INR(totalTax)}</Text>
            <Text style={S.cardSub}>incl. 4% Health & Education Cess ({INR(cess)})</Text>
          </View>
          <View style={S.card}>
            <Text style={S.cardLabel}>Effective Tax Rate</Text>
            <Text style={S.cardValue}>{PCT(effRate)}</Text>
            <Text style={S.cardSub}>= Total Tax / Total Income</Text>
            <Text style={[S.cardSub, {marginTop: 1}]}>on total income {INR(taxableIncome, 0)}</Text>
          </View>
          <View style={[S.card, isRefund ? S.cardGreen : S.cardRed]}>
            <Text style={S.cardLabel}>{isRefund ? 'Refund Due' : 'Balance Payable'}</Text>
            <Text style={[S.cardValue, isRefund ? S.cardGreenValue : S.cardRedValue]}>
              {INR(Math.abs(netPayable))}
            </Text>
            <Text style={S.cardSub}>{isRefund ? 'via bank account' : 'via Challan 280'}</Text>
          </View>
        </View>

        <SectionHeading title="Salary Income — New Regime Computation" />
        <Text style={S.sectionNote}>
          Under the New Tax Regime you receive a flat Rs.75,000 Standard Deduction (Sec 16).
          No 80C, HRA, or NPS deductions are permitted.
        </Text>
        <View style={[S.table, { marginBottom: 0 }]}>
          <WRow label="Gross Salary (from Form-16)" value={INR(grossSalary)} bold />
          <WRow label="Less: Standard Deduction — Sec 16 (New Regime)" value={`− ${INR(stdDeduction)}`} indent neg />
          <WRow label="Taxable Income (Salary Head)" value={INR(taxableIncome)} bold highlight />
        </View>

        {/* Slab box */}
        <View style={S.slabBox}>
          <Text style={S.slabTitle}>New Regime Tax Slabs — FY 2024–25</Text>
          {[
            ['Up to Rs.4,00,000',           '0%',  ],
            ['Rs.4,00,001 – Rs.8,00,000',    '5%',  ],
            ['Rs.8,00,001 – Rs.12,00,000',   '10%', ],
            ['Rs.12,00,001 – Rs.16,00,000',  '15%', ],
            ['Rs.16,00,001 – Rs.20,00,000',  '20%', ],
            ['Rs.20,00,001 – Rs.24,00,000',  '25%', ],
            ['Above Rs.24,00,000',          '30%', ],
          ].map(([range, rate]) => (
            <View key={range} style={S.slabRow}>
              <Text style={S.slabRange}>{range}</Text>
              <Text style={S.slabRate}>{rate}</Text>
            </View>
          ))}
          {taxableIncome <= 1_200_000 && (
            <View style={S.rebateBadge}>
              <Text style={S.rebateText}>Section 87A Rebate applied — taxable income ≤ Rs.12,00,000 · Full tax waived</Text>
            </View>
          )}
        </View>

        <View style={[S.table, { marginTop: 10 }]}>
          <WRow label="Tax on Salary (before cess)" value={INR(salaryTax)} bold />
          <WRow label="+ Health & Education Cess (4%)" value={`+ ${INR(Math.abs(cess))}`} indent />
          <WRow label="Total Tax Liability" value={INR(totalTax)} bold highlight />
        </View>

        <SectionHeading title="TDS Reconciliation" />
        <View style={S.reconcileBox}>
          {[
            ['Total Tax Liability',              INR(totalTax),         false],
            ['Less: TDS Deducted by Employer',   `− ${INR(tds)}`,       false],
          ].map(([label, value, _], i) => (
            <View key={String(label)} style={[S.reconcileRow]}>
              <Text style={S.reconcileLabel}>{label as string}</Text>
              <Text style={S.reconcileValue}>{value as string}</Text>
            </View>
          ))}
          <View style={[S.reconcileRow, S.reconcileRowLast]}>
            <Text style={S.reconcileLabel} />
            <View style={S.thinDivider} />
          </View>
          <View style={S.reconcileFinalRow}>
            <Text style={S.reconcileFinalLabel}>{isRefund ? 'Refund Due to You' : 'Balance Tax Payable'}</Text>
            <Text style={[S.reconcileFinalValue, { color: isRefund ? GREEN : RED }]}>
              {INR(Math.abs(netPayable))}
            </Text>
          </View>
        </View>

        {/* Why refund / payable plain-English explanation */}
        <View style={[S.tipBox, isRefund ? S.tipBoxGreen : S.tipBoxAmber, { marginBottom: 12 }]}>
          <Text style={[S.tipTitle, isRefund ? S.tipTitleGreen : S.tipTitleAmber]}>
            {isRefund ? 'Why are you getting a refund?' : 'Why do you owe more tax?'}
          </Text>
          <Text style={[S.tipText, isRefund ? S.tipTextGreen : S.tipTextAmber]}>
            {isRefund
              ? `Your employer deducted ${INR(tds, 0)} as TDS throughout the year. Your actual tax liability on your final income is ${INR(totalTax, 0)}. The difference — ${INR(Math.abs(netPayable), 0)} — will be refunded to your pre-validated bank account after filing.`
              : `Your employer deducted ${INR(tds, 0)} as TDS. However your final tax liability is ${INR(totalTax, 0)}. The shortfall of ${INR(Math.abs(netPayable), 0)} must be paid as Self Assessment Tax before filing.`
            }
          </Text>
        </View>

        {/* Compliance checklist */}
        <SectionHeading title="Filing Readiness Checklist" />
        <View style={[S.table, { marginBottom: 0 }]}>
          {[
            ['Salary income reported', true],
            ['Standard deduction applied (Rs.75,000)', true],
            ['TDS from Form-16 reconciled', true],
            ['New Tax Regime applied', true],
            [taxableIncome <= 1200000 ? 'Section 87A rebate applied' : 'Section 87A: not applicable (income > Rs.12L)', taxableIncome <= 1200000],
            ['Tax calculation complete', true],
            [isRefund ? 'Refund claim ready' : 'Challan 280 payment required before filing', true],
          ].map(([label, ok], i) => (
            <View key={String(label)} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}, i === 6 ? S.tableRowLast : {}]}>
              <Text style={[S.tableCell, { flex: 1 }]}>{ok ? 'v' : 'o'}  {label as string}</Text>
              <Text style={[S.tableCell, { color: ok ? GREEN : AMBER, fontWeight: 700 }]}>{ok ? 'Done' : 'Note'}</Text>
            </View>
          ))}
        </View>

        <PageFooter />
      </Page>
    </>
  );
};

// ─── ITR-2 Report ─────────────────────────────────────────────────────────────

const ITR2Report = ({ state }: { state: any }) => {
  const sd = state.salary?.data;
  if (!sd || !state.calculationResult) return null;
  const r = state.calculationResult;

  const grossSalary   = sd.gross_salary || sd.salary || 0;
  const tds           = sd.tds_paid || sd.deductions || 0;
  const stdDeduction  = 75_000;
  const hpNetIncome   = state.houseProperty?.aggregate?.net_hp_income ?? 0;
  const hpTotalLoss   = state.houseProperty?.aggregate?.total_hp_loss ?? 0;
  const hpProperties: HousePropertyEntry[] = state.houseProperty?.aggregate?.properties ?? [];
  const debtMfIncome  = r.debtMutualFunds?.addedToIncome ?? 0;
  const taxableIncome = Math.max(0, grossSalary - stdDeduction + hpNetIncome + debtMfIncome);

  const salaryTax     = r.finalTaxSummary?.salaryPlusDebtMfTax ?? 0;
  const stockTax      = r.finalTaxSummary?.stockCapitalGainsTax ?? 0;
  const equityMfTax   = r.finalTaxSummary?.mutualFundEquityTax ?? 0;
  const totalBfCess   = r.finalTaxSummary?.totalIncomeTaxBeforeCess ?? 0;
  const cess          = r.finalTaxSummary?.cess ?? 0;
  const totalTax      = r.finalTaxSummary?.totalTaxLiability ?? 0;
  const netPayable    = r.netPayable ?? 0;
  const isRefund      = netPayable < 0;

  const stcgBefore    = r.parsedStockGains?.stcg_before ?? 0;
  const stcgAfter     = r.parsedStockGains?.stcg_after ?? 0;
  const ltcgBefore    = r.parsedStockGains?.ltcg_before ?? 0;
  const ltcgAfter     = r.parsedStockGains?.ltcg_after ?? 0;
  const stcgTax       = r.stockTaxComputation?.stcgTax ?? 0;
  const ltcgTax       = r.stockTaxComputation?.ltcgTax ?? 0;
  const eqStcg        = r.equityMutualFunds?.stcg ?? 0;
  const eqLtcg        = r.equityMutualFunds?.ltcg ?? 0;
  const eqTaxableLtcg = r.equityMutualFunds?.taxableLtcg ?? 0;
  const eqMfTax       = r.equityMutualFunds?.equityMfTax ?? 0;
  const debtStcg      = r.debtMutualFunds?.debtStcg ?? 0;
  const debtLtcg      = r.debtMutualFunds?.debtLtcg ?? 0;

  const hasEquity     = stcgBefore + stcgAfter + ltcgBefore + ltcgAfter > 0;
  const hasMF         = eqStcg + eqLtcg > 0;          // equity MF only — triggers CG page
  const hasDebtMFNote = debtStcg + debtLtcg > 0;      // debt MF shown in salary section
  const hasHP         = hpProperties.length > 0;

  const totalGross    = taxableIncome + stcgBefore + stcgAfter + ltcgBefore + ltcgAfter + eqStcg + eqLtcg + debtStcg + debtLtcg;
  const effRate       = totalGross > 0 ? (totalTax / totalGross) * 100 : 0;

  return (
    <>
      <CoverPage
        itrType="itr-2" grossSalary={grossSalary} totalTax={totalTax}
        netPayable={netPayable} isRefund={isRefund}
        calculatedAt={state.lastCalculatedAt}
      />

      {/* ── PAGE 2: Summary & Salary ── */}
      <Page size="A4" style={S.page}>
        <PageHeader itrType="ITR-2" page={2} />

        <SectionHeading title="Tax Summary" />
        <View style={S.cardGrid}>
          <View style={S.card}>
            <Text style={S.cardLabel}>Total Tax Liability</Text>
            <Text style={S.cardValue}>{INR(totalTax)}</Text>
            <Text style={S.cardSub}>incl. 4% cess ({INR(cess)})</Text>
          </View>
          <View style={S.card}>
            <Text style={S.cardLabel}>Effective Tax Rate</Text>
            <Text style={S.cardValue}>{PCT(effRate)}</Text>
            <Text style={S.cardSub}>= Total Tax / Total Income</Text>
            <Text style={[S.cardSub, {marginTop: 1}]}>{INR(totalGross, 0)} total income</Text>
          </View>
          <View style={[S.card, isRefund ? S.cardGreen : S.cardRed]}>
            <Text style={S.cardLabel}>{isRefund ? 'Refund Due' : 'Balance Payable'}</Text>
            <Text style={[S.cardValue, isRefund ? S.cardGreenValue : S.cardRedValue]}>
              {INR(Math.abs(netPayable))}
            </Text>
            <Text style={S.cardSub}>{isRefund ? 'via bank account' : 'via Challan 280'}</Text>
          </View>
        </View>

        {/* Where tax comes from */}
        <View style={S.table}>
          <View style={S.tableHead}>
            <Text style={[S.tableHeadCell, { flex: 1 }]}>Income Source</Text>
            <Text style={[S.tableHeadCell, { width: 90, textAlign: 'right' }]}>Amount</Text>
            <Text style={[S.tableHeadCell, { width: 90, textAlign: 'right' }]}>Tax</Text>
          </View>
          {[
            ['Salary + Debt MF (slab)',    INR(taxableIncome), INR(salaryTax)],
            hasEquity ? ['Equity Stock Capital Gains', INR(stcgBefore + stcgAfter + ltcgBefore + ltcgAfter), INR(stockTax)] : null,
            hasMF     ? ['Equity Mutual Funds',         INR(eqStcg + eqLtcg),    INR(equityMfTax)] : null,
            hasDebtMFNote ? ['Debt MF (added to salary slab)',  INR(debtStcg + debtLtcg), 'at slab'] : null,
          ].filter(Boolean).map(([label, amt, tax], i, arr) => (
            <View key={String(label)} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}, i === arr.length - 1 ? S.tableRowLast : {}]}>
              <Text style={[S.tableCell, { flex: 1 }]}>{label as string}</Text>
              <Text style={[S.tableCell, S.tableCellRight, { width: 90 }]}>{amt as string}</Text>
              <Text style={[S.tableCell, S.tableCellRight, S.tableCellBold, { width: 90 }]}>{tax as string}</Text>
            </View>
          ))}
          <View style={[S.tableRow, { backgroundColor: '#eef2ff' }]}>
            <Text style={[S.tableCell, S.tableCellBold, { flex: 1 }]}>Sub-total before cess</Text>
            <Text style={[S.tableCell, S.tableCellRight, { width: 90 }]}>{INR(totalGross)}</Text>
            <Text style={[S.tableCell, S.tableCellRight, S.tableCellIndigo, { width: 90 }]}>{INR(totalBfCess)}</Text>
          </View>
        </View>

        {/* Salary waterfall */}
        <SectionHeading title="Salary Income — Computation" />
        <Text style={S.sectionNote}>
          New Tax Regime: Flat Rs.75,000 Standard Deduction. No 80C / HRA / NPS deductions permitted.
          {debtMfIncome > 0 ? ' Debt MF gains are treated as income and added to salary head.' : ''}
          {hpNetIncome > 0 ? ' Net House Property Income is added to taxable income.' : ''}
        </Text>
        <View style={S.table}>
          <WRow label="Gross Salary (Form-16)" value={INR(grossSalary)} bold />
          <WRow label="Less: Standard Deduction — Sec 16" value={`− ${INR(stdDeduction)}`} indent neg />
          {hpNetIncome > 0 && <WRow label="Add: Net House Property Income" value={`+ ${INR(hpNetIncome)}`} indent pos />}
          {debtMfIncome > 0 && <WRow label="Add: Debt MF Gains (treated as income)" value={`+ ${INR(debtMfIncome)}`} indent pos />}
          <WRow label="Taxable Income — Salary Head" value={INR(taxableIncome)} bold highlight />
        </View>

        <View style={S.slabBox}>
          <Text style={S.slabTitle}>New Regime Tax Slabs — FY 2024–25</Text>
          {/* 2-column compact grid — half the height of the vertical list */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              ['Up to Rs.4,00,000',          '0%'],
              ['Rs.4,00,001 – Rs.8,00,000',  '5%'],
              ['Rs.8,00,001 – Rs.12,00,000', '10%'],
              ['Rs.12,00,001 – Rs.16,00,000','15%'],
              ['Rs.16,00,001 – Rs.20,00,000','20%'],
              ['Rs.20,00,001 – Rs.24,00,000','25%'],
              ['Above Rs.24,00,000',         '30%'],
            ].map(([range, rate], i) => (
              <View key={range} style={{ width: '50%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 2.5, backgroundColor: i % 2 === 0 ? 'white' : '#f8faff' }}>
                <Text style={[S.slabRange, { fontSize: 7.5 }]}>{range}</Text>
                <Text style={[S.slabRate,  { fontSize: 7.5 }]}>{rate}</Text>
              </View>
            ))}
          </View>
          {taxableIncome <= 1_200_000 && (
            <View style={S.rebateBadge}>
              <Text style={S.rebateText}>v Section 87A Rebate — taxable income Rs.12,00,000 or below · Full tax waived</Text>
            </View>
          )}
        </View>

        <View style={[S.table, { marginTop: 10 }]}>
          <WRow label="Tax on Salary + Debt MF (before cess)" value={INR(salaryTax)} bold />
        </View>

        <PageFooter />
      </Page>

      {/* ── PAGE 3: Capital Gains (conditionally rendered) ── */}
      {(hasEquity || hasMF) && (
        <Page size="A4" style={S.page}>
          <PageHeader itrType="ITR-2" page={3} />

          {hasEquity && (
            <>
              <SectionHeading title="Schedule CG — Equity Stock Capital Gains" />
              <Text style={S.sectionNote}>
                Tax rates changed on 23 July 2024 (Budget 2024).
                STCG: 15% → 20%  |  LTCG: 10% → 12.5%.
                First Rs.1,25,000 of total LTCG (equity + equity MF combined) is exempt under Sec 112A.
              </Text>
              <View style={S.table}>
                <View style={S.tableHead}>
                  <Text style={[S.tableHeadCell, { flex: 1 }]}>Description</Text>
                  <Text style={[S.tableHeadCell, { width: 70, textAlign: 'right' }]}>Gains</Text>
                  <Text style={[S.tableHeadCell, { width: 45, textAlign: 'right' }]}>Rate</Text>
                  <Text style={[S.tableHeadCell, { width: 70, textAlign: 'right' }]}>Tax</Text>
                </View>
                {[
                  stcgBefore > 0 ? ['STCG — before 23 Jul 2024', INR(stcgBefore), '15%', null] : null,
                  stcgAfter > 0  ? ['STCG — on/after 23 Jul 2024', INR(stcgAfter),  '20%', null] : null,
                  ltcgBefore > 0 ? ['LTCG — before 23 Jul 2024', INR(ltcgBefore), '10%', null] : null,
                  ltcgAfter > 0  ? ['LTCG — on/after 23 Jul 2024', INR(ltcgAfter),  '12.5%', null] : null,
                ].filter(Boolean).map(([desc, gains, rate, _tax], i) => (
                  <View key={String(desc)} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
                    <Text style={[S.tableCell, { flex: 1 }]}>{desc as string}</Text>
                    <Text style={[S.tableCell, S.tableCellRight, { width: 70 }]}>{gains as string}</Text>
                    <Text style={[S.tableCell, S.tableCellRight, { width: 45 }]}>{rate as string}</Text>
                    <Text style={[S.tableCell, S.tableCellRight, { width: 70 }]}>—</Text>
                  </View>
                ))}
                <View style={[S.tableRow, S.tableRowLast, { backgroundColor: '#eef2ff' }]}>
                  <Text style={[S.tableCell, S.tableCellBold, { flex: 1 }]}>Total Equity Stock Tax</Text>
                  <Text style={[S.tableCell, S.tableCellRight, { width: 70 }]}>{INR(stcgBefore + stcgAfter + ltcgBefore + ltcgAfter)}</Text>
                  <Text style={[S.tableCell, { width: 45 }]} />
                  <Text style={[S.tableCell, S.tableCellRight, S.tableCellIndigo, { width: 70 }]}>{INR(stockTax)}</Text>
                </View>
              </View>
            </>
          )}

          {hasMF && (
            <>
              <SectionHeading title="Schedule CG — Mutual Fund Capital Gains" />
              <Text style={S.sectionNote}>
                Equity MFs: STCG taxed at 20%, LTCG at 12.5% after Rs.1,25,000 exemption (Sec 112A).
                Debt MFs (post Apr 2023): gains added to income and taxed at slab rate.
              </Text>
              <View style={S.table}>
                <View style={S.tableHead}>
                  <Text style={[S.tableHeadCell, { flex: 1 }]}>Description</Text>
                  <Text style={[S.tableHeadCell, { width: 80, textAlign: 'right' }]}>Amount</Text>
                  <Text style={[S.tableHeadCell, { width: 80, textAlign: 'right' }]}>Tax</Text>
                </View>
                {/* Equity MF rows */}
                {eqStcg > 0 && (
                  <View style={S.tableRow}>
                    <Text style={[S.tableCell, { flex: 1 }]}>Equity MF — STCG (20%)</Text>
                    <Text style={[S.tableCell, S.tableCellRight, { width: 80 }]}>{INR(eqStcg)}</Text>
                    <Text style={[S.tableCell, S.tableCellRight, { width: 80 }]}>—</Text>
                  </View>
                )}
                {eqLtcg > 0 && (
                  <>
                    <View style={[S.tableRow, S.tableRowAlt]}>
                      <Text style={[S.tableCell, { flex: 1 }]}>Equity MF — LTCG (gross)</Text>
                      <Text style={[S.tableCell, S.tableCellRight, { width: 80 }]}>{INR(eqLtcg)}</Text>
                      <Text style={[S.tableCell, S.tableCellRight, { width: 80 }]}>—</Text>
                    </View>
                    <View style={S.tableRow}>
                      <Text style={[S.tableCell, { flex: 1 }]}>  Less: LTCG Exemption Sec 112A (Rs.1,25,000)</Text>
                      <Text style={[S.tableCell, S.tableCellRight, { width: 80, color: RED }]}>− {INR(eqLtcg - eqTaxableLtcg)}</Text>
                      <Text style={[S.tableCell, S.tableCellRight, { width: 80 }]}>—</Text>
                    </View>
                    <View style={[S.tableRow, S.tableRowAlt]}>
                      <Text style={[S.tableCell, { flex: 1 }]}>  Taxable LTCG (12.5%)</Text>
                      <Text style={[S.tableCell, S.tableCellRight, { width: 80 }]}>{INR(eqTaxableLtcg)}</Text>
                      <Text style={[S.tableCell, S.tableCellRight, { width: 80 }]}>—</Text>
                    </View>
                  </>
                )}
                {/* Debt MF — shown here only if equity MF page is rendered */}
                {hasDebtMFNote && (
                  <View style={S.tableRow}>
                    <Text style={[S.tableCell, { flex: 1 }]}>Debt MF STCG + LTCG (added to income → slab)</Text>
                    <Text style={[S.tableCell, S.tableCellRight, { width: 80 }]}>{INR(debtStcg + debtLtcg)}</Text>
                    <Text style={[S.tableCell, S.tableCellRight, { width: 80 }]}>at slab</Text>
                  </View>
                )}
                <View style={[S.tableRow, S.tableRowLast, { backgroundColor: '#eef2ff' }]}>
                  <Text style={[S.tableCell, S.tableCellBold, { flex: 1 }]}>Total Equity MF Tax</Text>
                  <Text style={[S.tableCell, { width: 80 }]} />
                  <Text style={[S.tableCell, S.tableCellRight, S.tableCellIndigo, { width: 80 }]}>{INR(equityMfTax)}</Text>
                </View>
              </View>
            </>
          )}

          <PageFooter />
        </Page>
      )}

      {/* ── PAGE 4: House Property (conditionally rendered) ── */}
      {hasHP && (
        <Page size="A4" style={S.page}>
          <PageHeader itrType="ITR-2" page={hasEquity || hasMF ? 4 : 3} />

          <SectionHeading title="Schedule HP — House Property Income / Loss" />
          <Text style={S.sectionNote}>
            Under the New Tax Regime: SOP has NAV = Rs.0 (no income, no Sec 24b deduction).
            For LOP/DLOP: full home loan interest deductible under Sec 24b (no cap).
            HP losses cannot be set off against salary — carried forward up to 8 years (intra-head only).
          </Text>

          {hpProperties.map((entry: HousePropertyEntry, idx: number) => {
            const inp = entry.input;
            const res = entry.result;
            if (!res) return null;
            const isLoss = res.hp_income_or_loss < 0;
            const typeStyle = inp.property_type === 'SOP' ? S.hpTypeSOP : inp.property_type === 'LOP' ? S.hpTypeLOP : S.hpTypeDLOP;

            return (
              <View key={inp.id} style={S.hpCard}>
                <View style={S.hpCardHead}>
                  <Text style={S.hpCardTitle}>{inp.label}</Text>
                  <Text style={[S.hpTypeBadge, typeStyle]}>{propTypeLabel(inp.property_type)}</Text>
                </View>

                {inp.property_type === 'SOP' ? (
                  <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 8.5, color: GRAY3 }}>
                      Self-Occupied Property — Gross Annual Value = Rs.0 under New Tax Regime.
                      No deductions applicable.  HP Income = Rs.0.
                    </Text>
                  </View>
                ) : (
                  <View>
                    <WRow label="Gross Annual Value (GAV)"
                      value={`= max(actual rent ${INR(inp.gross_rent_received, 0)}, market rent ${INR(inp.expected_market_rent, 0)}) = ${INR(res.gross_annual_value)}`}
                    />
                    <WRow label="Less: Municipal Taxes Paid" value={`− ${INR(res.municipal_taxes_paid)}`} indent neg />
                    <WRow label="Net Annual Value (NAV)" value={INR(res.net_annual_value)} bold />
                    <WRow label="Less: 30% Standard Deduction — Sec 24(a)" value={`− ${INR(res.standard_deduction_24a)}`} indent neg />
                    <WRow label="Less: Home Loan Interest — Sec 24(b)" value={`− ${INR(res.interest_deduction_24b)}`} indent neg />
                    <WRow
                      label={isLoss ? 'HP Loss' : 'HP Income'}
                      value={`${isLoss ? '− ' : '+ '}${INR(Math.abs(res.hp_income_or_loss))}`}
                      bold highlight neg={isLoss} pos={!isLoss}
                    />
                  </View>
                )}

                {isLoss && (
                  <View style={S.hpLossBox}>
                    <Text style={S.hpLossText}>
                      ✗  HP Loss of {INR(Math.abs(res.hp_income_or_loss))} CANNOT be set off against salary under the New Tax Regime.{'\n'}
                      ↷  Carry forward for {res.carryforward_years} years — can only be set off against future HP income (intra-head).
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Aggregate */}
          <View style={[S.reconcileBox, { marginTop: 8 }]}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: GRAY1, marginBottom: 10 }}>Aggregate House Property Position</Text>
            {hpNetIncome > 0 && (
              <View style={S.reconcileRow}>
                <Text style={S.reconcileLabel}>Net HP Income added to taxable income</Text>
                <Text style={[S.reconcileValue, { color: AMBER }]}>+ {INR(hpNetIncome)}</Text>
              </View>
            )}
            {hpTotalLoss > 0 && (
              <View style={[S.reconcileRow, S.reconcileRowLast]}>
                <Text style={S.reconcileLabel}>Total HP Loss (carry forward — not set off against salary)</Text>
                <Text style={[S.reconcileValue, { color: RED }]}>− {INR(hpTotalLoss)}</Text>
              </View>
            )}
          </View>

          <PageFooter />
        </Page>
      )}

      {/* ── FINAL PAGE: Tax Reconciliation ── */}
      <Page size="A4" style={S.page}>
        <PageHeader itrType="ITR-2" page={5} />

        <SectionHeading title="Final Tax Computation & Reconciliation" />
        <View style={S.table}>
          <WRow label="Tax on Salary + Debt MF" value={INR(salaryTax)} />
          {hasEquity && <WRow label="Tax on Equity Stock Gains" value={INR(stockTax)} indent />}
          {hasMF     && <WRow label="Tax on Equity Mutual Funds" value={INR(equityMfTax)} indent />}
          <WRow label="Sub-total (before cess)" value={INR(totalBfCess)} bold />
          <WRow label="+ Health & Education Cess (4%)" value={`+ ${INR(cess)}`} indent />
          <WRow label="Total Tax Liability" value={INR(totalTax)} bold highlight />
        </View>

        <SectionHeading title="TDS Reconciliation" />
        <View style={S.reconcileBox}>
          <View style={S.reconcileRow}>
            <Text style={S.reconcileLabel}>Total Tax Liability</Text>
            <Text style={S.reconcileValue}>{INR(totalTax)}</Text>
          </View>
          <View style={S.reconcileRow}>
            <Text style={S.reconcileLabel}>Less: TDS Deducted by Employer (Form-16)</Text>
            <Text style={S.reconcileValue}>− {INR(tds)}</Text>
          </View>
          <View style={S.reconcileFinalRow}>
            <Text style={S.reconcileFinalLabel}>{isRefund ? 'Refund Due to You' : 'Balance Tax Payable'}</Text>
            <Text style={[S.reconcileFinalValue, { color: isRefund ? GREEN : RED }]}>
              {INR(Math.abs(netPayable))}
            </Text>
          </View>
        </View>

        {/* Challan / refund instructions */}
        <View style={[S.tipBox, isRefund ? S.tipBoxGreen : S.tipBoxAmber]}>
          <Text style={[S.tipTitle, isRefund ? S.tipTitleGreen : S.tipTitleAmber]}>
            {isRefund ? 'Refund — What happens next' : 'Balance Payable — Action Required Before Filing'}
          </Text>
          <Text style={[S.tipText, isRefund ? S.tipTextGreen : S.tipTextAmber]}>
            {isRefund
              ? 'Your TDS exceeds your total tax liability. File your ITR on incometax.gov.in and the refund will be credited to your pre-validated bank account — typically within 30–45 days of filing. Make sure your bank account is linked and pre-validated on the portal.'
              : `You owe ${INR(Math.abs(netPayable))} in additional tax. Before filing your ITR:\n1. Go to incometax.gov.in → e-Pay Tax → Challan 280\n2. Select "Self Assessment Tax (300)"\n3. Pay ${INR(Math.abs(netPayable))}\n4. Note the BSR code and challan serial number\n5. Enter these details while filing ITR\nDelaying payment may attract interest under Sec 234B (1% per month) and 234C.`
            }
          </Text>
        </View>

        {/* 87A warning if applicable */}
        {(stcgAfter > 0 || eqStcg > 0) && (
          <View style={[S.tipBox, { backgroundColor: '#fffbeb', borderColor: '#fcd34d', marginTop: 10 }]}>
            <Text style={[S.tipTitle, { color: AMBER }]}>⚠ Section 87A — Capital Gains Note (FY 2024-25)</Text>
            <Text style={[S.tipText, { color: '#78350f' }]}>
              The Income Tax Department has clarified that Sec 87A rebate does NOT apply to STCG taxed at 20% (post-July 2024) and LTCG under Sec 112A. This computation applies 87A only to slab income (salary head). If your taxable salary income alone is Rs.12,00,000 or below, the rebate is applied there. Verify on the portal — this has been subject to legal challenge.
            </Text>
          </View>
        )}

        {/* ── Why refund / payable plain-English explanation ── */}
        <View style={[S.tipBox, isRefund ? S.tipBoxGreen : S.tipBoxAmber, { marginTop: 12 }]}>
          <Text style={[S.tipTitle, isRefund ? S.tipTitleGreen : S.tipTitleAmber]}>
            {isRefund ? 'Why are you getting a refund?' : 'Why do you owe more tax?'}
          </Text>
          <Text style={[S.tipText, isRefund ? S.tipTextGreen : S.tipTextAmber]}>
            {isRefund
              ? `Your employer deducted ${INR(tds, 0)} as TDS throughout the year based on estimated salary. Your actual tax liability, computed on all income sources (salary, capital gains, house property), is ${INR(totalTax, 0)}. Since more was deducted than required, the government owes you ${INR(Math.abs(netPayable), 0)} back.`
              : `Your employer deducted ${INR(tds, 0)} as TDS. But your final tax liability across all income sources is ${INR(totalTax, 0)}. The shortfall of ${INR(Math.abs(netPayable), 0)} must be paid via Challan 280 before filing.`
            }
          </Text>
        </View>

        {/* ── Income sources breakdown ── */}
        <SectionHeading title="Income Sources Breakdown" />
        <View style={S.table}>
          <View style={S.tableHead}>
            <Text style={[S.tableHeadCell, { flex: 1 }]}>Source</Text>
            <Text style={[S.tableHeadCell, { width: 120, textAlign: 'right' }]}>Amount</Text>
            <Text style={[S.tableHeadCell, { width: 60, textAlign: 'right' }]}>Impact</Text>
          </View>
          <View style={[S.tableRow]}>
            <Text style={[S.tableCell, { flex: 1 }]}>Salary Income (after std. deduction)</Text>
            <Text style={[S.tableCell, S.tableCellRight, { width: 120 }]}>{INR(taxableIncome)}</Text>
            <Text style={[S.tableCell, S.tableCellRight, { width: 60, color: AMBER, fontWeight: 700 }]}>Taxable</Text>
          </View>
          {hasEquity && (
            <View style={[S.tableRow, S.tableRowAlt]}>
              <Text style={[S.tableCell, { flex: 1 }]}>Equity Stock Capital Gains</Text>
              <Text style={[S.tableCell, S.tableCellRight, { width: 120 }]}>{INR(stcgBefore + stcgAfter + ltcgBefore + ltcgAfter)}</Text>
              <Text style={[S.tableCell, S.tableCellRight, { width: 60, color: AMBER, fontWeight: 700 }]}>Taxable</Text>
            </View>
          )}
          {hasMF && (
            <View style={[S.tableRow]}>
              <Text style={[S.tableCell, { flex: 1 }]}>Mutual Fund Gains (Equity + Debt)</Text>
              <Text style={[S.tableCell, S.tableCellRight, { width: 120 }]}>{INR(eqStcg + eqLtcg + debtStcg + debtLtcg)}</Text>
              <Text style={[S.tableCell, S.tableCellRight, { width: 60, color: AMBER, fontWeight: 700 }]}>Taxable</Text>
            </View>
          )}
          {hpNetIncome > 0 && (
            <View style={[S.tableRow, S.tableRowAlt]}>
              <Text style={[S.tableCell, { flex: 1 }]}>House Property Income</Text>
              <Text style={[S.tableCell, S.tableCellRight, { width: 120, color: AMBER }]}>+ {INR(hpNetIncome)}</Text>
              <Text style={[S.tableCell, S.tableCellRight, { width: 60, color: AMBER, fontWeight: 700 }]}>Added</Text>
            </View>
          )}
          {hpTotalLoss > 0 && (
            <View style={[S.tableRow]}>
              <Text style={[S.tableCell, { flex: 1 }]}>House Property Loss (carry forward)</Text>
              <Text style={[S.tableCell, S.tableCellRight, { width: 120, color: RED }]}>- {INR(hpTotalLoss)}</Text>
              <Text style={[S.tableCell, S.tableCellRight, { width: 60, color: GRAY4, fontWeight: 700 }]}>C/F only</Text>
            </View>
          )}
        </View>

        {/* ── Compliance checklist ── */}
        <SectionHeading title="Filing Readiness Checklist" />
        <View style={S.table}>
          {[
            ['Salary income reported (Form-16)', true],
            ['Standard deduction applied (Rs.75,000 — Sec 16)', true],
            hasEquity ? ['Equity stock capital gains reported (Schedule CG)', true] : null,
            hasMF ? ['Mutual fund gains reported (Schedule CG)', true] : null,
            hasHP ? ['House property income / loss reported (Schedule HP)', true] : null,
            ['TDS deducted by employer reconciled', true],
            ['New Tax Regime applied (FY 2024-25 slabs)', true],
            [(stcgAfter > 0 || eqStcg > 0) ? 'Section 87A: verify on portal for CG income' : 'Section 87A checked', (stcgAfter === 0 && eqStcg === 0)],
            ['Tax calculation complete', true],
            [isRefund ? 'Refund claim ready — file ITR to initiate' : 'Challan 280 payment required before filing', true],
          ].filter(Boolean).map(([label, ok], i, arr) => (
            <View key={String(label)} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}, i === arr.length - 1 ? S.tableRowLast : {}]}>
              <Text style={[S.tableCell, { flex: 1 }]}>{ok ? 'v' : 'o'}  {label as string}</Text>
              <Text style={[S.tableCell, { color: ok ? GREEN : AMBER, fontWeight: 700, width: 60, textAlign: 'right' }]}>{ok ? 'Done' : 'Check'}</Text>
            </View>
          ))}
        </View>

        <PageFooter />
      </Page>
    </>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────

interface TaxReportPDFProps {
  itrType: 'itr1' | 'itr2';
  itr1State?: any;
  itr2State?: any;
}

const TaxReportPDF: React.FC<TaxReportPDFProps> = ({ itrType, itr1State, itr2State }) => (
  <Document
    title={`SmartTax ${itrType.toUpperCase()} FY 2024-25`}
    author="SmartTax"
    subject="Income Tax Computation Report — New Tax Regime"
    creator="SmartTax · smarttax.in"
    producer="SmartTax (@react-pdf/renderer)"
    keywords="ITR, income tax, FY 2024-25, AY 2025-26, New Tax Regime"
  >
    {itrType === 'itr1' && itr1State
      ? <ITR1Report state={itr1State} />
      : null
    }
    {itrType === 'itr2' && itr2State
      ? <ITR2Report state={itr2State} />
      : null
    }
  </Document>
);

export default TaxReportPDF;
