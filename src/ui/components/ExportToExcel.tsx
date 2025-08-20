import React from "react";

// Allows callers to rename fields (header) or provide computed fields (formatter).
interface Column {
  // Label to show in the exported file header
  header: string;
  // Key to read from each row (optional if formatter provided)
  key?: string;
  // Optional formatter to compute the cell value from the row
  formatter?: (row: Record<string, any>) => any;
}

// Simple ExportToExcel button that accepts rows and a filename
interface Props {
  data: Record<string, any>[];
  filename?: string;
  // Optional list of columns. If provided, export will use these headers and order.
  columns?: Column[];
  // Optional custom button label
  buttonLabel?: string;
}

const ExportToExcel: React.FC<Props> = ({
  data,
  filename = "export",
  columns,
  buttonLabel = "تصدير إلى Excel",
}) => {
  const handleExport = async () => {
    try {
      // Try dynamic import of xlsx
      const xlsx = await import("xlsx").catch(() => null);
      // Build exportRows according to columns if provided (allows renaming and computed fields)
      const exportRows: Record<string, any>[] = (data || []).map((row) => {
        if (!columns || columns.length === 0) return { ...row };
        const out: Record<string, any> = {};
        columns.forEach((col) => {
          if (col.formatter) out[col.header] = col.formatter(row);
          else out[col.header] = row[col.key as string];
        });
        return out;
      });

      if (xlsx && (xlsx as any).utils) {
        const utils = (xlsx as any).utils;
        // If columns provided, use their headers as the sheet header order
        const headerOrder =
          columns && columns.length > 0
            ? columns.map((c) => c.header)
            : undefined;
        const ws = utils.json_to_sheet(exportRows || [], {
          header: headerOrder,
        });
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Sheet1");
        const wbout = (xlsx as any).write(wb, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }

      // Fallback to CSV
      if (!exportRows || exportRows.length === 0) {
        alert("لا توجد بيانات للتصدير");
        return;
      }
      // Determine headers and key order for CSV
      const headers =
        columns && columns.length > 0
          ? columns.map((c) => c.header)
          : Object.keys(exportRows[0]);
      const csv = [headers.join(",")]
        .concat(
          exportRows.map((r) =>
            headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
          )
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error", e);
      alert("حدث خطأ أثناء التصدير");
    }
  };

  return (
    <button
      onClick={handleExport}
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        background: "#1976d2",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}>
      {buttonLabel}
    </button>
  );
};

export default ExportToExcel;
