import { Link, useLocation } from 'react-router-dom';
import { useITR } from '../../contexts/ITRContext';

export const ITR1Sidebar = () => {
  const location = useLocation();
  const { itr1State } = useITR();

  const sections = [
    { path: '/app/itr-1/salary', label: 'Salary', status: itr1State.salary.status },
    { path: '/app/itr-1/review', label: 'Review', status: itr1State.review.status },
    { path: '/app/itr-1/calculate', label: 'Calculate', status: itr1State.calculated ? 'complete' : 'incomplete' },
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'complete') return '✓';
    if (status === 'in_progress') return '◐';
    return '○';
  };

  return (
    <div className="w-64 flex-shrink-0">
      <div className="sticky top-20">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          ITR-1 Workspace
        </h2>
        <nav className="space-y-1">
          {sections.map((section) => {
            const isActive = location.pathname === section.path;
            return (
              <Link
                key={section.path}
                to={section.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-accent'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{getStatusIcon(section.status)}</span>
                <span>{section.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
