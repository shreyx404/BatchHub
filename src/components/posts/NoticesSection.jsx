import PostCard from './PostCard';
import { Megaphone, Star } from 'lucide-react';

export default function NoticesSection({ posts }) {
  // Filter for notice and important type posts
  const noticePosts = posts.filter(
    (p) => p.type === 'notice' || p.type === 'important'
  );

  if (noticePosts.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone size={16} className="text-[var(--color-text)]" />
        <h2 className="text-[10px] font-medium text-[var(--color-text)] tracking-[0.1em] uppercase">
          Notices &amp; Important
        </h2>
        <span className="text-[10px] font-light text-[var(--color-text-dim)]">
          ({noticePosts.length})
        </span>
      </div>

      <div className="relative border-l-2 border-[var(--color-text)] pl-0">
        <div className="flex flex-col gap-0 stagger-children">
          {noticePosts.map((post) => (
            <div
              key={post.id}
              className="relative bg-[var(--color-surface-2)] border-b border-[var(--color-border)]"
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
