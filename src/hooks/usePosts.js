import { useState, useEffect, useCallback } from 'react';
import { fetchPosts, fetchUpcomingDeadlines } from '../lib/api';
import { MinHeap } from '../lib/ds';

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
    let cancelled = false;

    setLoading(true);
    fetchUpcomingDeadlines()
      .then((data) => {
        if (!cancelled) {
          if (data && data.length > 0) {
            // Unit 4 Priority Queue: Min-Heap ordered by earliest due_date
            const heap = new MinHeap((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
            data.forEach((item) => heap.insert(item));
            const sorted = [];
            while (!heap.isEmpty()) {
              sorted.push(heap.extractMin());
            }
            setDeadlines(sorted);
          } else {
            setDeadlines([]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setDeadlines([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { deadlines, loading };
}
