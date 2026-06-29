import { useState, useEffect } from 'react';
import {
  BarChart, FileText, Calendar, GitCompare, Trash2, Search,
  ChevronDown, ChevronUp, Eye, Download
} from 'lucide-react';
import { mockArticles, Article } from '../../data/mockData';
import { CHAT_LABEL } from '../../config/nav';
import { loadUploadedArticles } from '../../../utils/articleStore';
import { loadReports, deleteReport, AnalysisReport } from '../../../utils/reportsStore';
import { getPapers } from '../../services/paperService';
import { toast } from 'sonner';
import AnalysisResultsModal from './AnalysisResultsModal';
import ComparisonModal from './ComparisonModal';
import ArticleIcon from '../ui/ArticleIcon';
import SinglePDFViewer from '../library/SinglePDFViewer';

/*
 * AnalyzedReports
 * -------------------------------------------------------------------------
 * The "Analyzed Reports" page. Lists previously-run analyses (seeded with
 * mock reports). Two columns:
 *   - Left  : articles referenced by any report (open each in the PDF viewer).
 *   - Right : comparison reports (2+ articles) -> open ComparisonModal.
 * Clicking a report opens AnalysisResultsModal. Articles are resolved by
 * merging localStorage uploads with the mock article seed.
 */

export default function AnalyzedReports() {
  // UI state: search box, which report row is expanded, and which modal is open.
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareArticles, setCompareArticles] = useState<Article[]>([]);
  const [singlePDFView, setSinglePDFView] = useState<Article | null>(null);
  
  // Reports persisted from Research Chat analyses (localStorage). Reload on focus
  // so a report created in another tab/route shows up here.
  const [reports, setReports] = useState<AnalysisReport[]>(() => loadReports());
  useEffect(() => {
    const refresh = () => setReports(loadReports());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // Real papers from the backend, so reports referencing DB article ids resolve.
  const [dbArticles, setDbArticles] = useState<Article[]>([]);
  useEffect(() => {
    getPapers()
      .then(setDbArticles)
      .catch((e) => console.error('Failed to load papers for reports:', e));
  }, []);

  // Reports matching the current search text (case-insensitive name match).
  const filteredReports = reports.filter((report) =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete with a confirm prompt, then drop it from state + toast.
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      setReports(deleteReport(id));
      toast.success('Report deleted successfully');
    }
  };

  const handleExport = (report: AnalysisReport) => {
    toast.success(`Exporting "${report.name}" as PDF…`);
  };

  const handleViewAnalysis = (report: AnalysisReport) => {
    setSelectedReport(report);
  };

  // Resolve a report's article ids into full Article objects. Looks first in
  // uploaded (localStorage) articles, then the mock seed; falls back to mocks
  // only if reading storage throws. filter(Boolean) drops any unknown ids.
  const getArticlesForReport = (articleIds: string[]) => {
    return articleIds.map(id => allArticles.find(a => a.id === id)).filter(Boolean) as Article[];
  };

  // All available articles: backend papers first, then localStorage uploads,
  // then mock seed — de-duped by id so report ids resolve to real articles.
  const allArticles = (() => {
    let stored: Article[] = [];
    try { stored = loadUploadedArticles(); } catch { stored = []; }
    const merged: Article[] = [...dbArticles];
    for (const a of [...stored, ...mockArticles]) {
      if (!merged.find(m => m.id === a.id)) merged.push(a);
    }
    return merged;
  })();

  // Unique set of article ids touched by any report -> the left-column list.
  const analyzedArticleIds = Array.from(new Set(reports.flatMap(r => r.articleIds)));
  const analyzedArticles = allArticles.filter(a => analyzedArticleIds.includes(a.id));

  // Right column: only reports with 2+ articles count as comparisons, and they
  // still respect the search filter.
  const comparisonReports = reports.filter(r => r.articleIds.length >= 2 && r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render: header + search -> two-column grid (articles | comparisons) ->
  // the three modals (PDF viewer, results, comparison) mounted conditionally.
  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden bg-muted">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-5 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-red-600">
                <BarChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-xl">Analyzed Reports</h1>
                <p className="text-sm text-muted-foreground">{reports.length} reports · {filteredReports.length} shown</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reports…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent bg-muted focus:bg-card transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Research Chat */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">{CHAT_LABEL}</h3>
            <div className="space-y-3">
              {analyzedArticles.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">No articles in Research Chat yet.</p>
                </div>
              ) : (
                analyzedArticles.map((article) => (
                  <div key={article.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                    <ArticleIcon size="md" title="Article">
                      <FileText className="w-5 h-5 text-current" />
                    </ArticleIcon>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground">{article.authors[0]} et al. · {article.year}</p>
                    </div>
                    <button onClick={() => setSinglePDFView(article)} className="p-2 text-muted-foreground hover:text-foreground rounded-md" title="Open PDF">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Comparison Reports */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Comparisons</h3>
            <div className="space-y-3">
              {comparisonReports.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">No comparisons available.</p>
                </div>
              ) : (
                comparisonReports.map((report) => (
                  <div key={report.id} className="bg-card rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{report.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{report.articleIds.length} articles · {report.analysisDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setCompareArticles(getArticlesForReport(report.articleIds)); setShowCompareModal(true); }} className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold">Open Comparison</button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {getArticlesForReport(report.articleIds).map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border">
                                <ArticleIcon size="sm" title="Article">
                                  <FileText className="w-4 h-4 text-current" />
                                </ArticleIcon>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                          </div>
                          <button onClick={() => setSinglePDFView(a)} className="p-2 text-muted-foreground hover:text-foreground rounded-md" title="Open PDF">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {singlePDFView && (
        <SinglePDFViewer article={singlePDFView} onClose={() => setSinglePDFView(null)} />
      )}

      {selectedReport && (
        <AnalysisResultsModal
          articles={getArticlesForReport(selectedReport.articleIds)}
          depth={selectedReport.depth}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {showCompareModal && (
        <ComparisonModal
          articles={compareArticles}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
}
