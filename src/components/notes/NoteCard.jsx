import { ExternalLink, ArrowUpRight } from 'lucide-react';
import Badge from '../ui/Badge';

export default function NoteCard({ note }) {
  const subjectColor = note.subjects?.color || null;
  const hoverBorderColor = subjectColor || 'var(--color-amber)';

  return (
    <a
      href={note.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative pl-5 sm:pl-7 py-5 sm:py-7 border-l border-[var(--color-border)] transition-all duration-300 hover:-translate-y-0.5 hover:translate-x-0.5"
      style={{
        '--hover-border-color': hoverBorderColor,
        backgroundImage: 'linear-gradient(90deg, transparent, transparent)',
        transition: 'background-image 0.5s ease, transform 0.3s ease',
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
        className="absolute left-[-4px] top-[26px] sm:top-[34px] w-[7px] h-[7px] bg-[var(--color-border-light)] transition-colors duration-300 group-hover:bg-[var(--hover-border-color)]"
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
      />
      {/* Glowing line overlay on hover */}
      <div
        className="absolute left-0 top-0 w-[1px] h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to bottom, transparent, ${hoverBorderColor}, transparent)` }}
      />

      {/* Content */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {note.subjects && <Badge subject={note.subjects} />}
            <span className="flex items-center gap-1 text-[10px] font-mono tracking-[0.04em] text-[var(--color-text-dim)] uppercase">
              <ExternalLink size={10} />
              Notes
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[var(--text-base)] sm:text-[var(--text-lg)] font-display font-semibold text-[var(--color-text)] tracking-[-0.01em] leading-snug mb-1 group-hover:text-[var(--color-text)] transition-colors">
            {note.title}
          </h3>

          {/* Subtitle */}
          {note.subtitle && (
            <p className="text-[var(--text-xs)] sm:text-[var(--text-sm)] text-[var(--color-text-muted)] font-light tracking-[0.01em] leading-relaxed line-clamp-2">
              {note.subtitle}
            </p>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[9px] font-mono tracking-[0.04em] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-dim)] uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* External link arrow */}
        <div className="shrink-0 mt-1">
          <ArrowUpRight
            size={16}
            className="text-[var(--color-text-dim)] group-hover:text-[var(--color-text)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
          />
        </div>
      </div>
    </a>
  );
}
