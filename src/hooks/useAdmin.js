import { useState, useCallback } from 'react';

const ADMIN_KEY = 'batchhub_admin';
const ADMIN_TOKEN_KEY = 'batchhub_admin_token';

export function useAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_KEY) === 'true';
  });

  const login = useCallback((password) => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminPassword) {
      // In demo mode, accept any non-empty password
      if (password && password.length > 0) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, password);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }

    if (password === adminPassword) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, password);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout };
}
