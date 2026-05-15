import { useState } from 'react';
import {
  BarChart, FileText, Calendar, Download, Trash2, Search,
  ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { mockArticles, Article } from '../data/mockData';
import { toast } from 'sonner';
import AnalysisResultsModal from './AnalysisResultsModal';

interface AnalysisReport {
  id: string;
  name: string;
  articleIds: string[];
  createdAt: string;
  analysisDate: string;
  depth: 'Fast' | 'Regular' | 'Deep';
}

export default function AnalyzedReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  
  // Mock analysis reports
  const [reports, setReports] = useState<AnalysisReport[]>([
    {
      id: 'r1',
      name: 'AI & NLP Research Analysis',
      articleIds: [mockArticles[0].id, mockArticles[1].id, mockArticles[3].id],
      createdAt: '2024-01-15',
      analysisDate: '2024-01-15',
      depth: 'Deep'
    },
    {
      id: 'r2',
      name: 'Climate & Energy Comparison',
      articleIds: [mockArticles[2].id, mockArticles[4].id],
      createdAt: '2024-01-10',
      analysisDate: '2024-01-10',
      depth: 'Regular'
    },
    {
      id: 'r3',
      name: 'Transformer Architecture Review',
      articleIds: [mockArticles[0].id],
      createdAt: '2024-01-05',
      analysisDate: '2024-01-05',
      depth: 'Fast'
    }
  ]);

  const filteredReports = reports.filter((report) =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success('Report deleted successfully');
    }
  };

  const handleExport = (report: AnalysisReport) => {
    toast.success(`Exporting "${report.name}" as PDF…`);
  };

  const handleViewAnalysis = (report: AnalysisReport) => {
    setSelectedReport(report);
  };

  const getArticlesForReport = (articleIds: string[]) => {
    return articleIds.map(id => mockArticles.find(a => a.id === id)).filter(Boolean) as Article[];
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-5 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-200">
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
        {filteredReports.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <BarChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-1">No reports found</h3>
            <p className="text-sm text-muted-foreground">Try a different search term or create a new analysis.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const isExpanded = expandedId === report.id;
              const articles = getArticlesForReport(report.articleIds);
              
              return (
                <div
                  key={report.id}
                  className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground leading-tight mb-1">
                          {report.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {report.analysisDate}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {articles.length} articles</span>
                          <span>·</span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-300 dark:border-slate-600 rounded-full text-[10px] font-bold uppercase">
                            {report.depth}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => handleExport(report)}
                          className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Export report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id, report.name)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expand/Collapse */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-2"
                    >
                      <span>View Details</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="space-y-3 mt-3 border-t border-border pt-4">
                        <div>
                          <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">Analyzed Articles</p>
                          <div className="space-y-2">
                            {articles.map((article) => (
                              <div
                                key={article.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border"
                              >
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-4 h-4 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{article.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{article.authors[0]} et al. · {article.year}</p>
                                </div>
                                <span className="p-1.5 text-muted-foreground" aria-hidden="true">
                                  <Eye className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 mt-3 border-t border-border">
                      <button
                        onClick={() => handleViewAnalysis(report)}
                        className="w-full px-3 py-2.5 text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg transition-colors mt-auto shrink-0 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Analysis
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedReport && (
        <AnalysisResultsModal
          articles={getArticlesForReport(selectedReport.articleIds)}
          depth={selectedReport.depth}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
