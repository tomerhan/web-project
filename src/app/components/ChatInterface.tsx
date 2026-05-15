// Import React hooks for state management and optimization
import { useState, useRef, useMemo } from 'react';
// Import icons from lucide-react for UI elements
import {
  Send, Upload, FileText, Sparkles,
  MoreVertical, ChevronLeft, ChevronRight,
  Trash2, Check, HelpCircle, Download, BookmarkPlus, ExternalLink, MessageSquare,
  AlignLeft
} from 'lucide-react';
// Import mock data and types for articles and chat messages
import { mockArticles, mockChatHistory, ChatMessage, Article } from '../data/mockData';
// Import authentication context to check user role
import { useAuth } from '../context/AuthContext';
// Import routing hooks for navigation
import { useNavigate, useParams } from 'react-router';
// Import component components for displaying PDFs and analysis
import SinglePDFViewer from './SinglePDFViewer';
import AnalysisStagesDialog from './AnalysisStagesDialog';
import ComparisonModal from './ComparisonModal';
import AnalysisResultsModal from './AnalysisResultsModal';
import GuidingQuestionsPanel from './GuidingQuestionsPanel';
// Import toast notification library
import { toast } from 'sonner';

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
  const navigate  = useNavigate();
  const { id: studentId } = useParams();
  // Check if the current view is lecturer view
  const isLecturerView = user?.role === 'lecturer';

  // State for chat messages and user input
  const [messages,        setMessages]        = useState<ChatMessage[]>(mockChatHistory);
  const [inputMessage,    setInputMessage]    = useState('');
  const [isTyping,        setIsTyping]        = useState(false);

  // State for uploaded files and upload progress
  const [uploadedFiles,   setUploadedFiles]   = useState<Article[]>(mockArticles);
  const [uploadProgress,  setUploadProgress]  = useState<number | null>(null);

  // State for UI modals and menus
  const [showStatsMenu,       setShowStatsMenu]       = useState(false);
  const [showUserMenu,        setShowUserMenu]        = useState(false);
  const [analysisType,        setAnalysisType]        = useState<'analyze' | 'compare' | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // State for article library search and sort
  const [searchQuery,        setSearchQuery]        = useState('');
  const [sortBy,             setSortBy]             = useState<'newest' | 'oldest' | 'title'>('newest');

  // State for analysis display
  const [showAnalysisModal,  setShowAnalysisModal]   = useState(false);
  const [singlePDFView,      setSinglePDFView]       = useState<Article | null>(null);
  const [activeExplainIdx,   setActiveExplainIdx]    = useState<number | null>(null);
  const [showGuidingPanel,   setShowGuidingPanel]    = useState(false);
  const [expandedSummaryId,  setExpandedSummaryId]   = useState<string | null>(null);

  // State for AI guiding questions and instructions
  const [guidingQuestions, setGuidingQuestions] = useState<string[]>([
    'What are the key methodological differences between these papers?',
    'Which paper presents stronger empirical evidence?',
    'Are there any conflicting findings that need to be addressed?',
  ]);
  const [guidingInstruction, setGuidingInstruction] = useState('');

  // State for saving analysis with custom name
  const [showSaveName,  setShowSaveName]  = useState(false);
  const [saveName,      setSaveName]      = useState('');

  // State for selected articles and analysis depth
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set([mockArticles[0].id])
  );
  const [analysisDepth,  setAnalysisDepth]  = useState<1 | 2 | 3>(2);

  // State for article groups (organization feature)
  const [articleGroups, setArticleGroups] = useState<ArticleGroup[]>([
    { id: 'g1', name: 'AI & NLP Research', articleIds: [mockArticles[0].id, mockArticles[1].id, mockArticles[3].id], createdAt: new Date().toISOString(), hasAnalysis: true, analysisDate: '2024-01-15' },
    { id: 'g2', name: 'Climate & Energy',  articleIds: [mockArticles[2].id, mockArticles[4].id],                     createdAt: new Date().toISOString(), hasAnalysis: false },
  ]);
  const [savedAnalyses] = useState<SavedAnalysis[]>([
    {
      id: 'sa-1',
      name: 'Transformer Architecture Evaluation',
      articleIds: [mockArticles[0].id],
      analysisType: 'analyze',
      prompt: 'Analyze core methodology and metrics',
      result: 'Mock result content here...',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sa-2',
      name: 'Quantum Cryptography Summary',
      articleIds: [mockArticles[1].id],
      analysisType: 'analyze',
      prompt: 'Summarize post-quantum security challenges',
      result: 'Mock result content here...',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sc-1',
      name: 'NLP Survey vs Quantum Models',
      articleIds: [mockArticles[0].id, mockArticles[1].id],
      analysisType: 'compare',
      prompt: 'Compare cross-domain data limitations',
      result: 'Mock comparison content here...',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sc-2',
      name: 'Smart Grid Optimization Frameworks',
      articleIds: [mockArticles[2].id, mockArticles[3].id],
      analysisType: 'compare',
      prompt: 'Compare performance efficiency parameters',
      result: 'Mock comparison content here...',
      createdAt: new Date().toISOString(),
    }
  ]);
  const [currentGroupId,    setCurrentGroupId]    = useState('g1');
  const [activeGroupId,     setActiveGroupId]     = useState('g1');

  // State for creating new groups
  const [newGroupName,      setNewGroupName]      = useState('');
  const [isCreatingGroup,   setIsCreatingGroup]   = useState(false);
  const [groupArticleSelection, setGroupArticleSelection] = useState<Set<string>>(new Set());

  // Reference to chat container for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to convert analysis depth number to human-readable label
  const getDepthLabel = (v: number) => (v === 1 ? 'Fast' : v === 2 ? 'Regular' : 'Deep');

  // Function to scroll the articles carousel left or right
  const scrollRow = (direction: 'left' | 'right') => {
    const container = document.getElementById('articles-carousel');
    if (container) {
      const scrollAmount = container.clientWidth;
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

    const newMsg: ChatMessage = {
      id: `c${Date.now()}`,
      articleId: Array.from(selectedArticles)[0] || '1',
      question:  text,
      answer:    '',
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
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null) return null;
        if (p >= 100) {
          clearInterval(interval);
          const na: Article = {
            ...mockArticles[0],
            id:         `uploaded-${Date.now()}`,
            title:      files[0].name.replace('.pdf', ''),
            year:       new Date().getFullYear(),
            uploadDate: new Date().toISOString().split('T')[0],
          };
          setUploadedFiles((prev) => [na, ...prev]);
          setSelectedArticles((prev) => new Set([...prev, na.id]));
          toast.success(`"${files[0].name}" added to library`);
          setTimeout(() => setUploadProgress(null), 600);
          return 100;
        }
        return p + 7;
      });
    }, 100);
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 10h.01"/>
                <path d="M12 10h.01"/>
                <path d="M16 10h.01"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-foreground">Research Chat</h1>
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
                onClick={() => setShowGuidingPanel(!showGuidingPanel)}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                  showGuidingPanel
                    ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-800 hover:shadow-md hover:scale-105'
                    : 'bg-card text-foreground hover:bg-slate-100 hover:border-blue-300 hover:shadow-sm hover:scale-105 border-border'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> AI Prompts
              </button>
              <button
                onClick={() => setShowSaveName(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-card text-foreground hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-sm hover:scale-105 rounded-lg text-xs font-bold transition-all border border-border"
              >
                <BookmarkPlus className="w-3.5 h-3.5" /> Save
              </button>
              <button
                onClick={handleExportChat}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-card text-foreground hover:bg-purple-50 hover:border-purple-300 hover:shadow-sm hover:scale-105 rounded-lg text-xs font-bold transition-all border border-border"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 border-slate-400 bg-slate-100 dark:bg-slate-800 text-white dark:border-slate-500 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-white" /> Upload PDF
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
                className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-slate-100 hover:border-blue-400 hover:shadow-md hover:scale-105 transition-all shadow-sm"
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

          <section className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-border pb-4">
              <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-muted border border-border rounded-xl shadow-sm">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {isLecturerView ? 'Articles Read' : 'Library'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {displayedArticles.length} articles total
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:hidden">
                  <button onClick={() => scrollRow('left')} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300 hover:shadow-md hover:scale-110 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollRow('right')} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300 hover:shadow-md hover:scale-110 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 outline-none text-foreground placeholder:text-slate-500 transition-all shadow-inner w-full sm:w-48"
                />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 outline-none text-foreground cursor-pointer transition-all shadow-inner"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">A-Z (Title)</option>
                </select>
                <div className="hidden lg:flex items-center gap-2 ml-2">
                  <button onClick={() => scrollRow('left')} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300 hover:shadow-md hover:scale-110 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollRow('right')} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300 hover:shadow-md hover:scale-110 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {displayedArticles.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground bg-muted/50 rounded-xl border border-dashed border-border">
                <p className="text-sm font-bold">No articles found matching criteria</p>
              </div>
            ) : (
              <div className="relative bg-gradient-to-b from-slate-900/40 to-transparent p-2 rounded-xl">
                <div 
                  id="articles-carousel"
                  className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {displayedArticles.map((article) => {
                    const isSelected = selectedArticles.has(article.id);
                    const isExpanded = expandedSummaryId === article.id;
                    const summaryText = (article as any).summary || 'This paper explores the core methodologies and practical challenges in the field, proposing a novel framework to address data limitations. It offers deep insights into AI architecture and expands upon previous literature by demonstrating robust accuracy enhancements across multiple diverse data sets, setting a new benchmark for future comparative studies and implementations.';
                    
                    const canExpand = summaryText.length > 120;
                    
                    return (
                      <div
                        key={article.id}
                        onClick={() => !isLecturerView && toggleArticleSelection(article.id)}
                        className={`flex-none w-full sm:w-[calc(50%-0.5rem)] snap-start relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer group min-h-[260px] ${
                           isLecturerView
                             ? 'border-slate-800 bg-slate-900/40 shadow-sm cursor-default'
                             : isSelected 
                             ? 'border-white bg-slate-900/60 shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                             : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/60 shadow-sm'
                        }`}
                      >
                        {!isLecturerView && (
                          <div className="absolute top-4 right-4 z-10">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-white border-white' : 'border-slate-600 bg-slate-800'}`}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" strokeWidth={4} />}
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3 mb-3 pr-8 shrink-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground/90 text-sm leading-snug line-clamp-2" title={article.title}>
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
                            if (canExpand) {
                              setExpandedSummaryId(isExpanded ? null : article.id);
                            }
                          }}
                          className={`flex-1 flex flex-col bg-muted/80 border border-border/60 rounded-lg p-3 mb-3 transition-colors ${canExpand ? 'cursor-pointer hover:bg-muted/90' : ''}`}
                        >
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5 shrink-0">
                            <AlignLeft className="w-3 h-3 text-red-500" /> Auto-Summary
                          </span>
                          <p className={`text-xs text-slate-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {summaryText}
                          </p>
                          {canExpand && (
                            <span className="text-[10px] text-blue-500 font-medium mt-1 flex items-center gap-1 shrink-0">
                              {isExpanded ? 'Show less' : 'Show more'}
                            </span>
                          )}
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            setSinglePDFView(article);
                          }}
                          className="w-full px-3 py-2.5 text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg transition-colors mt-auto shrink-0 flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Full PDF
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ═══ SECTION 2: AI Chat Interface (User's Styles + Dynamic Dual-Column Grouping Modal) ═══ */}
          {!isLecturerView && (
            <section className="bg-card rounded-2xl shadow-sm border border-border flex flex-col h-[500px] overflow-hidden">
              {/* Header Container with Grid/Flex Alignment */}
              <div className="bg-card px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0 gap-4 w-full min-w-0">
                
                {/* 1. Left Side: Title */}
                <div className="flex items-center gap-2 shrink-0">
                  <Sparkles className="w-5 h-5 text-slate-600" />
                  <span className="font-bold text-foreground">Analysis Chat</span>
                </div>
                
                {/* 2. Center: Scrollable Tabs Slider (Fixed layout constraints) */}
                <div className="w-0 flex-1 overflow-x-auto overflow-y-hidden py-1 flex items-center gap-1.5 min-w-0 whitespace-nowrap">
                  {articleGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setActiveGroupId(group.id);
                        setSelectedArticles(new Set(group.articleIds));
                      }}
                      className={`flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all border whitespace-nowrap ${
                        activeGroupId === group.id 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-card text-foreground border-border hover:bg-slate-800 hover:text-white hover:border-blue-400'
                      }`}
                    >
                      {group.name}
                    </button>
                  ))}
                </div>

                {/* 3. Right Side: Options Dropdown Trigger (Locked in place) */}
                <div className="relative shrink-0">
                  <button 
                    onClick={() => setShowStatsMenu(!showStatsMenu)} 
                    className="p-1.5 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-lg text-foreground transition-all hover:scale-110 border border-border shadow-sm"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showStatsMenu && (
                    <div className="absolute right-0 top-full mt-2 min-w-[18rem] z-50 bg-background border border-border rounded-xl shadow-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-foreground">Article Groups</h3>
                          <span className="text-xs text-muted-foreground">{articleGroups.length} groups</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setIsCreatingGroup(true);
                            setShowStatsMenu(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm bg-muted/50 hover:bg-muted rounded-lg flex items-center gap-2 transition-colors text-foreground border border-border"
                        >
                          <BookmarkPlus className="w-4 h-4 text-red-600" />
                          <span>Create New Group</span>
                        </button>
                        
                        <div className="border-t border-border my-2"></div>
                        
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {articleGroups.map((group) => (
                            <div key={group.id} className="group/item">
                              <button
                                onClick={() => {
                                  setActiveGroupId(group.id);
                                  setSelectedArticles(new Set(group.articleIds));
                                  setShowStatsMenu(false);
                                }}
                                className="w-full text-left flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-foreground">{group.name}</div>
                                    <div className="text-xs text-muted-foreground">{group.articleIds.length} articles</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  {articleGroups.length > 1 && (
                                    <button
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (confirm(`Delete group "${group.name}"?`)) deleteGroup(group.id); 
                                      }}
                                      className="p-1.5 hover:bg-blue-100 border border-transparent hover:border-blue-300 rounded text-blue-600 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Column Context Creator Modal Popup */}
              {isCreatingGroup && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-card rounded-2xl shadow-xl w-full max-w-5xl p-6 border border-border max-h-[90vh] flex flex-col">
                    <div className="shrink-0 mb-4">
                      <h3 className="font-bold text-foreground text-base">Create New Research Context Group</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Select articles, saved analyses, and comparisons to bundle together.</p>
                      <input
                        type="text"
                        placeholder="Enter group name (e.g., Deep Learning Core)..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full mt-3 px-4 py-2.5 border border-input rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-background text-foreground outline-none transition-all shadow-inner"
                        autoFocus
                      />
                    </div>
                    
                    {/* Balanced Three Columns Layout Grid */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden my-2 min-h-0">
                      
                      {/* Column 1: Library Articles */}
                      <div className="flex flex-col border border-border/60 bg-muted/30 rounded-xl p-3 overflow-hidden">
                        <p className="text-xs font-bold text-foreground/80 mb-2 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                          <FileText className="w-3.5 h-3.5 text-blue-500" /> Library Articles
                        </p>
                        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                          {uploadedFiles.map((article) => {
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
                                className={`w-full text-left px-3 py-2.5 text-xs bg-card hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors text-foreground border ${
                                  isSelected ? 'border-blue-500/50 bg-blue-500/5' : 'border-border/60'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-600 bg-slate-800'}`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                </div>
                                <span className="flex-1 truncate font-medium">{article.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column 2: Saved Analyses */}
                      <div className="flex flex-col border border-border/60 bg-muted/30 rounded-xl p-3 overflow-hidden">
                        <p className="text-xs font-bold text-foreground/80 mb-2 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Saved Analyses
                        </p>
                        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                          {savedAnalyses && savedAnalyses.filter(a => a.analysisType !== 'compare').length > 0 ? (
                            savedAnalyses.filter(a => a.analysisType !== 'compare').map((analysis) => {
                              const isSelected = groupArticleSelection.has(analysis.id);
                              return (
                                <button
                                  key={analysis.id}
                                  onClick={() => {
                                    const newSelection = new Set(groupArticleSelection);
                                    if (isSelected) newSelection.delete(analysis.id);
                                    else newSelection.add(analysis.id);
                                    setGroupArticleSelection(newSelection);
                                  }}
                                  className={`w-full text-left px-3 py-2.5 text-xs bg-card hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors text-foreground border ${
                                    isSelected ? 'border-purple-500/50 bg-purple-500/5' : 'border-border/60'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-600 bg-slate-800'}`}>
                                    {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                  </div>
                                  <span className="flex-1 truncate font-medium">{analysis.name}</span>
                                </button>
                              );
                            })
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                              <p className="text-xs font-medium text-muted-foreground">No analyses found</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Saved Comparisons */}
                      <div className="flex flex-col border border-border/60 bg-muted/30 rounded-xl p-3 overflow-hidden">
                        <p className="text-xs font-bold text-foreground/80 mb-2 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Saved Comparisons
                        </p>
                        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                          {savedAnalyses && savedAnalyses.filter(a => a.analysisType === 'compare').length > 0 ? (
                            savedAnalyses.filter(a => a.analysisType === 'compare').map((analysis) => {
                              const isSelected = groupArticleSelection.has(analysis.id);
                              return (
                                <button
                                  key={analysis.id}
                                  onClick={() => {
                                    const newSelection = new Set(groupArticleSelection);
                                    if (isSelected) newSelection.delete(analysis.id);
                                    else newSelection.add(analysis.id);
                                    setGroupArticleSelection(newSelection);
                                  }}
                                  className={`w-full text-left px-3 py-2.5 text-xs bg-card hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors text-foreground border ${
                                    isSelected ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-border/60'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600 bg-slate-800'}`}>
                                    {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                  </div>
                                  <span className="flex-1 truncate font-medium">{analysis.name}</span>
                                </button>
                              );
                            })
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                              <p className="text-xs font-medium text-muted-foreground">No comparisons found</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Modal Controls Bottom Row */}
                    <div className="flex gap-3 shrink-0 pt-3 border-t border-border mt-2">
                      <button
                        onClick={createNewGroup}
                        disabled={!newGroupName.trim()}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 hover:shadow-lg disabled:opacity-40 disabled:hover:shadow-none transition-all"
                      >
                        Create Group Context
                      </button>
                      <button
                        onClick={() => { 
                          setIsCreatingGroup(false); 
                          setNewGroupName(''); 
                          setGroupArticleSelection(new Set()); 
                        }}
                        className="px-5 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-bold hover:bg-slate-800 hover:text-white transition-all border border-border"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Central Chat Stream Logs Container */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-slate-900/40 via-background to-background">
                {messages.map((msg, idx) => (
                  <div key={idx} className="space-y-4 mb-8">
                    <div className="flex justify-end group">
                      <div className="max-w-[80%] p-4 rounded-2xl rounded-tr-none border border-blue-500/20 bg-blue-950/30 backdrop-blur-md shadow-lg transition-all hover:bg-blue-900/40 hover:border-blue-400/40">
                        <p className="text-sm leading-relaxed text-slate-200 group-hover:text-white transition-colors">
                          {msg.question}
                        </p>
                      </div>
                    </div>

                    {msg.answer && (
                      <div className="flex justify-start">
                        <div className="max-w-[90%] flex items-start gap-4">
                          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                            <Sparkles className="w-5 h-5 text-red-600" />
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {msg.answer}
                              </p>
                              
                              {msg.sources && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Sources</p>
                                  <div className="flex flex-wrap gap-2">
                                    {msg.sources.map((source, i) => {
                                      const article = uploadedFiles.find(a => a.id === msg.articleId);
                                      return (
                                        <button
                                          key={i}
                                          onClick={() => {
                                            if (article) {
                                              setSelectedArticles(new Set([article.id]));
                                              toast.success(`Selected: ${article.title}`);
                                            }
                                          }}
                                          className="px-2.5 py-1 bg-slate-800/50 text-slate-300 text-[10px] font-bold rounded border border-slate-700 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                          <FileText className="w-2.5 h-2.5" />
                                          {article ? article.title.substring(0, 20) + '...' : source}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => setActiveExplainIdx(activeExplainIdx === idx ? null : idx)}
                              className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 hover:text-blue-500 transition-colors ml-1 uppercase tracking-wider"
                            >
                              <HelpCircle className="w-3.5 h-3.5" /> How was this derived?
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 p-3 ml-12 items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Chat Text Input Section Area */}
              <div className="px-5 py-6 bg-card/90 backdrop-blur-md border-t border-border">
                <div className="max-w-4xl mx-auto flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={activeGroupId ? 
                      `Ask about group "${articleGroups.find(g => g.id === activeGroupId)?.name}"...` : 
                      "Ask about methodology, findings, or gaps..."
                    }
                    className="flex-1 px-5 py-3 text-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 outline-none text-slate-100 placeholder:text-slate-500 transition-all shadow-inner"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-30 disabled:hover:shadow-none transition-all flex items-center justify-center shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>
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
            </div>
          </div>
        </div>
      )}

      {!isLecturerView && showGuidingPanel && (
        <GuidingQuestionsPanel
          questions={guidingQuestions}
          setQuestions={setGuidingQuestions}
          instruction={guidingInstruction}
          setInstruction={setGuidingInstruction}
          onClose={() => setShowGuidingPanel(false)}
        />
      )}

      {analysisType && (
        <AnalysisStagesDialog
          type={analysisType}
          onClose={() => setAnalysisType(null)}
          onComplete={() => {
            const t = analysisType;
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