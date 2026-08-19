import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search posts... (Press /)' }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === '/' || e.key.toLowerCase() === 's') &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
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
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] group-focus-within:text-[var(--color-text)] transition-colors"
      />
      <input
        id="search-bar"
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-light)] focus:ring-1 focus:ring-[var(--color-border-light)] transition-all tracking-[0.005em]"
      />
    </div>
  );
}
