import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--color-bg)] px-4 text-center">
      <div className="animate-fade-in-up">
        {/* Glowing 404 */}
        <div className="relative mb-6">
          <span className="text-8xl sm:text-9xl font-display font-semibold text-[var(--color-text)] tracking-[-0.03em]">
            404
          </span>
          <div className="absolute inset-0 blur-3xl opacity-10 bg-[var(--color-text)]" />
        </div>

        <h1 className="text-[1.75rem] font-display font-medium text-[var(--color-text)] mb-2 tracking-[-0.015em]">
          Page not found
        </h1>
        <p className="text-[var(--text-sm)] font-light text-[var(--color-text-muted)] mb-8 max-w-sm tracking-[0.01em] leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-[var(--text-sm)] font-semibold transition-colors duration-300 tracking-[0.005em]"
        >
          <Home size={16} />
          Go to Feed
        </Link>
      </div>
    </div>
  );
}
