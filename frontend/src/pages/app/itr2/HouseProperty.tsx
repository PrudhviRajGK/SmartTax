import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useITR } from '../../../contexts/ITRContext';
import { useLang } from '../../../contexts/LanguageContext';
import type {
  HousePropertyInput, HousePropertyResult, HousePropertyEntry, HousePropertyAggregate, PropertyType,
} from '../../../types/tax.types';

function makeId() { return Math.random().toString(36).slice(2, 9); }

function makeDefaultInput(index: number): HousePropertyInput {
  return { id: makeId(), label: `Property ${index + 1}`, property_type: 'SOP', gross_rent_received: 0, expected_market_rent: 0, municipal_taxes_paid: 0, home_loan_interest: 0, unrealized_rent: 0, vacancy_loss: 0, pre_construction_interest: 0 };
}

const fmt = (n: number) => '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function buildAggregate(entries: HousePropertyEntry[]): HousePropertyAggregate {
  let netIncome = 0, totalLoss = 0;
  for (const e of entries) {
    if (!e.result) continue;
    const val = e.result.hp_income_or_loss;
    if (val >= 0) netIncome += val; else totalLoss += Math.abs(val);
  }
  return { net_hp_income: Math.round(netIncome * 100) / 100, total_hp_loss: Math.round(totalLoss * 100) / 100, properties: entries };
}

