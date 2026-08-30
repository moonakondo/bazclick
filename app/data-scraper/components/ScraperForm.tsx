"use client";

import { useState } from "react";
import { SourceCoverageInfo, YELP_COVERAGE_NOTE, YELLOW_PAGES_COVERAGE_NOTE } from "./SourceTooltip";

interface ScraperFormProps {
  onItemAdded: (item: any) => void;
  onClearResults: () => void;
  onLoading: (loading: boolean) => void;
  onStatusUpdate: (status: string) => void;
}

interface ResumeState {
  pendingInputs: string[];
  currentInputListings?: Record<string, unknown>[];
  currentInputLabel?: string;
}

type RunOutcome =
  | { status: "complete" }
  | { status: "paused"; resumeState: ResumeState }
  | { status: "error" };

// Safety cap so a bug on the server side (e.g. it keeps pausing without
// ever making progress) can't loop this forever in the browser.
const MAX_CONTINUATIONS = 60;

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

  // Runs ONE request/stream cycle against /api/scraper/start and reports
  // back whether it finished, errored, or got paused (with the resume
  // token needed to continue). Item/status events are forwarded to the
  // parent exactly as before — this part behaves identically to the
  // original single-shot version.
  async function runOneRequest(body: Record<string, unknown>): Promise<RunOutcome> {
    const response = await fetch("/api/scraper/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      alert("Failed to establish stream connection with scraper.");
      return { status: "error" };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data: ")) continue;

        try {
          const data = JSON.parse(line.replace("data: ", ""));

          if (data.status === "status") {
            onStatusUpdate(data.message);
          } else if (data.status === "item") {
            onItemAdded(data.item);
            if (data.message) onStatusUpdate(data.message);
          } else if (data.status === "complete") {
            onStatusUpdate(data.message || "Scraping completed!");
            return { status: "complete" };
          } else if (data.status === "paused") {
            onStatusUpdate(data.message || "Continuing...");
            return { status: "paused", resumeState: data.resumeState };
          } else if (data.status === "error") {
            alert(`Scraper Notice: ${data.error}`);
            return { status: "error" };
          }
        } catch {
          // Ignore partial chunk parse failures
        }
      }
    }

    // Stream ended without an explicit complete/paused/error event —
    // treat as done rather than looping forever.
    return { status: "complete" };
  }

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
      let outcome = await runOneRequest({
        inputs: activeInputs,
        sources: selectedSources,
      });

      let continuations = 0;
      while (outcome.status === "paused" && continuations < MAX_CONTINUATIONS) {
        continuations += 1;
        outcome = await runOneRequest({
          inputs: [],
          sources: selectedSources,
          resumeState: outcome.resumeState,
        });
      }

      if (outcome.status === "paused") {
        onStatusUpdate(
          "Stopped after many continuations — this search may be unusually large. You can start again to keep going."
        );
      }
    } catch (err: any) {
      console.warn("Stream read ended or dropped gracefully:", err);
    } finally {
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

          <SourceCoverageInfo
            label="Yelp"
            name="yelp"
            checked={sources.yelp}
            onChange={handleSourceChange}
            note={YELP_COVERAGE_NOTE}
          />

          <SourceCoverageInfo
            label="Yellow Pages"
            name="yellowpages"
            checked={sources.yellowpages}
            onChange={handleSourceChange}
            note={YELLOW_PAGES_COVERAGE_NOTE}
          />
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
