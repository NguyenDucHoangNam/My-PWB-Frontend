export function AiLoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700/50 rounded w-full"></div>
      <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
      <div className="space-y-2 pt-3">
        <div className="h-8 bg-gray-700/30 rounded"></div>
        <div className="h-8 bg-gray-700/30 rounded"></div>
      </div>
    </div>
  );
}
