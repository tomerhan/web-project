import { useState } from 'react';
import { Plus, X, Settings2, Sparkles, Trash2, Send, Lightbulb, BookOpen } from 'lucide-react';

interface GuidingQuestionsPanelProps {
  questions: string[];
  setQuestions: (q: string[]) => void;
  instruction: string;
  setInstruction: (i: string) => void;
  onClose: () => void;
}

export default function GuidingQuestionsPanel({
  questions, setQuestions, instruction, setInstruction, onClose
}: GuidingQuestionsPanelProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  // Practice Q&A — student asks, gets mock guided answer to build knowledge before main chat
  const [practiceQ, setPracticeQ] = useState('');
  const [practiceLog, setPracticeLog] = useState<{ q: string; a: string; guide: string[] }[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(false);

  const askPractice = () => {
    const q = practiceQ.trim();
    if (!q) return;
    setPracticeLoading(true);
    setTimeout(() => {
      const a = `Practice answer for: "${q}". Key idea: focus on the methodology section first, then compare results against the abstract's claims.`;
      const guide = [
        'What problem does the paper define?',
        'Which methods were used to validate it?',
        'How would you challenge a weak result?',
      ];
      setPracticeLog((prev) => [{ q, a, guide }, ...prev]);
      setPracticeQ('');
      setPracticeLoading(false);
    }, 700);
  };

  const handleAdd = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
      setIsAdding(false);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="w-80 lg:w-96 bg-card border-l border-border flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 overflow-hidden absolute right-0 top-0">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
        <h2 className="font-bold text-foreground flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5 text-slate-600" />
          Guiding Questions
        </h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8">
        
        {/* Questions List */}
        <div>
          <div className="flex flex-col gap-3 mb-4">
            {questions.map((q, idx) => (
              <div key={idx} className="group p-3.5 bg-card rounded-xl border border-border shadow-sm relative">
                <div className="text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Question {idx + 1}</div>
                <p className="text-sm text-foreground pr-6 leading-relaxed">{q}</p>
                <button 
                  onClick={() => removeQuestion(idx)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-gray-600 hover:bg-gray-50 transition-all bg-card rounded-md p-1.5 shadow-sm border border-border flex items-center justify-center"
                  title="Delete question"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            ))}
          </div>

          {isAdding ? (
            <div className="p-3.5 bg-card border border-gray-300 rounded-xl shadow-sm ring-2 ring-gray-50">
              <textarea
                autoFocus
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question..."
                className="w-full text-sm bg-muted border border-input rounded-xl focus:bg-card focus:border-gray-400 focus:ring-4 focus:ring-gray-50 outline-none transition-all resize-none h-32 text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={!newQuestion.trim()}
                  className="text-xs bg-gray-600 text-card px-4 py-1.5 rounded-lg hover:bg-gray-700 font-semibold disabled:opacity-50 transition-colors shadow-sm shadow-gray-200"
                >
                  Add Question
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-card border border-border rounded-xl shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Add Guiding Questions</h3>
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-3.5 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:text-gray-600 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Another Question
              </button>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-muted"></div>

        {/* Practice Q&A — ask anything, get guided answer to build knowledge */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-foreground text-sm">Practice Q&amp;A</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Ask anything about your papers. Get a guided answer plus follow-up prompts to prepare you for the main chat.
          </p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={practiceQ}
              onChange={(e) => setPracticeQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askPractice()}
              placeholder="What would you like to understand?"
              className="flex-1 px-3 py-2.5 text-sm bg-muted border border-input rounded-xl focus:bg-card focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/40 outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={askPractice}
              disabled={!practiceQ.trim() || practiceLoading}
              className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Ask
            </button>
          </div>

          {practiceLoading && (
            <div className="text-xs text-muted-foreground mb-3">Thinking…</div>
          )}

          <div className="flex flex-col gap-3">
            {practiceLog.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-border">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-0.5">You asked</p>
                  <p className="text-xs text-foreground">{item.q}</p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Guided Answer</p>
                  <p className="text-xs text-foreground leading-relaxed">{item.a}</p>
                </div>
                <div className="px-3 py-2 border-t border-border bg-muted/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Follow-up prompts
                  </p>
                  <ul className="space-y-1">
                    {item.guide.map((g, j) => (
                      <li key={j} className="text-[11px] text-muted-foreground leading-snug">• {g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-muted"></div>

        {/* AI Instructions Area */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-bold text-foreground text-sm">AI Guidance & Context</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Direct the AI on how to weigh these questions. Which are most important? Provide any additional context.
          </p>
          <div className="p-4 bg-card border-t border-border">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground mb-1">
                Custom Instructions
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g., Focus primarily on Question 1. Compare methodologies deeply but keep results summary brief..."
                className="w-full p-3.5 text-sm bg-muted border border-input rounded-xl focus:bg-card focus:border-red-400 focus:ring-4 focus:ring-red-50 outline-none transition-all resize-none h-32 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}