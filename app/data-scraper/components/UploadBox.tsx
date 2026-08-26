'use client';

import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

interface UploadBoxProps {
  onInputsParsed?: (inputs: string[]) => void;
  disabled?: boolean;
}

export default function UploadBox({ onInputsParsed, disabled = false }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      const allValues: string[] = [];

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

        for (const row of rows) {
          for (const cell of row) {
            const value = String(cell ?? '').trim();
            if (value) allValues.push(value);
          }
        }
      }

      const unique = Array.from(new Set(allValues));
      setCount(unique.length);

      if (unique.length === 0) {
        setError('No usable values found in that file.');
        return;
      }

      onInputsParsed?.(unique);
    } catch (err) {
      console.error('UploadBox parse error:', err);
      setError('Could not read that file — make sure it\'s a valid .xlsx or .csv.');
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        ↑
      </div>

      <p className="font-medium text-gray-900">Batch Upload Spreadsheet</p>
      <p className="mt-1 text-sm text-gray-500">
        Upload an Excel file containing keywords or Google Maps URLs in any column.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Choose XLSX / CSV
      </button>

      {fileName && !error && (
        <p className="mt-3 text-xs text-gray-500">
          {fileName} — {count} value{count === 1 ? '' : 's'} loaded
        </p>
      )}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}