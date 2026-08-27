"use client";

import React, { useState } from "react";

function LocalHeader() {
  return (
    <header className="w-full py-4 border-b border-neutral-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl font-extrabold tracking-wider text-green-400">
          BAZCLICK
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
          PRO
        </span>
      </div>
    </header>
  );
}

function LocalFooter() {
  return (
    <footer className="w-full py-6 mt-12 border-t border-neutral-800 text-center text-xs text-neutral-500">
      <p>
        © {new Date().getFullYear()} Bazclick Intelligence. All rights reserved.
      </p>
    </footer>
  );
}

interface AdvancedLead {
  "Brand Name": string;
  Website: string;
  "Brand Category": string;
  Address: string;
  Email: string;
  Phone: string;
  Facebook: string;
  YouTube: string;
  Instagram: string;
  "Instagram Followers": string;
  "FB Follower": string;
  "YouTube Subscriber": string;
  "Social Activity": string;
  "SM Last Post": string;
  "SM Video Content Quality": string;
  "SM Image Content Quality": string;
  "SM Posting Frequency": string;
  "FB Ads": string;
  "Website Present": string;
  "Website Functions": string;
  "Website Speed": string;
  "Website Content": string;
  "Website On-page SEO": string;
  "Website Design": string;
  "Website Condition": string;
  "Website Traffic": string;
  "Website's Missings": string;
  "Google Ads": string;
  "Google My Business": string;
  "GMB Post Frequency": string;
  "GMB Review": string;
  "GMB Quality": string;
  "Top 5 Missings for Brand": string;
  "Main Brand Problem": string;
  "Overall Missing Notes": string;
  "Automated Business Gap Mail": string;
  "Send Email to Brand Author": string;
}

const ALL_COLUMNS: (keyof AdvancedLead)[] = [
  "Brand Name",
  "Website",
  "Brand Category",
  "Address",
  "Email",
  "Phone",
  "Facebook",
  "YouTube",
  "Instagram",
  "Instagram Followers",
  "FB Follower",
  "YouTube Subscriber",
  "Social Activity",
  "SM Last Post",
  "SM Video Content Quality",
  "SM Image Content Quality",
  "SM Posting Frequency",
  "FB Ads",
  "Website Present",
  "Website Functions",
  "Website Speed",
  "Website Content",
  "Website On-page SEO",
  "Website Design",
  "Website Condition",
  "Website Traffic",
  "Website's Missings",
  "Google Ads",
  "Google My Business",
  "GMB Post Frequency",
  "GMB Review",
  "GMB Quality",
  "Top 5 Missings for Brand",
  "Main Brand Problem",
  "Overall Missing Notes",
  "Automated Business Gap Mail",
  "Send Email to Brand Author",
];

const GLOW_TEXT =
  "[text-shadow:0_0_6px_rgba(255,255,255,0.45)]";

const GREEN_BTN =
  "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_10px_2px_rgba(34,197,94,0.55)] hover:shadow-[0_0_16px_4px_rgba(34,197,94,0.8)] transition";

