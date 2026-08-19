import {
  BookOpen, FlaskConical, Megaphone, CalendarClock,
  FolderOpen, Star
} from 'lucide-react';

/* ── Content Types ── */
export const CONTENT_TYPES = {
  assignment: {
    label: 'Assignment',
    emoji: '—',
    icon: BookOpen,
    color: 'var(--color-text)',
    bgClass: 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]',
  },
  lab: {
    label: 'Lab',
    emoji: '—',
    icon: FlaskConical,
    color: 'var(--color-text)',
    bgClass: 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]',
  },
  notice: {
    label: 'Notice',
    emoji: '—',
    icon: Megaphone,
    color: 'var(--color-text)',
    bgClass: 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]',
  },
  deadline: {
    label: 'Deadline',
    emoji: '—',
    icon: CalendarClock,
    color: 'var(--color-text)',
    bgClass: 'bg-[var(--color-surface-2)] text-[var(--color-text)] border-[var(--color-border-light)]',
  },
  resource: {
    label: 'Resource',
    emoji: '—',
    icon: FolderOpen,
    color: 'var(--color-text)',
    bgClass: 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]',
  },
  important: {
    label: 'Important',
    emoji: '—',
    icon: Star,
    color: 'var(--color-text)',
    bgClass: 'bg-[var(--color-text)] text-black border-[var(--color-text)]',
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

/* ── Max file size (10MB) ── */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* ── App Info ── */
export const APP_NAME = 'BatchHub';
export const APP_TAGLINE = 'One organized place for everything your batch needs to know.';
