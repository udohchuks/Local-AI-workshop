import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Menu, Moon, Sun, X, ChevronRight, ChevronLeft } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  chapter: number;
  setChapter: (chapter: number) => void;
  isDark: boolean;
  toggleDark: () => void;
}

export const CHAPTER_LIST = [
  { id: 0, part: "PART I: QUANTIZATION", title: "01. VRAM & Memory Breakdown" },
  { id: 1, part: "PART I: QUANTIZATION", title: "02. Anatomy of a Bit & Data Types" },
  { id: 2, part: "PART I: QUANTIZATION", title: "03. Linear Mapping Theory" },
  { id: 3, part: "PART I: QUANTIZATION", title: "04. Symmetric Quantization Walkthrough" },
  { id: 4, part: "PART I: QUANTIZATION", title: "05. Asymmetric Quantization Walkthrough" },
  { id: 5, part: "PART II: FINE-TUNING & LORA", title: "06. Full Fine-Tuning vs. PEFT" },
  { id: 6, part: "PART II: FINE-TUNING & LORA", title: "07. Low-Rank Adaptation (LoRA) Walkthrough" },
  { id: 7, part: "PART II: FINE-TUNING & LORA", title: "08. QLoRA Master Synthesis" },
];

export function Layout({ children, chapter, setChapter, isDark, toggleDark }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const part1Chapters = CHAPTER_LIST.filter(c => c.part === "PART I: QUANTIZATION");
  const part2Chapters = CHAPTER_LIST.filter(c => c.part === "PART II: FINE-TUNING & LORA");

  const currentChapterObj = CHAPTER_LIST.find(c => c.id === chapter) || CHAPTER_LIST[0];

  return (
    <div className={cn("flex flex-col h-screen w-full font-sans overflow-hidden select-none transition-colors duration-200", isDark ? "dark bg-[#09090B] text-white" : "bg-[#FAFAFA] text-black")}>
      {/* Top Navigation Header */}
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] flex items-center justify-between px-4 lg:px-6 shrink-0 transition-colors z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Toggle Sidebar [≡]"
          >
            {isSidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
          <div className="w-7 h-7 bg-black dark:bg-white flex items-center justify-center rounded-sm ml-1">
            <div className="w-3.5 h-3.5 border-2 border-white dark:border-black rotate-45"></div>
          </div>
          <h1 className="text-xs sm:text-sm font-bold tracking-tight uppercase hidden md:block">
            A Visual Guide to LLM Efficiency: <span className="text-blue-600 dark:text-blue-400">Quantization, LoRA & QLoRA</span>
          </h1>
          <h1 className="text-xs font-bold tracking-tight uppercase md:hidden">
            LLM Efficiency
          </h1>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase whitespace-nowrap">
              CHAPTER {(chapter + 1).toString().padStart(2, '0')} / {(CHAPTER_LIST.length).toString().padStart(2, '0')}
            </span>
            <div className="w-24 sm:w-32 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
              <div 
                className="h-full bg-black dark:bg-white transition-all duration-300 ease-out" 
                style={{ width: `${((chapter + 1) / CHAPTER_LIST.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4 sm:pl-6">
            <button 
              onClick={toggleDark}
              className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-zinc-700" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Collapsible Categorized Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 top-14 z-40 bg-zinc-100 dark:bg-[#000000] border-r border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out lg:relative lg:top-0 overflow-y-auto",
            isSidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:border-r-0 lg:opacity-0"
          )}
        >
          <div className="space-y-6 w-full">
            <div>
              <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 font-mono">
                PART I: QUANTIZATION
              </div>
              <div className="space-y-1">
                {part1Chapters.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setChapter(item.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                    className={cn(
                      "w-full text-left p-2.5 text-xs flex items-center gap-2.5 rounded transition-all",
                      chapter === item.id 
                        ? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-black dark:text-white shadow-sm" 
                        : "opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span className={cn("font-mono text-[11px]", chapter === item.id ? "text-blue-600 dark:text-blue-400 font-bold" : "text-zinc-500")}>
                      {(item.id + 1).toString().padStart(2, '0')}
                    </span> 
                    <span className="truncate">{item.title.replace(/^\d+\.\s*/, '')}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 font-mono">
                PART II: FINE-TUNING & LORA
              </div>
              <div className="space-y-1">
                {part2Chapters.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setChapter(item.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                    className={cn(
                      "w-full text-left p-2.5 text-xs flex items-center gap-2.5 rounded transition-all",
                      chapter === item.id 
                        ? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-black dark:text-white shadow-sm" 
                        : "opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span className={cn("font-mono text-[11px]", chapter === item.id ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-500")}>
                      {(item.id + 1).toString().padStart(2, '0')}
                    </span> 
                    <span className="truncate">{item.title.replace(/^\d+\.\s*/, '')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-900 dark:bg-zinc-900 text-white p-3.5 rounded-lg border border-zinc-800">
              <div className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono">Active Chapter</div>
              <div className="text-xs font-bold mt-1 text-blue-400 truncate">{currentChapterObj.title}</div>
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 top-14 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Workspace Stage */}
        <main className="flex-1 flex flex-col bg-white dark:bg-[#09090B] overflow-hidden transition-colors relative z-0">
          <div className="flex-1 flex flex-col overflow-y-auto">
            {children}

            {/* Bottom Linear Navigation Controls */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-[#09090B] flex items-center justify-between shrink-0">
              <button
                disabled={chapter === 0}
                onClick={() => setChapter(Math.max(0, chapter - 1))}
                className={cn(
                  "p-2 rounded-full border flex items-center justify-center transition-all flex-shrink-0 min-w-[40px]",
                  chapter === 0
                    ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-zinc-800"
                    : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
                title="Previous Chapter"
              >
                <ChevronLeft size={16} />
              </button>

              

              <button
                disabled={chapter === CHAPTER_LIST.length - 1}
                onClick={() => setChapter(Math.min(CHAPTER_LIST.length - 1, chapter + 1))}
                className={cn(
                  "p-2 rounded-full border flex items-center justify-center transition-all flex-shrink-0 min-w-[40px]",
                  chapter === CHAPTER_LIST.length - 1
                    ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-zinc-800"
                    : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                )}
                title="Next Chapter"
              >
                <ChevronRight size={16} />
              </button>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
