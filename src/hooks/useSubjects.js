import { useState, useEffect, useCallback } from 'react';
import { fetchSubjects } from '../lib/api';

export function useSubjects() {
  const [subjects, setSubjects] = useState([]);
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
        const data = await fetchSubjects();
        if (!cancelled) {
          setSubjects(data || []);
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
  }, [fetchIndex]);

  return { subjects, loading, error, refetch };
}

