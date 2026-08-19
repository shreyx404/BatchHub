import { useState, useEffect, useCallback } from 'react';
import { fetchPosts, fetchUpcomingDeadlines } from '../lib/api';

export function usePosts(filters = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPosts(filters);
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.subjectId, filters.search]);

  useEffect(() => {
    load();
  }, [load]);

  return { posts, loading, error, refetch: load };
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
