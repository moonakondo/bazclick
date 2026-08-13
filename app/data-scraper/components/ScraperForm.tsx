"use client";

import { useState } from "react";

interface ScraperFormProps {
  onItemAdded: (item: any) => void;
  onClearResults: () => void;
  onLoading: (loading: boolean) => void;
  onStatusUpdate: (status: string) => void;
}

export default function ScraperForm({
  onItemAdded,
  onClearResults,
  onLoading,
  onStatusUpdate,
}: ScraperFormProps) {
  const [inputVal, setInputVal] = useState("");
  const [sources, setSources] = useState<string[]>(["google", "yelp", "yellowpages"]);

  function toggleSource(source: string) {
    setSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const inputs = inputVal
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!inputs.length) return;

    onLoading(true);
    onClearResults();
    onStatusUpdate("Connecting to scrapers...");

    try {
      const response = await fetch("/api/scraper/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, sources }),
      });

      if (!response.body) throw new Error("No readable stream received.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.replace("data: ", ""));

            if (data.status === "status" || data.status === "progress") {
              onStatusUpdate(data.message);
            } else if (data.status === "item") {
              onItemAdded(data.item);
            } else if (data.status === "error") {
              alert(data.error);
            }
          }
        }
      }
    } catch (err: any) {
      alert(err.message || "An error occurred during live scraping.");
    } finally {
      onLoading(false);
      onStatusUpdate("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
          Search Sources
        </label>
        <div className="flex gap-4 text-xs font-medium text-slate-700">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sources.includes("google")}
              onChange={() => toggleSource("google")}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Google Maps
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sources.includes("yelp")}
              onChange={() => toggleSource("yelp")}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Yelp
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sources.includes("yellowpages")}
              onChange={() => toggleSource("yellowpages")}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Yellow Pages
          </label>
        </div>
      </div>

      <div>
        <textarea
          rows={5}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Enter keywords or Google Maps URLs (one per line)..."
          className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition"
      >
        Start Scraping
      </button>
    </form>
  );
}