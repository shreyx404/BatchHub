
import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Menu, FileText, BookOpen, Plus, TrendingUp, Eye, Archive } from 'lucide-react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminSidebar from '../components/admin/AdminSidebar';
import PostForm from '../components/admin/PostForm';
import PostTable from '../components/admin/PostTable';
import SubjectManager from '../components/admin/SubjectManager';
import DeadlineBanner from '../components/posts/DeadlineBanner';
import NoticesSection from '../components/posts/NoticesSection';
import PinnedSection from '../components/posts/PinnedSection';
import PostGrid from '../components/posts/PostGrid';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import { useAdmin } from '../hooks/useAdmin';
import { usePosts, useUpcomingDeadlines } from '../hooks/usePosts';
import { fetchAllPosts, fetchPost } from '../lib/api';
import { useSubjects } from '../hooks/useSubjects';

export default function AdminPage() {
  const { isAuthenticated, login, logout } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="min-h-dvh flex bg-[var(--color-bg)]">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-[var(--color-border)] flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] lg:hidden text-[var(--color-text-muted)]"
          >
            <Menu size={18} />
          </button>
          <span className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)] tracking-[0.01em]">
            Admin Dashboard
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/create" element={<PostForm />} />
            <Route path="/edit/:id" element={<EditPostWrapper />} />
            <Route path="/posts" element={<PostTable />} />
            <Route path="/subjects" element={<SubjectManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ── Dashboard Home ── */
function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, archived: 0 });
  const { subjects } = useSubjects();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllPosts().then((posts) => {
      setStats({
        total: posts.length,
        published: posts.filter((p) => p.status === 'published').length,
        draft: posts.filter((p) => p.status === 'draft').length,
        archived: posts.filter((p) => p.status === 'archived').length,
      });
    });
  }, []);

  /* ── Student feed data (same hooks students use) ── */
  const { posts, loading: postsLoading, error: postsError, refetch } = usePosts({});
  const { deadlines, loading: deadlinesLoading } = useUpcomingDeadlines();

  // Categorise posts exactly like HomePage's structured view
  const { noticePosts, pinnedPosts, withDeadline, withoutDeadline } = useMemo(() => {
    // 1. Notices & Important (highlighted at top)
    const notices = posts.filter((p) => p.type === 'notice' || p.type === 'important');
    const noticeIds = new Set(notices.map((p) => p.id));

    // 2. Pinned posts (excluding ones already in notices)
    const pinned = posts.filter((p) => p.is_pinned && !noticeIds.has(p.id));
    const pinnedIds = new Set(pinned.map((p) => p.id));

    // 3 & 4. Remaining posts (not notice/important, not pinned)
    const rest = posts.filter((p) => !noticeIds.has(p.id) && !pinnedIds.has(p.id));

    // Posts WITH due dates — sorted ascending (soonest deadline first)
    const hasDue = rest
      .filter((p) => p.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    // Posts WITHOUT due dates — sorted by created_at ascending (first come first serve)
    const noDue = rest
      .filter((p) => !p.due_date)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return { noticePosts: notices, pinnedPosts: pinned, withDeadline: hasDue, withoutDeadline: noDue };
  }, [posts]);

  const cards = [
    {
      label: 'Total Posts', value: stats.total, icon: FileText,
      color: 'var(--color-accent)', bg: 'var(--color-accent)',
      to: '/admin/posts?status=all',
    },
    {
      label: 'Published', value: stats.published, icon: TrendingUp,
      color: '#10b981', bg: '#10b981',
      to: '/admin/posts?status=published',
    },
    {
      label: 'Drafts', value: stats.draft, icon: FileText,
      color: '#f59e0b', bg: '#f59e0b',
      to: '/admin/posts?status=draft',
    },
    {
      label: 'Archived', value: stats.archived, icon: Archive,
      color: '#8888a0', bg: '#8888a0',
      to: '/admin/posts?status=archived',
    },
    {
      label: 'Subjects', value: subjects.length, icon: BookOpen,
      color: '#3b82f6', bg: '#3b82f6',
      to: '/admin/subjects',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-medium text-[var(--color-text)] tracking-[-0.01em]">Dashboard</h2>
        <button
          onClick={() => navigate('/admin/create')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-[var(--text-sm)] font-medium transition-colors duration-300 tracking-[0.005em]"
        >
          <Plus size={14} />
          New Post
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger-children">
        {cards.map(({ label, value, icon: Icon, color, bg, to }) => (
          <div
            key={label}
            onClick={() => to && navigate(to)}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 cursor-pointer hover:border-[var(--color-border-light)] hover:bg-[var(--color-surface-2)]/40 transition-all group"
          >
            <div
              className="w-9 h-9 flex items-center justify-center mb-3"
              style={{ background: bg + '15' }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-2xl font-display font-semibold text-[var(--color-text)] tracking-[-0.02em]">{value}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] mt-0.5 tracking-[0.03em] uppercase font-medium transition-colors">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <QuickAction
          icon={Plus}
          label="Create New Post"
          description="Add an assignment, notice, or update"
          onClick={() => navigate('/admin/create')}
        />
        <QuickAction
          icon={FileText}
          label="Manage Posts"
          description="View, edit, or archive existing posts"
          onClick={() => navigate('/admin/posts')}
        />
      </div>

      {/* ── Student View Preview ── */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <Eye size={14} className="text-[var(--color-accent)]" />
          <span className="text-[10px] font-medium text-[var(--color-text)] tracking-[0.08em] uppercase">
            Student View
          </span>
          <span className="text-[10px] font-light text-[var(--color-text-dim)] tracking-[0.01em]">
            — What students see on the homepage
          </span>
        </div>

        {/* Feed content */}
        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {postsError ? (
            <ErrorState message={postsError} onRetry={refetch} />
          ) : postsLoading ? (
            <LoadingState />
          ) : (
            <>
              {/* Deadline banner */}
              {!deadlinesLoading && deadlines.length > 0 && (
                <DeadlineBanner deadlines={deadlines} />
              )}

              {/* All Updates heading */}
              {posts.length > 0 && (
                <div className="flex items-center gap-2">
                  <h3 className="text-[var(--text-sm)] font-medium tracking-[0.02em] text-[var(--color-text)]">
                    All Updates
                  </h3>
                  <span className="text-[var(--text-xs)] font-light text-[var(--color-text-dim)]">
                    ({posts.length})
                  </span>
                </div>
              )}

              {/* 1. Notices & Important */}
              <NoticesSection posts={noticePosts} />

              {/* 2. Pinned posts */}
              <PinnedSection posts={pinnedPosts} />

              {/* 3. Posts with due dates — ascending by deadline */}
              {withDeadline.length > 0 && (
                <div className="space-y-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-[10px] font-medium text-[var(--color-text-dim)] tracking-[0.1em] uppercase">
                      Upcoming Deadlines
                    </h3>
                    <span className="text-[10px] font-light text-[var(--color-text-dim)]">
                      ({withDeadline.length})
                    </span>
                  </div>
                  <PostGrid posts={withDeadline} loading={false} />
                </div>
              )}

              {/* 4. Posts without due dates — FCFS */}
              {withoutDeadline.length > 0 && (
                <div className="space-y-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-[10px] font-medium text-[var(--color-text-dim)] tracking-[0.1em] uppercase">
                      General Updates
                    </h3>
                    <span className="text-[10px] font-light text-[var(--color-text-dim)]">
                      ({withoutDeadline.length})
                    </span>
                  </div>
                  <PostGrid posts={withoutDeadline} loading={false} />
                </div>
              )}

              {/* Empty state */}
              {posts.length === 0 && (
                <PostGrid posts={[]} loading={false} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-left transition-all group"
    >
      <div className="w-10 h-10 bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-accent)]/20 transition-colors">
        <Icon size={18} className="text-[var(--color-accent)]" />
      </div>
      <div>
        <p className="text-[var(--text-sm)] font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent-hover)] transition-colors duration-300 tracking-[0.005em]">
          {label}
        </p>
        <p className="text-[10px] font-light text-[var(--color-text-dim)] tracking-[0.01em]">{description}</p>
      </div>
    </button>
  );
}

/* ── Edit Post Wrapper ── */
function EditPostWrapper() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost(id)
      .then(setPost)
      .catch(() => navigate('/admin/posts'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" /></div>;
  if (!post) return null;

  return <PostForm existingPost={post} onSaved={() => navigate('/admin/posts')} />;
}
