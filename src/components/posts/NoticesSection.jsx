import PostCard from './PostCard';
import { Megaphone } from 'lucide-react';

export default function NoticesSection({ posts = [] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="section-divider mb-5 sm:mb-6">
        <span>Notices & Important · {posts.length}</span>
      </div>

      {/* Bento grid: first item spans full width, rest in 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-0">
        {posts.length === 1 ? (
          <div className="sm:col-span-2 relative bg-[var(--color-surface-2)] border-l-2 border-l-[var(--color-amber)] border-b border-b-[var(--color-border)]">
            <PostCard post={posts[0]} />
          </div>
        ) : (
          <>
            {/* First notice — wide card spanning both columns */}
            <div className="sm:col-span-2 relative bg-[var(--color-surface-2)] border-l-2 border-l-[var(--color-amber)] border-b border-b-[var(--color-border)]">
              <PostCard post={posts[0]} />
            </div>
            {/* Remaining notices — grid */}
            {posts.slice(1).map((post) => (
              <div
                key={post.id}
                className="relative bg-[var(--color-surface-2)] border-l-2 border-l-[var(--color-amber)] border-b border-b-[var(--color-border)] sm:odd:border-r sm:odd:border-r-[var(--color-border)]"
              >
                <PostCard post={post} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
