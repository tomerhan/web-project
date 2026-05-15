import { useState } from 'react';
import {
  History, GitCompare, MessageSquare, BookOpen,
  Trash2, Search, Calendar, BarChart3,FileText
} from 'lucide-react';
import { mockAnalysisSessions, mockArticles } from '../data/mockData';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const TYPE_ICONS = {
  comparison: GitCompare,
  chat:        MessageSquare,
  summary:     BarChart3,
};

const TYPE_COLORS = {
  comparison: 'bg-purple-100 text-purple-700 border-purple-200',
  chat:        'bg-blue-100 text-blue-700 border-blue-200',
  summary:     'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState(mockAnalysisSessions);

  const filtered = sessions.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success('Session deleted');
  };

  const stats = {
    total:       sessions.length,
    comparisons: sessions.filter((s) => s.type === 'comparison').length,
    chats:       sessions.filter((s) => s.type === 'chat').length,
    articles:    new Set(sessions.flatMap((s) => s.articleIds)).size,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-5 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-red-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-xl">Chat History</h1>
            <p className="text-sm text-muted-foreground">Your past research sessions and analyses</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 bg-transparent">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: stats.total, icon: History, color: 'text-red-600' },
            { label: 'Comparisons',    value: stats.comparisons, icon: GitCompare, color: 'text-purple-600' },
            { label: 'Chat Sessions',  value: stats.chats,        icon: MessageSquare, color: 'text-blue-600' },
            { label: 'Articles Used',  value: stats.articles,     icon: BookOpen, color: 'text-emerald-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className={`text-2xl font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sessions by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-input rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Sessions list */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-1">No sessions found</h3>
            <p className="text-sm text-muted-foreground">Start a new research chat to create history.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Go to Research Chat
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session) => {
              const TypeIcon = TYPE_ICONS[session.type] ?? MessageSquare;
              const articles = mockArticles.filter((a) => session.articleIds.includes(a.id));
              return (
                <div
                  key={session.id}
                  className="bg-card border border-border rounded-2xl shadow-sm hover:border-red-300 hover:shadow-md transition-all group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${TYPE_COLORS[session.type]}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-foreground truncate">{session.name}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${TYPE_COLORS[session.type]}`}>
                              {session.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Calendar className="w-3.5 h-3.5" />
 {new Date(session.createdDate).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric'
                             })}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <FileText className="w-3.5 h-3.5" />
                            {articles.length} article{articles.length !== 1 && 's'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          <span>15 min · {articles.length} articles</span>
                        </div>
                        {/* </button> */}
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Resume button */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-card hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground rounded-lg text-xs font-bold transition-colors"
                      >
                        Resume Session →
                      </button>
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