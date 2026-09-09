import { useMemo } from 'react';
import { usePosts } from './usePosts';

/**
 * Hook for fetching and sorting archived posts.
 * Wraps usePosts with status='archived' and adds client-side sorting.
 *
 * @param {Object} filters - { type, subjectId, search }
 * @param {string} sortBy - 'newest' | 'oldest' | 'due-date' | 'title-az'
 */
export function useArchivePosts(filters = {}, sortBy = 'newest') {
  const archiveFilters = useMemo(
    () => ({ ...filters, status: 'archived' }),
    [filters.type, filters.subjectId, filters.search]
  );

  const { posts, loading, error, refetch } = usePosts(archiveFilters);

  const sortedPosts = useMemo(() => {
    if (!posts.length) return posts;

    const sorted = [...posts];

    switch (sortBy) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
        break;
      case 'due-date':
        sorted.sort((a, b) => {
          // Posts with due dates first, then sorted descending (most recent due first)
          if (a.due_date && b.due_date) return new Date(b.due_date) - new Date(a.due_date);
          if (a.due_date && !b.due_date) return -1;
          if (!a.due_date && b.due_date) return 1;
          return new Date(b.updated_at) - new Date(a.updated_at);
        });
        break;
      case 'title-az':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
    }

    return sorted;
  }, [posts, sortBy]);

  return {
    posts: sortedPosts,
    totalCount: posts.length,
    loading,
    error,
    refetch,
  };
}
