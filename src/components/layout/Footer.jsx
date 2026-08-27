import { APP_NAME, APP_TAGLINE } from '../../lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[var(--text-xs)] font-light text-[var(--color-text-dim)] tracking-[0.02em]">
        <span>
          © {new Date().getFullYear()} {APP_NAME}
        </span>
        <span className="text-[10px] tracking-[0.03em]">
          {APP_TAGLINE}
        </span>
      </div>
    </footer>
  );
}