export default function AdvancedDataScraperPage() {
  const [keywords, setKeywords] = useState(
    "Keywords to Scrape Leads..."
  );
  const [requireActiveAds, setRequireActiveAds] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<AdvancedLead[]>([]);
  const [selectedMail, setSelectedMail] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartScraping = async () => {
    setLoading(true);
    setLeads([]);
    setErrorMessage("");
    setStatusMessage("");

    const keywordList = keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (keywordList.length === 0) {
      setErrorMessage("Please enter at least one keyword.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/scraper/advanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: keywordList,
          requireActiveAds,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const rawEvent of events) {
          const line = rawEvent.trim();

          if (!line.startsWith("data:")) continue;

          const jsonString = line.slice(5).trim();

          if (!jsonString) continue;

          try {
            const data = JSON.parse(jsonString);

            if (data.type === "lead" && data.lead) {
              setLeads((previous) => [
                ...previous,
                data.lead as AdvancedLead,
              ]);
            }

            if (data.type === "status") {
              setStatusMessage(data.message || "");
            }

            if (data.type === "error") {
              setErrorMessage(
                data.message || "An error occurred during scraping."
              );
            }

            if (data.type === "done") {
              setStatusMessage("");
            }
          } catch (error) {
            console.error("Failed to parse SSE event:", error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to execute scrape job:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to execute scrape job."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = (lead: AdvancedLead) => {
    console.log("Send Email clicked for:", lead["Brand Name"]);
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;

    const rows = [
      ALL_COLUMNS.join(","),
      ...leads.map((lead) =>
        ALL_COLUMNS.map((column) => {
          const value = lead[column] ?? "";

          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(",")
      ),
    ];

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `brand_leads_${Date.now()}.csv`;
    anchor.click();

    window.URL.revokeObjectURL(url);
  };

  const renderCellContent = (
    column: keyof AdvancedLead,
    lead: AdvancedLead
  ) => {
    const value = lead[column];

    if (column === "Send Email to Brand Author") {
      return (
        <button
          onClick={() => handleSendEmail(lead)}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs border border-green-400 ${GREEN_BTN}`}
        >
          Send Email
        </button>
      );
    }

    if (column === "Automated Business Gap Mail") {
      return (
        <button
          onClick={() => setSelectedMail(String(value || ""))}
          className={`px-3 py-1 rounded-md font-semibold text-xs border border-green-400 ${GREEN_BTN}`}
        >
          View Mail
        </button>
      );
    }

    if (
      ["Website", "Facebook", "YouTube", "Instagram"].includes(
        column
      )
    ) {
      if (!value || value === "N/A") {
        return (
          <span className="text-neutral-400">
            N/A
          </span>
        );
      }

      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noreferrer"
          className={`text-green-400 font-medium hover:underline inline-flex items-center gap-1 ${GLOW_TEXT}`}
        >
          Link ↗
        </a>
      );
    }

    if (column === "FB Ads") {
      const active = String(value || "").includes("Active");

      return (
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            active
              ? "bg-green-500/20 text-green-300 border border-green-500/50"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/50"
          }`}
        >
          {String(value || "N/A")}
        </span>
      );
    }

    if (column === "Website Speed") {
      const text = String(value || "");

      const fast = text.includes("Fast");
      const average = text.includes("Average");

      return (
        <span
          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
            fast
              ? "bg-green-500/20 text-green-300 border border-green-500/50"
              : average
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/50"
          }`}
        >
          {text || "N/A"}
        </span>
      );
    }

    return (
      <span className="text-white">
        {String(value || "N/A")}
      </span>
    );
  };

  return (
    <div
      className="p-6 md:p-10 min-h-screen font-sans text-white flex flex-col justify-between"
      style={{ backgroundColor: "#000000" }}
    >
      <div>
        <LocalHeader />

        <header className="mb-8 my-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1
              className={`text-3xl font-extrabold tracking-tight text-white ${GLOW_TEXT}`}
            >
              Brand Intelligence & Lead Scraper
            </h1>

            <p className="text-neutral-300 text-sm mt-1">
              Real-time audit across {ALL_COLUMNS.length} data points per brand
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="px-4 py-2 rounded-lg border border-neutral-700 text-xs font-semibold text-white"
              style={{ backgroundColor: "#0a0a0a" }}
            >
              Columns Mapped:{" "}
              <span
                className={`text-green-400 font-bold ${GLOW_TEXT}`}
              >
                {ALL_COLUMNS.length}
              </span>
            </span>
          </div>
        </header>

        <div
          className="border border-neutral-800 rounded-2xl p-6 shadow-xl mb-8"
          style={{ backgroundColor: "#0a0a0a" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                Target Keywords
              </label>

              <input
                type="text"
                value={keywords}
                onChange={(event) =>
                  setKeywords(event.target.value)
                }
                className="w-full border border-neutral-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                style={{ backgroundColor: "#000000" }}
                placeholder="Real estate New York, real estate Los Angeles"
              />
            </div>

            <div
              className="flex items-center gap-3 border border-neutral-700 p-3 rounded-xl"
              style={{ backgroundColor: "#000000" }}
            >
              <input
                type="checkbox"
                id="adsFilter"
                checked={requireActiveAds}
                onChange={(event) =>
                  setRequireActiveAds(event.target.checked)
                }
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500 bg-black border-neutral-600 cursor-pointer"
              />

              <label
                htmlFor="adsFilter"
                className="text-xs font-medium text-neutral-200 cursor-pointer select-none"
              >
                Filter Active Meta Ads Only
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStartScraping}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm ${
                  loading
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    : GREEN_BTN
                }`}
              >
                {loading
                  ? "Analyzing Leads..."
                  : "Run Scraper"}
              </button>

              {leads.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className={`py-3 px-4 font-bold text-sm rounded-xl whitespace-nowrap ${GREEN_BTN}`}
                >
                  Export ({leads.length})
                </button>
              )}
            </div>
          </div>

          {(statusMessage || errorMessage) && (
            <div className="mt-4 text-xs">
              {statusMessage && (
                <p
                  className={`text-green-300 ${GLOW_TEXT}`}
                >
                  {statusMessage}
                </p>
              )}

              {errorMessage && (
                <p className="text-rose-400 font-semibold">
                  {errorMessage}
                </p>
              )}
            </div>
          )}
        </div>

        <div
          className="border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden mb-8"
          style={{ backgroundColor: "#0a0a0a" }}
        >
          <div
            className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center"
            style={{ backgroundColor: "#0a0a0a" }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Scraped Results:{" "}
              <span
                className={`text-white font-semibold ${GLOW_TEXT}`}
              >
                {leads.length} Records
              </span>
            </span>

            <span className="text-xs text-neutral-400">
              Scroll horizontally to view all {ALL_COLUMNS.length} columns →
            </span>
          </div>

          <div className="overflow-x-auto max-h-[750px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead
                className="text-white uppercase tracking-wider text-[11px] font-bold sticky top-0 z-20 shadow-md"
                style={{ backgroundColor: "#000000" }}
              >
                <tr>
                  <th
                    className="p-4 border-b border-neutral-800 min-w-[50px] text-center sticky left-0 z-30"
                    style={{ backgroundColor: "#000000" }}
                  >
                    #
                  </th>

                  {ALL_COLUMNS.map((column) => (
                    <th
                      key={column}
                      className="p-4 border-b border-neutral-800 whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody
                className="divide-y divide-neutral-800"
                style={{ backgroundColor: "#000000" }}
              >
                {leads.map((lead, rowIndex) => (
                  <tr
                    key={`${lead["Brand Name"]}-${rowIndex}`}
                    className="hover:bg-neutral-900 transition-colors"
                  >
                    <td
                      className="p-4 text-center text-neutral-400 font-mono sticky left-0 z-10"
                      style={{ backgroundColor: "#000000" }}
                    >
                      {rowIndex + 1}
                    </td>

                    {ALL_COLUMNS.map((column) => (
                      <td
                        key={column}
                        className="p-4 whitespace-nowrap max-w-[300px] truncate"
                      >
                        {renderCellContent(column, lead)}
                      </td>
                    ))}
                  </tr>
                ))}

                {leads.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={ALL_COLUMNS.length + 1}
                      className="p-16 text-center text-neutral-400 text-sm"
                    >
                      No brand data loaded yet. Click{" "}
                      <span
                        className={`text-green-400 font-semibold ${GLOW_TEXT}`}
                      >
                        "Run Scraper"
                      </span>{" "}
                      to begin extracting leads.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LocalFooter />

      {selectedMail && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="border border-neutral-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
            style={{ backgroundColor: "#0a0a0a" }}
          >
            <h3
              className={`text-lg font-bold text-white mb-4 ${GLOW_TEXT}`}
            >
              Automated Business Gap Pitch
            </h3>

            <div
              className="p-4 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto"
              style={{ backgroundColor: "#000000" }}
            >
              {selectedMail}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(selectedMail)
                }
                className={`px-4 py-2 font-semibold rounded-lg text-xs ${GREEN_BTN}`}
              >
                Copy Content
              </button>

              <button
                onClick={() => setSelectedMail(null)}
                className="px-4 py-2 hover:bg-neutral-900 text-white font-semibold rounded-lg text-xs border border-neutral-700 transition"
                style={{ backgroundColor: "#000000" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}