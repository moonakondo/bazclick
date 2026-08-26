"use client";

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

export default function ResultsTable({ results }: { results: Result[] }) {
  if (!results || !results.length) return null;

  function getBadgeColor(role: string = "N/A") {
    if (["Owner / Founder", "CEO / Managing Director", "CMO", "Head of Marketing", "Director"].includes(role)) {
      return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
    }
    if (["Business Development Manager", "Sales Manager / Head of Sales", "General Manager"].includes(role)) {
      return "bg-blue-100 text-blue-800 border-blue-200 font-medium";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  // Helper: true only if the field is a real, non-N/A value
  function hasValue(value?: string) {
    return !!value && value !== "N/A";
  }

  function exportToCSV() {
    const headers = [
      "Business Name",
      "Source",
      "Email",
      "Email Role",
      "Phone",
      "Website",
      "Address",
      "Facebook",
      "Instagram",
      "LinkedIn",
      "Twitter",
      "YouTube",
      "TikTok",
    ];

    const rows = results.map((r) => [
      `"${(r.name || "N/A").replace(/"/g, '""')}"`,
      `"${(r.source || "Google Maps").replace(/"/g, '""')}"`,
      `"${(r.email || "N/A").replace(/"/g, '""')}"`,
      `"${(r.email_role || "N/A").replace(/"/g, '""')}"`,
      `"${(r.phone || "N/A").replace(/"/g, '""')}"`,
      `"${(r.website || "N/A").replace(/"/g, '""')}"`,
      `"${(r.address || "N/A").replace(/"/g, '""')}"`,
      `"${(r.facebook || "N/A").replace(/"/g, '""')}"`,
      `"${(r.instagram || "N/A").replace(/"/g, '""')}"`,
      `"${(r.linkedin || "N/A").replace(/"/g, '""')}"`,
      `"${(r.twitter || "N/A").replace(/"/g, '""')}"`,
      `"${(r.youtube || "N/A").replace(/"/g, '""')}"`,
      `"${(r.tiktok || "N/A").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "qualified_leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Qualified Search Leads</h2>
          <p className="text-sm text-slate-500">{results.length} valid business records found.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-green-600/30 hover:bg-green-700 transition"
        >
          Download CSV ({results.length})
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role Priority</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Socials</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-semibold text-slate-900">{r.name}</td>
                <td className="px-4 py-4 font-medium text-blue-600">{r.email || "N/A"}</td>
                <td className="px-4 py-4">
                  <span className={`inline-block rounded-md border px-2.5 py-1 text-xs ${getBadgeColor(r.email_role)}`}>
                    {r.email_role || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-4">{r.phone || "N/A"}</td>
                <td className="px-4 py-4">
                  {hasValue(r.website) ? (
                    <a href={r.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Visit
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-4 py-4 text-slate-600 max-w-[220px]">{r.address || "N/A"}</td>
                <td className="px-4 py-4 space-x-2 text-xs font-semibold">
                  {hasValue(r.facebook) && (
                    <a href={r.facebook} target="_blank" rel="noreferrer" className="text-blue-600">FB</a>
                  )}
                  {hasValue(r.linkedin) && (
                    <a href={r.linkedin} target="_blank" rel="noreferrer" className="text-blue-700">IN</a>
                  )}
                  {hasValue(r.instagram) && (
                    <a href={r.instagram} target="_blank" rel="noreferrer" className="text-pink-600">IG</a>
                  )}
                  {hasValue(r.youtube) && (
                    <a href={r.youtube} target="_blank" rel="noreferrer" className="text-red-600">YT</a>
                  )}
                  {hasValue(r.tiktok) && (
                    <a href={r.tiktok} target="_blank" rel="noreferrer" className="text-slate-900">TT</a>
                  )}
                  {!hasValue(r.facebook) &&
                    !hasValue(r.linkedin) &&
                    !hasValue(r.instagram) &&
                    !hasValue(r.youtube) &&
                    !hasValue(r.tiktok) && (
                      <span className="text-slate-400">N/A</span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}