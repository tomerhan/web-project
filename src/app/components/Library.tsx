import { useState } from 'react';
import {
  Search, Filter, Upload, FileText, Calendar, Users, TrendingUp,
  LayoutGrid, List, BookOpen, Star, ChevronDown, ChevronUp, X, Check, Sparkles
} from 'lucide-react';
import { mockArticles, Article } from '../data/mockData';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';

export default function Library() {
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [articles, setArticles]           = useState<Article[]>(mockArticles);
  const [viewMode, setViewMode]           = useState<ViewMode>('grid');
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [showCompareModal, setShowCompareModal] = useState(false);

  const allTopics = ['all', ...new Set(articles.flatMap((a) => a.topics))];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopic === 'all' || article.topics.includes(selectedTopic);
    return matchesSearch && matchesTopic;
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          const newArticle: Article = {
            ...mockArticles[0],
            id: `upload-${Date.now()}`,
            title: files[0].name.replace('.pdf', ''),
            uploadDate: new Date().toISOString().split('T')[0],
          };
          setArticles((p) => [newArticle, ...p]);
          toast.success(`"${files[0].name}" uploaded successfully`);
          setTimeout(() => setUploadProgress(null), 500);
          return 100;
        }
        return prev + 8;
      });
    }, 120);
  };

  const bestMatchId = [...articles].sort((a, b) => b.citations - a.citations)[0]?.id;

  // Similar-article suggestions: pick top-cited from each top topic in the library
  const topTopics = (() => {
    const counts: Record<string, number> = {};
    articles.forEach((a) => a.topics.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
  })();
  const suggestions = topTopics
    .map((topic) => {
      const pool = articles.filter((a) => a.topics.includes(topic));
      return pool.sort((a, b) => b.citations - a.citations)[0];
    })
    .filter(Boolean)
    .filter((a, idx, arr) => arr.findIndex((x) => x.id === a.id) === idx)
    .slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      
      {/* Upload progress bar */}
      {uploadProgress !== null && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-xl p-4 w-72">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Uploading PDF…</p>
              <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-100"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-5 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-200">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-xl">My Research Library</h1>
                <p className="text-sm text-muted-foreground">{articles.length} articles · {filteredArticles.length} shown</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Compare button */}
              {selectedForCompare.size > 0 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Compare ({selectedForCompare.size})
                </button>
              )}
              {/* View mode toggle */}
              <div className="hidden sm:flex bg-muted border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 border-slate-400 bg-slate-100 dark:bg-slate-800 text-foreground dark:border-slate-500 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Upload PDF
                <input type="file" accept=".pdf" multiple onChange={handleUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title or author…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent bg-muted focus:bg-card transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-input rounded-xl text-sm focus:ring-2 focus:ring-red-500 bg-muted focus:bg-card appearance-none min-w-[160px]"
              >
                {allTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic === 'all' ? 'All Topics' : topic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Similar-article suggestions */}
        {suggestions.length > 0 && (
          <section className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
              <div className="p-2.5 bg-muted border border-border rounded-xl shadow-sm">
                <Sparkles className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Suggested Similar Articles</h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Picks based on the topics already in your library
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((a) => (
                <div
                  key={a.id}
                  className="bg-muted/40 border border-border rounded-xl p-4 hover:bg-muted/70 hover:border-red-300 transition-colors cursor-pointer"
                  onClick={() => toast.success(`Opened "${a.title}"`)}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm font-bold text-foreground line-clamp-2">{a.title}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium mb-2 truncate">
                    {a.authors[0]}{a.authors.length > 1 ? ' et al.' : ''} • {a.year}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {a.topics.slice(0, 2).map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-card border border-border text-foreground rounded-full text-[10px] font-medium">{t}</span>
                    ))}
                    <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {a.citations}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {filteredArticles.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-1">No articles found</h3>
            <p className="text-sm text-muted-foreground">Try a different search term or upload new papers.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredArticles.map((article) => {
              const isBest      = article.id === bestMatchId;
              const isExpanded  = expandedId === article.id;
              return (
                <div
                  key={article.id}
                  className={`bg-card rounded-2xl border-2 shadow-sm hover:shadow-md transition-all group ${
                    isBest ? 'border-amber-300' : 'border-border hover:border-border'
                  }`}
                >
                  <div className="p-5">
                    {/* Badge */}
                    {isBest && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          Most Cited
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground leading-tight mb-1 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {article.authors[0]} et al. · {article.year}
                        </p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {article.authors.length} authors</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.year}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {article.citations} citations</span>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.topics.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-300 dark:border-slate-600 rounded-full text-[11px] font-medium">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Abstract accordion */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : article.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-2"
                    >
                      <span>Abstract & Key Findings</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isExpanded && (
                      <div className="space-y-3 mt-2 border-t border-border pt-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">{article.abstract}</p>
                        <div>
                          <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-1.5">Key Findings</p>
                          <ul className="space-y-1">
                            {article.keyFindings.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground leading-relaxed">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground">
                          <span className="font-bold text-muted-foreground">Methodology: </span>{article.methodology}
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {filteredArticles.map((article, idx) => {
              const isBest = article.id === bestMatchId;
              return (
                <div
                  key={article.id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group ${
                    idx < filteredArticles.length - 1 ? 'border-b border-border' : ''
                  } ${isBest ? 'bg-amber-50/50' : ''}`}
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-foreground text-sm truncate">{article.title}</h3>
                      {isBest && (
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-bold text-amber-600">Top</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>{article.authors[0]} et al.</span>
                      <span>·</span>
                      <span>{article.year}</span>
                      <span>·</span>
                      <span>{article.citations} citations</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
