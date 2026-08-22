import { CONTENT_TYPE_LIST } from '../../lib/constants';

export default function FilterBar({
  selectedType,
  onTypeChange,
  selectedSubject,
  onSubjectChange,
  subjects = [],
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Type filters */}
      <div className="flex gap-1.5 overflow-x-auto sm:flex-wrap scrollbar-hide pb-1">
        <FilterChip
          label="All"
          active={!selectedType}
          onClick={() => onTypeChange(null)}
        />
        {CONTENT_TYPE_LIST.map(({ value, label, icon: Icon }) => (
          <FilterChip
            key={value}
            label={label}
            icon={Icon}
            active={selectedType === value}
            onClick={() => onTypeChange(selectedType === value ? null : value)}
          />
        ))}
      </div>

      {/* Subject filters */}
      {subjects.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto sm:flex-wrap scrollbar-hide pb-1">
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
              small
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, icon: Icon, active, onClick, small = false }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 border transition-all duration-200 whitespace-nowrap
        ${small ? 'px-2.5 py-1 text-[10px] tracking-[0.03em] font-mono' : 'px-3 py-1.5 text-[11px] tracking-[0.02em] uppercase'}
        ${
          active
            ? 'bg-white border-white text-black font-semibold'
            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] font-normal hover:border-[var(--color-border-light)] hover:text-[var(--color-text)]'
        }`}
    >
      {Icon && <Icon size={12} className="shrink-0" />}
      {label}
    </button>
  );
}
