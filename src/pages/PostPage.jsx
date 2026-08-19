import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, CalendarClock, Paperclip, ExternalLink,
  Share2, Download, FileText, Image as ImageIcon, File
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
  const hasAttachments = post.attachments && post.attachments.length > 0;

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: post.title, text: `${post.title} — ${APP_NAME}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)]">
      <NavBar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6 animate-fade-in-up">
        {/* Type accent bar */}
        <div
          className="h-0.5 w-16 rounded-full mb-6 bg-[var(--color-border-light)]"
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
                · {format(new Date(post.created_at), 'dd-MM-yyyy')}
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
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-[0.02em] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {hasLinks && (
          <div className="mb-6">
            <h3 className="text-[10px] font-medium text-[var(--color-text)] mb-3 flex items-center gap-1.5 tracking-[0.08em] uppercase">
              <ExternalLink size={14} />
              Links
            </h3>
            <div className="space-y-2">
              {post.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] text-[var(--text-sm)] text-[var(--color-accent-hover)] font-medium transition-all duration-300 group tracking-[0.005em]"
                >
                  <ExternalLink size={14} className="shrink-0" />
                  <span className="truncate">{link.label || link.url}</span>
                  <ArrowLeft size={12} className="ml-auto rotate-180 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {hasAttachments && (
          <div className="mb-6">
            <h3 className="text-[10px] font-medium text-[var(--color-text)] mb-3 flex items-center gap-1.5 tracking-[0.08em] uppercase">
              <Paperclip size={14} />
              Attachments
            </h3>
            <div className="space-y-2">
              {post.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] text-[var(--text-sm)] transition-all duration-300 group"
                >
                  <FileIcon type={att.file_type} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-text)] truncate">
                      {att.file_name}
                    </p>
                    {att.file_size && (
                      <p className="text-xs text-[var(--color-text-dim)]">
                        {formatBytes(att.file_size)}
                      </p>
                    )}
                  </div>
                  <Download
                    size={14}
                    className="text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors shrink-0"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="pt-6 border-t border-[var(--color-border)]">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-[var(--text-sm)] font-medium transition-colors duration-300 tracking-[0.005em]"
          >
            <Share2 size={14} />
            Share on WhatsApp
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
    <nav className="sticky top-0 z-50 glass-strong">
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

function FileIcon({ type }) {
  const iconClass = 'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-[var(--color-border)]';

  if (type?.startsWith('image/')) {
    return (
      <div className={`${iconClass} bg-[var(--color-surface)]`}>
        <ImageIcon size={16} className="text-[var(--color-text)]" />
      </div>
    );
  }
  if (type === 'application/pdf') {
    return (
      <div className={`${iconClass} bg-[var(--color-surface)]`}>
        <FileText size={16} className="text-[var(--color-text)]" />
      </div>
    );
  }
  return (
    <div className={`${iconClass} bg-[var(--color-surface)]`}>
      <File size={16} className="text-[var(--color-text)]" />
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
