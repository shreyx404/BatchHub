import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Archive, Eye, Search, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import { fetchAllPosts, updatePost, deletePost } from '../../lib/api';
import { POST_STATUSES } from '../../lib/constants';

export default function PostTable() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllPosts();
      setPosts(data);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const filteredPosts = statusFilter === 'all'
    ? posts
    : posts.filter((p) => p.status === statusFilter);

  const handleArchive = async (post) => {
    try {
      await updatePost(post.id, { status: 'archived' });
      toast.success('Post archived');
      loadPosts();
    } catch (err) {
      toast.error('Failed to archive post');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost(deleteTarget.id);
      toast.success('Post deleted');
      setDeleteTarget(null);
      loadPosts();
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-[var(--color-text)]">All Posts</h2>

        {/* Status filter */}
        <div className="flex gap-2">
          {['all', 'published', 'draft', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

      {filteredPosts.length === 0 ? (
        <EmptyState title="No posts" description="No posts match the selected filter." />
      ) : (
        <div className="space-y-2">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all group"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge type={post.type} />
                  {post.subjects && <Badge subject={post.subjects} />}
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                    style={{
                      background: (POST_STATUSES[post.status]?.color || '#888') + '15',
                      color: POST_STATUSES[post.status]?.color || '#888',
                    }}
                  >
                    {POST_STATUSES[post.status]?.label || post.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--color-text)] truncate">
                  {post.title}
                </p>
                <p className="text-xs text-[var(--color-text-dim)] mt-0.5">
                  {format(new Date(post.created_at), 'dd-MM-yyyy · h:mm a')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionButton
                  icon={Eye}
                  label="View"
                  onClick={() => window.open(`/post/${post.id}`, '_blank')}
                />
                <ActionButton
                  icon={Edit2}
                  label="Edit"
                  onClick={() => navigate(`/admin/edit/${post.id}`)}
                />
                {post.status !== 'archived' && (
                  <ActionButton
                    icon={Archive}
                    label="Archive"
                    onClick={() => handleArchive(post)}
                  />
                )}
                <ActionButton
                  icon={Trash2}
                  label="Delete"
                  danger
                  onClick={() => setDeleteTarget(post)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

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
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
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
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg transition-colors ${
        danger
          ? 'hover:bg-red-500/10 text-[var(--color-text-dim)] hover:text-red-400'
          : 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
      }`}
    >
      <Icon size={14} />
    </button>
  );
}
