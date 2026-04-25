import { Link, useLocation } from 'react-router-dom';
import { useITR } from '../../contexts/ITRContext';

export const ITR2Sidebar = () => {
  const location = useLocation();
  const { itr2State } = useITR();

  const sections = [
    { path: '/app/itr-2/salary',         label: 'Salary',         status: itr2State.salary.status },
    { path: '/app/itr-2/equity',          label: 'Equity',         status: itr2State.equity.status },
    { path: '/app/itr-2/mutual-funds',    label: 'Mutual Funds',   status: itr2State.mutualFunds.status },
    { path: '/app/itr-2/house-property',  label: 'House Property', status: itr2State.houseProperty?.status ?? 'incomplete' },
    { path: '/app/itr-2/review',          label: 'Review',         status: itr2State.review.status },
    { path: '/app/itr-2/calculate',       label: 'Calculate',      status: itr2State.calculated ? 'complete' : 'incomplete' },
  ];

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (status === 'complete') return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">✓</span>
    );
    if (status === 'in_progress') return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-500 text-[11px]">◐</span>
    );
    return (
      <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${isActive ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`} />
    );
  };

  return (
    <div className="w-64 flex-shrink-0">
      <div className="sticky top-20">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-3">
          ITR-2 Workspace
        </h2>
        <nav className="space-y-0.5">
          {sections.map((section, _idx) => {
            const isActive = location.pathname === section.path;
            return (
              <Link
                key={section.path}
                to={section.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {getStatusIcon(section.status, isActive)}
                <span>{section.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
