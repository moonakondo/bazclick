"use client";

import { useState } from "react";
import ScraperForm from "./components/ScraperForm";
import UploadBox from "./components/UploadBox";
import ScraperProgress from "./components/ScraperProgress";
import ResultsTable from "./components/ResultsTable";

/**
 * Result structure used by ResultsTable.
 *
 * Keep this in sync with the Result interface in ResultsTable.tsx.
 */
interface Result {
  name: string;
  website?: string;
  phone?: string;
  address?: string;
  email?: string;
  email_role?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  source?: string;
}

/**
 * Local Header component.
 *
 * Kept self-contained because there is no separate Header.tsx
 * module at the previous import location.
 */
function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="text-xl font-extrabold tracking-tight text-slate-900">
          BAZCLICK
        </div>
      </div>
    </header>
  );
}

/**
 * Local Footer component.
 *
 * Kept self-contained because there is no separate Footer.tsx
 * module at the previous import location.
 */
function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} BazClick. All rights reserved.
      </div>
    </footer>
  );
}

interface ScraperEvent {
  status?: "status" | "item" | "complete" | "error";
  message?: string;
  item?: unknown;
  error?: string;
}

export default function DataScraperPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);

  function handleItemAdded(newItem: Result) {
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
        body: JSON.stringify({
          inputs,
          sources: ["google"],
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

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

        // Keep any incomplete trailing chunk for the next read.
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          const line = chunk.trim();

          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice("data:".length).trim();

          if (!jsonStr) continue;

          let event: ScraperEvent;

          try {
            event = JSON.parse(jsonStr) as ScraperEvent;
          } catch {
            // Skip malformed event rather than crashing the stream.
            continue;
          }

          if (event.status === "status") {
            setStatusText(event.message || "");
          } else if (event.status === "item") {
            if (event.item !== undefined) {
              /*
               * The scraper API returns lead/result objects.
               * ResultsTable expects Result[].
               *
               * We cast the API item here rather than using unknown[]
               * for the entire results state, preserving the existing
               * scraper response flow.
               */
              handleItemAdded(event.item as Result);
            }
          } else if (event.status === "complete") {
            setStatusText(event.message || "Done.");
            setLoading(false);
          } else if (event.status === "error") {
            setStatusText(
              `Error: ${event.error || "Unknown error"}`
            );
            setLoading(false);
          }
        }
      }

      // Make sure loading does not remain stuck if the stream
      // closes without an explicit complete/error event.
      setLoading(false);
    } catch (err) {
      console.error("Batch scrape error:", err);

      setStatusText(
        "Batch scrape failed — check your connection and try again."
      );

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
              Extract businesses live with real-time feedback, concurrent
              website enrichment, social profiles, and clean CSV exports.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Direct Search Input
                </h2>

                <ScraperForm
                  onItemAdded={handleItemAdded}
                  onClearResults={handleClearResults}
                  onLoading={setLoading}
                  onStatusUpdate={setStatusText}
                />
              </div>

              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Batch Spreadsheet Processing
                </h2>

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