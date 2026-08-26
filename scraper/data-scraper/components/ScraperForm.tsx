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
  const [sources, setSources] = useState({
    google: true,
    yelp: true,
    yellowpages: true,
  });

  const handleSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSources({ ...sources, [e.target.name]: e.target.checked });
  };

  const handleStartScraping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    onClearResults();
    onLoading(true);
    onStatusUpdate("Connecting to scrapers...");

    const selectedSources = Object.keys(sources).filter(
      (key) => sources[key as keyof typeof sources]
    );

    const activeInputs = inputVal
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/scraper/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: activeInputs,
          sources: selectedSources,
        }),
      });

      if (!response.ok || !response.body) {
        alert("Failed to establish stream connection with scraper.");
        onLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || ""; // Retain incomplete chunk in buffer

        for (const part of parts) {
          const line = part.trim();
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));

              if (data.status === "status") {
                onStatusUpdate(data.message);
              } else if (data.status === "item") {
                onItemAdded(data.item);
                if (data.message) onStatusUpdate(data.message);
              } else if (data.status === "complete") {
                onStatusUpdate(data.message || "Scraping completed!");
              } else if (data.status === "error") {
                alert(`Scraper Notice: ${data.error}`);
              }
            } catch (err) {
              // Ignore partial chunk parse failures
            }
          }
        }
      }
    } catch (err: any) {
      console.warn("Stream read ended or dropped gracefully:", err);
    } finally {
      // ALWAYS keep collected leads intact and reset loading spinner gently
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleStartScraping} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          SEARCH SOURCES
        </label>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="google"
              checked={sources.google}
              onChange={handleSourceChange}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Google Maps
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="yelp"
              checked={sources.yelp}
              onChange={handleSourceChange}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Yelp
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="yellowpages"
              checked={sources.yellowpages}
              onChange={handleSourceChange}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Yellow Pages
          </label>
        </div>
      </div>

      <div>
        <textarea
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Enter keyword (e.g., Hotels Dhaka) OR paste Google Maps link..."
          rows={4}
          className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-900 py-3 text-sm font-bold text-white hover:bg-blue-800 transition"
      >
        Start Scraping
      </button>
    </form>
  );
}