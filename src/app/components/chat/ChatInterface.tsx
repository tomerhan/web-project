// Import React hooks for state management and optimization
import { useState, useRef, useMemo, useEffect } from 'react';
// Import icons from lucide-react for UI elements
import {
  Upload, FileText,
  ChevronLeft, ChevronRight,
  Check, Download, BookmarkPlus, ExternalLink,
  AlignLeft
} from 'lucide-react';
// Import mock data and types for articles and chat messages
import { mockChatHistory, ChatMessage, Article } from '../../data/mockData';
import { getPapers, uploadPaper } from '../../services/paperService';
// Import authentication context to check user role
import { useAuth } from '../../context/AuthContext';
import { getMyProgress, getStudentProgress, toScoreMap } from '../../services/progressService';
import { saveReport } from '../../../utils/reportsStore';
// Import routing hooks for navigation
import { useNavigate, useParams } from 'react-router';
// Import component components for displaying PDFs and analysis
import SinglePDFViewer from '../library/SinglePDFViewer';
import AnalysisStagesDialog from '../analysis/AnalysisStagesDialog';
import ComparisonModal from '../analysis/ComparisonModal';
import AnalysisResultsModal from '../analysis/AnalysisResultsModal';
import GuidingQuestionsBlock from './GuidingQuestionsBlock';
import StudentPerformancePanel from '../dashboard/StudentPerformancePanel';
// Import toast notification library
import { toast } from 'sonner';
import { getShortSummary, extractTextFromPDF } from '../../../utils/textUtils';
import ArticleIcon from '../ui/ArticleIcon';
import { CHAT_LABEL } from '../../config/nav';

// Interface defining the structure of an article group for organizing research papers
interface ArticleGroup {
  id: string;
  name: string;
  articleIds: string[];
  createdAt: string;
  hasAnalysis?: boolean;
  analysisDate?: string;
}

// Interface defining the structure of a saved analysis result
interface SavedAnalysis {
  id: string;
  name: string;
  articleIds: string[];
  analysisType: 'analyze' | 'compare';
  prompt: string;
  result: string;
  createdAt: string;
}

