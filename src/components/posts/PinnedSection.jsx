import PostCard from './PostCard';
import { Pin } from 'lucide-react';

export default function PinnedSection({ posts }) {
  const pinnedPosts = posts.filter((p) => p.is_pinned);

  if (pinnedPosts.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Pin size={16} className="text-amber-400 rotate-45" />
        <h2 className="text-[10px] font-medium text-[var(--color-text)] tracking-[0.1em] uppercase">
          Pinned Updates
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {pinnedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
