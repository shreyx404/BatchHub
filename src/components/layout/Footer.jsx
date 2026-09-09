import { Link, useLocation } from 'react-router-dom';
import { APP_NAME, APP_TAGLINE } from '../../lib/constants';

export default function Footer() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <footer className="border-t border-[var(--color-border)] mt-auto pb-safe">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-8 sm:py-10">
        {/* Navigation row */}
        {!isAdmin && (
          <nav className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Link
              to="/"
              className="text-[10px] sm:text-[var(--text-xs)] font-mono uppercase tracking-[0.08em] text-[var(--color-text-dim)] hover:text-[var(--color-amber)] transition-colors duration-300"
            >
              Home
            </Link>
            <span className="text-[var(--color-border-light)]">·</span>
            <Link
              to="/calendar"
              className="text-[10px] sm:text-[var(--text-xs)] font-mono uppercase tracking-[0.08em] text-[var(--color-text-dim)] hover:text-[var(--color-amber)] transition-colors duration-300"
            >
              Calendar
            </Link>
            <span className="text-[var(--color-border-light)]">·</span>
            <Link
              to="/archive"
              className="text-[10px] sm:text-[var(--text-xs)] font-mono uppercase tracking-[0.08em] text-[var(--color-text-dim)] hover:text-[var(--color-amber)] transition-colors duration-300"
            >
              Archive
            </Link>
          </nav>
        )}

        {/* Divider */}
        <div className="w-8 h-[1px] bg-[var(--color-border)] mb-4 sm:mb-5" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-xs)] font-light text-[var(--color-text-dim)] tracking-[0.02em]">
              © {new Date().getFullYear()} {APP_NAME}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.04em] text-[var(--color-border-light)] uppercase">
              {APP_TAGLINE}
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-[0.04em] text-[var(--color-border-light)] uppercase">
            Crafted for your batch
          </span>
        </div>
      </div>
    </footer>
  );
}
