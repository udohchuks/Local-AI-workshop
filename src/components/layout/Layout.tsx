import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Menu, Moon, Sun, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  chapter: number;
  setChapter: (chapter: number) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const CHAPTERS = [
  "01. VRAM Bottlenecks",
  "02. Anatomy of a Bit",
  "03. Linear Mapping Theory",
  "04. Symmetric Walkthrough",
  "05. Asymmetric Walkthrough",
];

export function Layout({ children, chapter, setChapter, isDark, toggleDark }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className={cn("flex flex-col h-screen w-full font-sans overflow-hidden select-none transition-colors duration-200", isDark ? "dark bg-bg-dark text-text-dark" : "bg-bg-app text-text-main")}>
      {/* Top Navigation Header */}
      <header className="h-14 border-b border-border-main dark:border-border-dark bg-white dark:bg-bg-dark flex items-center justify-between px-6 shrink-0 transition-colors z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-8 h-8 rounded border border-border-main dark:border-border-dark flex items-center justify-center text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
          <div className="w-8 h-8 bg-text-main dark:bg-text-dark flex items-center justify-center rounded-sm ml-2">
            <div className="w-4 h-4 border-2 border-white dark:border-black rotate-45"></div>
          </div>
          <h1 className="text-sm font-bold tracking-tight uppercase hidden sm:block">A Visual Guide to Quantization</h1>
          <h1 className="text-sm font-bold tracking-tight uppercase sm:hidden">Quantization</h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-text-muted dark:text-text-muted-dark uppercase whitespace-nowrap">
              CHAPTER {(chapter + 1).toString().padStart(2, '0')} / {(CHAPTERS.length).toString().padStart(2, '0')}
            </span>
            <div className="w-32 h-1 bg-border-main dark:bg-border-dark rounded-full overflow-hidden hidden md:block">
              <div 
                className="h-full bg-text-main dark:bg-text-dark transition-all duration-300 ease-out" 
                style={{ width: `${((chapter + 1) / CHAPTERS.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-border-main dark:border-border-dark pl-6">
            <button 
              onClick={toggleDark}
              className="w-8 h-8 rounded border border-border-main dark:border-border-dark flex items-center justify-center text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Collapsible Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 top-14 z-40 bg-sidebar-bg dark:bg-sidebar-dark border-r border-border-main dark:border-border-dark p-6 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out lg:relative lg:top-0 overflow-hidden",
            isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:border-r-0 lg:opacity-0"
          )}
        >
          <nav className="space-y-1 w-52">
            <div className="text-[10px] font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-widest mb-4">Curriculum</div>
            {CHAPTERS.map((title, idx) => (
              <div
                key={idx}
                onClick={() => { setChapter(idx); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                className={cn(
                  "p-3 text-xs flex items-center gap-3 rounded cursor-pointer transition-colors",
                  chapter === idx 
                    ? "bg-white dark:bg-card-dark border border-border-main dark:border-border-dark font-bold shadow-sm" 
                    : "opacity-50 hover:opacity-100"
                )}
              >
                <span className={cn("font-mono", chapter === idx && "text-brand-blue")}>
                  {(idx + 1).toString().padStart(2, '0')}
                </span> 
                {title}
              </div>
            ))}
          </nav>

          <div className="bg-text-main dark:bg-white text-white dark:text-black p-4 rounded-lg mt-8 w-52">
            <div className="text-[10px] uppercase opacity-50 mb-1 font-mono">Real-time Memory Saving</div>
            <div className="text-2xl font-mono">-87.5%</div>
            <div className="text-[10px] opacity-70 mt-2 italic font-serif">From FP32 to INT4 precision</div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 top-14 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Stage Content */}
        <main className="flex-1 flex flex-col bg-white dark:bg-card-dark overflow-hidden transition-colors relative z-0">
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
