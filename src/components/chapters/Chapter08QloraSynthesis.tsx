import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { calculateQloraVram } from "../../lib/lora-math";
import { Cpu, HardDrive, Zap, Server, Shield, Layers, Play } from "lucide-react";

export function Chapter08QloraSynthesis() {
  const [activePhase, setActivePhase] = useState<number>(1); // Phase 1 to 4
  const [isPagedCpu, setIsPagedCpu] = useState<boolean>(false);
  const [modelParamsB, setModelParamsB] = useState<number>(65); // LLaMA-65B

  const qloraVram = calculateQloraVram(modelParamsB, 64);

  return (
    <div className="flex flex-col w-full min-h-full p-4 lg:p-8 space-y-8 bg-white dark:bg-[#09090B] text-black dark:text-white">
      
      {/* 📖 SECTION 1: THEORY & FORMULA BANNER */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
            SECTION 1
          </span>
          <h2 className="text-xl font-bold tracking-tight">Theory & Formula Banner: QLoRA Master Synthesis</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          QLoRA enables 16-bit fine-tuning quality on a 4-bit base model without performance loss via three fundamental innovations:
        </p>

        <div className="py-3 px-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-sm">
          <BlockMath math={`h = \\text{Dequantize}\\left(W^{\\text{NF4}}_0\\right) x + \\frac{\\alpha}{r} (B \\cdot A) x`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="font-bold text-blue-600 dark:text-blue-400">1. NF4 Base Quantization</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">Information-theoretically optimal 4-bit quantile mapping for Gaussian weights.</div>
          </div>
          <div className="p-3 rounded border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20">
            <div className="font-bold text-purple-600 dark:text-purple-400">2. Double Quantization (DQ)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">Quantizes first-stage FP32 scale factors to 8-bit integers, saving 0.37 bits/param.</div>
          </div>
          <div className="p-3 rounded border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="font-bold text-emerald-600 dark:text-emerald-400">3. Paged Optimizers</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">CUDA Unified Memory pages adapter optimizer states to CPU RAM during activation spikes.</div>
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
            <h3 className="text-lg font-bold tracking-tight">Dynamic Visual Canvas: 4-Phase QLoRA Pipeline & Memory Paging</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPagedCpu(!isPagedCpu)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center gap-2 border",
                isPagedCpu
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
              )}
            >
              <HardDrive size={14} /> Paged RAM to CPU: {isPagedCpu ? "ACTIVE" : "INACTIVE"}
            </button>
          </div>
        </div>

        {/* Phase selector tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
          {[
            { phase: 1, title: "Phase 1: Storage", desc: "4-bit NF4 Base + Double Quant" },
            { phase: 2, title: "Phase 2: Dequantization", desc: "On-the-fly FP16 expansion" },
            { phase: 3, title: "Phase 3: Dual Forward", desc: "Base + LoRA adapter pass" },
            { phase: 4, title: "Phase 4: Backprop", desc: "Paged AdamW adapter updates" },
          ].map((item) => (
            <button
              key={`phase-${item.phase}`}
              onClick={() => setActivePhase(item.phase)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                activePhase === item.phase
                  ? "bg-blue-600 text-white border-blue-600 font-bold shadow-md"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
              )}
            >
              <div>{item.title}</div>
              <div className="text-[10px] opacity-80 font-normal">{item.desc}</div>
            </button>
          ))}
        </div>

        {/* Dynamic Simulator Canvas */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Hardware Memory Pool Allocation</span>
            <span>VRAM Impact: <strong className="text-emerald-600">{qloraVram.totalGbs.toFixed(1)} GB Total</strong></span>
          </div>

          {/* Interactive Memory Paging Diagram */}
          <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* GPU VRAM Box */}
            <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-500/5 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-blue-600">
                <span className="flex items-center gap-1.5"><Server size={16} /> GPU VRAM (48GB Single GPU)</span>
                <span>{qloraVram.totalGbs.toFixed(1)} GB Used</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded bg-blue-600 text-white flex justify-between font-bold">
                  <span>NF4 4-bit Base Model + DQ</span>
                  <span>{qloraVram.baseNf4Gbs.toFixed(1)} GB</span>
                </div>
                <div className="p-2 rounded bg-emerald-500 text-white flex justify-between font-bold">
                  <span>LoRA Adapters ($r=64$)</span>
                  <span>{qloraVram.adaptersGbs.toFixed(1)} GB</span>
                </div>
                {!isPagedCpu && (
                  <div className="p-2 rounded bg-purple-600 text-white flex justify-between font-bold">
                    <span>AdamW Optimizer States</span>
                    <span>{qloraVram.pagedAdamGbs.toFixed(1)} GB</span>
                  </div>
                )}
              </div>
            </div>

            {/* System CPU RAM Box */}
            <div className={cn(
              "p-4 rounded-xl border-2 transition-all space-y-3",
              isPagedCpu ? "border-purple-500 bg-purple-500/10" : "border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50"
            )}>
              <div className="flex justify-between items-center text-xs font-mono font-bold text-purple-600">
                <span className="flex items-center gap-1.5"><HardDrive size={16} /> System CPU RAM (Unified Paging)</span>
                <span>{isPagedCpu ? `${qloraVram.pagedAdamGbs.toFixed(1)} GB Paged` : "Idle"}</span>
              </div>

              <div className="text-xs font-mono text-zinc-500 leading-relaxed">
                {isPagedCpu ? (
                  <div className="p-3 rounded bg-purple-600 text-white font-bold animate-pulse">
                    ⚡ CUDA Unified Memory: Paging adapter optimizer states into System CPU RAM during activation spikes!
                  </div>
                ) : (
                  <div className="p-3 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    Click "Paged RAM to CPU" button to simulate offloading optimizer memory during peak gradient backprop!
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-zinc-200 dark:border-zinc-800 text-zinc-500">
            <span>Result: <strong>LLaMA-65B fine-tuning runs smoothly on a single 48GB GPU!</strong></span>
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
            <h3 className="text-lg font-bold tracking-tight">Step-by-Step Master Synthesis Table (LLaMA-65B Fine-Tuning)</h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span>Model Size ($N$):</span>
            <input
              type="number"
              min="7"
              max="405"
              value={modelParamsB}
              onChange={(e) => setModelParamsB(parseFloat(e.target.value) || 65)}
              className="w-20 p-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-bold text-blue-600"
            />
            <span>B Params</span>
          </div>
        </div>

        {/* Synthesis Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                <th className="p-3">Workflow Method</th>
                <th className="p-3">Base Model VRAM</th>
                <th className="p-3">Adapter VRAM</th>
                <th className="p-3">Adam States</th>
                <th className="p-3">Total VRAM</th>
                <th className="p-3">Hardware Hardware Requirement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr className="bg-red-50/40 dark:bg-red-950/20">
                <td className="p-3 font-bold text-red-600">16-bit Full FT</td>
                <td className="p-3 text-zinc-500">{(modelParamsB * 2).toFixed(1)} GB</td>
                <td className="p-3 text-zinc-500">0 GB</td>
                <td className="p-3 text-red-500 font-bold">{(modelParamsB * 8).toFixed(1)} GB</td>
                <td className="p-3 text-red-600 font-bold font-mono">&gt; 780 GB</td>
                <td className="p-3 font-bold text-red-600">❌ Multi-node GPU cluster required</td>
              </tr>
              <tr className="bg-amber-50/40 dark:bg-amber-950/20">
                <td className="p-3 font-bold text-amber-600">16-bit LoRA</td>
                <td className="p-3 text-zinc-500">{(modelParamsB * 2).toFixed(1)} GB</td>
                <td className="p-3 text-emerald-600 font-bold">0.8 GB</td>
                <td className="p-3 text-purple-600">2.4 GB</td>
                <td className="p-3 text-amber-600 font-bold">~130 GB</td>
                <td className="p-3 font-bold text-amber-600">⚠️ 2× 80GB A100 GPUs required</td>
              </tr>
              <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                <td className="p-3 font-bold text-emerald-600">QLoRA (NF4 + DQ + Paged)</td>
                <td className="p-3 text-blue-600 font-bold">{qloraVram.baseNf4Gbs.toFixed(1)} GB (NF4)</td>
                <td className="p-3 text-emerald-600 font-bold">{qloraVram.adaptersGbs.toFixed(1)} GB</td>
                <td className="p-3 text-purple-600 font-bold">{qloraVram.pagedAdamGbs.toFixed(1)} GB (Paged)</td>
                <td className="p-3 text-emerald-600 font-bold text-sm">~{qloraVram.totalGbs.toFixed(1)} GB</td>
                <td className="p-3 font-bold text-emerald-600">✅ Fits on a SINGLE 48GB GPU!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
