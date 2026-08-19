
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Menu, FileText, BookOpen, Plus, TrendingUp } from 'lucide-react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminSidebar from '../components/admin/AdminSidebar';
import PostForm from '../components/admin/PostForm';
import PostTable from '../components/admin/PostTable';
import SubjectManager from '../components/admin/SubjectManager';
import { useAdmin } from '../hooks/useAdmin';
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

  const cards = [
    {
      label: 'Total Posts', value: stats.total, icon: FileText,
      color: 'var(--color-accent)', bg: 'var(--color-accent)',
    },
    {
      label: 'Published', value: stats.published, icon: TrendingUp,
      color: '#10b981', bg: '#10b981',
    },
    {
      label: 'Drafts', value: stats.draft, icon: FileText,
      color: '#f59e0b', bg: '#f59e0b',
    },
    {
      label: 'Subjects', value: subjects.length, icon: BookOpen,
      color: '#3b82f6', bg: '#3b82f6',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-medium text-[var(--color-text)] tracking-[-0.01em]">Dashboard</h2>
        <button
          onClick={() => navigate('/admin/create')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-[var(--text-sm)] font-medium transition-colors duration-300 tracking-[0.005em]"
        >
          <Plus size={14} />
          New Post
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: bg + '15' }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-2xl font-display font-semibold text-[var(--color-text)] tracking-[-0.02em]">{value}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 tracking-[0.03em] uppercase font-medium">{label}</p>
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
    </div>
  );
}

function QuickAction({ icon: Icon, label, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-left transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-accent)]/20 transition-colors">
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
