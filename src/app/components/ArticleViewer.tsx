import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, FileText, SplitSquareHorizontal } from 'lucide-react';
import { Article } from '../data/mockData';

interface ArticleViewerProps {
  articles: Article[];
  onClose: () => void;
}

export default function ArticleViewer({ articles, onClose }: ArticleViewerProps) {
  const [currentPage, setCurrentPage] = useState(0); 
  const [showAll, setShowAll] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Safety check to prevent runtime errors if articles array is empty/undefined
  if (!articles || articles.length === 0) return null;

  // Mocking 10 pages total per document
  const totalPages = 10;
  const pagePairs = Math.ceil(totalPages / 2);

  // Wrapped in useCallback to ensure stable function references for the keyboard event listener
  const handleNext = useCallback(() => {
    setCurrentPage(p => Math.min(pagePairs - 1, p + 1));
  }, [pagePairs]);

  const handlePrev = useCallback(() => {
    setCurrentPage(p => Math.max(0, p - 1));
  }, []);

  const isComparison = articles.length === 2;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Sync React state with the browser's native fullscreen API (handles 'Esc' key presses)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation for better UX standard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape' && showAll) {
        setShowAll(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, showAll]);

  const renderMockPdfPage = (article: Article, isLeft: boolean) => {
    const pageNum = isLeft ? currentPage * 2 + 1 : currentPage * 2 + 2;
    
    return (
      <div className="aspect-[1/1.4] bg-white rounded shadow-lg border border-slate-200 flex flex-col p-8 md:p-12 relative overflow-hidden group">
        {/* PDF Watermark / header */}
        <div className="absolute top-4 right-6 text-[8px] text-slate-300 font-mono">
          {article.authors[0]} et al. / Research Journal
        </div>

        <div className="flex-1">
          {currentPage === 0 && isLeft ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-tight font-serif">
                  {article.title}
                </h1>
                <p className="text-sm md:text-base text-slate-600 font-serif italic">
                  {article.authors.join(', ')}
                </p>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                <h3 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Abstract</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-serif text-justify">
                  {article.abstract}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <div className="w-full h-3 bg-slate-200 rounded"></div>
                <div className="w-full h-3 bg-slate-100 rounded"></div>
                <div className="w-5/6 h-3 bg-slate-100 rounded"></div>
              </div>
            </div>
          ) : currentPage === 0 && !isLeft ? (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 mb-4 text-lg font-serif">1. Introduction</h3>
              <div className="space-y-3 mb-8">
                <div className="w-full h-3 bg-slate-200 rounded"></div>
                <div className="w-full h-3 bg-slate-200 rounded"></div>
                <div className="w-full h-3 bg-slate-200 rounded"></div>
                <div className="w-4/5 h-3 bg-slate-200 rounded"></div>
              </div>
              
              <div className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">Figure 1: Methodology Overview</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8 mt-4">
              <div className="space-y-3">
                <div className="w-1/2 h-5 bg-slate-200 rounded mb-4"></div>
                <div className="w-full h-3 bg-slate-100 rounded"></div>
                <div className="w-full h-3 bg-slate-100 rounded"></div>
                <div className="w-full h-3 bg-slate-100 rounded"></div>
                <div className="w-11/12 h-3 bg-slate-100 rounded"></div>
              </div>
              
              <div className="space-y-3">
                <div className="w-full h-3 bg-slate-100 rounded"></div>
                <div className="w-full h-3 bg-slate-100 rounded"></div>
                <div className="w-3/4 h-3 bg-slate-100 rounded"></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center text-xs font-mono text-slate-400 pt-6 border-t border-slate-100 mt-auto">
          - {pageNum} -
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 backdrop-blur-md z-50 transition-colors duration-300 ${isFullscreen ? 'bg-slate-900' : 'bg-slate-900/80 p-4 lg:p-8'}`}>
      <div className={`bg-white w-full flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${isFullscreen ? 'h-screen rounded-none' : 'h-[90vh] rounded-2xl max-w-[90vw] mx-auto my-auto'}`}>
        
        {/* Header Toolbar */}
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-400" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">
                  {isComparison ? 'Comparison View' : 'Document Viewer'}
                </span>
                <span className="font-bold text-sm truncate max-w-[200px] md:max-w-md">
                  {isComparison ? 'Multiple PDFs' : articles[0].title}
                </span>
              </div>
            </div>
            
            {isComparison && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-lg border border-slate-600">
                <SplitSquareHorizontal className="w-4 h-4 text-slate-300" />
                <span className="text-xs font-medium text-slate-300">Side-by-Side</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!showAll && (
              <div className="hidden md:flex items-center bg-slate-700 rounded-lg p-1 mr-2 border border-slate-600">
                <button 
                  onClick={handlePrev} 
                  disabled={currentPage === 0}
                  aria-label="Previous Page"
                  className="p-1.5 rounded hover:bg-slate-600 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-3 border-x border-slate-600">
                  {currentPage * 2 + 1}-{currentPage * 2 + 2} / {totalPages}
                </span>
                <button 
                  onClick={handleNext}
                  disabled={currentPage >= pagePairs - 1}
                  aria-label="Next Page"
                  className="p-1.5 rounded hover:bg-slate-600 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => setShowAll(!showAll)}
              aria-label={showAll ? "Switch to Focus View" : "Switch to Grid View"}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
            >
              {showAll ? (
                <><Minimize2 className="w-4 h-4" /> <span className="hidden md:inline">Focus</span></>
              ) : (
                <><Maximize2 className="w-4 h-4" /> <span className="hidden md:inline">Grid</span></>
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors hidden md:block"
              title="Toggle Fullscreen"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <div className="w-px h-6 bg-slate-600 mx-1"></div>

            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(err => console.error(err));
                }
                onClose();
              }}
              aria-label="Close Viewer"
              className="p-1.5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div 
          className="flex-1 bg-slate-300 p-4 md:p-8 relative overflow-y-scroll overflow-x-hidden"
          style={{ 
            height: 'calc(90vh - 60px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#6b7280 #f1f5f9'
          }}
        >
          
          {showAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl mx-auto py-4 min-h-[150vh]">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div key={`page-grid-${i}`} className="aspect-[1/1.4] bg-white rounded shadow-sm border border-slate-200 flex flex-col p-6 cursor-pointer hover:ring-4 ring-red-400/50 transition-all" onClick={() => {
                  setCurrentPage(Math.floor(i / 2));
                  setShowAll(false);
                }}>
                  <div className="flex-1 opacity-50">
                    <div className="w-1/3 h-2 bg-slate-300 rounded mb-3"></div>
                    <div className="w-full h-1 bg-slate-200 rounded mb-1.5"></div>
                    <div className="w-full h-1 bg-slate-200 rounded mb-1.5"></div>
                    <div className="w-5/6 h-1 bg-slate-200 rounded mb-4"></div>
                    
                    {i === 0 && (
                      <div className="mt-4 border-l-2 border-red-200 pl-2 py-1 mb-4 bg-red-50">
                        <div className="w-full h-1 bg-slate-300 rounded mb-1"></div>
                        <div className="w-2/3 h-1 bg-slate-300 rounded"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    Page {i + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-[1400px] mx-auto h-full">
              
              {/* Mobile controls top */}
              <div className="flex md:hidden items-center justify-between w-full bg-white p-2 rounded-lg shadow-sm">
                <button onClick={handlePrev} disabled={currentPage === 0} aria-label="Previous Page" className="p-2 disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button>
                <span className="text-xs font-mono font-bold">{currentPage * 2 + 1} / {totalPages}</span>
                <button onClick={handleNext} disabled={currentPage >= pagePairs - 1} aria-label="Next Page" className="p-2 disabled:opacity-30"><ChevronRight className="w-5 h-5"/></button>
              </div>

              {isComparison ? (
                // Comparison View: Show left page of Article 1, and left page of Article 2 side-by-side
                <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 w-full max-h-full px-4 lg:px-0">
                  <div className="flex flex-col flex-1 min-h-[500px] lg:h-full">
                    <div className="bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-t-xl text-center truncate" title={articles[0].title}>
                      {articles[0].title}
                    </div>
                    <div className="flex-1 overflow-hidden shadow-2xl rounded-b-xl border border-slate-300">
                      {renderMockPdfPage(articles[0], true)}
                    </div>
                  </div>

                  {articles[1] && (
                    <div className="flex flex-col flex-1 min-h-[500px] lg:h-full">
                      <div className="bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-t-xl text-center truncate" title={articles[1].title}>
                        {articles[1].title}
                      </div>
                      <div className="flex-1 overflow-hidden shadow-2xl rounded-b-xl border border-slate-300">
                        {renderMockPdfPage(articles[1], true)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Single View: Show Left and Right pages of Article 1
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 w-full max-h-full">
                  <div className="flex-1 overflow-hidden shadow-2xl rounded-xl border border-slate-300">
                    {renderMockPdfPage(articles[0], true)}
                  </div>
                  
                  <div className="flex-1 overflow-hidden shadow-2xl rounded-xl border border-slate-300 hidden lg:block">
                    {renderMockPdfPage(articles[0], false)}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}