import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { useLang } from '../../contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';

// ── Inline logo components — no file imports needed ─────────────────────────
// Uses the v4 color system: #1e3a8a (mark top) → #2563eb (mark bottom/tax text)

const LogoMark = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="st-mark-bg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%"  stopColor="#1e3a8a"/>
        <stop offset="100%" stopColor="#2563eb"/>
      </linearGradient>
      <linearGradient id="st-mark-sh" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%"  stopColor="white" stopOpacity="0.15"/>
        <stop offset="50%" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <rect width="56" height="56" rx="13" fill="url(#st-mark-bg)"/>
    <rect width="56" height="56" rx="13" fill="url(#st-mark-sh)"/>
    {/* Rupee symbol — uniform 3px strokes */}
    <g stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <line x1="13" y1="13" x2="37" y2="13"/>
      <line x1="13" y1="20" x2="34" y2="20"/>
      <line x1="20" y1="13" x2="20" y2="44"/>
      <line x1="13" y1="20" x2="36" y2="44"/>
    </g>
    {/* Integrated check badge */}
    <circle cx="43" cy="43" r="9"   fill="white"/>
    <circle cx="43" cy="43" r="7.2" fill="#15803d"/>
    <polyline points="39.2,43.1 42.0,45.8 46.8,40.2"
      stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// Light mode wordmark (dark navy SMART + blue tax)
const WordmarkLight = () => (
  <svg width="110" height="32" viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="23"
      fontFamily="'Montserrat','DM Sans','Helvetica Neue',sans-serif"
      fontSize="20" fontWeight="800" letterSpacing="-0.4" fill="#1e3a8a">SMART</text>
    <text x="72" y="24"
      fontFamily="'Montserrat','DM Sans','Helvetica Neue',sans-serif"
      fontSize="21" fontWeight="400" letterSpacing="-0.4" fill="#2563eb">tax</text>
  </svg>
);

// Dark mode wordmark (white SMART + blue-300 tax)
const WordmarkDark = () => (
  <svg width="110" height="32" viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="23"
      fontFamily="'Montserrat','DM Sans','Helvetica Neue',sans-serif"
      fontSize="20" fontWeight="800" letterSpacing="-0.4" fill="#f1f5f9">SMART</text>
    <text x="72" y="24"
      fontFamily="'Montserrat','DM Sans','Helvetica Neue',sans-serif"
      fontSize="21" fontWeight="400" letterSpacing="-0.4" fill="#60a5fa">tax</text>
  </svg>
);

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

  const isActive   = (path: string) => location.pathname === path;
  const startsWith = (path: string) => location.pathname.startsWith(path);
  const isDark     = theme === 'dark';

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

          {/* ── Logo ── */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-85 transition-opacity duration-150"
              aria-label="SmartTax home"
            >
              <LogoMark size={32} />
              {isDark ? <WordmarkDark /> : <WordmarkLight />}
            </Link>

            {/* Nav links — only when logged in */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                <Link to="/app/dashboard"    className={navLinkClass(isActive('/app/dashboard'))}>
                  {t('nav.overview')}
                </Link>
                <Link to="/app/itr-1/salary" className={navLinkClass(startsWith('/app/itr-1'))}>
                  ITR-1
                </Link>
                <Link to="/app/itr-2/salary" className={navLinkClass(startsWith('/app/itr-2'))}>
                  ITR-2
                </Link>
                <Link to="/app/history"      className={navLinkClass(isActive('/app/history'))}>
                  {t('nav.history')}
                </Link>
                <Link to="/info"             className={navLinkClass(isActive('/info'))}>
                  {t('nav.info')}
                </Link>
              </div>
            )}
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center space-x-2">

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgb(var(--color-border-subtle))] text-[13px] font-semibold transition-all hover:bg-[rgb(var(--color-bg-tertiary))]"
              title="Switch Language"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="text-[rgb(var(--color-text-secondary))]">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className="text-[rgb(var(--color-text-secondary))]">
                {({'en':'EN','hi':'हिं','bn':'বাং','or':'ଓଡ଼ି','ta':'தமிழ்','te':'తెలుగు'} as Record<string,string>)[lang] ?? 'EN'}
              </span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] transition-all duration-150"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5"/>
                  <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              )}
            </button>

            {/* User avatar + dropdown */}
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
