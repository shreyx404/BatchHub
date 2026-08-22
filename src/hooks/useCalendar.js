import { useState, useEffect } from 'react';
import { fetchCalendarDeadlines } from '../lib/api';

export function useCalendarPosts(year, month) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCalendarDeadlines(year, month);
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
  }, [year, month]);

  return { posts, loading, error };
}
