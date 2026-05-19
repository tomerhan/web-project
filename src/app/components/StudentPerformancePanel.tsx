import { useMemo } from 'react';
import { Activity, BookOpen, Layers, MessageSquare, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend
} from 'recharts';
import { Article, ChatMessage } from '../data/mockData';

interface Props {
  studentName: string;
  articles: Article[];
  messages: ChatMessage[];
  analyzedIds: Set<string>;
  perArticleComprehension: Record<string, number>;
}

export default function StudentPerformancePanel({
  studentName, articles, messages, analyzedIds, perArticleComprehension,
}: Props) {
  // Metrics
  const totalQuestions = messages.length;
  const analyzedCount = analyzedIds.size;
  const analyzedArticles = articles.filter(a => analyzedIds.has(a.id));
  const avgComprehension = analyzedArticles.length === 0
    ? 0
    : Math.round(
        analyzedArticles.reduce((s, a) => s + (perArticleComprehension[a.id] || 0), 0)
          / analyzedArticles.length
      );

  // Per-article comprehension bar data
  const articleData = useMemo(
    () => articles.map((a, i) => ({
      name: `P${i + 1}`,
      title: a.title.substring(0, 40),
      comprehension: perArticleComprehension[a.id] || 0,
      questions: messages.filter(m => m.articleId === a.id).length,
    })),
    [articles, messages, perArticleComprehension]
  );

  // Topic coverage radar
  const topicCoverage = useMemo(() => {
    const topicMap: Record<string, { total: number; engaged: number }> = {};
    articles.forEach(a => {
      a.topics.forEach(t => {
        topicMap[t] ??= { total: 0, engaged: 0 };
        topicMap[t].total += 1;
        if (messages.some(m => m.articleId === a.id)) topicMap[t].engaged += 1;
      });
    });
    return Object.entries(topicMap)
      .slice(0, 6)
      .map(([topic, v]) => ({
        topic,
        score: v.total === 0 ? 0 : Math.round((v.engaged / v.total) * 100),
      }));
  }, [articles, messages]);

  // Activity timeline (questions per day, last 7 days)
  const activity = useMemo(() => {
    const days: { day: string; questions: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const count = messages.filter(m => m.timestamp?.slice(0, 10) === key).length;
      days.push({ day: label, questions: count });
    }
    return days;
  }, [messages]);

  const stats = [
    { label: 'Avg Comprehension', value: `${avgComprehension}%`, icon: TrendingUp, accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
    { label: 'Questions Asked', value: totalQuestions, icon: MessageSquare, accent: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Papers Analyzed', value: analyzedCount, icon: BookOpen, accent: 'text-red-600 bg-red-50 dark:bg-red-900/30' },
    { label: 'Topics Engaged', value: topicCoverage.filter(t => t.score > 0).length, icon: Layers, accent: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  ];

  return (
    <section className="bg-card border border-border rounded-2xl shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-foreground">{studentName} — Performance</h2>
          <p className="text-xs text-muted-foreground">Comprehension, engagement, and topic coverage from chat activity</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="p-4 rounded-xl bg-muted border border-border">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${accent}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-muted/40 border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Comprehension per Paper</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={articleData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number, _n, p: any) => [`${v}%`, p.payload.title]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="comprehension" fill="#dc2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-muted/40 border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Topic Coverage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={topicCoverage}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Engagement" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-muted/40 border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Last 7 Days Activity</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={activity} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="questions" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
