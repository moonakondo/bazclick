"use client";

import { AdvancedLead } from "@/scraper/advanced-multi-source";

interface Props {
  results: AdvancedLead[];
}

export default function AdvancedResultsTable({ results }: Props) {
  if (!results.length) return null;

  function exportCSV() {
    if (!results.length) return;
    const headers = Object.keys(results[0]).join(",");
    const rows = results.map((r) =>
      Object.values(r)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dhaka_business_leads_35col_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">
          Scraped Verified Commercial Leads ({results.length})
        </h3>
        <button
          onClick={exportCSV}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
        >
          📥 Export Complete 35-Column CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[3200px] text-left text-xs text-slate-700">
          <thead className="bg-slate-100 uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">🏢 Business Name</th>
              <th className="p-3">🏭 Industry Category</th>
              <th className="p-3">🗺️ Service Area</th>
              <th className="p-3">📌 Business Address</th>
              <th className="p-3">📞 Contact Number</th>
              <th className="p-3">📧 Email Address</th>
              <th className="p-3">🌐 Website URL</th>
              <th className="p-3">🌐 Website Present?</th>
              <th className="p-3">🎨 Website Design</th>
              <th className="p-3">🛠️ Website Functions</th>
              <th className="p-3">⭐ GMB Rating</th>
              <th className="p-3">📘 Facebook Page</th>
              <th className="p-3">👥 FB Followers</th>
              <th className="p-3">📢 FB Ads Status</th>
              <th className="p-3">📸 Instagram</th>
              <th className="p-3">📸 IG Followers</th>
              <th className="p-3">🎯 Main Brand Problem</th>
              <th className="p-3">🎯 Top 5 Missings</th>
              <th className="p-3">📝 Overall Missing Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {results.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">{item["Brand Name"]}</td>
                <td className="p-3">{item["Brand Category"]}</td>
                <td className="p-3 whitespace-nowrap">{item["Service Area"]}</td>
                <td className="p-3 max-w-xs truncate">{item["Address"]}</td>
                <td className="p-3 font-semibold text-blue-700">{item["Phone"]}</td>
                <td className="p-3">{item["Email"]}</td>
                <td className="p-3 text-blue-600 truncate max-w-xs">{item["Website"]}</td>
                <td className="p-3">{item["Website Present"]}</td>
                <td className="p-3">{item["Website Design"]}</td>
                <td className="p-3">{item["Website Functions"]}</td>
                <td className="p-3">{item["GMB Review"]}</td>
                <td className="p-3">{item["Facebook"]}</td>
                <td className="p-3">{item["FB Follower"]}</td>
                <td className="p-3">{item["FB Ads"]}</td>
                <td className="p-3">{item["Instagram"]}</td>
                <td className="p-3">{item["Instagram Followers"]}</td>
                <td className="p-3 font-semibold text-rose-600">{item["Main Brand Problem"]}</td>
                <td className="p-3 max-w-md truncate">{item["Top 5 Missings for Brand"]}</td>
                <td className="p-3 max-w-md truncate">{item["Overall Missing Notes"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}