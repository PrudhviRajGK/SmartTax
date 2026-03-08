import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { useLang } from '../../contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const startsWith = (path: string) => location.pathname.startsWith(path);

  const getUserInitials = (email: string) => email.substring(0, 2).toUpperCase();

  const navLinkClass = (active: boolean) =>
    `px-3 py-2 rounded-lg text-[15px] font-medium transition-all duration-150 ${
      active
        ? 'text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-tertiary))]'
        : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))]'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgb(var(--color-bg-primary))] border-b border-[rgb(var(--color-border-subtle))] backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Nav Links */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-[17px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight hover:opacity-80 transition-opacity"
            >
              SmartTax
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-1">
                <Link to="/app/dashboard" className={navLinkClass(isActive('/app/dashboard'))}>
                  {t('nav.overview')}
                </Link>
                <Link to="/app/itr-1/salary" className={navLinkClass(startsWith('/app/itr-1'))}>
                  ITR-1
                </Link>
                <Link to="/app/itr-2/salary" className={navLinkClass(startsWith('/app/itr-2'))}>
                  ITR-2
                </Link>
                <Link to="/app/history" className={navLinkClass(isActive('/app/history'))}>
                  {t('nav.history')}
                </Link>
                <Link to="/info" className={navLinkClass(isActive('/info'))}>
                  {t('nav.info')}
                </Link>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-2">

            {/* Hindi / English toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgb(var(--color-border-subtle))] text-[13px] font-semibold transition-all hover:bg-[rgb(var(--color-bg-tertiary))]"
              title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              <span className="text-[15px]">{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
              <span className="text-[rgb(var(--color-text-secondary))]">
                {lang === 'en' ? 'हिं' : 'EN'}
              </span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] transition-all duration-150"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* User menu */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full bg-[rgb(var(--color-accent))] text-white flex items-center justify-center text-[13px] font-medium hover:bg-[rgb(var(--color-accent-hover))] transition-all duration-150"
                  aria-label="User menu"
                >
                  {getUserInitials(user.email || '')}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border))] rounded-xl shadow-[var(--shadow-lg)] py-1 animate-fade-in">
                    <div className="px-4 py-3 border-b border-[rgb(var(--color-border-subtle))]">
                      <p className="text-[13px] text-[rgb(var(--color-text-tertiary))] truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/app/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-[15px] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
                    >
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to="/app/history"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-[15px] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
                    >
                      {t('nav.history')}
                    </Link>
                    <button
                      onClick={() => { signOut(); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[15px] text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error-bg))] transition-colors"
                    >
                      {t('nav.signout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
