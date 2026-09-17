import { Folder } from 'lucide-react';

export default function FolderCard({ subject, onClick }) {
  const subjectColor = subject.color || null;
  const hoverBorderColor = subjectColor || 'var(--color-amber)';
  const hoverGlowColor = subjectColor ? `${subjectColor}55` : 'var(--color-amber-glow)';

  return (
    <button
      onClick={onClick}
      className="group block relative w-full text-left pl-5 sm:pl-7 py-5 sm:py-6 border-l border-[var(--color-border)] transition-all duration-300 hover:-translate-y-0.5 hover:translate-x-0.5 active:bg-[var(--color-surface-3)]"
      style={{
        '--hover-border-color': hoverBorderColor,
        '--hover-glow-color': hoverGlowColor,
        backgroundImage: 'linear-gradient(90deg, transparent, transparent)',
        transition: 'background-image 0.5s ease, transform 0.3s ease, background-color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundImage = `linear-gradient(90deg, ${subjectColor ? subjectColor + '08' : 'rgba(212, 165, 116, 0.04)'}, transparent 70%)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundImage = 'linear-gradient(90deg, transparent, transparent)';
      }}
    >
      {/* Ledger Node Marker */}
      <div 
        className="absolute left-[-4px] top-[26px] sm:top-[30px] w-[7px] h-[7px] bg-[var(--color-border-light)] transition-colors duration-300 group-hover:bg-[var(--hover-border-color)]"
        style={{
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
      />
      {/* Ledger glowing line overlay */}
      <div 
        className="absolute left-0 top-0 w-[1px] h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to bottom, transparent, var(--hover-border-color), transparent)` }}
      />
      
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] group-hover:border-[var(--hover-border-color)] transition-colors duration-300 flex items-center justify-center">
            <Folder size={22} className="text-[var(--color-text-dim)] group-hover:text-[var(--hover-border-color)] transition-colors duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[var(--text-base)] sm:text-[var(--text-lg)] font-display font-semibold text-[var(--color-text)] tracking-[-0.01em] leading-snug group-hover:text-[var(--color-text)] transition-colors truncate">
            {subject.name}
          </h3>
          {subject.code && (
            <p className="text-[10px] font-mono tracking-[0.04em] text-[var(--color-text-dim)] mt-1 uppercase truncate">
              {subject.code}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
