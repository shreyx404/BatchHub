import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { effectiveTheme, toggleTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-dim)] hover:text-[var(--color-text)] relative group ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <div className="relative w-[18px] h-[18px] flex items-center justify-center">
        {isDark ? (
          <Sun
            size={18}
            className="transition-transform duration-300 group-hover:rotate-45 text-[var(--color-text-dim)] group-hover:text-[var(--color-amber)]"
          />
        ) : (
          <Moon
            size={18}
            className="transition-transform duration-300 group-hover:-rotate-12 text-[var(--color-text-dim)] group-hover:text-[var(--color-amber)]"
          />
        )}
      </div>
    </button>
  );
}
