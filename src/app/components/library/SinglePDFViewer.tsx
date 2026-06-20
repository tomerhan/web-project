import { useState } from 'react';
import { X, Maximize2, Minimize2, FileText, ExternalLink } from 'lucide-react';
import { Article } from '../../data/mockData';

interface SinglePDFViewerProps {
  article: Article;
  onClose: () => void;
}

export default function SinglePDFViewer({ article, onClose }: SinglePDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Main Top Bar */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
                PDF Viewer - {article.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {article.pdfUrl && article.pdfUrl !== '#' && (
              <a
                href={article.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in New Tab
              </a>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* PDF Document Container */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden flex max-w-7xl mx-auto w-full h-full bg-card dark:bg-black">
          {article.pdfUrl && article.pdfUrl !== '#' ? (
            <iframe
              src={article.pdfUrl}
              className="w-full h-full border-2 border-red-500 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.18)]"
              title={article.title}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted rounded-lg border border-border">
              <FileText className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No PDF File Available</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                This article was created manually or before real PDF uploads were enabled. There is no PDF document hosted for this paper.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}