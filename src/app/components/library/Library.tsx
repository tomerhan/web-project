import { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, Upload, FileText, Calendar, Users, TrendingUp,
  LayoutGrid, List, BookOpen, Star, ChevronDown, ChevronUp, Check, Sparkles, Trash2, Loader2
} from 'lucide-react';
import { Article } from '../../data/mockData';
import { getPapers, uploadPaper, deletePaper, getSuggestionsForPapers, PaperSuggestion } from '../../services/paperService';
import { toast } from 'sonner';
import ArticleIcon from '../ui/ArticleIcon';

type ViewMode = 'grid' | 'list';

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedForCompare] = useState<Set<string>>(new Set());
  const [, setShowCompareModal] = useState(false);
  const [suggestions, setSuggestions] = useState<PaperSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // Which papers the suggestion search is based on (user-chosen).
  const [suggestSelection, setSuggestSelection] = useState<Set<string>>(new Set());
  const defaultSelectedRef = useRef(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getPapers();
        setArticles(data);
      } catch (error) {
        console.error('Failed to load papers:', error);
        toast.error('Failed to load papers from server');
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Pre-select the most-cited paper as a sensible default once articles load.
  // The user can change the selection and trigger the search with the button.
  useEffect(() => {
    if (articles.length === 0 || defaultSelectedRef.current) return;
    defaultSelectedRef.current = true;
    const seed = [...articles].sort((a, b) => b.citations - a.citations)[0];
    if (seed) setSuggestSelection(new Set([seed.id]));
  }, [articles]);

  const toggleSuggestSelection = (id: string) => {
    setSuggestSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Run the suggestion search for the chosen papers (merged keywords on the server).
  const runSuggestions = async () => {
    const ids = Array.from(suggestSelection);
    if (ids.length === 0) { toast.error('Select at least one paper'); return; }
    setSuggestionsLoading(true);
    setHasSearched(true);
    try {
      const data = await getSuggestionsForPapers(ids, 8);
      setSuggestions(data);
      if (data.length === 0) toast.info('No related papers found for this selection');
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      toast.error('Failed to fetch suggested papers');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const allTopics = ['all', ...new Set(articles.flatMap((a) => a.topics))];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopic === 'all' || article.topics.includes(selectedTopic);
    return matchesSearch && matchesTopic;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 80);

    try {
      const newArticle = await uploadPaper(files[0]);

      clearInterval(interval);
      setUploadProgress(100);
      setArticles((p) => [newArticle, ...p]);

      // notify other parts of the app (ChatInterface) about the new upload
      try { window.dispatchEvent(new CustomEvent('uploaded-article', { detail: newArticle })); } catch { }
      toast.success(`"${files[0].name}" uploaded successfully`);
    } catch (err) {
      clearInterval(interval);
      console.error('Failed to upload paper:', err);
      toast.error('Failed to upload paper to server');
    } finally {
      setTimeout(() => setUploadProgress(null), 500);
    }
  };

  const bestMatchId = [...articles].sort((a, b) => b.citations - a.citations)[0]?.id;

  const handleDeleteArticle = async (id: string) => {
    try {
      await deletePaper(id);
      setArticles((prev) => prev.filter(a => a.id !== id));
      toast.success('Article deleted');
    } catch (err) {
      console.error('Failed to delete paper:', err);
      toast.error('Failed to delete paper');
    }
  };

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
              <p className="text-sm font-bold text-foreground">Uploading PDFâ€¦</p>
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
              <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-red-600">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-xl">All Articles</h1>
                <p className="text-sm text-muted-foreground">{articles.length} articles Â· {filteredArticles.length} shown</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Compare button */}
              {selectedForCompare.size > 0 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
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
                placeholder="Search by title or authorâ€¦"
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

        {/* Similar-article suggestions moved to end of page */}

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <h3 className="font-bold text-foreground mb-1">Loading articles...</h3>
            <p className="text-sm text-muted-foreground">Connecting to the database.</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-1">No articles found</h3>
            <p className="text-sm text-muted-foreground">Try a different search term or upload new papers.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredArticles.map((article) => {
              const isBest = article.id === bestMatchId;
              const isExpanded = expandedId === article.id;
              const isSelected = suggestSelection.has(article.id);
              return (
                <div
                  key={article.id}
                  className={`bg-card rounded-2xl border-2 shadow-sm hover:shadow-md transition-all group ${isSelected ? 'border-red-500' : isBest ? 'border-amber-300' : 'border-border hover:border-border'
                    }`}
                >
                  <div className="p-5">
                    {/* Badge */}
                    {isBest && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star className="w-3.5 h-3.5 text-red-600 fill-amber-500" />
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
                          {article.authors[0]} et al. Â· {article.year}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSuggestSelection(article.id); }}
                        title={isSelected ? 'Selected for suggestions' : 'Select for suggestions'}
                        className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-red-400'}`}
                      >
                        {isSelected && <Check className="w-4 h-4" strokeWidth={3} />}
                      </button>
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
                      <span>Auto-Summary</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isExpanded && (
                      <div className="space-y-3 mt-2 border-t border-border pt-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {(() => {
                            const a = article.abstract?.trim();
                            if (a && a.length > 0) {
                              return a.split('.').slice(0, 2).join('. ') + (a.split('.').length > 2 ? 'â€¦' : '');
                            }
                            return article.keyFindings?.slice(0, 2).join('; ') || 'No summary available.';
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Delete button for each article */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.id); }}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

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
              const isSelected = suggestSelection.has(article.id);
              return (
                <div
                  key={article.id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group ${idx < filteredArticles.length - 1 ? 'border-b border-border' : ''
                    } ${isSelected ? 'bg-red-50 dark:bg-red-950/20' : isBest ? 'bg-amber-50/50' : ''}`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSuggestSelection(article.id); }}
                    title={isSelected ? 'Selected for suggestions' : 'Select for suggestions'}
                    className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-red-400'}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </button>
                  <ArticleIcon size="md" title="Article">
                    <FileText className="w-5 h-5 text-current" />
                  </ArticleIcon>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.id); }} className="p-2 text-muted-foreground hover:text-red-600 rounded-md" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-foreground text-sm truncate">{article.title}</h3>
                      {isBest && (
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-3 h-3 text-red-600 fill-amber-500" />
                          <span className="text-[10px] font-bold text-amber-600">Top</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>{article.authors[0]} et al.</span>
                      <span>Â·</span>
                      <span>{article.year}</span>
                      <span>Â·</span>
                      <span>{article.citations} citations</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Suggested popular papers — pick which of your papers to base the
            search on, then fetch the most-cited related papers (by keywords). */}
        {articles.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-foreground text-lg mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              Find Suggested Papers
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Tick the papers above to base the search on, then search for the most-cited related work.
            </p>

            {/* Search button */}
            <button
              onClick={runSuggestions}
              disabled={suggestSelection.size === 0 || suggestionsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors mb-4"
            >
              {suggestionsLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</>
                : <><Search className="w-4 h-4" /> Find Suggestions ({suggestSelection.size})</>
              }
            </button>

            {/* Results */}
            {suggestionsLoading ? null : suggestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestions.map((s) => (
                  <a
                    key={s.externalId}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border hover:border-red-300 hover:shadow-sm transition-all"
                  >
                    <ArticleIcon size="sm" title={s.title}>
                      <FileText className="w-4 h-4 text-current" />
                    </ArticleIcon>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-2">{s.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {s.authors[0] || 'Unknown'}{s.year ? ` · ${s.year}` : ''}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 mt-1">
                        <TrendingUp className="w-3 h-3" /> {s.citations.toLocaleString()} citations
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : hasSearched ? (
              <p className="text-sm text-muted-foreground py-2">No related papers found for this selection.</p>
            ) : null}
          </div>
        )}
      </div>

    </div>
  );
}
