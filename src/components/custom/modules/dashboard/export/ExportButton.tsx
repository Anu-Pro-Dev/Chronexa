"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { DashboardExcelExporter, ExportColumn, ExportMeta } from "./DashboardExcelExporter";

interface ExportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  columns: ExportColumn[];
  meta: ExportMeta;
  filename?: string;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({
  data,
  columns,
  meta,
  filename,
  disabled,
  className = "",
}: ExportButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await DashboardExcelExporter.export(data, columns, meta, filename);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || loading || data.length === 0}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-text-secondary hover:text-primary hover:bg-backdrop transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      title="Export to Excel"
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <Download className="h-4 w-4" />
      )}
    </button>
  );
}
