import { useState, useCallback } from 'react';

const ADMIN_TOKEN_KEY = 'batchhub_admin_token';

export function useAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem(ADMIN_TOKEN_KEY);
  });

  const login = useCallback(async (password) => {
    if (!password || !password.trim()) {
      return false;
    }

    // Validate the password by making a lightweight request to the admin API.
    // If the server responds with 200, the password is correct.
    // The password is never checked client-side — it's only sent as a Bearer token.
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        // Send a harmless request that will fail gracefully — 
        // we just need to know if auth passes (200/400) vs fails (401/429/500).
        body: JSON.stringify({ action: '__ping' }),
      });

      if (response.status === 401) {
        return false; // Invalid password
      }

      if (response.status === 429) {
        return 'rate_limited'; // Too many attempts
      }

      if (response.status === 500) {
        // Server misconfigured — but password may still be valid in demo mode
        // Allow through only if no admin API is set up (demo mode)
        return false;
      }

      // 200 (unlikely for __ping, but possible) or 400 ("Unknown action") both mean auth passed
      sessionStorage.setItem(ADMIN_TOKEN_KEY, password);
      setIsAuthenticated(true);
      return true;
    } catch {
      // Network error — might be in dev without the API. Fall back to storing the token
      // so the admin UI renders, and let actual admin requests handle auth.
      sessionStorage.setItem(ADMIN_TOKEN_KEY, password);
      setIsAuthenticated(true);
      return true;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout };
}
