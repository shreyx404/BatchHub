import { Link, useLocation } from 'react-router-dom';
import { Search, X, Settings, CalendarClock } from 'lucide-react';
import { APP_NAME } from '../../lib/constants';

export default function Header({ searchOpen, onToggleSearch, onSearchChange, searchValue }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCalendar = location.pathname === '/calendar';

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-white flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="/batchhub-icon.png"
                alt={APP_NAME}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <span className="font-display text-lg font-medium tracking-[-0.01em] text-[var(--color-text)] leading-none">
              {APP_NAME}
            </span>
          </Link>

          {/* Calendar nav link */}
          {!isAdmin && (
            <Link
              to="/calendar"
              className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 text-[var(--text-xs)] font-medium tracking-[0.01em] transition-colors ${
                isCalendar
                  ? 'text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border-light)]'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] border border-transparent hover:border-[var(--color-border)]'
              }`}
              aria-label="Academic Calendar"
            >
              <CalendarClock size={13} />
              <span className="inline">Calendar</span>
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <>
              {searchOpen ? (
                <div className="flex items-center gap-2 animate-fade-in">
                  <input
                    id="header-search"
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search updates..."
                    autoFocus
                    className="w-40 sm:w-56 h-9 px-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-light)] transition-colors tracking-[0.005em]"
                  />
                  <button
                    onClick={onToggleSearch}
                    className="p-2 hover:bg-[var(--color-surface-2)] transition-colors text-[var(--color-text-muted)]"
                    aria-label="Close search"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onToggleSearch}
                  className="p-2 hover:bg-[var(--color-surface-2)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  aria-label="Open search"
                >
                  <Search size={18} />
                </button>
              )}
            </>
          )}

          {!isAdmin && (
            <Link
              to="/admin"
              className="p-2 hover:bg-[var(--color-surface-2)] transition-colors text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]"
              aria-label="Admin"
            >
              <Settings size={18} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
