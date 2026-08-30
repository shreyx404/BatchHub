import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus, FileText, BookOpen,
  CalendarClock, LogOut, X
} from 'lucide-react';
import { APP_NAME } from '../../lib/constants';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/create', icon: FilePlus, label: 'Create Post' },
  { to: '/admin/posts', icon: FileText, label: 'All Posts' },
  { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/admin/calendar', icon: CalendarClock, label: 'Calendar' },
];

export default function AdminSidebar({ isOpen, onClose, onLogout }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-dvh w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 pt-safe pb-safe
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white flex items-center justify-center overflow-hidden">
              <img
                src="/batchhub-icon.png"
                alt={APP_NAME}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <span className="font-display text-lg font-medium leading-none mt-1 text-[var(--color-text)] tracking-[-0.01em]">
              {APP_NAME}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text)] font-medium border border-[var(--color-border)] tracking-[0.06em] uppercase">
              Admin
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center hover:bg-[var(--color-surface-2)] lg:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] text-[var(--text-sm)] font-medium transition-all duration-200 tracking-[0.005em] ${
                  isActive
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-hover)] border border-[var(--color-accent)]/20'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] border border-transparent'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 min-h-[44px] text-[var(--text-sm)] font-medium text-red-400 hover:bg-red-500/10 transition-colors duration-200 tracking-[0.005em]"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
