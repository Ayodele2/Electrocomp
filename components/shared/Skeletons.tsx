export function ProductSkeleton() {
  return (
    <div className="rounded-xl border bg-white overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-gray-100 rounded w-16" />
          <div className="h-8 bg-blue-50 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-48 mb-8" />
      <div className="flex gap-8">
        <div className="hidden lg:block w-52 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
        <div className="flex-1">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
