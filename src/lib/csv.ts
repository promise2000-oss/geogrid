import { downloadBlob } from "@/lib/utils";

/** Client-side CSV export shared by every module that offers one. */
export function exportCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  downloadBlob(lines.join("\n"), filename, "text/csv;charset=utf-8");
}