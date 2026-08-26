"use client";

interface ScraperProgressProps {
  loading: boolean;
  statusText: string;
  count: number;
}

export default function ScraperProgress({
  loading,
  statusText,
  count,
}: ScraperProgressProps) {
  // Show section if currently scraping OR if we have collected results
  if (!loading && count === 0 && !statusText) return null;

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        {loading ? (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
          </span>
        ) : (
          <span className="inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        )}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {loading ? "Scraping Active" : "Scraping Finished"}
          </p>
          <p className="text-sm font-medium text-slate-700">
            {statusText || (loading ? "Processing..." : "Done")}
          </p>
        </div>
      </div>

      <div className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
        {count} Leads Found
      </div>
    </div>
  );
}