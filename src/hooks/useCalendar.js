import { useState, useEffect } from 'react';
import { fetchCalendarDeadlines } from '../lib/api';

export function useCalendarPosts(year, month, options = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCalendarDeadlines(year, month, options);
        if (!cancelled) {
          setPosts(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [year, month, optionsKey]);

  return { posts, loading, error };
}
