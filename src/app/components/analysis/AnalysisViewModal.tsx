import { X, Download, Eye } from 'lucide-react';
import { SavedAnalysis } from '../../data/mockData';

/*
 * AnalysisViewModal
 * -------------------------------------------------------------------------
 * Read-only viewer for a single already-saved analysis. Shows the prompt,
 * the result text, an optional comparison block, and any extracted questions.
 * The only action is Download, which builds a plain-text file in the browser.
 */

interface AnalysisViewModalProps {
  analysis: SavedAnalysis;   // the saved record to display
  onClose: () => void;
}

export default function AnalysisViewModal({ analysis, onClose }: AnalysisViewModalProps) {
  // Build a Markdown-ish text document from the analysis fields and trigger a
  // client-side download via a temporary <a> + object URL (no server needed).
  const handleDownload = () => {
    const content = `
# ${analysis.name}

## Article: ${analysis.articleTitle}

## Analysis Type: ${analysis.analysisType.toUpperCase()}

## Prompt:
${analysis.prompt}

## Analysis Result:
${analysis.result}

${analysis.comparison ? `## Comparison:
${analysis.comparison}` : ''}

${analysis.questionsFromPrompt && analysis.questionsFromPrompt.length > 0 ? `## Questions from Prompt:
${analysis.questionsFromPrompt.map((q, i) => `${i + 1}. ${q}`).join('\n')}` : ''}

## Created: ${new Date(analysis.createdAt).toLocaleDateString()}
    `.trim();

    // Wrap text in a Blob, make a temporary download link, click it, clean up.
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.name.replace(/\s+/g, '_')}_analysis.txt`; // spaces -> underscores
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);   // release the blob URL to avoid a memory leak
  };

  // Render: header -> scrollable body (article info, prompt, result, optional
  // comparison, optional numbered questions) -> footer with Download button.
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">{analysis.name}</h2>
              <p className="text-xs text-muted-foreground">View Only</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {/* Article Info */}
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium text-foreground">{analysis.articleTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(analysis.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Prompt */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Prompt</h3>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-foreground leading-relaxed">{analysis.prompt}</p>
              </div>
            </div>

            {/* Analysis Result */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Analysis Result</h3>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {analysis.result}
                </div>
              </div>
            </div>

            {/* Comparison */}
            {analysis.comparison && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Comparison</h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">{analysis.comparison}</p>
                </div>
              </div>
            )}

            {/* Questions from Prompt */}
            {analysis.questionsFromPrompt && analysis.questionsFromPrompt.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2">Questions from Prompt</h3>
                <div className="bg-muted rounded-lg p-4">
                  <ul className="space-y-2">
                    {analysis.questionsFromPrompt.map((question, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>View Only Mode</span>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
