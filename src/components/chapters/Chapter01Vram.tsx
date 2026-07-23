import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { calculateVram } from "../../lib/quantization-math";
import { cn } from "../../lib/utils";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

const MODELS = [
  { label: "7B", params: 7 },
  { label: "13B", params: 13 },
  { label: "70B", params: 70 },
  { label: "405B", params: 405 },
];

const PRECISIONS = [
  { label: "FP32", bits: 32 },
  { label: "FP16", bits: 16 },
  { label: "INT8", bits: 8 },
  { label: "INT4", bits: 4 },
];

const VRAM_CAPACITIES = [24, 80, 320];

export function Chapter01Vram() {
  const [modelIdx, setModelIdx] = useState(0);
  const [precisionIdx, setPrecisionIdx] = useState(0);
  const [vramCapIdx, setVramCapIdx] = useState(1);

  const model = MODELS[modelIdx];
  const precision = PRECISIONS[precisionIdx];
  const capacity = VRAM_CAPACITIES[vramCapIdx];

  const requiredVram = calculateVram(model.params, precision.bits);
  const isOom = requiredVram > capacity;
  const heightPercent = Math.min((requiredVram / capacity) * 100, 100);

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full h-full animate-in fade-in duration-500">
      {/* Narrative Pane */}
      <section className="w-full lg:w-[420px] p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-border-main dark:border-border-dark flex flex-col gap-6 shrink-0 bg-white dark:bg-bg-dark overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-3xl font-serif leading-tight italic">Memory Bottlenecks</h2>
          <p className="text-sm text-text-muted dark:text-text-muted-dark leading-relaxed">
            The primary bottleneck in running Large Language Models isn't compute—it's memory bandwidth and VRAM capacity. Quantization allows us to fit massive models into smaller GPUs by reducing the precision of each parameter.
          </p>
        </div>
        
        <div className="p-5 bg-sidebar-bg dark:bg-[#121214] border-l-4 border-brand-blue text-[11px] leading-relaxed">
          <div className="text-text-muted dark:text-text-muted-dark mb-3 font-bold uppercase tracking-widest font-sans">Math Engine</div>
          <div className="text-[13px]">
            <BlockMath math={`\\text{Memory (GB)} = \\frac{${model.params} \\times 10^9 \\times \\frac{${precision.bits}}{8}}{10^9}`} />
          </div>
        </div>

        <div className="mt-auto space-y-6 pt-8 lg:pt-0">
          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-widest uppercase text-text-muted dark:text-text-muted-dark">Model Architecture</label>
            <div className="grid grid-cols-4 gap-2">
              {MODELS.map((m, i) => (
                <button
                  key={m.label}
                  onClick={() => setModelIdx(i)}
                  className={cn(
                    "px-2 py-2 text-xs font-mono rounded border transition-colors",
                    modelIdx === i 
                      ? "bg-text-main dark:bg-white text-white dark:text-black border-text-main dark:border-white font-bold" 
                      : "bg-white dark:bg-card-dark border-border-main dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 opacity-70"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-widest uppercase text-text-muted dark:text-text-muted-dark">Precision Target</label>
            <div className="grid grid-cols-4 gap-2">
              {PRECISIONS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setPrecisionIdx(i)}
                  className={cn(
                    "px-2 py-2 text-xs font-mono rounded border transition-colors",
                    precisionIdx === i 
                      ? "bg-text-main dark:bg-white text-white dark:text-black border-text-main dark:border-white font-bold" 
                      : "bg-white dark:bg-card-dark border-border-main dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 opacity-70"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visualizer */}
      <section className="flex-1 bg-bg-app dark:bg-bg-dark relative flex flex-col p-4 lg:p-8 overflow-y-auto">
        <div className="flex-1 border border-dashed border-[#D4D4D8] dark:border-[#3F3F46] rounded-xl flex flex-col p-6 lg:p-10 relative overflow-hidden bg-white dark:bg-[#18181B] shadow-inner min-h-[500px]">
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
             <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase text-text-muted dark:text-text-muted-dark tracking-widest">Required VRAM</div>
                <div className={cn("text-3xl font-mono", isOom ? "text-brand-crimson" : "text-brand-emerald")}>
                  {requiredVram.toFixed(2)} GB
                </div>
             </div>
             
             <div className="flex flex-col items-end space-y-2">
               <label className="text-[10px] font-bold tracking-widest uppercase text-text-muted dark:text-text-muted-dark">Available Capacity</label>
               <div className="flex gap-2">
                  {VRAM_CAPACITIES.map((cap, i) => (
                    <button
                      key={cap}
                      onClick={() => setVramCapIdx(i)}
                      className={cn(
                        "w-12 py-1 text-xs font-mono rounded border transition-colors text-center",
                        vramCapIdx === i 
                          ? "border-brand-blue bg-brand-blue/10 text-brand-blue font-bold" 
                          : "border-border-main dark:border-border-dark bg-white dark:bg-card-dark hover:bg-black/5"
                      )}
                    >
                      {cap}
                    </button>
                  ))}
               </div>
             </div>
          </div>

          <div className="flex-1 w-full relative flex items-end justify-center mt-20 mb-8">
            {/* Capacity line */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
              <div className="w-full border-t border-dashed border-border-main dark:border-[#3F3F46] relative">
                <span className="absolute -top-5 left-0 text-[10px] font-mono text-text-muted dark:text-text-muted-dark">Limit: {capacity} GB</span>
              </div>
            </div>

            <div className="w-full max-w-sm h-full relative flex items-end justify-center border-b-2 border-text-main dark:border-text-dark">
              <motion.div
                initial={false}
                animate={{ height: `${heightPercent}%` }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                className={cn(
                  "w-full mx-8 relative border-t-2 border-l-2 border-r-2 rounded-t-sm shadow-sm",
                  isOom 
                    ? "bg-brand-crimson/10 border-brand-crimson text-brand-crimson" 
                    : "bg-brand-emerald/10 border-brand-emerald text-brand-emerald"
                )}
              >
              </motion.div>

              <AnimatePresence>
                {isOom && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-1/4 w-full border-t border-dashed border-brand-crimson z-10"
                  >
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#18181B] px-2 font-mono text-[10px] font-bold text-brand-crimson whitespace-nowrap">
                      OOM (+{(requiredVram - capacity).toFixed(1)} GB)
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
