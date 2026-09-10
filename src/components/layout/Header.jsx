import { Link, useLocation } from 'react-router-dom';
import { Settings, CalendarClock, Archive, FolderOpen } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { APP_NAME } from '../../lib/constants';
import { useCollegeMaterial } from '../../hooks/useCollegeMaterial';

export default function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCalendar = location.pathname === '/calendar';
  const isArchive = location.pathname === '/archive';
  const { materialUrl } = useCollegeMaterial();


  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-[var(--color-border)] pt-safe">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group min-h-[40px]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 border border-[var(--color-border)]">
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

        {/* Right actions: Calendar | Archive | Material | Theme | Gear */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {!isAdmin && (
            <>
              {/* Calendar Button */}
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

              {/* Archive Button */}
              <Link
                to="/archive"
                className={`p-2 min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors ${
                  isArchive
                    ? 'text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border-light)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]'
                }`}
                aria-label="Archive"
                title="Archive"
              >
                <Archive size={18} />
              </Link>

              {/* College Study Material Drive Link (between Archive & Theme Toggle) */}
              <a
                href={materialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                aria-label="College Study Material & Resources"
                title="College Study Material (Google Drive)"
              >
                <FolderOpen size={18} />
              </a>

              {/* Theme Toggle */}
              <ThemeToggle />


              {/* Admin Settings Button */}
              <Link
                to="/admin"
                className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]"
                aria-label="Admin Settings"
                title="Admin Settings"
              >
                <Settings size={18} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
