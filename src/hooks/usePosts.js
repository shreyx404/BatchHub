import { useState, useEffect, useCallback } from 'react';
import { fetchPosts, fetchUpcomingDeadlines } from '../lib/api';

export function usePosts(filters = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fetchIndex, setFetchIndex] = useState(0);
  const refetch = useCallback(() => setFetchIndex((prev) => prev + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPosts(filters);
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
  }, [filters.type, filters.subjectId, filters.search, filters.status, fetchIndex]);

  return { posts, loading, error, refetch };
}

export function useUpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingDeadlines()
      .then(setDeadlines)
      .catch(() => setDeadlines([]))
      .finally(() => setLoading(false));
  }, []);

  return { deadlines, loading };
}
