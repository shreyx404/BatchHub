export default function LoadingState({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex gap-2">
            <div className="skeleton w-20 h-5" />
            <div className="skeleton w-14 h-5" />
          </div>
          <div className="skeleton w-full h-5" />
          <div className="skeleton w-3/4 h-5" />
          <div className="skeleton w-1/2 h-4 mt-2" />
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 20 }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className="rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
