import { useState, useEffect } from 'react';
import { Lock, GraduationCap, AlertCircle, ShieldAlert, Clock } from 'lucide-react';
import { APP_NAME } from '../../lib/constants';
import { getLockoutInfo } from '../../hooks/useAdmin';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(() => getLockoutInfo().remainingAttempts);
  const [isLocked, setIsLocked] = useState(() => getLockoutInfo().isLocked);
  const [remainingSeconds, setRemainingSeconds] = useState(() => getLockoutInfo().remainingSeconds);

  // Active countdown timer when locked
  useEffect(() => {
    if (!isLocked || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      const lock = getLockoutInfo();
      if (!lock.isLocked || lock.remainingSeconds <= 0) {
        setIsLocked(false);
        setRemainingSeconds(0);
        setRemainingAttempts(10);
        setError('');
        clearInterval(timer);
      } else {
        setRemainingSeconds(lock.remainingSeconds);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, remainingSeconds]);

  const formatCountdown = (totalSecs) => {
    if (totalSecs <= 0) return '0s';
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError(`Account is locked for 24 hours. Time remaining: ${formatCountdown(remainingSeconds)}`);
      return;
    }

    if (!password.trim()) {
      setError('Please enter the admin password.');
      return;
    }

    setLoading(true);
    try {
      const result = await onLogin(password);
      if (result?.success) {
        // Success handled by auth state change
        return;
      }

      if (result?.isLocked || result?.error === 'rate_limited') {
        setIsLocked(true);
        setRemainingSeconds(result.remainingSeconds || 86400);
        setRemainingAttempts(0);
        setError(`Too many failed attempts (10/10). Account locked for 24 hours.`);
      } else if (result?.error === 'invalid_password' || !result) {
        const remaining = result?.remainingAttempts !== undefined ? result.remainingAttempts : 10;
        setRemainingAttempts(remaining);
        setError(
          remaining > 0
            ? `Invalid password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before 24-hour lockout.`
            : 'Too many failed attempts (10/10). Account locked for 24 hours.'
        );
      } else {
        setError('Login failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-text)] flex items-center justify-center mb-3 shadow-lg">
            <GraduationCap size={24} className="text-black" />
          </div>
          <h1 className="text-[1.75rem] font-display font-medium text-[var(--color-text)] tracking-[-0.015em]">
            {APP_NAME} Admin
          </h1>
          <p className="text-[var(--text-sm)] font-light text-[var(--color-text-muted)] mt-1.5 tracking-[0.01em]">
            Enter password to manage content.
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {isLocked && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-red-300">Account Locked (10/10 Attempts)</p>
                <p className="text-red-300/80 leading-relaxed">
                  Too many incorrect password attempts. Access is locked for 24 hours for security.
                </p>
                <div className="pt-1 flex items-center gap-1.5 font-mono text-[11px] text-red-200 font-medium">
                  <Clock size={12} />
                  <span>Time remaining: {formatCountdown(remainingSeconds)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                disabled={isLocked || loading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder={isLocked ? 'Account locked (24 hours)' : 'Admin password'}
                autoFocus={!isLocked}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-light)] focus:ring-1 focus:ring-[var(--color-border-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all tracking-[0.005em]"
              />
            </div>
            {error && !isLocked && (
              <p className="mt-2 text-[10px] text-red-400 flex items-center gap-1 animate-fade-in tracking-[0.01em]">
                <AlertCircle size={12} />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full h-11 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-black text-[var(--text-sm)] font-semibold transition-colors duration-300 flex items-center justify-center gap-2 tracking-[0.005em]"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : isLocked ? (
              `Locked (${formatCountdown(remainingSeconds)})`
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {!isLocked && remainingAttempts < 10 && (
            <p className="text-[10px] font-mono text-amber-400/80 mb-2 tracking-[0.02em]">
              Security: {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining (Limit: 10 / 24h)
            </p>
          )}
          <p className="text-center text-[10px] font-light text-[var(--color-text-dim)] tracking-[0.02em]">
            Contact the batch representative for access.
          </p>
        </div>
      </div>
    </div>
  );
}
