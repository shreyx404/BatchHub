import { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, AlertCircle, ShieldAlert, Clock, Shield } from 'lucide-react';
import { APP_NAME } from '../../lib/constants';
import { getLockoutInfo } from '../../hooks/useAdmin';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(() => getLockoutInfo().remainingAttempts);
  const [isLocked, setIsLocked] = useState(() => getLockoutInfo().isLocked);
  const [remainingSeconds, setRemainingSeconds] = useState(() => getLockoutInfo().remainingSeconds);

  // Turnstile state
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileReady, setTurnstileReady] = useState(!TURNSTILE_SITE_KEY); // Ready if not configured

  // Initialize Turnstile widget
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || isLocked) return;

    const renderWidget = () => {
      if (!window.turnstile || !turnstileRef.current) return;

      // Remove existing widget if re-rendering
      if (turnstileWidgetId.current !== null) {
        try { window.turnstile.remove(turnstileWidgetId.current); } catch {}
        turnstileWidgetId.current = null;
      }

      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        size: 'flexible',
        callback: (token) => {
          setTurnstileToken(token);
          setTurnstileReady(true);
        },
        'expired-callback': () => {
          setTurnstileToken(null);
          setTurnstileReady(false);
          // Auto-refresh
          if (turnstileWidgetId.current !== null) {
            window.turnstile.reset(turnstileWidgetId.current);
          }
        },
        'error-callback': () => {
          // Fail open — allow login even if Turnstile has issues
          setTurnstileReady(true);
          setTurnstileToken(null);
        },
      });
    };

    // Wait for Turnstile script to load
    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 200);
      // Give up after 10 seconds — fail open
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setTurnstileReady(true);
      }, 10000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      if (turnstileWidgetId.current !== null) {
        try { window.turnstile.remove(turnstileWidgetId.current); } catch {}
        turnstileWidgetId.current = null;
      }
    };
  }, [isLocked]);

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

  const resetTurnstile = useCallback(() => {
    if (TURNSTILE_SITE_KEY && turnstileWidgetId.current !== null && window.turnstile) {
      setTurnstileToken(null);
      setTurnstileReady(false);
      window.turnstile.reset(turnstileWidgetId.current);
    }
  }, []);

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
      const result = await onLogin(password, turnstileToken);
      if (result?.success) {
        return;
      }

      // Reset Turnstile for next attempt
      resetTurnstile();

      if (result?.error === 'turnstile_failed') {
        setError('Bot verification failed. Please refresh the page and try again.');
      } else if (result?.isLocked || result?.error === 'rate_limited') {
        setIsLocked(true);
        setRemainingSeconds(result.remainingSeconds || 86400);
        setRemainingAttempts(0);
        setError(`Too many failed attempts (10/10). Account locked for 24 hours.`);
      } else if (result?.error === 'server_error') {
        setError('Server configuration error. Check ADMIN_PASSWORD environment variable.');
      } else if (result?.error === 'network_error') {
        setError('Unable to reach server. Please check your internet connection.');
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
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)] px-4 py-8 pt-safe pb-safe">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white flex items-center justify-center mb-3 shadow-lg overflow-hidden border border-white/20">
            <img
              src="/batchhub-icon.png"
              alt={APP_NAME}
              className="w-full h-full object-contain p-1"
            />
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
          <div className="mb-4 p-3.5 bg-red-950/40 border border-red-800/60 text-red-200 animate-fade-in">
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]"
              />
              <input
                id="admin-password"
                type="password"
                value={password}
                disabled={isLocked || loading}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder={isLocked ? 'Account locked (24 hours)' : 'Admin password'}
                autoFocus={!isLocked}
                className="w-full h-11 pl-10 pr-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-light)] focus:ring-1 focus:ring-[var(--color-border-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all tracking-[0.005em]"
              />
            </div>
            {error && !isLocked && (
              <p className="mt-2 text-[11px] text-red-400 flex items-center gap-1 animate-fade-in tracking-[0.01em]">
                <AlertCircle size={12} />
                {error}
              </p>
            )}
          </div>

          {/* Cloudflare Turnstile Widget */}
          {TURNSTILE_SITE_KEY && !isLocked && (
            <div className="flex justify-center">
              <div ref={turnstileRef} />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLocked || (TURNSTILE_SITE_KEY && !turnstileReady)}
            className="w-full h-11 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-black text-[var(--text-sm)] font-semibold transition-colors duration-300 flex items-center justify-center gap-2 tracking-[0.005em]"
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
          {TURNSTILE_SITE_KEY && !isLocked && (
            <p className="text-[10px] text-[var(--color-text-dim)] mb-2 flex items-center justify-center gap-1 tracking-[0.02em]">
              <Shield size={10} />
              Protected by Cloudflare Turnstile
            </p>
          )}
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