export default function HouseProperty() {
  const navigate = useNavigate();
  const { itr2State, updateITR2 } = useITR();
  const { t } = useLang();

  const [entries, setEntries] = useState<HousePropertyEntry[]>(() => {
    const saved = itr2State.houseProperty?.properties;
    return saved && saved.length > 0 ? saved : [{ input: makeDefaultInput(0), result: null }];
  });
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string | null>>({});

  const addProperty = () => setEntries(prev => [...prev, { input: makeDefaultInput(prev.length), result: null }]);

  const removeProperty = (id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.input.id !== id);
      return next.map((e, i) => ({ ...e, input: { ...e.input, label: `Property ${i + 1}` } }));
    });
    setErrorMap(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const updateInput = (id: string, field: keyof HousePropertyInput, value: any) => {
    setEntries(prev => prev.map(e => e.input.id === id ? { ...e, input: { ...e.input, [field]: value }, result: null } : e));
  };

  const calculateOne = async (entry: HousePropertyEntry): Promise<HousePropertyResult | null> => {
    const id = entry.input.id;
    setLoadingMap(prev => ({ ...prev, [id]: true }));
    setErrorMap(prev => ({ ...prev, [id]: null }));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/calculate/house-property`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_type:        entry.input.property_type,
          gross_rent_received:  entry.input.gross_rent_received,
          expected_market_rent: entry.input.expected_market_rent,
          municipal_taxes_paid: entry.input.municipal_taxes_paid,
          home_loan_interest:   entry.input.home_loan_interest,
          vacancy_loss:         entry.input.vacancy_loss         ?? 0,
          unrealized_rent:      entry.input.unrealized_rent      ?? 0,
          pre_construction_interest: entry.input.pre_construction_interest ?? 0,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error('Calculation failed');
      return json.data as HousePropertyResult;
    } catch (e: any) {
      setErrorMap(prev => ({ ...prev, [id]: e.message ?? 'Something went wrong' }));
      return null;
    } finally {
      setLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCalculateAll = async () => {
    const updatedEntries: HousePropertyEntry[] = [];
    for (const entry of entries) {
      const result = await calculateOne(entry);
      updatedEntries.push({ ...entry, result });
    }
    setEntries(updatedEntries);
    const allDone = updatedEntries.every(e => e.result !== null);
    const aggregate = buildAggregate(updatedEntries);
    updateITR2('houseProperty', { status: allDone ? 'complete' : 'in_progress', properties: updatedEntries, aggregate });
    if (allDone) navigate('/app/itr-2/review');
  };

  const handleSkip = () => {
    updateITR2('houseProperty', { status: 'complete', properties: [], aggregate: { net_hp_income: 0, total_hp_loss: 0, properties: [] } });
    navigate('/app/itr-2/review');
  };

  const aggregate = buildAggregate(entries);
  const hasAnyResult = entries.some(e => e.result !== null);
  const anyLoading = Object.values(loadingMap).some(Boolean);

  const PROPERTY_OPTIONS: { value: PropertyType; labelKey: string; hintKey: string }[] = [
    { value: 'SOP',  labelKey: 'hp.sop_label',  hintKey: 'hp.sop_hint' },
    { value: 'LOP',  labelKey: 'hp.lop_label',  hintKey: 'hp.lop_hint' },
    { value: 'DLOP', labelKey: 'hp.dlop_label', hintKey: 'hp.dlop_hint' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('hp.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('hp.subtitle')}</p>
      </div>

      {entries.map((entry, idx) => {
        const { input, result } = entry;
        const isRented = input.property_type === 'LOP' || input.property_type === 'DLOP';
        const loading = !!loadingMap[input.id];
        const err = errorMap[input.id] ?? null;

        return (
          <div key={input.id} className="bg-white dark:bg-gray-800 rounded-xl shadow divide-y divide-gray-100 dark:divide-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">{input.label}</h3>
              {entries.length > 1 && (
                <button onClick={() => removeProperty(input.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                  {t('hp.remove')}
                </button>
              )}
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-5">
              {/* Property type */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('hp.prop_type')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {PROPERTY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateInput(input.id, 'property_type', opt.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        input.property_type === opt.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-800 dark:text-white">{t(opt.labelKey)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t(opt.hintKey)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SOP notice */}
              {input.property_type === 'SOP' && (
                <div className="rounded-lg p-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {t('hp.sop_warning')}
                </div>
              )}

              {/* Rented fields */}
              {isRented && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {input.property_type === 'LOP' && (
                    <NumberField label={t('hp.gross_rent')} value={input.gross_rent_received} onChange={v => updateInput(input.id, 'gross_rent_received', v)} />
                  )}
                  <NumberField
                    label={t('hp.market_rent')} value={input.expected_market_rent}
                    onChange={v => updateInput(input.id, 'expected_market_rent', v)}
                    hint={input.property_type === 'LOP' ? t('hp.gav_hint_lop') : t('hp.gav_hint_dlop')}
                  />
                  <NumberField label={t('hp.municipal_tax')} value={input.municipal_taxes_paid} onChange={v => updateInput(input.id, 'municipal_taxes_paid', v)} hint={t('hp.municipal_hint')} />
                  <NumberField label={t('hp.loan_interest')} value={input.home_loan_interest} onChange={v => updateInput(input.id, 'home_loan_interest', v)} hint={t('hp.loan_hint')} />
                </div>
              )}

              {/* Optional ITR portal fields (informational — do not affect New Regime computation) */}
              {isRented && (
                <AdvancedFields
                  input={input}
                  onUpdate={(field, val) => updateInput(input.id, field as keyof HousePropertyInput, val)}
                />
              )}

              {/* Preview button */}
              <button
                onClick={async () => {
                  const result = await calculateOne(entry);
                  if (result) setEntries(prev => prev.map(p => p.input.id === input.id ? { ...p, result } : p));
                }}
                disabled={loading}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-200 font-medium py-2 rounded-lg text-sm transition-colors"
              >
                {loading ? t('hp.calculating') : t('hp.preview')}
              </button>
              {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}
            </div>

            {/* Result breakdown */}
            {result && (
              <div className="px-6 py-5 space-y-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-b-xl">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t('hp.breakdown')}</p>
                <BRow label={t('hp.gav')} value={fmt(result.gross_annual_value)} />
                <BRow label={t('hp.less_muni')} value={`− ${fmt(result.municipal_taxes_paid)}`} />
                <BRow label={t('hp.nav')} value={fmt(result.net_annual_value)} bold />
                <BRow label={t('hp.std_dedn')} value={`− ${fmt(result.standard_deduction_24a)}`} />
                <BRow label={t('hp.interest_dedn')} value={`− ${fmt(result.interest_deduction_24b)}`} />
                <div className={`flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-700 ${result.hp_income_or_loss < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                  <span>{result.hp_income_or_loss < 0 ? t('hp.hp_loss') : t('hp.hp_income')}</span>
                  <span>{fmt(result.hp_income_or_loss)}</span>
                </div>
                {result.hp_income_or_loss < 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-sm space-y-1">
                    <p className="text-red-700 dark:text-red-300">✗ <strong>{t('hp.no_setoff')}</strong></p>
                    <p className="text-red-600 dark:text-red-400">↷ {t('hp.carry_fwd').replace('{n}', String(result.carryforward_years))}</p>
                  </div>
                )}
                {result.notes?.map((note: string, i: number) => (
                  <p key={i} className="text-xs text-gray-500 dark:text-gray-400 italic">{note}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add property */}
      <button
        onClick={addProperty}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        {t('hp.add_another')}
      </button>

      {/* Aggregate banner */}
      {hasAnyResult && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('hp.net_income')}</p>
            <p className={`text-xl font-bold ${aggregate.net_hp_income > 0 ? 'text-green-600' : 'text-gray-800 dark:text-gray-100'}`}>{fmt(aggregate.net_hp_income)}</p>
          </div>
          {aggregate.total_hp_loss > 0 && (
            <div className="text-right space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('hp.total_loss')}</p>
              <p className="text-xl font-bold text-red-500">− {fmt(aggregate.total_hp_loss)}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={handleSkip} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline transition-colors">
          {t('hp.skip')}
        </button>
        <button
          onClick={handleCalculateAll}
          disabled={anyLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {anyLoading ? t('hp.calculating') : t('hp.calc_continue')}
        </button>
      </div>
    </div>
  );
}

function AdvancedFields({ input, onUpdate }: { input: any; onUpdate: (field: string, val: number) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Additional ITR portal fields (optional)
        </span>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 bg-gray-50/50 dark:bg-gray-900/20">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
            These fields are required on the Income Tax portal but do <strong>not</strong> change your tax under the New Tax Regime. Enter them for record-keeping or if you plan to file manually on the portal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField
              label="Unrealized Rent Recovered"
              value={input.unrealized_rent ?? 0}
              onChange={v => onUpdate('unrealized_rent', v)}
              hint="Rent arrears received this year from a previous tenant (added to GAV)"
            />
            <NumberField
              label="Vacancy Loss (Annual)"
              value={input.vacancy_loss ?? 0}
              onChange={v => onUpdate('vacancy_loss', v)}
              hint="Number of months the property was vacant × monthly expected rent"
            />
            <div className="md:col-span-2">
              <NumberField
                label="Pre-construction Interest (Annual instalment)"
                value={input.pre_construction_interest ?? 0}
                onChange={v => onUpdate('pre_construction_interest', v)}
                hint="Total pre-construction period interest ÷ 5, deductible over 5 years under Sec 24(b). Only applicable for Let-Out / Deemed Let-Out."
              />
            </div>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-[12px] text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Interest limit logic (New Regime)</p>
            <p>Self-Occupied → No deduction (NAV = ₹0, Sec 24b not available)</p>
            <p>Let Out / Deemed Let Out → Full interest deductible, no cap</p>
            <p className="text-[11px] text-gray-400 mt-1 italic">Note: Under Old Regime, SOP Sec 24b cap was ₹2,00,000. Under New Regime, no deduction is available for SOP.</p>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Multiple property aggregation: SmartTax sums all property incomes and losses. HP losses cannot be set off against salary under New Regime — only carried forward 8 years intra-head.
          </p>
        </div>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
      <input type="number" min={0} value={value || ''} onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function BRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-semibold' : ''} text-gray-700 dark:text-gray-300`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
