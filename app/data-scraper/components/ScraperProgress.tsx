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
  if (!loading && count === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-blue-600"></span>
            </div>
          ) : (
            <div className="h-3.5 w-3.5 rounded-full bg-green-500" />
          )}

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {loading ? "Scraping Active" : "Scraping Completed"}
            </h4>
            <p className="text-xs text-blue-700 font-semibold mt-0.5">
              {statusText || (loading ? `${count} Leads Scraped & Still Finding...` : `${count} Leads Scraped totally.`)}
            </p>
          </div>
        </div>

        <span className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-300">
          {count} Leads Found
        </span>
      </div>
    </div>
  );
}