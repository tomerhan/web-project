import { useState } from 'react';
import { 
  User, Mail, BookOpen, MessageSquare, GitCompare, 
  Calendar, Settings, LogOut, TrendingUp, Trash2 
} from 'lucide-react';
import { mockArticles, mockChatHistory, mockAnalysisSessions } from '../../data/mockData';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  // Adding the Role to the user object
  const user = {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    institution: 'Stanford University',
    field: 'Computer Science & Artificial Intelligence',
    joinDate: '2025-09-15',
    role: 'lecturer' // We added the role here
  };

  // Using State so we can actually delete sessions
  const [recentSessions, setRecentSessions] = useState(mockAnalysisSessions);

  const deleteSession = (id: string) => {
    setRecentSessions(prev => prev.filter(session => session.id !== id));
  };

  const stats = [
    { label: 'Articles in Library', value: mockArticles.length, icon: BookOpen, color: 'emerald' },
    { label: 'Questions Asked', value: mockChatHistory.length, icon: MessageSquare, color: 'violet' },
    { label: 'Comparisons Made', value: recentSessions.filter(s => s.type === 'comparison').length, icon: GitCompare, color: 'blue' },
    { label: 'Active Days', value: 45, icon: Calendar, color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-bold text-foreground text-lg">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-300 dark:border-slate-600 rounded-md">
                      {user.role === 'lecturer' ? 'Lecturer' : 'Student'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.institution}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-2">
                <button className="w-full px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Account Settings
                </button>
                <button className="w-full px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground">Email Notifications</span>
                  <input type="checkbox" defaultChecked className="rounded accent-red-600" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground">Auto Summaries</span>
                  <input type="checkbox" defaultChecked className="rounded accent-red-600" />
                </label>
                <div className="pt-2">
                  <label className="block text-sm text-foreground mb-2">Interface Language</label>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground">
                    <option value="en">English</option>
                    <option value="he">Hebrew</option>
                    <option value="es">EspaÃ±ol</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses: Record<string, string> = {
                  emerald: 'bg-emerald-100 text-emerald-600',
                  violet: 'bg-violet-100 text-violet-600',
                  blue: 'bg-blue-100 text-blue-600',
                  green: 'bg-green-100 text-green-600'
                };

                return (
                  <div key={index} className="bg-card rounded-lg border border-border p-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[stat.color]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Recent Sessions */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {recentSessions.length > 0 ? (
                  recentSessions.map(session => (
                    <div key={session.id} className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-foreground">{session.name}</h4>
                        <p className="text-sm text-muted-foreground">{session.createdDate}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {session.duration} min Â· {session.articleIds.length} articles
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md p-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">No recent sessions found.</div>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background border border-border rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">ðŸ“š</div>
                  <div className="font-semibold text-foreground">Avid Reader</div>
                  <div className="text-xs text-muted-foreground">5+ articles in library</div>
                </div>
                <div className="bg-background border border-border rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">ðŸ’¬</div>
                  <div className="font-semibold text-foreground">Curious Mind</div>
                  <div className="text-xs text-muted-foreground">10+ questions asked</div>
                </div>
                <div className="bg-background border border-border rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">ðŸ”</div>
                  <div className="font-semibold text-foreground">Researcher</div>
                  <div className="text-xs text-muted-foreground">Multiple comparisons made</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}