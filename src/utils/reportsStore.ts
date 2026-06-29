// Persistence for "Analyzed Reports" produced when articles are analyzed in
// Research Chat. Mirrors the localStorage pattern used elsewhere in the app.

const KEY = 'analyzed_reports_v1';

export interface AnalysisReport {
  id: string;
  name: string;
  articleIds: string[];
  createdAt: string;
  analysisDate: string;
  depth: 'Fast' | 'Regular' | 'Deep';
}

/** Read all saved reports (newest first). Returns [] on any error. */
export function loadReports(): AnalysisReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as AnalysisReport[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Prepend a report; de-dupes an existing report covering the exact same articles. */
export function saveReport(report: AnalysisReport): AnalysisReport[] {
  const existing = loadReports();
  const sameSet = (a: string[], b: string[]) =>
    a.length === b.length && [...a].sort().join() === [...b].sort().join();
  const deduped = existing.filter((r) => !sameSet(r.articleIds, report.articleIds));
  const next = [report, ...deduped];
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

/** Remove a report by id and persist. Returns the remaining list. */
export function deleteReport(id: string): AnalysisReport[] {
  const next = loadReports().filter((r) => r.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}
