import PostCard from './PostCard';
import { Pin } from 'lucide-react';

export default function PinnedSection({ posts = [] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="section-divider mb-5 sm:mb-6">
        <span>Pinned Updates · {posts.length}</span>
      </div>

      {/* Bento grid: first item spans full width for 3+ posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-0">
        {posts.length >= 3 ? (
          <>
            <div className="sm:col-span-2 relative border-b border-[var(--color-border)]">
              <PostCard post={posts[0]} />
            </div>
            {posts.slice(1).map((post) => (
              <div
                key={post.id}
                className="relative border-b border-[var(--color-border)] sm:odd:border-r sm:odd:border-r-[var(--color-border)]"
              >
                <PostCard post={post} />
              </div>
            ))}
          </>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="relative border-b border-[var(--color-border)] sm:first:border-r sm:first:border-r-[var(--color-border)]"
            >
              <PostCard post={post} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
