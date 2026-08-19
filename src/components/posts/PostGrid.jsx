import PostCard from './PostCard';
import EmptyState from '../ui/EmptyState';
import { Search } from 'lucide-react';

export default function PostGrid({ posts, loading }) {
  if (!loading && posts.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No posts found"
        description="Try adjusting your search or filters to find what you're looking for."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto stagger-children w-full">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
