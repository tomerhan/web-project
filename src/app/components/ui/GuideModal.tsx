import React, { useState } from 'react';
import {
  X, BookOpen, MessageSquare, BarChart2, ChevronRight, UploadCloud, Search, CheckCircle2, FileText
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'library' | 'chat' | 'analyzer';

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('library');

  if (!isOpen) return null;

  const tabs: { id: TabType; icon: React.ElementType; label: string }[] = [
    { id: 'library', icon: BookOpen, label: 'Library & Upload' },
    { id: 'chat', icon: MessageSquare, label: 'Socratic Chat' },
    { id: 'analyzer', icon: BarChart2, label: 'Chat Analyzer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Welcome to ResearchAI</h2>
              <p className="text-sm text-muted-foreground">Quick Guide & Walkthrough</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-64 bg-muted border-r border-border p-4 flex flex-col gap-2 overflow-y-auto shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-medium text-sm ${
                    isActive 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-red-500'}`} />
                  {tab.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-background">
            {activeTab === 'library' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <UploadCloud className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Building Your Library</h3>
                    <p className="text-muted-foreground">Upload and manage your academic papers.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-red-600">1</div>
                    <div>
                      <h4 className="font-bold text-foreground">Upload a PDF</h4>
                      <p className="text-sm text-muted-foreground mt-1">Navigate to the <strong>Library</strong> section and click the upload button to add a new academic paper (.pdf format).</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-red-600">2</div>
                    <div>
                      <h4 className="font-bold text-foreground">Automatic Parsing</h4>
                      <p className="text-sm text-muted-foreground mt-1">The system will automatically extract the title, abstract, and text from the PDF using advanced parsing techniques.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-red-600">3</div>
                    <div>
                      <h4 className="font-bold text-foreground">Manage Library</h4>
                      <p className="text-sm text-muted-foreground mt-1">View all your uploaded papers, search through them, and prepare them for chat or deep analysis.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Socratic Chat</h3>
                    <p className="text-muted-foreground">Engage in a guided dialogue to deepen your understanding.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-card border border-border p-4 rounded-xl flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-sm text-foreground"><strong>Goal:</strong> The AI acts as a mentor, guiding you to understand the paper rather than just giving you the answers directly.</p>
                  </div>
                  
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Select a paper from the main screen to begin a chat session.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Ask questions about the methodology, results, or concepts in the paper.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>The AI will respond with probing questions (Socratic method) to help you think critically about the material.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>If you get stuck, you can ask for hints or a direct explanation.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'analyzer' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <BarChart2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Chat Analyzer</h3>
                    <p className="text-muted-foreground">Compare multiple papers and generate comprehensive reports.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <Search className="w-5 h-5 text-red-600 mb-2" />
                      <h4 className="font-bold text-foreground text-sm">Cross-Reference</h4>
                      <p className="text-xs text-muted-foreground mt-1">Select multiple papers from your library to find common themes, contradictions, and gaps.</p>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <FileText className="w-5 h-5 text-red-600 mb-2" />
                      <h4 className="font-bold text-foreground text-sm">Generate Reports</h4>
                      <p className="text-xs text-muted-foreground mt-1">Create detailed, structured markdown reports summarizing the findings across all selected papers.</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
                    <h4 className="font-bold text-foreground text-sm mb-2">How to use:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Go to <strong>Chat Analyzer</strong> from the sidebar.</li>
                      <li>Select 2 or more papers to compare.</li>
                      <li>Click <strong>Analyze</strong> to start the process.</li>
                      <li>View the generated report in <strong>Analyzed Reports</strong>.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
