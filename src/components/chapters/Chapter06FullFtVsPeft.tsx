import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { Lock, Unlock } from "lucide-react";
import { calculateFullFtVram, calculateLoraVram } from "../../lib/lora-math";

export function Chapter06FullFtVsPeft() {
  const [mode, setMode] = useState<"FullFT" | "PEFT">("FullFT");
  const [modelParamsB, setModelParamsB] = useState<number>(7); // 7B
  const [rankR, setRankR] = useState<number>(8); // r=8

  const fullFtStats = calculateFullFtVram(modelParamsB, 16); // FP16
  const loraStats = calculateLoraVram(modelParamsB, 16, (rankR * 2 * 4096) / (4096 * 4096)); // ~0.2% trainable

  const trainableParamsFull = modelParamsB * 1e9;
  const trainableParamsLora = modelParamsB * 1e9 * ((rankR * 2 * 4096) / (4096 * 4096));

  const checkpointFullGbs = (trainableParamsFull * 2) / 1e9; // FP16 checkpoint
  const checkpointLoraMbs = (trainableParamsLora * 2) / 1e6; // FP16 checkpoint in MB

  return (
    <div className="flex flex-col w-full min-h-full p-4 lg:p-8 space-y-8 bg-white dark:bg-[#09090B] text-black dark:text-white">
      
      {/* 📖 SECTION 1: THEORY & FORMULA BANNER */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
            SECTION 1
          </span>
          <h2 className="text-xl font-bold tracking-tight">Theory & Formula Banner: Full Fine-Tuning vs. PEFT Mechanics</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          <strong>Full Fine-Tuning</strong> updates every single base parameter <InlineMath math="W_0" />, requiring backpropagating gradients <InlineMath math="\nabla_{W_0}\mathcal{L}" /> and storing 8 bytes/param for FP32 Adam optimizer states. 
          <strong>PEFT (LoRA)</strong> freezes the base model parameters <InlineMath math="W_0" /> (<InlineMath math="\nabla_{W_0}\mathcal{L} = 0" />) and only updates lightweight auxiliary adapter parameters <InlineMath math="\Theta_{\text{adapter}}" />.
        </p>

        <div className="py-3 px-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-sm">
          <BlockMath math={`W_{\\text{Full FT}} = W_0 - \\eta \\cdot \\text{Adam}(\\nabla_W \\mathcal{L}) \\quad \\text{vs} \\quad W_{\\text{PEFT}} = W_0 + \\Delta W(\\Theta_{\\text{adapter}})`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
            <div className="font-bold text-red-600 dark:text-red-400">Full Fine-Tuning (Heavyweight)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">100% trainable parameters. Massive VRAM footprint and huge multi-gigabyte checkpoints.</div>
          </div>
          <div className="p-3 rounded border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="font-bold text-emerald-600 dark:text-emerald-400">PEFT / LoRA (Lightweight)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">0.1%–0.3% trainable parameters. Base model frozen, megabyte-sized adapter checkpoints.</div>
          </div>
        </div>
      </section>

      {/* 🎨 SECTION 2: DYNAMIC VISUAL CANVAS & ANIMATION */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
              SECTION 2
            </span>
            <h3 className="text-lg font-bold tracking-tight">Dynamic Visual Canvas: Computation Graph & Gradient Locking</h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={() => setMode("FullFT")}
              className={cn(
                "px-3 py-1.5 rounded border transition-all flex items-center gap-2",
                mode === "FullFT" ? "bg-red-600 text-white font-bold border-red-600" : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
              )}
            >
              <Unlock size={14} /> Full FT (Unlocked)
            </button>
            <button
              onClick={() => setMode("PEFT")}
              className={cn(
                "px-3 py-1.5 rounded border transition-all flex items-center gap-2",
                mode === "PEFT" ? "bg-emerald-600 text-white font-bold border-emerald-600" : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
              )}
            >
              <Lock size={14} /> PEFT / LoRA (Frozen Base)
            </button>
          </div>
        </div>

        {/* Computation Graph Canvas */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Input Activation <InlineMath math="x" /></span>
            <span>Gradient Flow Backpropagation (<InlineMath math="\nabla \mathcal{L}" />)</span>
          </div>

          {/* Main Graph Flow Visualization */}
          <div className="my-6 flex flex-col md:flex-row items-center justify-center gap-8 relative">
            
            {/* Base Weight Block W0 */}
            <div className={cn(
              "w-64 h-32 rounded-xl border-2 p-4 flex flex-col justify-between relative transition-all duration-500 shadow-lg",
              mode === "FullFT" 
                ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400" 
                : "bg-zinc-200/50 dark:bg-zinc-900 border-zinc-400 text-zinc-500"
            )}>
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sm">Base Weights <InlineMath math="W_0" /></span>
                {mode === "PEFT" ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-700 text-white text-[10px] font-bold">
                    <Lock size={12} /> FROZEN
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold animate-pulse">
                    <Unlock size={12} /> TRAINABLE
                  </span>
                )}
              </div>

              <div className="text-[11px] font-mono">
                {modelParamsB} Billion Parameters (<InlineMath math="d = 4096" />)
              </div>

              {/* Gradient stream overlay for Full FT */}
              {mode === "FullFT" && (
                <div className="absolute inset-0 bg-red-500/10 rounded-xl flex items-center justify-center animate-pulse pointer-events-none">
                  <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                    <InlineMath math="\nabla_{W_0}\mathcal{L}" /> Active Stream
                  </span>
                </div>
              )}
            </div>

            {/* PEFT Side Adapter Bypass Path */}
            {mode === "PEFT" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-56 h-32 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 flex flex-col justify-between shadow-lg relative"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs">LoRA Adapters (<InlineMath math="A, B" />)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                    TRAINABLE
                  </span>
                </div>

                <div className="text-[10px] font-mono space-y-0.5">
                  <div>Rank <InlineMath math={`r = ${rankR}`} /></div>
                  <div>Params: ~{((trainableParamsLora / 1e6)).toFixed(1)}M (0.2%)</div>
                </div>

                <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                  <InlineMath math="\nabla_{A,B}\mathcal{L}" /> Gradient Active
                </div>
              </motion.div>
            )}

          </div>

          <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-zinc-200 dark:border-zinc-800 text-zinc-500">
            <span>Status: <strong>{mode === "FullFT" ? "Full Backpropagation into All Base Weights" : "Base Weights Locked; Backprop only into Adapters"}</strong></span>
          </div>

        </div>
      </section>

      {/* 🔢 SECTION 3: STEP-BY-STEP NUMERICAL LAB & EDITABLE DATA TABLE */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded bg-purple-600/10 text-purple-600 dark:text-purple-400 font-mono text-xs font-bold">
              SECTION 3
            </span>
            <h3 className="text-lg font-bold tracking-tight">Step-by-Step Numerical Comparison Lab (7B Benchmark)</h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span>Model Size (<InlineMath math="N" />):</span>
              <input
                type="number"
                min="1"
                max="70"
                value={modelParamsB}
                onChange={(e) => setModelParamsB(parseFloat(e.target.value) || 1)}
                className="w-16 p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-bold text-blue-600"
              />
              <span>B</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Rank (<InlineMath math="r" />):</span>
              <input
                type="number"
                min="1"
                max="64"
                value={rankR}
                onChange={(e) => setRankR(parseInt(e.target.value) || 1)}
                className="w-16 p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-bold text-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Concrete Numerical Comparison Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                <th className="p-3">Training Strategy</th>
                <th className="p-3">Trainable Parameters</th>
                <th className="p-3">Checkpoint Size</th>
                <th className="p-3">Adam States VRAM</th>
                <th className="p-3">Total VRAM Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr className="bg-red-50/40 dark:bg-red-950/20">
                <td className="p-3 font-bold text-red-600 dark:text-red-400">Full Fine-Tuning</td>
                <td className="p-3 font-bold">{(trainableParamsFull / 1e9).toFixed(1)}B (100%)</td>
                <td className="p-3 font-bold text-red-500">{checkpointFullGbs.toFixed(1)} GB</td>
                <td className="p-3 font-bold text-purple-600">{fullFtStats.optimizerGbs.toFixed(1)} GB</td>
                <td className="p-3 font-bold text-red-600">{fullFtStats.totalGbs.toFixed(1)} GB</td>
              </tr>
              <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">LoRA (PEFT, r={rankR})</td>
                <td className="p-3 font-bold">{(trainableParamsLora / 1e6).toFixed(1)}M (~0.2%)</td>
                <td className="p-3 font-bold text-emerald-600">{checkpointLoraMbs.toFixed(1)} MB (500× smaller!)</td>
                <td className="p-3 font-bold text-purple-600">{loraStats.optimizerGbs.toFixed(3)} GB</td>
                <td className="p-3 font-bold text-emerald-600">{loraStats.totalGbs.toFixed(1)} GB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
