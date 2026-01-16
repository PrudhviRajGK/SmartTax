import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Navbar } from '../components/layout/Navbar';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-1.5 bg-[rgb(var(--color-accent-light))] rounded-full mb-4">
            
            </div>
            
            <h1 className="text-[56px] md:text-[72px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight leading-[1.1]">
              Smart
              <br />
              <span className="text-[rgb(var(--color-accent))]">TAX</span>
            </h1>
            
            <p className="text-[19px] text-[rgb(var(--color-text-secondary))] max-w-2xl mx-auto leading-relaxed">
              Automated tax computation for ITR-1 and ITR-2. Upload your documents, 
              we handle the calculations. Professional-grade accuracy, zero complexity.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              {user ? (
                <Link
                  to="/app/dashboard"
                  className="px-8 py-4 bg-[rgb(var(--color-accent))] text-white rounded-xl font-medium hover:bg-[rgb(var(--color-accent-hover))] transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] text-[16px]"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-[rgb(var(--color-accent))] text-white rounded-xl font-medium hover:bg-[rgb(var(--color-accent-hover))] transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] text-[16px]"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))] rounded-xl font-medium hover:bg-[rgb(var(--color-bg-tertiary))] transition-all text-[16px]"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 border-t border-[rgb(var(--color-border-subtle))]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight mb-4">
              Everything you need
            </h2>
            <p className="text-[17px] text-[rgb(var(--color-text-secondary))] max-w-2xl mx-auto">
              Built for accuracy, designed for simplicity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            <div className="p-8 bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-subtle))] hover:border-[rgb(var(--color-border))] transition-all hover:shadow-[var(--shadow-card)] group">
              <div className="w-12 h-12 bg-[rgb(var(--color-accent-light))] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[rgb(var(--color-accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold mb-3 text-[rgb(var(--color-text-primary))]">
                Document Parsing
              </h3>
              <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                Automated extraction from Form-16 PDFs and broker capital gains reports. Supports Groww and Zerodha formats.
              </p>
            </div>

            <div className="p-8 bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-subtle))] hover:border-[rgb(var(--color-border))] transition-all hover:shadow-[var(--shadow-card)] group">
              <div className="w-12 h-12 bg-[rgb(var(--color-accent-light))] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[rgb(var(--color-accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold mb-3 text-[rgb(var(--color-text-primary))]">
                Tax Computation
              </h3>
              <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                New Tax Regime FY 2024-25 compliant. STCG, LTCG, and mutual fund capital gains calculated per IT Act.
              </p>
            </div>

            <div className="p-8 bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-subtle))] hover:border-[rgb(var(--color-border))] transition-all hover:shadow-[var(--shadow-card)] group">
              <div className="w-12 h-12 bg-[rgb(var(--color-accent-light))] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[rgb(var(--color-accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold mb-3 text-[rgb(var(--color-text-primary))]">
                Data Security
              </h3>
              <p className="text-[15px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                Financial data encrypted at rest and in transit. Secure authentication with Supabase. No third-party sharing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-20 border-t border-[rgb(var(--color-border-subtle))]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-[40px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight mb-4">
              Ready to file your taxes?
            </h2>
            <p className="text-[17px] text-[rgb(var(--color-text-secondary))] mb-8 max-w-2xl mx-auto">
              Join professionals who trust SmartTax for accurate, hassle-free tax filing
            </p>
            <Link
              to="/signup"
              className="inline-block px-10 py-4 bg-[rgb(var(--color-accent))] text-white rounded-xl font-medium hover:bg-[rgb(var(--color-accent-hover))] transition-all shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] text-[16px]"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-12 border-t border-[rgb(var(--color-border-subtle))]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[14px] text-[rgb(var(--color-text-tertiary))]">
              © 2025 SmartTax. Built for FY 2024–25.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/info" className="text-[14px] text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors">
                How it works
              </Link>
              <a href="#" className="text-[14px] text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors">
                Privacy
              </a>
              <a href="#" className="text-[14px] text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
