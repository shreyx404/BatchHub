import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search updates... (Ctrl + K)' }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full group">
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] group-focus-within:text-[var(--color-text)] transition-colors"
      />
      <input
        id="search-bar"
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-16 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-light)] focus:ring-1 focus:ring-[var(--color-border-light)] transition-all tracking-[0.005em]"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-[var(--color-text-dim)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1.5 py-0.5">
        <span>⌘/Ctrl</span>
        <span>K</span>
      </div>
    </div>
  );
}
