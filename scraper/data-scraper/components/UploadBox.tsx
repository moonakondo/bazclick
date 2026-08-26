"use client";

import { ChangeEvent, DragEvent, useState } from "react";
import * as XLSX from "xlsx";

interface UploadBoxProps {
  disabled?: boolean;
  onInputsParsed: (inputs: string[]) => void;
}

export default function UploadBox({
  disabled = false,
  onInputsParsed,
}: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  function extractInputsFromWorkbook(workbook: XLSX.WorkBook): string[] {
    const inputs: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) continue;

      const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        defval: "",
        raw: false,
      });

      for (const row of rows) {
        if (!Array.isArray(row)) continue;

        for (const cell of row) {
          if (typeof cell !== "string") continue;

          const value = cell.trim();

          if (!value) continue;

          inputs.push(value);
        }
      }
    }

    return Array.from(new Set(inputs));
  }

  async function processFile(file: File) {
    setError("");
    setFileName(file.name);

    const extension = file.name.toLowerCase().split(".").pop();

    if (!extension || !["xlsx", "xls", "csv"].includes(extension)) {
      setError("Please upload an XLSX, XLS, or CSV file.");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const inputs = extractInputsFromWorkbook(workbook);

      if (inputs.length === 0) {
        setError(
          "No keywords or URLs were found in the uploaded spreadsheet."
        );
        return;
      }

      onInputsParsed(inputs);
    } catch (err) {
      console.error("Failed to process spreadsheet:", err);

      setError(
        "Could not read the spreadsheet. Please check the file and try again."
      );
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    void processFile(file);

    // Allow the same file to be selected again later.
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (disabled) return;

    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setIsDragging(false);

    if (disabled) return;

    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    void processFile(file);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
            : isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
        }`}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14"
            />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          Batch Upload Spreadsheet
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Upload an Excel or CSV file containing keywords or URLs.
        </p>

        <p className="mt-1 text-xs text-slate-400">
          XLSX, XLS and CSV files are supported.
        </p>

        <label
          className={`mt-5 inline-flex cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
            disabled
              ? "cursor-not-allowed bg-slate-200 text-slate-400"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Choose File

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </label>

        <p className="mt-3 text-xs text-slate-400">
          Or drag and drop your file here
        </p>

        {fileName && !error && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-left">
            <p className="text-xs font-semibold text-green-700">
              File loaded
            </p>

            <p className="mt-1 truncate text-sm text-green-800">
              {fileName}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {disabled && (
          <p className="mt-4 text-xs font-medium text-slate-500">
            Please wait for the current scraping process to finish.
          </p>
        )}
      </div>
    </div>
  );
}