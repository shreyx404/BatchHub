import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit2, Trash2, Archive, ArchiveRestore, Eye, ArrowUpDown, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import { fetchAllPosts, updatePost, deletePost } from '../../lib/api';
import { POST_STATUSES } from '../../lib/constants';

const SORT_OPTIONS = [
  { key: 'due_date', label: 'Due Date', icon: Calendar },
  { key: 'created_at', label: 'Created Date', icon: Clock },
];

export default function PostTable() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const statusParam = searchParams.get('status');
  const [statusFilter, setStatusFilter] = useState(statusParam || 'all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [sortBy, setSortBy] = useState('due_date');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    if (statusParam && ['all', 'published', 'draft', 'archived'].includes(statusParam)) {
      setStatusFilter(statusParam);
    }
  }, [statusParam]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ status });
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllPosts();
      setPosts(data || []);
    } catch (err) {
      console.error('Error loading posts:', err);
      toast.error(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const filteredPosts = statusFilter === 'all'
    ? posts
    : posts.filter((p) => p.status === statusFilter);

  /* ── Sorting logic ── */
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'due_date') {
      const aHas = !!a.due_date;
      const bHas = !!b.due_date;

      // Posts with deadlines appear first; dateless posts at bottom
      if (!aHas && !bHas) return 0;
      if (!aHas) return 1;
      if (!bHas) return -1;

      const diff = new Date(a.due_date) - new Date(b.due_date);
      return sortDirection === 'asc' ? diff : -diff;
    }

    // Default: created_at
    const diff = new Date(a.created_at || 0) - new Date(b.created_at || 0);
    return sortDirection === 'asc' ? diff : -diff;
  });

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      await updatePost(archiveTarget.id, { status: 'archived' });
      setPosts((prev) =>
        prev.map((p) => (p.id === archiveTarget.id ? { ...p, status: 'archived' } : p))
      );
      toast.success('Post archived');
      setArchiveTarget(null);
    } catch (err) {
      console.error('Error archiving post:', err);
      toast.error(err.message || 'Failed to archive post');
    }
  };

  const handleRestore = async (post) => {
    try {
      await updatePost(post.id, { status: 'published' });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: 'published' } : p))
      );
      toast.success('Post restored to published');
    } catch (err) {
      console.error('Error restoring post:', err);
      toast.error(err.message || 'Failed to restore post');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost(deleteTarget.id);
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success('Post deleted');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(err.message || 'Failed to delete post');
    }
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-[var(--color-text)]">All Posts</h2>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'published', 'draft', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilterChange(s)}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-[var(--color-accent)] text-black'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {s === 'all' ? 'All' : POST_STATUSES[s]?.label || s}
              {s !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({posts.filter((p) => p.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-[0.05em] font-medium text-[var(--color-text-dim)]">
          Sort by
        </span>
        {SORT_OPTIONS.map(({ key, label, icon: SortIcon }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
              sortBy === key
                ? 'bg-[var(--color-accent)] text-black'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <SortIcon size={12} />
            {label}
          </button>
        ))}
        <button
          onClick={toggleSortDirection}
          title={sortDirection === 'asc' ? 'Earliest first' : 'Latest first'}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-light)] transition-all"
        >
          <ArrowUpDown size={12} />
          {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>

        {sortBy === 'due_date' && (
          <span className="text-[10px] text-[var(--color-text-dim)] italic ml-1">
            Posts with deadlines appear first
          </span>
        )}
      </div>

      {sortedPosts.length === 0 ? (
        <EmptyState title="No posts" description="No posts match the selected filter." />
      ) : (
        <div className="space-y-2">
          {sortedPosts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all group"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge type={post.type} />
                  {post.subjects && <Badge subject={post.subjects} />}
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5"
                    style={{
                      background: (POST_STATUSES[post.status]?.color || '#888') + '15',
                      color: POST_STATUSES[post.status]?.color || '#888',
                    }}
                  >
                    {POST_STATUSES[post.status]?.label || post.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--color-text)] break-words sm:truncate">
                  {post.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-dim)] mt-1 flex-wrap">
                  <span>
                    Posted: {format(new Date(post.created_at || new Date()), 'dd-MM-yyyy · h:mm a')}
                  </span>
                  {post.due_date && (
                    <span className="text-red-400/90 font-medium">
                      · Due: {format(new Date(post.due_date), 'dd-MM-yyyy · h:mm a')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions - Always visible on mobile, reveal on hover for desktop */}
              <div className="flex items-center gap-1.5 shrink-0 pt-2.5 sm:pt-0 border-t border-[var(--color-border)]/50 sm:border-t-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <ActionButton
                  icon={Eye}
                  label="View Post"
                  onClick={() => window.open(`/post/${post.id}`, '_blank')}
                />
                <ActionButton
                  icon={Edit2}
                  label="Edit Post"
                  onClick={() => navigate(`/admin/edit/${post.id}`)}
                />
                {post.status !== 'archived' ? (
                  <ActionButton
                    icon={Archive}
                    label="Archive Post"
                    onClick={() => setArchiveTarget(post)}
                  />
                ) : (
                  <ActionButton
                    icon={ArchiveRestore}
                    label="Restore Post"
                    onClick={() => handleRestore(post)}
                  />
                )}
                <ActionButton
                  icon={Trash2}
                  label="Delete Post"
                  danger
                  onClick={() => setDeleteTarget(post)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archive confirmation modal */}
      <Modal
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive Post"
      >
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Are you sure you want to archive <strong className="text-[var(--color-text)]">"{archiveTarget?.title}"</strong>? It will be hidden from the student feed and moved to the Archived section.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setArchiveTarget(null)}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmArchive}
            className="px-4 py-2 text-sm font-medium bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black font-semibold transition-colors"
          >
            Archive Post
          </button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Post"
      >
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Are you sure you want to delete <strong className="text-[var(--color-text)]">"{deleteTarget?.title}"</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      title={label}
      aria-label={label}
      className={`p-2 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center border sm:border-transparent ${
        danger
          ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 sm:bg-transparent sm:text-[var(--color-text-dim)] sm:hover:bg-red-500/10 sm:hover:text-red-400'
          : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 sm:bg-transparent sm:text-[var(--color-text-dim)] sm:hover:bg-[var(--color-surface-2)] sm:hover:text-[var(--color-text)]'
      }`}
    >
      <Icon size={15} />
    </button>
  );
}
