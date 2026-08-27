export default function LoadingState({ count = 3 }) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative pl-6 py-6 border-l border-[var(--color-border)] space-y-3.5"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div
            className="absolute left-[-4px] top-[30px] w-[7px] h-[7px] bg-[var(--color-border-light)]"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          />
          <div className="flex items-center gap-3">
            <div className="skeleton w-28 h-3" />
            <div className="skeleton w-16 h-4" />
            <div className="skeleton w-12 h-4" />
          </div>
          <div className="skeleton w-3/4 h-7" />
          <div className="skeleton w-full h-4" />
          <div className="skeleton w-2/3 h-4" />
          <div className="pt-2 border-t border-[var(--color-border)] border-dashed flex justify-between">
            <div className="skeleton w-36 h-3" />
            <div className="skeleton w-4 h-4" />
          </div>
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
