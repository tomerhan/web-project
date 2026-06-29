import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Sparkles, FileText, MessageSquare, MoreVertical, BookmarkPlus, Check, Edit, X, Home, Brain } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ChatMessage, Article } from '../../data/mockData';
import { getPapers } from '../../services/paperService';
import { startOrResumeChat, sendChatMessage, mapMessagesToFrontend } from '../../services/chatService';
import { getMyProgress, toScoreMap } from '../../services/progressService';
import { toast } from 'sonner';

/*
 * ChatAnalyzer
 * -------------------------------------------------------------------------
 * The "Research Chat" screen. User groups articles together, creates a chat,
 * and asks questions; a canned AI reply streams back after a delay (no real
 * backend). A left rail tracks a "comprehension %" that climbs with each
 * message and celebrates at 100%. Groups and messages persist in localStorage.
 *
 * Entry points (besides normal use):
 *   - resumed session  : keys left in localStorage by the History page.
 *   - comparison -> chat: 'create-chat-from-comparison' window event.
 */

// A named bundle of article ids the user wants to discuss together.
interface ArticleGroup {
  id: string;
  name: string;
  articleIds: string[];
}

export default function ChatAnalyzer() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Article groups
  const [groups, setGroups] = useState<ArticleGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showStatsMenu, setShowStatsMenu] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupArticleSelection, setGroupArticleSelection] = useState<Set<string>>(new Set());

  // Backend chat session state
  const [chatId, setChatId] = useState<string | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  const activeGroup = groups.find(g => g.id === activeGroupId);   // currently selected group (if any)
  const [allArticles, setAllArticles] = useState<Article[]>([]);

  // Resolve the active group's ids into full Article objects (for the chips).
  const activeGroupArticles = activeGroup
    ? allArticles.filter(a => activeGroup.articleIds.includes(a.id))
    : [];

  // Create a new group from the modal's name + checkbox selection, activate it.
  const createGroup = () => {
    if (!newGroupName.trim() || groupArticleSelection.size === 0) return;
    const g: ArticleGroup = {
      id: `g-${Date.now()}`,
      name: newGroupName.trim(),
      articleIds: Array.from(groupArticleSelection),
    };
    setGroups(prev => [...prev, g]);
    setActiveGroupId(g.id);
    setIsCreatingGroup(false);
    setNewGroupName('');
    setGroupArticleSelection(new Set());
    toast.success(`Group "${g.name}" created`);
  };

  // Real per-paper comprehension, scored server-side by the LLM judge and
  // persisted in Progress. Loaded on mount and refreshed after each message.
  const [progressByPaper, setProgressByPaper] = useState<Record<string, number>>({});
  useEffect(() => {
    getMyProgress()
      .then((items) => setProgressByPaper(toScoreMap(items)))
      .catch((e) => console.error('Failed to load comprehension progress:', e));
  }, []);

  // TEMP PREVIEW: click the % to force 100% and watch the celebration. Remove before commit.
  const [previewMax, setPreviewMax] = useState(false);

  const comprehensionPercent = useMemo(
    () => (previewMax ? 100 : activeArticleId ? progressByPaper[activeArticleId] ?? 0 : 0),
    [previewMax, activeArticleId, progressByPaper]
  );

  // Celebration toast: fire once when hitting 100%; reset the latch below 100.
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

  // If a resumed session was set by HistoryPage, create a temporary group and activate it
  useEffect(() => {
    try {
      const resumedId = localStorage.getItem('resumed_session_id');
      const rawIds = localStorage.getItem('resumed_session_article_ids');
      const resumedName = localStorage.getItem('resumed_session_name');
      if (resumedId && rawIds) {
        const ids = JSON.parse(rawIds) as string[];
        if (ids && ids.length > 0) {
          const gid = `resumed-${Date.now()}`;
          const g: ArticleGroup = { id: gid, name: resumedName || 'Resumed Session', articleIds: ids };
          setGroups((p) => [g, ...p]);
          setActiveGroupId(gid);
          setIsResumedMode(true);
          setChatCreated(true);
          toast.success('Resumed session loaded');
        }
      }
    } catch (e) { /* ignore */ }
    try { localStorage.removeItem('resumed_session_id'); localStorage.removeItem('resumed_session_article_ids'); } catch { }
  }, []);

  // Editable group title state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [isResumedMode, setIsResumedMode] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState<1 | 2 | 3>(2);
  const [chatCreated, setChatCreated] = useState(false);

  // Fetch papers from database on mount and setup initial groups
  useEffect(() => {
    const loadAllPapers = async () => {
      try {
        const data = await getPapers();
        setAllArticles(data);

        // Rehydrate saved groups first; only seed a default group if none exist.
        const validIds = new Set(data.map((p) => p.id));
        let restored: ArticleGroup[] = [];
        try {
          const raw = localStorage.getItem('analysis_groups_v1');
          if (raw) {
            const parsed = JSON.parse(raw) as ArticleGroup[];
            // Drop stale article ids that no longer exist in the DB.
            restored = (Array.isArray(parsed) ? parsed : [])
              .map((g) => ({ ...g, articleIds: g.articleIds.filter((id) => validIds.has(id)) }))
              .filter((g) => g.articleIds.length > 0);
          }
        } catch { /* corrupt storage — fall through to defaults */ }

        if (restored.length > 0) {
          setGroups(restored);
          setActiveGroupId(restored[0].id);
        } else if (data.length > 0) {
          // First visit (or nothing valid stored): seed one group with all papers.
          const seed: ArticleGroup = { id: 'g1', name: 'My Research', articleIds: data.map((p) => p.id) };
          setGroups([seed]);
          setActiveGroupId('g1');
        }
      } catch (error) {
        console.error('Failed to load papers in ChatAnalyzer:', error);
      }
    };
    loadAllPapers();
  }, []);

  // Update activeArticleId when activeGroupId or activeGroupArticles changes
  useEffect(() => {
    if (activeGroupArticles.length > 0) {
      if (!activeArticleId || !activeGroupArticles.find(a => a.id === activeArticleId)) {
        setActiveArticleId(activeGroupArticles[0].id);
      }
    } else {
      setActiveArticleId(null);
    }
  }, [activeGroupId, activeGroupArticles]);

  // Load or resume chat on active article change, only if chat is created
  useEffect(() => {
    if (!chatCreated || !activeArticleId) {
      setChatId(null);
      setMessages([]);
      return;
    }

    const initChat = async () => {
      try {
        setIsTyping(true);
        const session = await startOrResumeChat(activeArticleId);
        setChatId(session._id);
        setMessages(mapMessagesToFrontend(session.messages, activeArticleId));
      } catch (err) {
        console.error('Failed to init chat session:', err);
        toast.error('Failed to initialize Socratic chat session');
      } finally {
        setIsTyping(false);
        setTimeout(() => {
          chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    };

    initChat();
  }, [activeArticleId, chatCreated]);

  // Persist groups so renamed groups survive reload
  useEffect(() => {
    if (groups.length > 0) {
      try { localStorage.setItem('analysis_groups_v1', JSON.stringify(groups)); } catch (e) { /* ignore */ }
    }
  }, [groups]);

  // Send a question: calls backend API and updates the state with Socratic bot response
  const send = async () => {
    const text = inputMessage.trim();
    if (!text || !chatId || !activeArticleId) return;

    const tempUserMsgId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempUserMsgId,
      articleId: activeArticleId,
      question: text,
      answer: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((p) => [...p, newMsg]);
    setInputMessage('');
    setIsTyping(true);
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);

    try {
      const updatedSession = await sendChatMessage(chatId, text);
      const mapped = mapMessagesToFrontend(updatedSession.messages, activeArticleId);
      setMessages(mapped);
      // Live-update the comprehension bar with the freshly scored progress.
      if (updatedSession.progress && activeArticleId) {
        const pid = activeArticleId;
        setProgressByPaper((prev) => ({ ...prev, [pid]: updatedSession.progress!.score }));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to get response from Socratic bot');
      setMessages((p) => p.filter(m => m.id !== tempUserMsgId));
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  };

  // Persist messages to localStorage so other views (History) can read them
  useEffect(() => {
    try { localStorage.setItem('chat_analyzer_messages_v1', JSON.stringify(messages)); } catch (e) { /* ignore */ }
  }, [messages]);

  // Listen for the ComparisonModal "Create Chat" event: build a group from the
  // passed article ids, make it active, and optionally seed messages.
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail;
      if (!detail || !detail.articleIds) return;
      const gid = `comp-${Date.now()}`;
      const g = { id: gid, name: detail.name || 'Comparison Chat', articleIds: detail.articleIds } as ArticleGroup;
      setGroups((p) => [g, ...p]);
      setActiveGroupId(gid);
      setIsResumedMode(true);
      if (detail.messages) setMessages(detail.messages as any);
      setChatCreated(true); // Enable chat view immediately on comparison import
      toast.success('Chat created from comparison');
    };
    window.addEventListener('create-chat-from-comparison', handler as EventListener);
    return () => window.removeEventListener('create-chat-from-comparison', handler as EventListener);
  }, []);

  // Render: header -> pre-chat control bar (difficulty + Create Chat) ->
  // body split into the comprehension rail (left) and the chat section
  // (group tabs, group manager menu, context bar, create-group modal,
  // message list with typing dots, and the input row).
  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <header className="bg-card border-b border-border px-5 py-3.5 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-muted border border-border rounded-xl shadow-sm">
            <MessageSquare className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Chat Analyzer</h1>
            <p className="text-xs text-muted-foreground">Comprehension tracker + research chat</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground text-sm font-medium rounded-lg transition-colors border border-border"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </button>
      </header>

      {/* Control bar: select difficulty + create chat */}
      {!chatCreated && (
        <div className="bg-card border-t border-border px-5 h-26.5 flex items-center shadow-lg">
          <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
            <div className="text-sm font-medium text-foreground">{
              allArticles.length === 0
                ? 'No articles yet — upload one in Library'
                : activeGroup
                  ? `${activeGroup.articleIds.length} article${activeGroup.articleIds.length !== 1 ? 's' : ''} selected`
                  : 'No articles selected — open the ⋮ menu to pick'
            }</div>
            <div className="flex-1">
              <div className="text-[11px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Difficulty</div>
              <input
                type="range"
                min={1}
                max={3}
                value={analysisDepth}
                onChange={(e) => setAnalysisDepth(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground flex justify-between mt-1">
                <span>Fast</span><span>Regular</span><span>Deep</span>
              </div>
            </div>
            <div>
              <button
                onClick={() => {
                  const articleIds = activeGroup ? activeGroup.articleIds : [];
                  if (!articleIds || articleIds.length === 0) { toast.error('Select articles first'); return; }
                  const gid = `live-${Date.now()}`;
                  const g = { id: gid, name: activeGroup?.name || 'Live Session', articleIds } as ArticleGroup;
                  setGroups((p) => [g, ...p]);
                  setActiveGroupId(gid);
                  setChatCreated(true);
                  setMessages([]);
                  toast.success('Chat created');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden bg-muted min-h-0">
        {/* Left bar — comprehension % with 100% celebration */}
        <aside className={`w-20 shrink-0 flex flex-col items-center gap-3 py-6 border-r border-border relative overflow-hidden transition-colors duration-500 ${comprehensionPercent === 100
            ? 'bg-gradient-to-b from-red-50 via-card to-card dark:from-red-950/40 dark:via-card dark:to-card'
            : 'bg-card'
          }`}>
          {comprehensionPercent === 100 && (
            <>
              <span className="pointer-events-none absolute inset-0 ring-2 ring-red-500/60 animate-pulse" aria-hidden />
              <span className="pointer-events-none absolute top-6 left-2 w-1 h-1 rounded-full bg-red-400 animate-ping" aria-hidden />
              <span className="pointer-events-none absolute top-12 right-2 w-1 h-1 rounded-full bg-red-500 animate-ping [animation-delay:0.3s]" aria-hidden />
              <span className="pointer-events-none absolute top-24 left-3 w-1.5 h-1.5 rounded-full bg-red-300 animate-ping [animation-delay:0.6s]" aria-hidden />
              <span className="pointer-events-none absolute bottom-10 right-2 w-1 h-1 rounded-full bg-red-400 animate-ping [animation-delay:0.9s]" aria-hidden />
              <span className="pointer-events-none absolute bottom-20 left-2 w-1 h-1 rounded-full bg-red-500 animate-ping [animation-delay:1.2s]" aria-hidden />
            </>
          )}
          {/* Animated comprehension badge — spinning gradient ring + glowing pulsing brain.
              At 100% it turns gold and celebrates (faster spin, scaling bounce, mastery sparkle). */}
          <div className={`relative w-12 h-12 flex items-center justify-center shrink-0 transition-transform duration-500 ${comprehensionPercent === 100 ? 'mt-5 scale-110' : ''}`} aria-label="Comprehension" title="Comprehension">
            {/* rotating conic gradient ring — red while learning, gold at mastery */}
            <span
              className={`absolute inset-0 rounded-full animate-spin ${comprehensionPercent === 100 ? '[animation-duration:1.2s]' : '[animation-duration:3s]'}`}
              style={{
                background: comprehensionPercent === 100
                  ? 'conic-gradient(from 0deg, #f59e0b, #fde68a, #fbbf24, #f59e0b)'
                  : 'conic-gradient(from 0deg, #ef4444, #fca5a5, transparent 60%, #ef4444)',
              }}
              aria-hidden
            />
            {/* inner mask so only the ring edge shows */}
            <span className="absolute inset-[3px] rounded-full bg-card" aria-hidden />
            {/* soft pulsing glow */}
            <span className={`absolute inset-0 rounded-full blur-md animate-pulse ${comprehensionPercent === 100 ? 'bg-amber-400/50' : 'bg-red-500/30'}`} aria-hidden />
            {/* counter-rotating sparkle accents */}
            <span className={`absolute inset-0 animate-spin [animation-direction:reverse] ${comprehensionPercent === 100 ? '[animation-duration:2.5s]' : '[animation-duration:6s]'}`} aria-hidden>
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${comprehensionPercent === 100 ? 'bg-amber-300' : 'bg-red-400'}`} />
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${comprehensionPercent === 100 ? 'bg-yellow-200' : 'bg-red-300'}`} />
              {comprehensionPercent === 100 && (
                <>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-200" />
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-yellow-300" />
                </>
              )}
            </span>
            {/* brain icon — breathing while learning, bouncing star-burst at mastery */}
            {comprehensionPercent === 100 ? (
              <Brain className="relative w-5 h-5 text-amber-500 animate-bounce drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
            ) : (
              <Brain className="relative w-5 h-5 text-red-600 dark:text-red-400 animate-[pulse_1.6s_ease-in-out_infinite] drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
            )}
          </div>
          <span
            onClick={() => setPreviewMax((v) => !v)}
            title="TEMP: click to preview 100% celebration"
            className={`text-sm font-bold tabular-nums relative cursor-pointer select-none ${comprehensionPercent === 100 ? 'text-red-600 dark:text-red-300 text-base' : 'text-foreground'
            }`}>{comprehensionPercent}%</span>
          <div className={`relative w-3 flex-1 rounded-full overflow-hidden border ${comprehensionPercent === 100
              ? 'bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-700 shadow-[0_0_12px_rgba(220,38,38,0.6)]'
              : 'bg-slate-200 dark:bg-slate-800 border-border'
            }`}>
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out ${comprehensionPercent === 100
                  ? 'bg-gradient-to-t from-red-700 via-red-500 to-red-300 animate-pulse'
                  : 'bg-gradient-to-t from-red-600 to-red-400 dark:from-red-500 dark:to-red-300'
                }`}
              style={{ height: `${comprehensionPercent}%` }}
              role="progressbar"
              aria-valuenow={comprehensionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className={`text-[10px] relative ${comprehensionPercent === 100 ? 'text-red-600 dark:text-red-300 font-bold' : 'text-muted-foreground'
            }`}>{comprehensionPercent === 100 ? 'MAX!' : '0%'}</span>
        </aside>

        {/* Chat section — moved from main screen */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">
          <section className="bg-card rounded-2xl shadow-sm border border-border flex flex-col h-[500px] overflow-hidden">
            <div className="bg-card px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0 gap-4 w-full min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles className="w-5 h-5 text-red-600" />
                <span className="font-bold text-foreground">Chat Analyzer</span>
              </div>

              {/* Group tabs */}
              <div className="w-0 flex-1 overflow-x-auto overflow-y-hidden py-1 flex items-center gap-1.5 min-w-0 whitespace-nowrap">
                {isResumedMode && activeGroup ? (
                  <div className="flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all border whitespace-nowrap bg-red-600 text-white border-red-600 shadow-md">
                    {activeGroup.name}
                  </div>
                ) : (
                  groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setActiveGroupId(activeGroupId === g.id ? null : g.id)}
                      className={`flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all border whitespace-nowrap ${activeGroupId === g.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-card text-foreground border-border hover:bg-muted'
                        }`}
                    >
                      {g.name}
                    </button>
                  ))
                )}
              </div>

              {/* 3-dot menu — attach a group of articles to discuss */}
              {!isResumedMode && (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setShowStatsMenu((v) => !v)}
                    className="p-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-lg text-foreground transition-all border border-border shadow-sm"
                    aria-label="Manage article groups"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showStatsMenu && (
                    <div className="absolute right-0 top-full mt-2 min-w-[18rem] z-50 bg-background border border-border rounded-xl shadow-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">Article Groups</h3>
                        <span className="text-xs text-muted-foreground">{groups.length} groups</span>
                      </div>
                      <button
                        onClick={() => { setIsCreatingGroup(true); setShowStatsMenu(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm bg-muted/50 hover:bg-muted rounded-lg flex items-center gap-2 transition-colors text-foreground border border-border mb-2"
                      >
                        <BookmarkPlus className="w-4 h-4 text-red-600" />
                        <span>Create New Group</span>
                      </button>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {groups.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => { setActiveGroupId(g.id); setShowStatsMenu(false); }}
                            className={`w-full text-left flex items-center justify-between p-2 rounded-lg transition-colors ${activeGroupId === g.id ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-muted'
                              }`}
                          >
                            <div>
                              <div className="text-sm font-medium text-foreground">{g.name}</div>
                              <div className="text-xs text-muted-foreground">{g.articleIds.length} articles</div>
                            </div>
                            {activeGroupId === g.id && <Check className="w-4 h-4 text-red-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Active group context bar */}
            {activeGroup && (
              <div className="px-5 py-2 border-b border-border bg-red-50/50 dark:bg-red-950/20 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  {editingGroupId === activeGroup.id ? (
                    <div className="flex items-center gap-2">
                      <input value={editingGroupName} onChange={(e) => setEditingGroupName(e.target.value)} className="px-3 py-1 rounded-lg border bg-background text-foreground" />
                      <button onClick={() => {
                        setGroups((prev) => prev.map(g => g.id === activeGroup.id ? { ...g, name: editingGroupName || g.name } : g));
                        setEditingGroupId(null);
                        setEditingGroupName('');
                        toast.success('Group name updated');
                      }} className="p-1 text-green-600"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setEditingGroupId(null); setEditingGroupName(''); }} className="p-1 text-muted-foreground"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-red-700 dark:text-red-300">{activeGroup.name}</h3>
                      <button onClick={() => { setEditingGroupId(activeGroup.id); setEditingGroupName(activeGroup.name); }} className="p-1 text-muted-foreground" title="Edit group name"><Edit className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                {activeGroupArticles.map((a) => {
                  const isActive = a.id === activeArticleId;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setActiveArticleId(a.id)}
                      className={`text-[10px] font-medium rounded-full px-2.5 py-1 flex items-center gap-1.5 transition-all cursor-pointer border ${isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold scale-105'
                          : 'bg-card text-foreground border-border hover:bg-muted'
                        }`}
                    >
                      <FileText className={`w-3 h-3 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                      {a.title.substring(0, 40)}{a.title.length > 40 ? '…' : ''}
                    </button>
                  );
                })}
                <span className="text-[10px] text-muted-foreground ml-auto">{messages.length} message{messages.length === 1 ? '' : 's'}</span>
              </div>
            )}
            {!activeGroup && (
              <div className="px-5 py-1.5 border-b border-border bg-muted/30 flex justify-end">
                <span className="text-[10px] text-muted-foreground">{messages.length} message{messages.length === 1 ? '' : 's'}</span>
              </div>
            )}

            {/* Create group modal */}
            {isCreatingGroup && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 border border-border">
                  <h3 className="font-bold text-foreground mb-4">Create New Group</h3>
                  <input
                    type="text"
                    placeholder="Group name..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4 bg-background text-foreground"
                    autoFocus
                  />
                  <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Select Articles</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                    {allArticles.map((a) => {
                      const sel = groupArticleSelection.has(a.id);
                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            const next = new Set(groupArticleSelection);
                            if (sel) next.delete(a.id); else next.add(a.id);
                            setGroupArticleSelection(next);
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm bg-muted/50 hover:bg-muted rounded-lg flex items-center gap-2 transition-colors text-foreground border border-border"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${sel ? 'bg-blue-500 border-blue-500' : 'border-slate-500 bg-card'}`}>
                            {sel && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                          </div>
                          <span className="flex-1 truncate text-xs font-medium">{a.title}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={createGroup}
                      disabled={!newGroupName.trim() || groupArticleSelection.size === 0}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => { setIsCreatingGroup(false); setNewGroupName(''); setGroupArticleSelection(new Set()); }}
                      className="px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-background dark:bg-gradient-to-b dark:from-slate-900/40 dark:via-background dark:to-background">
              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-4 mb-8">
                  <div className="flex justify-end group">
                    <div className="max-w-[80%] p-4 rounded-2xl rounded-tr-none border border-red-500/30 bg-red-50 dark:bg-red-950/30 backdrop-blur-md shadow-sm dark:shadow-lg">
                      <p className="text-sm leading-relaxed text-foreground">{msg.question}</p>
                    </div>
                  </div>
                  {msg.answer && (
                    <div className="flex justify-start">
                      <div className="max-w-[90%] flex items-start gap-4">
                        <div className="w-9 h-9 bg-muted border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                          <Sparkles className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.answer}</p>
                            {msg.sources && (
                              <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Sources</p>
                                <div className="flex flex-wrap gap-2">
                                  {msg.sources.map((source, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-bold rounded border border-border flex items-center gap-1.5">
                                      <FileText className="w-2.5 h-2.5" />
                                      {source}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-muted-foreground px-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            <div className="px-5 py-4 bg-card/90 backdrop-blur-md border-t border-border">
              <div className="max-w-4xl mx-auto flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Ask about methodology, findings, or gaps..."
                  className="flex-1 px-5 py-3 text-sm bg-muted/40 dark:bg-slate-800/40 border border-border dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-500 outline-none text-foreground placeholder:text-muted-foreground transition-all shadow-inner"
                />
                <button
                  onClick={send}
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-30 disabled:hover:shadow-none transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
