import { CONTENT_TYPES, CONTENT_TYPE_LIST } from '../../lib/constants';

export default function FilterBar({
  selectedType,
  onTypeChange,
  selectedSubject,
  onSubjectChange,
  subjects = [],
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto sm:flex-wrap scrollbar-hide pb-1">
        <FilterChip
          label="All"
          active={!selectedType}
          onClick={() => onTypeChange(null)}
        />
        {CONTENT_TYPE_LIST.map(({ value, emoji, label }) => (
          <FilterChip
            key={value}
            label={`${emoji} ${label}`}
            active={selectedType === value}
            onClick={() => onTypeChange(selectedType === value ? null : value)}
          />
        ))}
      </div>

      {/* Subject filters */}
      {subjects.length > 0 && (
        <div className="flex gap-2 overflow-x-auto sm:flex-wrap scrollbar-hide pb-1">
          <FilterChip
            label="All Subjects"
            active={!selectedSubject}
            onClick={() => onSubjectChange(null)}
            small
          />
          {subjects.map((subject) => (
            <FilterChip
              key={subject.id}
              label={subject.code || subject.name}
              active={selectedSubject === subject.id}
              onClick={() =>
                onSubjectChange(selectedSubject === subject.id ? null : subject.id)
              }
              color={subject.color}
              small
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick, color, small = false }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border transition-all duration-300 whitespace-nowrap hover:scale-[1.02] active:scale-95
        ${small ? 'px-2.5 py-1 text-[10px] tracking-[0.02em]' : 'px-3 py-1.5 text-[11px] tracking-[0.015em]'}
        ${
          active
            ? 'bg-[var(--color-text)] border-[var(--color-text)] text-black font-medium shadow-md'
            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] font-normal hover:border-[var(--color-border-light)] hover:text-[var(--color-text)]'
        }`}
    >
      {label}
    </button>
  );
}
