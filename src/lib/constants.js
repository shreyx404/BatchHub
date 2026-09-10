import {
  BookOpen, FlaskConical, Megaphone, CalendarClock,
  FolderOpen, Star
} from 'lucide-react';

/* ── Content Types ── */
export const CONTENT_TYPES = {
  assignment: {
    label: 'Assignment',
    icon: BookOpen,
    color: 'var(--color-text)',
    bgClass: 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]',
  },
  lab: {
    label: 'Lab',
    icon: FlaskConical,
    color: 'var(--color-text)',
    bgClass: 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]',
  },
  notice: {
    label: 'Notice',
    icon: Megaphone,
    color: 'var(--color-text)',
    bgClass: 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]',
  },
  deadline: {
    label: 'Deadline',
    icon: CalendarClock,
    color: 'var(--color-text)',
    bgClass: 'bg-[var(--color-surface-2)] text-[var(--color-text)] border-[var(--color-border-light)]',
  },
  resource: {
    label: 'Resource',
    icon: FolderOpen,
    color: 'var(--color-text)',
    bgClass: 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]',
  },
  important: {
    label: 'Important',
    icon: Star,
    color: 'var(--color-text)',
    bgClass: 'badge-inverse border border-[var(--color-text)]',
  },
};

export const CONTENT_TYPE_LIST = Object.entries(CONTENT_TYPES).map(
  ([value, meta]) => ({ value, ...meta })
);

/* ── Post Statuses ── */
export const POST_STATUSES = {
  published: { label: 'Published', color: '#10b981' },
  draft: { label: 'Draft', color: '#f59e0b' },
  archived: { label: 'Archived', color: '#8888a0' },
};

/* ── Archive Sort Options ── */
export const ARCHIVE_SORT_OPTIONS = [
  { value: 'newest', label: 'Recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'due-date', label: 'Due Date' },
  { value: 'title-az', label: 'A → Z' },
];

/* ── App Info ── */
export const APP_NAME = 'BatchHub';
export const APP_TAGLINE = 'One organized place for everything your batch needs to know.';

/* ── App Settings & Material Links ── */
export const DEFAULT_COLLEGE_MATERIAL_URL = 'https://drive.google.com/drive/folders/1MukhwWiRG7CTsOmi2a__buSqKY_HcQXy?usp=drive_link';

export const SETTING_KEYS = {
  COLLEGE_MATERIAL_URL: 'college_material_url',
};

