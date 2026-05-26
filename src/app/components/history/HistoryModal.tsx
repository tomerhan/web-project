import { X, Clock, FileText, ChevronRight } from 'lucide-react';
import { ChatMessage, Article } from '../../data/mockData';

interface HistoryModalProps {
  onClose: () => void;
  messages: ChatMessage[];
  selectedArticles: Article[];
}

export default function HistoryModal({ onClose, messages, selectedArticles }: HistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="bg-muted border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-red-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Analysis History & Statistics</h2>
              <p className="text-xs text-muted-foreground">Review past queries and AI responses</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/50">
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Queries</span>
              <span className="text-2xl font-bold text-foreground">{messages.length}</span>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Articles Analyzed</span>
              <span className="text-2xl font-bold text-foreground">{selectedArticles.length}</span>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Time Saved</span>
              <span className="text-2xl font-bold text-green-600">~{messages.length * 45}m</span>
            </div>
          </div>

          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Query Log
          </h3>

          {messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground font-medium">No history recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">{msg.timestamp}</span>
                      <p className="text-sm font-bold text-foreground">{msg.content}</p>
                    </div>
                  </div>
                  <div className="pl-4 border-l-2 border-border">
                    <p className="text-sm text-muted-foreground line-clamp-2">{msg.response}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}