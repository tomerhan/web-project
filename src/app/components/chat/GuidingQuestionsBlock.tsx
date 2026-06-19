import { useMemo, useState } from 'react';
import { Lightbulb, Plus, Trash2, FileText, BookOpen, Sparkles } from 'lucide-react';
import { Article } from '../../data/mockData';
import { toast } from 'sonner';
import { queryPaper } from '../../services/paperService';

interface QuestionEntry {
  id: string;
  text: string;
  guide: string;
  mentioned: Article[];
  answer: string | null;
  loading: boolean;
}

interface Props {
  articles: Article[];
  selectedArticleIds?: Set<string>;
  disabled?: boolean;
  disabledReason?: string;
}

function detectArticles(text: string, articles: Article[]): Article[] {
  if (!text.trim()) return [];
  const lower = text.toLowerCase();
  return articles.filter((a) => {
    if (lower.includes(a.title.toLowerCase())) return true;
    const slug = a.title.toLowerCase().split(/\s+/).slice(0, 4).join(' ');
    if (slug.length >= 8 && lower.includes(slug)) return true;
    return a.topics.some((t) => lower.includes(t.toLowerCase()));
  });
}

export default function GuidingQuestionsBlock({ articles, selectedArticleIds, disabled, disabledReason }: Props) {
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const articleLibrary = useMemo(() => articles, [articles]);
  const hasAtLeastOne = questions.some((q) => q.text.trim().length > 0);

  const addQuestion = () => {
    if (disabled) return;
    setQuestions((prev) => [
      ...prev,
      { id: `q-${Date.now()}-${prev.length}`, text: '', guide: '', mentioned: [], answer: null, loading: false },
    ]);
  };

  const updateText = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, text, mentioned: detectArticles(text, articleLibrary), answer: null } : q
      )
    );
  };

  const updateGuide = (id: string, guide: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, guide } : q)));
  };

  const remove = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const answerQuestion = async (id: string) => {
    const q = questions.find((x) => x.id === id);
    if (!q || !q.text.trim()) return;

    let targetArticleId: string | null = null;
    if (q.mentioned.length > 0) {
      targetArticleId = q.mentioned[0].id;
    } else if (selectedArticleIds && selectedArticleIds.size > 0) {
      targetArticleId = Array.from(selectedArticleIds)[0];
    } else if (articles.length > 0) {
      targetArticleId = articles[0].id;
    }

    if (!targetArticleId) {
      toast.error('Please select or mention an article first.');
      return;
    }

    setQuestions((prev) => prev.map((x) => (x.id === id ? { ...x, loading: true } : x)));

    try {
      const answer = await queryPaper(targetArticleId, q.text, q.guide);
      setQuestions((prev) => prev.map((x) => (x.id === id ? { ...x, loading: false, answer } : x)));
    } catch (error) {
      console.error('Failed to get guiding answer:', error);
      toast.error('Failed to get answer from AI tutor.');
      setQuestions((prev) => prev.map((x) => (x.id === id ? { ...x, loading: false } : x)));
    }
  };


  return (
    <section className="bg-card rounded-2xl shadow-sm border border-border p-5 space-y-5">
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <div className="p-2.5 bg-muted border border-border rounded-xl shadow-sm shrink-0">
          <Lightbulb className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Guided Questions</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Build questions for the chat. Add an optional guide note per question for sharper understanding. At least one question is required.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {questions.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border p-6 text-center bg-muted/40">
            <p className="text-sm text-muted-foreground">No questions yet. Click + to add your first.</p>
          </div>
        )}

        {questions.map((q, idx) => (
          <article
            key={q.id}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          >
            <header className="px-4 py-2.5 bg-muted/60 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-red-600" /> Question {idx + 1}
              </span>
              <button
                onClick={() => remove(q.id)}
                className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-600 transition-colors"
                aria-label={`Remove question ${idx + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </header>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Your question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => updateText(q.id, e.target.value)}
                  disabled={disabled}
                  placeholder="Write the question to bring into the chat..."
                  className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Guide note <span className="text-muted-foreground/70 normal-case font-medium">(optional)</span>
                </label>
                <textarea
                  value={q.guide}
                  onChange={(e) => updateGuide(q.id, e.target.value)}
                  disabled={disabled}
                  placeholder="Optional: explain what you're trying to understand, edge cases to cover..."
                  className="w-full px-3 py-2.5 text-sm bg-muted/40 border border-input rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-foreground placeholder:text-muted-foreground resize-none h-20 disabled:opacity-50"
                />
              </div>

              {q.mentioned.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-red-600" /> Articles referenced in this question
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.mentioned.map((a) => (
                      <div
                        key={a.id}
                        className="bg-muted/60 border border-border rounded-xl p-3 flex items-start gap-2"
                      >
                        <FileText className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{a.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {a.authors[0]}{a.authors.length > 1 ? ' et al.' : ''} â€¢ {a.year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  onClick={() => answerQuestion(q.id)}
                  disabled={!q.text.trim() || q.loading || disabled}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {q.loading ? 'Thinkingâ€¦' : q.answer ? 'Regenerate Answer' : 'Get Answer'}
                </button>
              </div>

              {q.loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span>Generating guided answerâ€¦</span>
                </div>
              )}

              {q.answer && !q.loading && (
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-red-600" /> Guided Answer
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{q.answer}</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border">
        <button
          onClick={addQuestion}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2.5 mt-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-sm"
          aria-label="Add a question"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>

        <span className="text-xs text-muted-foreground mt-4">
          {questions.filter(q => q.text.trim()).length} question{questions.filter(q => q.text.trim()).length === 1 ? '' : 's'} ready
          {!hasAtLeastOne && questions.length > 0 && <span className="text-red-500 ml-2">â€¢ fill at least one</span>}
        </span>
      </div>

      {disabled && (
        <p className="text-xs text-muted-foreground italic">
          {disabledReason || 'Analyze a PDF first to enable guided questions'}
        </p>
      )}
    </section>
  );
}
