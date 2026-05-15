import { useState } from 'react';
import { Outlet } from 'react-router';
import { Menu, FileText } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex-1 flex w-full h-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 1. Sidebar - Fixed height via Parent */}
      <Sidebar
        mobileSidebarOpen={mobileSidebarOpen}
        onMobileSidebarClose={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border shrink-0 z-10">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground">ResearchAI</span>
        </div>

        {/* CRITICAL: The Outlet container must be flex-1 and min-h-0 
            to allow child components to calculate their own scrollable height.
        */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}