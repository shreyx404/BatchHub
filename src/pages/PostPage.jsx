import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, CalendarClock, ExternalLink,
  Share2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { usePost } from '../hooks/usePost';
import Badge from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import Footer from '../components/layout/Footer';
import { CONTENT_TYPES, APP_NAME } from '../lib/constants';

function getSafeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return '#';
}

export default function PostPage() {
  const { id } = useParams();
  const { post, loading, error } = usePost(id);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-dvh flex flex-col bg-[var(--color-bg)]">
        <NavBar />
        <ErrorState
          message={error || 'Post not found.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const typeConfig = CONTENT_TYPES[post.type];
  const hasDueDate = !!post.due_date;
  const hasLinks = post.links && post.links.length > 0;

  const handleShare = async () => {
    const url = window.location.href;
    const shareText = `*${post.title}*\n\n_${APP_NAME} :_ ->\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        if (err.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(shareText);
            toast.success('Copied to clipboard!');
          } catch {
            toast.error('Failed to copy to clipboard');
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard!');
      } catch {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)]">
      <NavBar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6 animate-fade-in-up">
        {/* Type accent bar */}
        <div
          className="h-0.5 w-16 mb-6 bg-[var(--color-border-light)]"
        />

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge type={post.type} />
          {post.subjects && <Badge subject={post.subjects} />}
        </div>

        {/* Title */}
        <h1 className="text-[2rem] sm:text-[2.75rem] font-display font-semibold text-[var(--color-text)] tracking-[-0.02em] leading-[1.1] mb-5">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-[var(--text-sm)] text-[var(--color-text-muted)] mb-6 pb-6 border-b border-[var(--color-border)]">
          {post.created_at && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              Posted {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              <span className="text-[var(--color-text-dim)]">
                · {format(new Date(post.created_at), 'dd-MM-yyyy · h:mm a')}
              </span>
            </span>
          )}
          {hasDueDate && (
            <span className="flex items-center gap-1.5 text-red-400 font-medium tracking-[0.005em]">
              <CalendarClock size={14} />
              Due {format(new Date(post.due_date), 'dd-MM-yyyy · h:mm a')}
            </span>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <div className="prose mb-8">
            <ReactMarkdown
              disallowedElements={['script', 'iframe', 'object', 'embed']}
              unwrapDisallowed
              urlTransform={(url) => {
                if (!url) return '';
                if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
                if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(url)) return `https://${url}`;
                return '';
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-[10px] font-medium tracking-[0.02em] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Resource Links / Attachments */}
        {hasLinks && (
          <div className="mb-6">
            <h3 className="text-[10px] font-medium text-[var(--color-text)] mb-3 flex items-center gap-1.5 tracking-[0.08em] uppercase">
              <ExternalLink size={14} />
              Resource Links &amp; Attachments
            </h3>
            <div className="space-y-2">
              {post.links.map((link, i) => {
                const safeHref = getSafeUrl(link.url);
                return (
                  <a
                    key={i}
                    href={safeHref}
                    target={safeHref.startsWith('#') ? undefined : '_blank'}
                    rel={safeHref.startsWith('#') ? undefined : 'noopener noreferrer'}
                    className="flex items-center gap-3 px-4 py-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] text-[var(--text-sm)] text-[var(--color-accent-hover)] font-medium transition-all duration-300 group tracking-[0.005em]"
                  >
                    <ExternalLink size={15} className="shrink-0 text-[var(--color-text-dim)] group-hover:text-[var(--color-accent-hover)] transition-colors" />
                    <span className="truncate flex-1 font-mono text-xs">{link.label || link.url}</span>
                    <ArrowLeft size={13} className="ml-auto rotate-180 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="pt-6 border-t border-[var(--color-border)]">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-[var(--text-sm)] font-semibold transition-colors duration-300 tracking-[0.005em]"
          >
            <Share2 size={14} />
            Share Post
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Sub-components ── */

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-3xl px-4 h-14 flex items-center">
        <Link
          to="/"
          className="flex items-center gap-2 text-[var(--text-sm)] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300 tracking-[0.005em]"
        >
          <ArrowLeft size={16} />
          Back to {APP_NAME}
        </Link>
      </div>
    </nav>
  );
}
