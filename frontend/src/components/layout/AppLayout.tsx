import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ITR1Sidebar } from './ITR1Sidebar';
import { ITR2Sidebar } from './ITR2Sidebar';
import TaxAdvisorChat from '../TaxAdvisorChat';

const AppLayout = () => {
  const location = useLocation();
  
  // Only show sidebar in workspace routes
  const isITR1 = location.pathname.startsWith('/app/itr-1');
  const isITR2 = location.pathname.startsWith('/app/itr-2');
  const showSidebar = isITR1 || isITR2;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-dark)]">
      <Navbar />
      <div className="flex">
        {/* Workspace Sidebar - only shows in ITR-1 or ITR-2 */}
        {showSidebar && (isITR1 ? <ITR1Sidebar /> : <ITR2Sidebar />)}
        
        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Tax Advisor Chatbot - floating on all pages */}
      <TaxAdvisorChat />
    </div>
  );
};

export default AppLayout;
