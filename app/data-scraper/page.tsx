"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScraperForm from "./components/ScraperForm";
import UploadBox from "./components/UploadBox";
import ScraperProgress from "./components/ScraperProgress";
import ResultsTable from "./components/ResultsTable";

export default function DataScraperPage() {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [results, setResults] = useState<any[]>([]);

  function handleItemAdded(newItem: any) {
    setResults((prev) => [...prev, newItem]);
  }

  function handleClearResults() {
    setResults([]);
  }

  // Runs a batch scrape from the list of keywords/URLs pulled out of an
  // uploaded spreadsheet. Talks to the exact same /api/scraper/start
  // endpoint and SSE event shape that ScraperForm uses for direct search
  // (status / item / complete / error), so results land in the same table.
  async function handleInputsParsed(inputs: string[]) {
    if (!inputs.length) return;

    handleClearResults();
    setLoading(true);
    setStatusText(`Starting batch scrape for ${inputs.length} input(s)...`);

    try {
      const res = await fetch("/api/scraper/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Batch uploads default to Google Maps only for now — the upload
        // box has no source checkboxes of its own yet.
        body: JSON.stringify({ inputs, sources: ["google"] }),
      });

      if (!res.body) {
        setStatusText("No response stream from server.");
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by a blank line ("\n\n")
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || ""; // keep any incomplete trailing chunk for next read

        for (const chunk of chunks) {
          const line = chunk.trim();
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice("data:".length).trim();
          if (!jsonStr) continue;

          let event: any;
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue; // skip malformed event rather than crashing the stream
          }

          if (event.status === "status") {
            setStatusText(event.message || "");
          } else if (event.status === "item") {
            handleItemAdded(event.item);
          } else if (event.status === "complete") {
            setStatusText(event.message || "Done.");
            setLoading(false);
          } else if (event.status === "error") {
            setStatusText(`Error: ${event.error || "Unknown error"}`);
            setLoading(false);
          }
        }
      }
    } catch (err) {
      console.error("Batch scrape error:", err);
      setStatusText("Batch scrape failed — check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
              Free Data Tool
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Free Data Scraper &amp; Business Lead Finder
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              Extract businesses live with real-time feedback, concurrent website enrichment, social profiles, and clean CSV exports.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-slate-900">Direct Search Input</h2>
                <ScraperForm
                  onItemAdded={handleItemAdded}
                  onClearResults={handleClearResults}
                  onLoading={setLoading}
                  onStatusUpdate={setStatusText}
                />
              </div>

              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-900">Batch Spreadsheet Processing</h2>
                <UploadBox
                  disabled={loading}
                  onInputsParsed={handleInputsParsed}
                />
              </div>
            </div>

            <ScraperProgress
              loading={loading}
              statusText={statusText}
              count={results.length}
            />

            <ResultsTable results={results} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
