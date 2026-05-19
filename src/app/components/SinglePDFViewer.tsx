import { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '../data/mockData';

interface SinglePDFViewerProps {
  article: Article;
  onClose: () => void;
}

export default function SinglePDFViewer({ article, onClose }: SinglePDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("1");
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isWheelLocked = useRef(false);

  const totalPages = 10;

  // Sync the input field with the current page whenever it changes via scroll or buttons
  useEffect(() => {
    setPageInputValue(String(currentPage + 1));
  }, [currentPage]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleNext = () => {
    setCurrentPage(p => Math.min(totalPages - 1, p + 1));
    scrollToTop();
  };

  const handlePrev = () => {
    setCurrentPage(p => Math.max(0, p - 1));
    scrollToTop();
  };

  // Handle direct page typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setPageInputValue(val);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let newPage = parseInt(pageInputValue, 10);
      if (isNaN(newPage) || newPage < 1) newPage = 1;
      if (newPage > totalPages) newPage = totalPages;
      
      setCurrentPage(newPage - 1);
      setPageInputValue(String(newPage));
      scrollToTop();
    }
  };

  const handleInputBlur = () => {
    setPageInputValue(String(currentPage + 1));
  };

  const lockWheel = () => {
    isWheelLocked.current = true;
    setTimeout(() => {
      isWheelLocked.current = false;
    }, 400); 
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isWheelLocked.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 1;
    const isAtTop = container.scrollTop === 0;

    if (e.deltaY > 0 && isAtBottom && currentPage < totalPages - 1) {
      handleNext();
      lockWheel();
    } 
    else if (e.deltaY < 0 && isAtTop && currentPage > 0) {
      handlePrev();
      lockWheel();
    }
  };

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

  const renderPdfPage = () => {
    return (
      <div className="flex-1 bg-card dark:bg-white rounded-lg overflow-hidden flex flex-col border-2 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.18)]">
        {/* Inner PDF Header */}
        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm line-clamp-1">{article.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {article.authors.join(', ')} • {article.year}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-muted-foreground/10 transition-colors text-muted-foreground hover:text-foreground"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* PDF Content Area */}
        <div 
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="p-8 md:p-12 flex-1 overflow-y-auto"
        >
          {currentPage === 0 ? (
            <div className="space-y-6">
              <div className="text-center space-y-4 mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {article.title}
                </h1>
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">
                    {article.authors.join(', ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {article.year} • Research Journal
                  </p>
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Abstract</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {article.abstract}
                </p>

                <h2 className="text-xl font-semibold mb-4 text-foreground">Key Findings</h2>
                <ul className="space-y-2 mb-8">
                  {article.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-muted-foreground">{finding}</span>
                    </li>
                  ))}
                </ul>

                <h2 className="text-xl font-semibold mb-4 text-foreground">Methodology</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {article.methodology}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Page {currentPage + 1}</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  This is page {currentPage + 1} of the research paper "{article.title}".
                  In a real implementation, this would display the actual PDF content for this page.
                </p>
                <div className="bg-muted p-6 rounded-lg border border-border/50">
                  <h3 className="font-semibold mb-3 text-foreground">Research Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.topics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-muted p-6 rounded-lg border border-border/50">
                  <h3 className="font-semibold mb-2 text-foreground">Citations</h3>
                  <p className="text-muted-foreground">
                    This paper has been cited <span className="font-semibold text-foreground">{article.citations}</span> times in academic literature.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
              <span className="font-medium text-foreground">PDF Viewer</span>
            </div>
          </div>

          {/* Interactive PDF-style Pagination */}
          <div className="flex items-center gap-1 bg-muted/30 px-2 py-1.5 rounded-md border border-border">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="p-1 rounded hover:bg-background hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 text-sm mx-2">
              <input 
                type="text"
                value={pageInputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputBlur}
                className="w-10 h-7 text-center bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm text-foreground transition-all"
                title="Type a page number and press Enter"
              />
              <span className="text-muted-foreground select-none font-mono text-sm">
                / {totalPages}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="p-1 rounded hover:bg-background hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Document Container */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden flex max-w-7xl mx-auto w-full">
          {renderPdfPage()}
        </div>
      </div>
    </div>
  );
}