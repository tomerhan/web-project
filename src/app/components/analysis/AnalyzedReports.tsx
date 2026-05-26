import { useState } from 'react';
import {
  BarChart, FileText, Calendar, GitCompare, Trash2, Search,
  ChevronDown, ChevronUp, Eye, Download
} from 'lucide-react';
import { mockArticles, Article } from '../../data/mockData';
import { CHAT_LABEL } from '../../config/nav';
import { loadUploadedArticles } from '../../../utils/articleStore';
import { toast } from 'sonner';
import AnalysisResultsModal from './AnalysisResultsModal';
import ComparisonModal from './ComparisonModal';
import ArticleIcon from '../ui/ArticleIcon';
import SinglePDFViewer from '../library/SinglePDFViewer';

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
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareArticles, setCompareArticles] = useState<Article[]>([]);
  const [singlePDFView, setSinglePDFView] = useState<Article | null>(null);
  
  // Reports - keep mock seed but allow syncing with uploaded articles
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
    toast.success(`Exporting "${report.name}" as PDFâ€¦`);
  };

  const handleViewAnalysis = (report: AnalysisReport) => {
    setSelectedReport(report);
  };

  const getArticlesForReport = (articleIds: string[]) => {
    try {
      const stored = loadUploadedArticles();
      const all = [...stored, ...mockArticles.filter(m => !stored.find(s => s.id === m.id))];
      return articleIds.map(id => all.find(a => a.id === id)).filter(Boolean) as Article[];
    } catch (e) {
      return articleIds.map(id => mockArticles.find(a => a.id === id)).filter(Boolean) as Article[];
    }
  };

  // All available articles (stored uploads merged with mocks)
  const allArticles = (() => {
    try {
      const stored = loadUploadedArticles();
      return [...stored, ...mockArticles.filter(m => !stored.find(s => s.id === m.id))];
    } catch (e) {
      return mockArticles;
    }
  })();

  // Analyzed article ids are those referenced by any report
  const analyzedArticleIds = Array.from(new Set(reports.flatMap(r => r.articleIds)));
  const analyzedArticles = allArticles.filter(a => analyzedArticleIds.includes(a.id));

  // Comparison reports are reports with 2+ articles
  const comparisonReports = reports.filter(r => r.articleIds.length >= 2 && r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden bg-muted">
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
                <p className="text-sm text-muted-foreground">{reports.length} reports Â· {filteredReports.length} shown</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reportsâ€¦"
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
                      <p className="text-xs text-muted-foreground">{article.authors[0]} et al. Â· {article.year}</p>
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
                        <p className="text-xs text-muted-foreground mt-1">{report.articleIds.length} articles Â· {report.analysisDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setCompareArticles(getArticlesForReport(report.articleIds)); setShowCompareModal(true); }} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">Open Comparison</button>
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
