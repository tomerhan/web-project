import { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, Loader2, Sparkles, Lightbulb } from 'lucide-react';

/*
 * AnalysisStagesDialog
 * -------------------------------------------------------------------------
 * The fake "loading" dialog shown while an analyze/compare runs. It does NOT
 * do real work — it walks through a fixed list of stages on timers to give
 * the impression of processing, then calls onComplete(). Also rotates a
 * "Did you know?" trivia line to keep the wait interesting.
 */

interface AnalysisStagesDialogProps {
  type: 'analyze' | 'compare';   // which stage list to show
  onClose: () => void;           // user cancelled / closed early
  onComplete: () => void;        // all stages finished -> open the real result
}

const TRIVIA = [
  'The word "research" comes from Old French "recerche", meaning "to seek out again."',
  'The first peer-reviewed journal, Philosophical Transactions, was published in 1665.',
  'Albert Einstein published 4 revolutionary papers in a single year — 1905.',
  'Over 2.5 million scientific papers are published globally every year.',
  'The average academic paper has around 25–30 citations.',
  'DNA\'s double helix structure was published in Nature in April 1953.',
  'The first computer "bug" was a moth found in a Harvard Mark II in 1947.',
  'Peer review as a formal process was not widespread until the mid-20th century.',
  'The H-index measures both productivity and impact of a researcher\'s work.',
  'Open-access publishing now accounts for over 50 % of new journal articles.',
];

export default function AnalysisStagesDialog({ type, onClose, onComplete }: AnalysisStagesDialogProps) {
  const [currentStage, setCurrentStage] = useState(0);                              // index of stage in progress
  const [triviaIdx, setTriviaIdx] = useState(Math.floor(Math.random() * TRIVIA.length)); // start on a random fact
  const [triviaVisible, setTriviaVisible] = useState(true);                         // drives the fade transition

  // Pick the stage list based on mode. Compare has 4 steps, analyze has 3.
  const stages =
    type === 'compare'
      ? [
          { title: 'Extracting text',           desc: 'Reading contents of selected articles' },
          { title: 'Identifying methodologies', desc: 'Comparing research approaches' },
          { title: 'Cross-referencing findings',desc: 'Finding similarities and contradictions' },
          { title: 'Generating comparison table',desc: 'Structuring the side-by-side overview' },
        ]
      : [
          { title: 'Scanning document',    desc: 'Parsing text and visual elements' },
          { title: 'Extracting key points',desc: 'Identifying main arguments and findings' },
          { title: 'Synthesizing insights',desc: 'Applying AI models to generate summary' },
        ];

  /* Advance stages: every 1.5s bump to the next stage. Once past the last
   * stage, wait 0.8s then fire onComplete(). Timers are cleared on unmount. */
  useEffect(() => {
    if (currentStage < stages.length) {
      const t = setTimeout(() => setCurrentStage((p) => p + 1), 1500);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => onComplete(), 800);
      return () => clearTimeout(t);
    }
  }, [currentStage, stages.length, onComplete]);

  /* Rotate trivia every 3s: fade out (300ms), swap to next fact, fade in. */
  useEffect(() => {
    const interval = setInterval(() => {
      setTriviaVisible(false);
      setTimeout(() => {
        setTriviaIdx((i) => (i + 1) % TRIVIA.length);
        setTriviaVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Progress % for the ring + bar (stages done / total).
  const pct = Math.round((currentStage / stages.length) * 100);

  // Render: header -> animated SVG ring spinner -> progress bar -> stage list
  // (each row: check / spinner / empty circle) -> trivia card -> footer.
  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border">

        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-foreground">
              {type === 'compare' ? 'Comparing Documents' : 'Analyzing Document'}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Spinner */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90 animate-[spin_2s_linear_infinite]" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#fee2e2" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke="#dc2626" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34 * pct / 100} ${2 * Math.PI * 34 * (1 - pct / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
              <span>Processing…</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Stages: each row's icon/colour depends on where currentStage is
              relative to its index (done = green check, active = spinner,
              pending = dimmed empty circle). */}
          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const isCompleted = currentStage > idx;   // already passed this stage
              const isActive    = currentStage === idx;  // currently on this stage
              const isPending   = currentStage < idx;    // not reached yet
              return (
                <div
                  key={idx}
                  className={`flex gap-3 transition-opacity duration-300 ${isPending ? 'opacity-35' : 'opacity-100'}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isActive ? 'text-red-700' : 'text-slate-800'}`}>
                      {stage.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trivia */}
          <div
            className={`bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4 transition-opacity duration-300 ${triviaVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                  Did you know?
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">{TRIVIA[triviaIdx]}</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 font-medium">
            Analysis typically takes 20–40 seconds ·{' '}
            <button onClick={onClose} className="underline hover:text-slate-600">cancel</button>
          </p>
        </div>

        {currentStage >= stages.length && (
          <div className="bg-emerald-50 px-6 py-3 text-center border-t border-emerald-100">
            <p className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Analysis complete!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
