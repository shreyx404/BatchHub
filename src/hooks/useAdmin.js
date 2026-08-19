import { useState, useCallback } from 'react';

const ADMIN_KEY = 'batchhub_admin';

export function useAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(ADMIN_KEY) === 'true';
  });

  const login = useCallback((password) => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminPassword) {
      // In demo mode, accept any non-empty password
      if (password && password.length > 0) {
        sessionStorage.setItem(ADMIN_KEY, 'true');
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }

    if (password === adminPassword) {
      sessionStorage.setItem(ADMIN_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout };
}
