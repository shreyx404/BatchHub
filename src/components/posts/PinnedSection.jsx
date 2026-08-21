import PostCard from './PostCard';
import { Pin } from 'lucide-react';

export default function PinnedSection({ posts = [] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Pin size={16} className="text-amber-400 rotate-45" />
        <h2 className="text-[10px] font-medium text-[var(--color-text)] tracking-[0.1em] uppercase">
          Pinned Updates
        </h2>
        <span className="text-[10px] font-light text-[var(--color-text-dim)]">
          ({posts.length})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
