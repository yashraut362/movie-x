// Placeholder cards shown while movie data is loading. The sizes mirror the
// 3D movie cards on the home, explore, and suggest pages so nothing shifts
// when the real cards arrive.
export function MovieCardSkeleton() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-auto w-auto animate-pulse rounded-xl border border-white/[0.1] bg-black bg-opacity-45 p-6 sm:w-[20rem]">
        <div className="h-6 w-3/4 rounded bg-white/10" />
        <div className="mt-3 h-4 w-full rounded bg-white/5" />
        <div className="mt-2 h-4 w-5/6 rounded bg-white/5" />
        <div className="mt-4 h-80 w-full rounded-xl bg-white/5" />
        <div className="mt-20 flex items-center justify-between">
          <div className="h-8 w-28 rounded-xl bg-white/5" />
          <div className="h-8 w-24 rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </>
  );
}
