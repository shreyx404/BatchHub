import { Link, useLocation } from 'react-router-dom';
import { Search, X, Settings, CalendarClock } from 'lucide-react';
import { APP_NAME } from '../../lib/constants';

export default function Header({ searchOpen, onToggleSearch, onSearchChange, searchValue }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCalendar = location.pathname === '/calendar';

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-[var(--color-border)] pt-safe">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group min-h-[40px]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <img
              src="/batchhub-icon.png"
              alt={APP_NAME}
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <span className="font-display text-base sm:text-lg font-medium tracking-[-0.01em] text-[var(--color-text)] leading-none">
            {APP_NAME}
          </span>
        </Link>

        {/* Right actions: Search | Calendar | Gear */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {!isAdmin && (
            <>
              {searchOpen ? (
                <div className="flex items-center gap-1.5 animate-fade-in">
                  <input
                    id="header-search"
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search updates..."
                    autoFocus
                    className="w-32 xs:w-44 sm:w-60 h-9 px-2.5 sm:px-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-xs)] sm:text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-light)] transition-colors tracking-[0.005em]"
                  />
                  <button
                    onClick={onToggleSearch}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-muted)]"
                    aria-label="Close search"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onToggleSearch}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  aria-label="Open search"
                  title="Search"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Calendar Button (between Search and Gear) */}
              <Link
                to="/calendar"
                className={`p-2 min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors ${
                  isCalendar
                    ? 'text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border-light)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]'
                }`}
                aria-label="Academic Calendar"
                title="Academic Calendar"
              >
                <CalendarClock size={18} />
              </Link>
            </>
          )}

          {!isAdmin && (
            <Link
              to="/admin"
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]"
              aria-label="Admin Settings"
              title="Admin Settings"
            >
              <Settings size={18} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
