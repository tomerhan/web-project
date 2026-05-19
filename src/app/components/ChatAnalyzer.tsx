import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Sparkles, FileText, MessageSquare, MoreVertical, BookmarkPlus, Check } from 'lucide-react';
import { ChatMessage, mockArticles, mockChatHistory } from '../data/mockData';
import { toast } from 'sonner';

interface ArticleGroup {
  id: string;
  name: string;
  articleIds: string[];
}

export default function ChatAnalyzer() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Article groups — restored from original chat container
  const [groups, setGroups] = useState<ArticleGroup[]>([
    { id: 'g1', name: 'AI & NLP Research', articleIds: mockArticles.slice(0, 3).map(a => a.id) },
    { id: 'g2', name: 'Climate & Energy', articleIds: mockArticles.slice(3, 5).map(a => a.id) },
  ]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showStatsMenu, setShowStatsMenu] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupArticleSelection, setGroupArticleSelection] = useState<Set<string>>(new Set());

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const activeGroupArticles = activeGroup
    ? mockArticles.filter(a => activeGroup.articleIds.includes(a.id))
    : [];

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

  // Demo override — when an analyze completes elsewhere, force the bar to 100% so the celebration effect is visible
  const [demoForce100, setDemoForce100] = useState<boolean>(() => {
    try { return localStorage.getItem('demo-comprehension-100') === '1'; } catch { return false; }
  });
  useEffect(() => {
    const onForce = () => setDemoForce100(true);
    window.addEventListener('comprehension-demo-100', onForce);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'demo-comprehension-100' && e.newValue === '1') setDemoForce100(true);
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('comprehension-demo-100', onForce);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const comprehensionPercent = useMemo(
    () => (demoForce100 ? 100 : Math.min(100, messages.length * 12)),
    [messages.length, demoForce100]
  );

  // Celebration toast once at 100%
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

  const send = () => {
    const text = inputMessage.trim();
    if (!text) return;
    const articleId = mockArticles[0]?.id ?? '1';
    const newMsg: ChatMessage = {
      id: `c${Date.now()}`,
      articleId,
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

    setTimeout(() => {
      const reply = 'Based on the analyzed material, the methodology relies on cross-validation across multiple datasets while the results emphasize statistical significance over raw effect size.';
      setMessages((p) => p.map((m) => (m.id === newMsg.id ? { ...m, answer: reply, sources: ['Methodology', 'Results'] } : m)));
      setIsTyping(false);
      setTimeout(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    }, 1500);
  };

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
      </header>

      <div className="flex-1 flex overflow-hidden bg-muted min-h-0">
        {/* Left bar — comprehension % with 100% celebration */}
        <aside className={`w-16 shrink-0 flex flex-col items-center gap-3 py-6 border-r border-border relative overflow-hidden transition-colors duration-500 ${
          comprehensionPercent === 100
            ? 'bg-gradient-to-b from-red-50 via-card to-card dark:from-red-950/40 dark:via-card dark:to-card'
            : 'bg-card'
        }`}>
          {comprehensionPercent === 100 && (
            <>
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-base animate-bounce" aria-hidden>🏆</span>
              <span className="pointer-events-none absolute inset-0 ring-2 ring-red-500/60 animate-pulse" aria-hidden />
              <span className="pointer-events-none absolute top-6 left-2 w-1 h-1 rounded-full bg-red-400 animate-ping" aria-hidden />
              <span className="pointer-events-none absolute top-12 right-2 w-1 h-1 rounded-full bg-red-500 animate-ping [animation-delay:0.3s]" aria-hidden />
              <span className="pointer-events-none absolute top-24 left-3 w-1.5 h-1.5 rounded-full bg-red-300 animate-ping [animation-delay:0.6s]" aria-hidden />
              <span className="pointer-events-none absolute bottom-10 right-2 w-1 h-1 rounded-full bg-red-400 animate-ping [animation-delay:0.9s]" aria-hidden />
              <span className="pointer-events-none absolute bottom-20 left-2 w-1 h-1 rounded-full bg-red-500 animate-ping [animation-delay:1.2s]" aria-hidden />
            </>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wide relative ${
            comprehensionPercent === 100 ? 'text-red-600 dark:text-red-300 mt-5' : 'text-muted-foreground'
          }`}>הבנה</span>
          <span className={`text-sm font-bold tabular-nums relative ${
            comprehensionPercent === 100 ? 'text-red-600 dark:text-red-300 text-base' : 'text-foreground'
          }`}>{comprehensionPercent}%</span>
          <div className={`relative w-3 flex-1 rounded-full overflow-hidden border ${
            comprehensionPercent === 100
              ? 'bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-700 shadow-[0_0_12px_rgba(220,38,38,0.6)]'
              : 'bg-slate-200 dark:bg-slate-800 border-border'
          }`}>
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out ${
                comprehensionPercent === 100
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
          <span className={`text-[10px] relative ${
            comprehensionPercent === 100 ? 'text-red-600 dark:text-red-300 font-bold' : 'text-muted-foreground'
          }`}>{comprehensionPercent === 100 ? 'MAX!' : '0%'}</span>
        </aside>

        {/* Chat section — moved from main screen */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">
          <section className="bg-card rounded-2xl shadow-sm border border-border flex flex-col h-[500px] overflow-hidden">
            <div className="bg-card px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0 gap-4 w-full min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles className="w-5 h-5 text-slate-600" />
                <span className="font-bold text-foreground">Analysis Chat</span>
              </div>

              {/* Group tabs */}
              <div className="w-0 flex-1 overflow-x-auto overflow-y-hidden py-1 flex items-center gap-1.5 min-w-0 whitespace-nowrap">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroupId(activeGroupId === g.id ? null : g.id)}
                    className={`flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all border whitespace-nowrap ${
                      activeGroupId === g.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-card text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              {/* 3-dot menu — attach a group of articles to discuss */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowStatsMenu((v) => !v)}
                  className="p-1.5 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-lg text-foreground transition-all border border-border shadow-sm"
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
                          className={`w-full text-left flex items-center justify-between p-2 rounded-lg transition-colors ${
                            activeGroupId === g.id ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-muted'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-medium text-foreground">{g.name}</div>
                            <div className="text-xs text-muted-foreground">{g.articleIds.length} articles</div>
                          </div>
                          {activeGroupId === g.id && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active group context bar */}
            {activeGroup && (
              <div className="px-5 py-2 border-b border-border bg-blue-50/50 dark:bg-blue-950/20 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Discussing:</span>
                {activeGroupArticles.map((a) => (
                  <span key={a.id} className="text-[10px] font-medium text-foreground bg-card border border-border rounded-full px-2 py-0.5 flex items-center gap-1">
                    <FileText className="w-2.5 h-2.5 text-blue-600" />
                    {a.title.substring(0, 40)}{a.title.length > 40 ? '…' : ''}
                  </span>
                ))}
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
                    {mockArticles.map((a) => {
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
                    <div className="max-w-[80%] p-4 rounded-2xl rounded-tr-none border border-blue-500/30 bg-blue-50 dark:bg-blue-950/30 backdrop-blur-md shadow-sm dark:shadow-lg">
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
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
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
                  className="flex-1 px-5 py-3 text-sm bg-muted/40 dark:bg-slate-800/40 border border-border dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 outline-none text-foreground placeholder:text-muted-foreground transition-all shadow-inner"
                />
                <button
                  onClick={send}
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-30 disabled:hover:shadow-none transition-all flex items-center justify-center shrink-0"
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
