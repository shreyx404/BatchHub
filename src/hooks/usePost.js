import { useState, useEffect } from 'react';
import { fetchPost } from '../lib/api';

export function usePost(id) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPost(id);
        if (!cancelled) setPost(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { post, loading, error };
}
