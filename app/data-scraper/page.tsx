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
                  onInputsParsed={(inputs) => {
                    // Pre-fill or start batch scraping logic if needed
                  }}
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