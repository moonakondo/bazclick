"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

interface UploadBoxProps {
  onInputsParsed: (inputs: string[]) => void;
}

export default function UploadBox({ onInputsParsed }: UploadBoxProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const extractedInputs = rows
          .flat()
          .map((cell) => String(cell || "").trim())
          .filter((val) => val.length > 3);

        const uniqueInputs = Array.from(new Set(extractedInputs));
        onInputsParsed(uniqueInputs);
      } catch (err) {
        alert("Failed to parse Excel file. Please upload a valid .xlsx or .csv file.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <span className="text-xl">↑</span>
      </div>

      <h3 className="text-sm font-bold text-slate-900">Batch Upload Spreadsheet</h3>
      <p className="mt-1 text-xs text-slate-500">
        Upload an Excel file containing keywords or Google Maps URLs in any column.
      </p>

      {fileName && (
        <div className="mt-3 inline-block rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Loaded: {fileName}
        </div>
      )}

      <div className="mt-4">
        <label className="inline-flex cursor-pointer rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
          {loading ? "Parsing file..." : "Choose XLSX / CSV"}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </label>
      </div>
    </div>
  );
}