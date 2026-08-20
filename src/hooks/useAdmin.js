import { useState, useCallback, useEffect } from 'react';
import { getDeviceFingerprint } from '../lib/fingerprint';

const ADMIN_TOKEN_KEY = 'batchhub_admin_token';
const ATTEMPTS_STORAGE_KEY = 'batchhub_admin_login_attempts';
const MAX_ATTEMPTS = 10;
const LOCKOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getLockoutInfo() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) {
      return { count: 0, isLocked: false, remainingAttempts: MAX_ATTEMPTS, remainingSeconds: 0 };
    }
    const data = JSON.parse(raw);
    const now = Date.now();

    // Check if 24-hour lockout is active
    if (data.lockedUntil && now < data.lockedUntil) {
      return {
        count: data.count || MAX_ATTEMPTS,
        isLocked: true,
        remainingAttempts: 0,
        remainingSeconds: Math.ceil((data.lockedUntil - now) / 1000),
      };
    }

    // Check if 24-hour lockout or attempt window has expired
    if (data.lockedUntil && now >= data.lockedUntil) {
      localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
      return { count: 0, isLocked: false, remainingAttempts: MAX_ATTEMPTS, remainingSeconds: 0 };
    }

    if (data.firstAttempt && now - data.firstAttempt > LOCKOUT_MS) {
      localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
      return { count: 0, isLocked: false, remainingAttempts: MAX_ATTEMPTS, remainingSeconds: 0 };
    }

    const count = data.count || 0;
    const isLocked = count >= MAX_ATTEMPTS;
    return {
      count,
      isLocked,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - count),
      remainingSeconds: isLocked ? Math.ceil(LOCKOUT_MS / 1000) : 0,
    };
  } catch {
    return { count: 0, isLocked: false, remainingAttempts: MAX_ATTEMPTS, remainingSeconds: 0 };
  }
}

function recordFailedAttempt() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    const now = Date.now();
    let data = raw ? JSON.parse(raw) : null;

    if (!data || (data.firstAttempt && now - data.firstAttempt > LOCKOUT_MS)) {
      data = { count: 1, firstAttempt: now, lockedUntil: null };
    } else {
      data.count = (data.count || 0) + 1;
    }

    if (data.count >= MAX_ATTEMPTS) {
      data.lockedUntil = now + LOCKOUT_MS;
    }

    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(data));
    return getLockoutInfo();
  } catch {
    return { count: 1, isLocked: false, remainingAttempts: MAX_ATTEMPTS - 1, remainingSeconds: 0 };
  }
}

function recordSuccessfulAttempt() {
  try {
    localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
  } catch {
    // Ignore storage issues
  }
}

export function useAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !getLockoutInfo().isLocked && !!sessionStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [lockoutInfo, setLockoutInfo] = useState(() => getLockoutInfo());

  // Periodically refresh lockout info to clear expired locks
  useEffect(() => {
    const check = () => setLockoutInfo(getLockoutInfo());
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (password, turnstileToken = null) => {
    if (!password || !password.trim()) {
      return { success: false, error: 'empty_password' };
    }

    const currentLock = getLockoutInfo();
    if (currentLock.isLocked) {
      setLockoutInfo(currentLock);
      return {
        success: false,
        error: 'rate_limited',
        isLocked: true,
        remainingSeconds: currentLock.remainingSeconds,
      };
    }

    // Generate device fingerprint for per-device rate limiting
    const fingerprint = getDeviceFingerprint();

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({
          action: '__ping',
          fingerprint,
          ...(turnstileToken && { turnstileToken }),
        }),
      });

      if (response.status === 429) {
        // Server triggered 429 rate limit
        const failed = recordFailedAttempt();
        // Force lock on client
        try {
          const now = Date.now();
          localStorage.setItem(
            ATTEMPTS_STORAGE_KEY,
            JSON.stringify({ count: MAX_ATTEMPTS, firstAttempt: now, lockedUntil: now + LOCKOUT_MS })
          );
        } catch {}
        const lock = getLockoutInfo();
        setLockoutInfo(lock);
        return { success: false, error: 'rate_limited', isLocked: true, remainingSeconds: lock.remainingSeconds };
      }

      if (response.status === 403) {
        // Turnstile bot verification failed
        return { success: false, error: 'turnstile_failed' };
      }

      if (response.status === 401) {
        const failed = recordFailedAttempt();
        setLockoutInfo(failed);
        return {
          success: false,
          error: failed.isLocked ? 'rate_limited' : 'invalid_password',
          remainingAttempts: failed.remainingAttempts,
          isLocked: failed.isLocked,
          remainingSeconds: failed.remainingSeconds,
        };
      }

      if (response.status === 404 || response.status === 500) {
        // Fallback for dev / demo environments where serverless /api/admin is not running
        const expected = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
        if (password === expected) {
          recordSuccessfulAttempt();
          setLockoutInfo(getLockoutInfo());
          sessionStorage.setItem(ADMIN_TOKEN_KEY, password);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          const failed = recordFailedAttempt();
          setLockoutInfo(failed);
          return {
            success: false,
            error: failed.isLocked ? 'rate_limited' : 'invalid_password',
            remainingAttempts: failed.remainingAttempts,
            isLocked: failed.isLocked,
            remainingSeconds: failed.remainingSeconds,
          };
        }
      }

      // Success (200 or 400 'Unknown action' means Bearer auth passed)
      recordSuccessfulAttempt();
      setLockoutInfo(getLockoutInfo());
      sessionStorage.setItem(ADMIN_TOKEN_KEY, password);
      setIsAuthenticated(true);
      return { success: true };
    } catch {
      // Network error fallback
      const expected = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
      if (password === expected) {
        recordSuccessfulAttempt();
        setLockoutInfo(getLockoutInfo());
        sessionStorage.setItem(ADMIN_TOKEN_KEY, password);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const failed = recordFailedAttempt();
        setLockoutInfo(failed);
        return {
          success: false,
          error: failed.isLocked ? 'rate_limited' : 'invalid_password',
          remainingAttempts: failed.remainingAttempts,
          isLocked: failed.isLocked,
          remainingSeconds: failed.remainingSeconds,
        };
      }
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout, lockoutInfo };
}
