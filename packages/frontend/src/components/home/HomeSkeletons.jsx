export function HeroSkeleton() {
  return (
    <div className="relative h-[32rem] w-full animate-pulse bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-8">
        <div className="max-w-xl space-y-4">
          <div className="h-4 w-40 rounded bg-gray-700" />
          <div className="h-10 w-80 rounded bg-gray-700" />
          <div className="h-4 w-96 rounded bg-gray-700" />
          <div className="h-4 w-72 rounded bg-gray-700" />
          <div className="flex gap-2">
            <div className="h-7 w-20 rounded-full bg-gray-700" />
            <div className="h-7 w-20 rounded-full bg-gray-700" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-36 rounded-lg bg-gray-700" />
            <div className="h-10 w-44 rounded-lg bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton({ count = 6 }) {
  return (
    <div className="flex gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-44 flex-shrink-0 animate-pulse md:w-48"
        >
          <div className="aspect-[2/3] w-full rounded-lg bg-gray-800" />
          <div className="mt-2 h-4 w-3/4 rounded bg-gray-800" />
          <div className="mt-1 h-3 w-1/2 rounded bg-gray-800" />
        </div>
      ))}
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/3] animate-pulse rounded-xl bg-gray-800"
        />
      ))}
    </div>
  );
}

export function CompactListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3"
        >
          <div className="h-16 w-11 rounded bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-800" />
            <div className="h-3 w-1/2 rounded bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
