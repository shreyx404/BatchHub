import { useState } from 'react';
import { Lock, GraduationCap, AlertCircle } from 'lucide-react';
import { APP_NAME } from '../../lib/constants';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter the admin password.');
      return;
    }

    setLoading(true);
    // Small delay for UX
    setTimeout(() => {
      const success = onLogin(password);
      if (!success) {
        setError('Invalid password. Please try again.');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-text)] flex items-center justify-center mb-3 shadow-lg">
            <GraduationCap size={24} className="text-black" />
          </div>
          <h1 className="text-[1.75rem] font-display font-medium text-[var(--color-text)] tracking-[-0.015em]">{APP_NAME} Admin</h1>
          <p className="text-[var(--text-sm)] font-light text-[var(--color-text-muted)] mt-1.5 tracking-[0.01em]">
            Enter password to manage content.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]"
              />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Admin password"
                autoFocus
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-light)] focus:ring-1 focus:ring-[var(--color-border-light)] transition-all tracking-[0.005em]"
              />
            </div>
            {error && (
              <p className="mt-2 text-[10px] text-red-400 flex items-center gap-1 animate-fade-in tracking-[0.01em]">
                <AlertCircle size={12} />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60 text-black text-[var(--text-sm)] font-semibold transition-colors duration-300 flex items-center justify-center gap-2 tracking-[0.005em]"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-[10px] font-light text-[var(--color-text-dim)] mt-6 tracking-[0.02em]">
          Contact the batch representative for access.
        </p>
      </div>
    </div>
  );
}