export default function ChatInterface() {
  // Get current user and navigation functions from contexts
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: studentId } = useParams();
  // Check if the current view is lecturer view
  const isLecturerView = user?.role === 'lecturer';

  // State for chat messages and user input
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [, setIsTyping] = useState(false);

  // State for uploaded files and upload progress
  const [uploadedFiles, setUploadedFiles] = useState<Article[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // State for UI modals and menus
  const [showStatsMenu, setShowStatsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [analysisType, setAnalysisType] = useState<'analyze' | 'compare' | null>(null);
  // Track which article IDs have completed analysis.
  const [analyzedArticles, setAnalyzedArticles] = useState<Set<string>>(new Set());
  // Articles that have been part of a Compare action
  const [comparedArticles, setComparedArticles] = useState<Set<string>>(new Set());
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // State for article library search and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // State for analysis display
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [singlePDFView, setSinglePDFView] = useState<Article | null>(null);
  const [activeExplainIdx, setActiveExplainIdx] = useState<number | null>(null);
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);

  // State for saving analysis with custom name
  const [showSaveName, setShowSaveName] = useState(false);
  const [saveName, setSaveName] = useState('');

  // State for selected articles and analysis depth
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set()
  );
  const [analysisDepth, setAnalysisDepth] = useState<1 | 2 | 3>(2);

  // State for article groups (organization feature)
  const [articleGroups, setArticleGroups] = useState<ArticleGroup[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState('');
  const [activeGroupId, setActiveGroupId] = useState('');

  // Fetch papers from the server on mount and build groups & saved analyses
  useEffect(() => {
    const loadPapers = async () => {
      try {
        const data = await getPapers();
        setUploadedFiles(data);
        setAnalyzedArticles(new Set(data.map(p => p.id)));

        if (data.length >= 5) {
          setArticleGroups([
            { id: 'g1', name: 'AI & NLP Research', articleIds: [data[0].id, data[1].id, data[3].id], createdAt: new Date().toISOString(), hasAnalysis: true, analysisDate: '2024-01-15' },
            { id: 'g2', name: 'Climate & Energy', articleIds: [data[2].id, data[4].id], createdAt: new Date().toISOString(), hasAnalysis: false },
          ]);
          setCurrentGroupId('g1');
          setActiveGroupId('g1');

          setSavedAnalyses([
            {
              id: 'sa-1',
              name: 'Transformer Architecture Evaluation',
              articleIds: [data[0].id],
              analysisType: 'analyze',
              prompt: 'Analyze core methodology and metrics',
              result: 'Mock result content here...',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'sa-2',
              name: 'Quantum Cryptography Summary',
              articleIds: [data[1].id],
              analysisType: 'analyze',
              prompt: 'Summarize post-quantum security challenges',
              result: 'Mock result content here...',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'sc-1',
              name: 'NLP Survey vs Quantum Models',
              articleIds: [data[0].id, data[1].id],
              analysisType: 'compare',
              prompt: 'Compare cross-domain data limitations',
              result: 'Mock comparison content here...',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'sc-2',
              name: 'Smart Grid Optimization Frameworks',
              articleIds: [data[2].id, data[3].id],
              analysisType: 'compare',
              prompt: 'Compare performance efficiency parameters',
              result: 'Mock comparison content here...',
              createdAt: new Date().toISOString(),
            }
          ]);

          if (user?.role === 'lecturer') {
            setComparedArticles(new Set([data[0].id, data[1].id]));
          }
        } else if (data.length > 0) {
          // If less than 5 papers but has some, create a default group with whatever we have
          const ids = data.map(p => p.id);
          setArticleGroups([
            { id: 'g1', name: 'My Research', articleIds: ids, createdAt: new Date().toISOString(), hasAnalysis: true, analysisDate: new Date().toISOString().split('T')[0] }
          ]);
          setCurrentGroupId('g1');
          setActiveGroupId('g1');
        }
      } catch (error) {
        console.error('Failed to load papers in ChatInterface:', error);
        toast.error('Failed to load papers');
      }
    };
    loadPapers();
  }, [user?.role]);

  // State for creating new groups
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupArticleSelection, setGroupArticleSelection] = useState<Set<string>>(new Set());

  // Reference to chat container for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Listen for uploads from other components (Library) and add them to uploadedFiles and analyzed set
  useEffect(() => {
    const handler = (e: any) => {
      const a: Article | undefined = e?.detail;
      if (!a) return;
      setUploadedFiles((prev) => [a, ...prev.filter(x => x.id !== a.id)]);
      setAnalyzedArticles((prev) => new Set([...prev, a.id]));
    };
    window.addEventListener('uploaded-article', handler as EventListener);
    return () => window.removeEventListener('uploaded-article', handler as EventListener);
  }, []);

  // Helper function to convert analysis depth number to human-readable label
  const getDepthLabel = (v: number) => (v === 1 ? 'Fast' : v === 2 ? 'Regular' : 'Deep');

  // use getShortSummary from utils

  // (carousel removed) — navigation now via two fixed columns (Comparisons | Analyzed)

  // Restore carousel helpers: arrow class and scroll function
  const arrowBtnClass = 'p-2 rounded-full bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300 hover:shadow-md hover:scale-110 transition-all';
  const scrollRow = (direction: 'left' | 'right') => {
    const container = document.getElementById('articles-carousel');
    if (container) {
      // Scroll by one full viewport width so the carousel advances by two cards
      const scrollAmount = Math.floor(container.clientWidth);
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Function to create a new article group with selected articles
  const createNewGroup = () => {
    if (!newGroupName.trim()) return;
    const ng: ArticleGroup = {
      id: `g${Date.now()}`,
      name: newGroupName.trim(),
      articleIds: Array.from(groupArticleSelection.size > 0 ? groupArticleSelection : selectedArticles),
      createdAt: new Date().toISOString(),
    };
    setArticleGroups((p) => [...p, ng]);
    setCurrentGroupId(ng.id);
    setActiveGroupId(ng.id);
    setNewGroupName('');
    setGroupArticleSelection(new Set());
    setIsCreatingGroup(false);
  };

  // Function to delete an article group (prevents deleting the last group)
  const deleteGroup = (gid: string) => {
    if (articleGroups.length <= 1) { alert('Cannot delete the last group.'); return; }
    setArticleGroups((p) => p.filter((g) => g.id !== gid));
    if (currentGroupId === gid) setCurrentGroupId(articleGroups.find((g) => g.id !== gid)!.id);
  };

  // Function to toggle article selection in the current context
  const toggleArticleSelection = (id: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedArticles(newSelected);
  };

  // Memoized function to filter and sort articles based on search query and sort preference
  const displayedArticles = useMemo(() => {
    let result = [...uploadedFiles];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.authors.some(author => author.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      if (sortBy === 'oldest') return yearA - yearB;
      return yearB - yearA;
    });
    return result;
  }, [uploadedFiles, searchQuery, sortBy]);

  // Function to handle sending messages in the chat
  const handleSendMessage = (textOrEvent?: string | React.MouseEvent | React.KeyboardEvent) => {
    const text = typeof textOrEvent === 'string' ? textOrEvent : inputMessage;
    if (!text.trim()) return;
    const hasAnalyzedSelected = Array.from(selectedArticles).some((id) => analyzedArticles.has(id));
    if (!hasAnalyzedSelected) {
      toast.error('Analyze at least one selected PDF before chatting');
      return;
    }

    const newMsg: ChatMessage = {
      id: `c${Date.now()}`,
      articleId: Array.from(selectedArticles)[0] || '1',
      question: text,
      answer: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((p) => [...p, newMsg]);
    if (text === inputMessage) setInputMessage('');
    setIsTyping(true);

    // Scroll to bottom after adding message
    setTimeout(() => { chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' }); }, 100);

    // Simulate AI response after 2 seconds
    setTimeout(() => {
      let aiText = '';
      if (text.includes('analysis') || text.includes('analyze')) {
        aiText = `Here is a **${getDepthLabel(analysisDepth).toLowerCase()}** analysis of the selected document:\n\n**Methodology:**\nThe authors conducted a comprehensive literature review and comparative analysis, focusing on transformer architectures and pre-trained language models.\n\n**Key Results & Statistics:**\n- Transformer models outperform traditional RNNs by 23 % on average.\n- Attention mechanisms enable better context understanding.\n\n**Conclusions:**\nPre-training on large corpora significantly improves downstream task performance.`;
      } else {
        aiText = 'Based on my analysis as an advanced academic research assistant, the selected papers show significant consensus on the core methodology but diverge on implementation specifics. Both acknowledge limitations in data availability.';
      }

      const aiResponse: ChatMessage = { ...newMsg, answer: aiText, sources: ['Literature Review', 'Methodology Section'] };
      setMessages((p) => p.map((m) => (m.id === newMsg.id ? aiResponse : m)));
      setIsTyping(false);
      setTimeout(() => { chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' }); }, 100);
    }, 2000);
  };

  // Function to handle file upload with progress simulation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null) return null;
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 15;
      });
    }, 80);

    try {
      const na = await uploadPaper(files[0]);

      clearInterval(interval);
      setUploadProgress(100);

      setUploadedFiles((prev) => [na, ...prev]);
      setAnalyzedArticles((prev) => new Set([...prev, na.id]));
      setSelectedArticles((prev) => new Set([...prev, na.id]));
      toast.success(`"${files[0].name}" added to library with extracted text`);
    } catch (err) {
      clearInterval(interval);
      console.error('Failed to upload paper:', err);
      toast.error('Failed to upload paper to server');
    } finally {
      setTimeout(() => setUploadProgress(null), 600);
    }
  };

  // Function to handle exporting the chat as PDF
  const handleExportChat = () => {
    toast.success('Exporting chat as PDF...', { description: 'Download will start shortly.' });
  };

  // Function to handle saving the analysis with a custom name
  const handleSaveAnalysis = () => {
    if (!saveName.trim()) return;
    toast.success(`Analysis "${saveName}" saved successfully!`);
    setShowSaveName(false);
    setSaveName('');
  };

  // Open the selected articles as a chat in the Chat Analyzer. Hands the
  // selection over via the resumed-session keys that ChatAnalyzer reads on mount.
  const openInChatAnalyzer = () => {
    const ids = Array.from(selectedArticles);
    if (ids.length === 0) {
      toast.error('Select at least one article first');
      return;
    }
    try {
      localStorage.setItem('resumed_session_id', `rc-${Date.now()}`);
      localStorage.setItem('resumed_session_article_ids', JSON.stringify(ids));
      localStorage.setItem('resumed_session_name', 'Research Chat Selection');
    } catch { /* ignore */ }
    navigate('/chat-analyzer');
  };

  // Real per-paper comprehension, scored server-side by the LLM judge and stored
  // in Progress. For a lecturer viewing /student/:id we load that student; for a
  // student's own view we load their own progress.
  const [realProgress, setRealProgress] = useState<Record<string, number>>({});
  useEffect(() => {
    const load = studentId ? getStudentProgress(studentId) : getMyProgress();
    load
      .then((items) => setRealProgress(toScoreMap(items)))
      .catch((e) => console.error('Failed to load comprehension progress:', e));
  }, [studentId]);

  // Per-article comprehension % from the server-side assessment (0 if none yet).
  const perArticleComprehension = useMemo(() => {
    const map: Record<string, number> = {};
    uploadedFiles.forEach((a) => { map[a.id] = realProgress[a.id] ?? 0; });
    return map;
  }, [uploadedFiles, realProgress]);

  // Count of currently selected PDFs that have been analyzed
  const analyzedSelectedCount = useMemo(
    () => Array.from(selectedArticles).filter((id) => analyzedArticles.has(id)).length,
    [selectedArticles, analyzedArticles]
  );
  // Chat enabled only when at least one selected PDF has been analyzed
  const canChat = analyzedSelectedCount > 0;
  // Comprehension percent: 0 if no analyzed PDF selected, else scales with chat activity
  const comprehensionPercent = useMemo(() => {
    if (!canChat) return 0;
    return Math.min(100, messages.length * 12);
  }, [canChat, messages.length]);

  // Fire celebration toast once when comprehension first hits 100%
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (comprehensionPercent === 100 && !celebratedRef.current) {
      celebratedRef.current = true;
      toast.success('100% comprehension reached!', {
        description: 'Outstanding work — you mastered this material.',
      });
    } else if (comprehensionPercent < 100) {
      celebratedRef.current = false;
    }
  }, [comprehensionPercent]);

  // Main component return - renders the chat interface UI
  return (
    <div className="flex flex-col h-screen overflow-hidden w-full bg-background animate-in fade-in duration-300 relative font-sans text-foreground">

      {/* Upload progress indicator */}
      {uploadProgress !== null && (
        <div className="fixed bottom-24 right-6 z-50 bg-card border border-border rounded-2xl shadow-xl p-4 w-72">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center text-foreground">
              <Upload className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Uploading PDF...</p>
              <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <header className="bg-card border-b border-border px-5 py-3.5 flex items-center justify-between shrink-0 z-10 shadow-sm">
        {isLecturerView ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-sm shadow-red-200">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Research Assistant</h1>
              <p className="text-xs text-muted-foreground">Reviewing Student Research</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-red-600 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8 10h.01" />
                <path d="M12 10h.01" />
                <path d="M16 10h.01" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-foreground">{CHAT_LABEL}</h1>
              <p className="text-xs text-muted-foreground">
                {selectedArticles.size} article{selectedArticles.size !== 1 && 's'} in context
              </p>
            </div>
          </div>
        )}

        {/* Action buttons in header */}
        <div className="flex items-center gap-2">
          {!isLecturerView && (
            <>
              <button
                onClick={() => setShowSaveName(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 border-slate-400 bg-slate-100 dark:bg-slate-800 text-foreground dark:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-sm hover:scale-105"
              >
                <BookmarkPlus className="w-3.5 h-3.5" /> Save
              </button>
              <button
                onClick={handleExportChat}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 border-slate-400 bg-slate-100 dark:bg-slate-800 text-foreground dark:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-sm hover:scale-105"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 border-slate-400 bg-slate-100 dark:bg-slate-800 text-foreground dark:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-sm hover:scale-105 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload PDF
                <input type="file" accept=".pdf" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </>
          )}

          {isCreatingGroup && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 border border-border max-h-[90vh] overflow-y-auto">
                <h3 className="font-bold text-foreground mb-4">Create New Group</h3>
                <input
                  type="text"
                  placeholder="Group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4 bg-background text-foreground"
                  autoFocus
                />
                {/* Article selection for group */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Select Articles</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadedFiles.slice(0, 6).map((article) => {
                      const isSelected = groupArticleSelection.has(article.id);
                      return (
                        <button
                          key={article.id}
                          onClick={() => {
                            const newSelection = new Set(groupArticleSelection);
                            if (isSelected) newSelection.delete(article.id);
                            else newSelection.add(article.id);
                            setGroupArticleSelection(newSelection);
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm bg-muted/50 hover:bg-muted rounded-lg flex items-center gap-2 transition-colors text-foreground border border-border"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800'}`}>
                            {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                          </div>
                          <span className="flex-1 truncate text-xs font-medium">{article.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={createNewGroup}
                    disabled={!newGroupName.trim()}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 hover:border-red-800 hover:shadow-md hover:scale-105 disabled:opacity-50 transition-all"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setIsCreatingGroup(false); setNewGroupName(''); setGroupArticleSelection(new Set()); }}
                    className="px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-bold hover:bg-slate-200 hover:text-slate-700 hover:shadow-sm hover:scale-105 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLecturerView && (
            <div className="relative ml-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-slate-100 hover:border-red-400 hover:shadow-md hover:scale-105 transition-all shadow-sm"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-bold text-foreground hidden sm:block bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600">
                  {user?.name || 'Lecturer'}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-card rounded-xl shadow-lg border border-border overflow-hidden p-2 z-50">
                  {studentId && (
                    <button
                      onClick={() => navigate('/lecturer')}
                      className="w-full px-4 py-2.5 bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 border border-emerald-300 dark:border-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-200 font-bold transition-all rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4" /> Back to Dashboard
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-muted">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 pb-40">

          {showSaveName && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center text-foreground">
                    <BookmarkPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Save Analysis</h3>
                    <p className="text-xs text-muted-foreground">Give this session a memorable name</p>
                  </div>
                </div>
                <input
                  autoFocus
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAnalysis(); if (e.key === 'Escape') setShowSaveName(false); }}
                  placeholder="e.g. NLP Transformer Deep Dive..."
                  className="w-full px-4 py-3 border border-input rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4 bg-background text-foreground"
                />
                <div className="flex gap-3">
                  <button onClick={handleSaveAnalysis} disabled={!saveName.trim()} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 hover:border-red-800 hover:shadow-md hover:scale-105 disabled:opacity-50 transition-all">Save</button>
                  <button onClick={() => { setShowSaveName(false); setSaveName(''); }} className="px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-bold hover:bg-slate-200 hover:text-slate-700 hover:shadow-sm hover:scale-105 transition-all">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {isLecturerView && (
            <StudentPerformancePanel
              studentName={studentId ? `Student ${studentId}` : 'Student'}
              articles={uploadedFiles}
              messages={messages}
              analyzedIds={analyzedArticles}
              perArticleComprehension={perArticleComprehension}
            />
          )}

          <section className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-border pb-4">
              <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <ArticleIcon size="md" title="Article">
                    <FileText className="w-5 h-5 text-current" />
                  </ArticleIcon>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {isLecturerView ? 'Articles Read' : 'Library'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {displayedArticles.length} articles total
                    </p>
                  </div>
                </div>
                {/* arrows removed here to keep single pair near carousel */}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm bg-muted/40 dark:bg-slate-800/40 border border-border dark:border-slate-700/50 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-600/50 focus:border-red-500 outline-none text-foreground placeholder:text-muted-foreground transition-all shadow-inner w-full sm:w-48"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm bg-muted/40 dark:bg-slate-800/40 border border-border dark:border-slate-700/50 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-600/50 focus:border-red-500 outline-none text-foreground cursor-pointer transition-all shadow-inner"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">A-Z (Title)</option>
                </select>
                {/* arrows: moved next to selection box as requested */}
                <div className="flex items-center gap-2">
                  <button onClick={() => scrollRow('left')} className={arrowBtnClass} aria-label="Scroll left">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollRow('right')} className={arrowBtnClass} aria-label="Scroll right">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {(() => {
              // For lecturer view, show all displayed articles under "Articles Read".
              const analyzedOnly = isLecturerView ? displayedArticles : displayedArticles.filter((a) => analyzedArticles.has(a.id));
              const comparisonArticles = analyzedOnly.filter((a) => comparedArticles.has(a.id));
              const analyzedColumnArticles = isLecturerView ? analyzedOnly : analyzedOnly.filter((a) => !comparedArticles.has(a.id));

              if (analyzedOnly.length === 0) {
                return (
                  <div className="py-12 text-center text-muted-foreground bg-muted/50 rounded-xl border border-dashed border-border">
                    <p className="text-sm font-bold">No articles in Research Chat yet</p>
                    <p className="text-xs mt-1">Select a paper and click Analyze to see it here.</p>
                  </div>
                );
              }

              // Render as horizontal carousel showing two cards per view
              const wrapperClass = isLecturerView
                ? 'bg-card rounded-2xl shadow-sm border border-border p-5'
                : 'relative bg-gradient-to-b from-slate-900/40 to-transparent p-2 rounded-xl';

              return (
                <div className={wrapperClass}>
                  <div className="flex items-center justify-between px-2 mb-3">
                    <div />
                    <div className="flex items-center gap-2">
                      {/* count displayed in library header — removed duplicate indicator here */}
                    </div>
                  </div>

                  <div id="articles-carousel" className="flex items-stretch overflow-x-auto gap-4 pb-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {analyzedColumnArticles.map((article) => {
                      const isSelected = selectedArticles.has(article.id);
                      const isExpanded = expandedSummaryId === article.id;
                      const summaryText = (article as any).summary || 'This paper explores the core methodologies and practical challenges in the field, proposing a novel framework to address data limitations.';
                      const canExpand = summaryText.length > 120;

                      return (
                        <div key={article.id} className="snap-start flex-shrink-0 w-[48%] min-w-[48%] flex">
                          <div
                            onClick={() => !isLecturerView && toggleArticleSelection(article.id)}
                            className={`relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer min-h-[260px] w-full h-full ${isLecturerView
                                ? 'border-border bg-card shadow-sm cursor-default'
                                : isSelected
                                  ? 'border-red-500 dark:border-white bg-card shadow-[0_0_15px_rgba(220,38,38,0.18)]'
                                  : 'border-border bg-card hover:border-red-300 hover:bg-muted/40 shadow-sm'
                              }`}>
                            {!isLecturerView && (
                              <div className="absolute top-4 right-4 z-10">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-red-500 border-red-500 dark:bg-transparent dark:border-white' : 'border-border bg-card'}`}>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-3 mb-3 pr-8 shrink-0 min-h-[3.5rem]">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-foreground/90 text-sm leading-snug line-clamp-2 min-h-[2.5rem]" title={article.title}>
                                  {article.title}
                                </h3>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mt-1 truncate">
                                  {article.authors.join(', ')} • {article.year}
                                </p>
                              </div>
                            </div>

                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                if (canExpand) setExpandedSummaryId(isExpanded ? null : article.id);
                              }}
                              className={`flex-1 flex flex-col bg-muted/80 border border-border/60 rounded-lg p-3 mb-3 transition-colors ${canExpand ? 'cursor-pointer hover:bg-muted/90' : ''}`}
                            >
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5 shrink-0">
                                <AlignLeft className="w-3 h-3 text-red-600" /> Auto-Summary
                              </span>
                              <p className={`text-xs text-foreground/80 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {getShortSummary(article)}
                              </p>
                              {canExpand && <span className="text-[10px] text-red-500 font-medium mt-1">{isExpanded ? 'Show less' : 'Show more'}</span>}
                            </div>

                            {isLecturerView && (
                              <div className="mb-3 shrink-0">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Student Comprehension</span>
                                  <span className="text-xs font-bold text-foreground tabular-nums">{perArticleComprehension[article.id] ?? 0}%</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden border border-border">
                                  <div
                                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                                    style={{ width: `${perArticleComprehension[article.id] ?? 0}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <button
                              onClick={(e) => { e.stopPropagation(); setSinglePDFView(article); }}
                              className="w-full px-3 py-2.5 text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg transition-colors mt-auto shrink-0 flex items-center justify-center gap-2"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View Full PDF
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </section>

          {/* ═══ Guided Questions — primary tool to sharpen understanding ═══ */}
          {!isLecturerView && (
            <GuidingQuestionsBlock
              articles={uploadedFiles}
              selectedArticleIds={selectedArticles}
              disabled={!canChat}
              disabledReason="Analyze a selected PDF first to unlock guided questions"
            />
          )}

        </div>
      </div>

      {!isLecturerView && (
        <div className="bg-card border-t border-border px-5 h-26.5 flex items-center shadow-lg">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-5 w-full">
            <div className="flex-1 w-full bg-muted border border-border p-3.5 rounded-2xl flex items-center gap-4">
              <div className="flex flex-col flex-shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Analysis Depth</span>
                <span className="text-sm font-bold text-foreground">{getDepthLabel(analysisDepth)}</span>
              </div>
              <div className="w-px h-7 bg-border" />
              <div className="flex-1 relative pt-5 pb-1">
                <input
                  type="range" min="1" max="3" step="1"
                  value={analysisDepth}
                  onChange={(e) => setAnalysisDepth(parseInt(e.target.value) as 1 | 2 | 3)}
                  className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="absolute top-0 left-0 w-full flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span>Fast</span><span>Regular</span><span>Deep</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setAnalysisType('analyze')}
                disabled={selectedArticles.size === 0}
                className="flex-1 md:px-8 py-3.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 hover:border-slate-600 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                Analyze {selectedArticles.size > 0 && `(${selectedArticles.size})`}
              </button>
              <button
                onClick={() => setAnalysisType('compare')}
                disabled={selectedArticles.size < 2}
                className="flex-1 md:px-8 py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 hover:border-red-800 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                Compare
              </button>
              <button
                onClick={openInChatAnalyzer}
                disabled={selectedArticles.size === 0}
                className="flex-1 md:px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                Create Chat {selectedArticles.size > 0 && `(${selectedArticles.size})`}
              </button>
            </div>
          </div>
        </div>
      )}


      {analysisType && (
        <AnalysisStagesDialog
          type={analysisType}
          onClose={() => setAnalysisType(null)}
          onComplete={() => {
            const t = analysisType;
            setAnalyzedArticles((prev) => new Set([...prev, ...selectedArticles]));
            if (t === 'compare') setComparedArticles((prev) => new Set([...prev, ...selectedArticles]));
            // Persist a report so it shows up in the Analyzed Reports screen.
            try {
              const ids = Array.from(selectedArticles);
              const titles = ids
                .map((id) => uploadedFiles.find((a) => a.id === id)?.title)
                .filter(Boolean) as string[];
              if (ids.length > 0) {
                const now = new Date().toISOString();
                saveReport({
                  id: `r-${Date.now()}`,
                  name: titles.length === 1 ? titles[0] : `${titles[0] ?? 'Analysis'} +${ids.length - 1} more`,
                  articleIds: ids,
                  createdAt: now,
                  analysisDate: now,
                  depth: 'Regular',
                });
              }
            } catch { /* ignore */ }
            // Demo flag — forces Research Chat bar to 100% so the celebration effect is visible
            try { localStorage.setItem('demo-comprehension-100', '1'); } catch { }
            window.dispatchEvent(new CustomEvent('comprehension-demo-100'));
            setAnalysisType(null);
            if (t === 'compare') setShowComparisonModal(true);
            else setShowAnalysisModal(true);
          }}
        />
      )}

      {showComparisonModal && (
        <ComparisonModal
          articles={uploadedFiles.filter((a) => selectedArticles.has(a.id))}
          onClose={() => setShowComparisonModal(false)}
        />
      )}

      {showAnalysisModal && (
        <AnalysisResultsModal
          articles={uploadedFiles.filter((a) => selectedArticles.has(a.id))}
          depth={getDepthLabel(analysisDepth)}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}

      {singlePDFView && (
        <SinglePDFViewer article={singlePDFView} onClose={() => setSinglePDFView(null)} />
      )}

    </div>
  );
}