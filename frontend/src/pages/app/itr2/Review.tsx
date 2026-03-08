import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useITR } from '../../../contexts/ITRContext';
import { useLang } from '../../../contexts/LanguageContext';

const ITR2Review = () => {
  const navigate = useNavigate();
  const { itr2State, updateITR2 } = useITR();
  const { t } = useLang();

  const canProceed = itr2State.salary.status === 'complete';
  const handleConfirm = () => { updateITR2('review', { status: 'complete' }); navigate('/app/itr-2/calculate'); };

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const propTypeLabel = (type: string) => {
    if (type === 'SOP') return t('r2.self_occ');
    if (type === 'LOP') return t('r2.let_out');
    return t('r2.deemed');
  };

  if (!canProceed) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('r2.title')}</h1>
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">{t('r2.incomplete')}</p>
          <Button onClick={() => navigate('/app/itr-2/salary')} className="mt-4">{t('r2.go_salary')}</Button>
        </div>
      </Card>
    </div>
  );

  const hpAgg = itr2State.houseProperty?.aggregate;
  const hpProperties = itr2State.houseProperty?.properties ?? [];
  const hasHP = hpProperties.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('r2.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('r2.subtitle')}</p>
      </div>

      {/* Salary */}
      {itr2State.salary.data && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('r2.salary')}</h2>
            <button onClick={() => navigate('/app/itr-2/salary')} className="text-sm text-blue-500 hover:text-blue-700">{t('common.edit')}</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <ReviewCell label={t('common.gross_salary')} value={fmt(itr2State.salary.data.gross_salary || itr2State.salary.data.salary || 0)} />
            <ReviewCell label={t('common.tds_paid')} value={fmt(itr2State.salary.data.tds_paid || itr2State.salary.data.deductions || 0)} />
          </div>
        </Card>
      )}

      {/* Equity */}
      {itr2State.equity.data && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('r2.equity')}</h2>
            <button onClick={() => navigate('/app/itr-2/equity')} className="text-sm text-blue-500 hover:text-blue-700">{t('common.edit')}</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <ReviewCell label={t('r2.stcg_before')} value={fmt(itr2State.equity.data.stcg_before ?? 0)} />
            <ReviewCell label={t('r2.stcg_after')} value={fmt(itr2State.equity.data.stcg_after ?? 0)} />
            <ReviewCell label={t('r2.ltcg_before')} value={fmt(itr2State.equity.data.ltcg_before ?? 0)} />
            <ReviewCell label={t('r2.ltcg_after')} value={fmt(itr2State.equity.data.ltcg_after ?? 0)} />
          </div>
        </Card>
      )}

      {/* Mutual Funds */}
      {itr2State.mutualFunds.data && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('r2.mf')}</h2>
            <button onClick={() => navigate('/app/itr-2/mutual-funds')} className="text-sm text-blue-500 hover:text-blue-700">{t('common.edit')}</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <ReviewCell label={t('r2.eq_stcg')} value={fmt(itr2State.mutualFunds.data.equity_stcg ?? 0)} />
            <ReviewCell label={t('r2.eq_ltcg')} value={fmt(itr2State.mutualFunds.data.equity_ltcg ?? 0)} />
            <ReviewCell label={t('r2.debt_stcg')} value={fmt(itr2State.mutualFunds.data.debt_stcg ?? 0)} />
            <ReviewCell label={t('r2.debt_ltcg')} value={fmt(itr2State.mutualFunds.data.debt_ltcg ?? 0)} />
          </div>
        </Card>
      )}

      {/* House Property */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('r2.hp')}</h2>
          <button onClick={() => navigate('/app/itr-2/house-property')} className="text-sm text-blue-500 hover:text-blue-700">
            {hasHP ? t('common.edit') : t('common.add')}
          </button>
        </div>
        {!hasHP ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('r2.no_hp')}</p>
        ) : (
          <div className="space-y-4">
            {hpProperties.map((entry: any) => {
              const r = entry.result;
              if (!r) return null;
              const isLoss = r.hp_income_or_loss < 0;
              return (
                <div key={entry.input.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {entry.input.label}
                      <span className="ml-2 text-xs text-gray-400">({propTypeLabel(r.property_type)})</span>
                    </span>
                    <span className={`text-sm font-semibold ${isLoss ? 'text-red-500' : 'text-green-600'}`}>
                      {isLoss ? '− ' : '+ '}{fmt(Math.abs(r.hp_income_or_loss))}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>GAV: {fmt(r.gross_annual_value)}</span>
                    <span>NAV: {fmt(r.net_annual_value)}</span>
                    <span>Std dedn: {fmt(r.standard_deduction_24a)}</span>
                    <span>Interest 24b: {fmt(r.interest_deduction_24b)}</span>
                  </div>
                  {isLoss && (
                    <p className="text-xs text-red-400">
                      {t('r2.carry_fwd').replace('{n}', String(r.carryforward_years))}
                    </p>
                  )}
                </div>
              );
            })}
            {hpAgg && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{t('r2.net_hp_income')}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{fmt(hpAgg.net_hp_income)}</span>
                </div>
                {hpAgg.total_hp_loss > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t('r2.total_hp_loss')}</span>
                    <span className="font-semibold text-red-500">− {fmt(hpAgg.total_hp_loss)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex space-x-4">
        <Button onClick={() => navigate('/app/itr-2/salary')} variant="secondary">{t('r2.edit_data')}</Button>
        <Button onClick={handleConfirm}>{t('r2.confirm')}</Button>
      </div>
    </div>
  );
};

function ReviewCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
    </div>
  );
}

export default ITR2Review;
