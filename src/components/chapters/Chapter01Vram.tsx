import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { AlertTriangle, Server, HardDrive, Cpu, Layers } from "lucide-react";

const WORKFLOWS = [
  { id: "fp32_full", label: "FP32 Full FT", baseBits: 32, isFullFt: true, isLora: false, isQlora: false },
  { id: "fp16_full", label: "FP16 Full FT", baseBits: 16, isFullFt: true, isLora: false, isQlora: false },
  { id: "fp16_inf", label: "FP16 Inference", baseBits: 16, isFullFt: false, isLora: false, isQlora: false },
  { id: "lora", label: "LoRA", baseBits: 16, isFullFt: false, isLora: true, isQlora: false },
  { id: "qlora", label: "QLoRA", baseBits: 4, isFullFt: false, isLora: false, isQlora: true },
];

const HARDWARE_PRESETS = [
  { label: "16GB RTX 4090", cap: 16 },
  { label: "24GB RTX 3090/4090", cap: 24 },
  { label: "80GB A100", cap: 80 },
];

export function Chapter01Vram() {
  const [modelParamsB, setModelParamsB] = useState<number>(8); // LLaMA-3 8B
  const [workflowId, setWorkflowId] = useState<string>("fp32_full");
  const [capacity, setCapacity] = useState<number>(24); // 24GB default

  const currentWorkflow = WORKFLOWS.find(w => w.id === workflowId) || WORKFLOWS[0];

  // Calculate memory pools
  // Weights (W)
  const weightBytes = currentWorkflow.baseBits / 8;
  const weightsGbs = modelParamsB * weightBytes;

  // Gradients (grad W)
  let gradientsGbs = 0;
  if (currentWorkflow.isFullFt) {
    gradientsGbs = modelParamsB * 2; // FP16 gradients
  } else if (currentWorkflow.isLora || currentWorkflow.isQlora) {
    gradientsGbs = modelParamsB * 0.002 * 2; // ~0.2% trainable adapters in FP16
  }

  // Optimizer States (m_t, v_t)
  let optimizerGbs = 0;
  if (currentWorkflow.isFullFt) {
    optimizerGbs = modelParamsB * 8; // FP32 Adam (4B momentum + 4B variance)
  } else if (currentWorkflow.isLora) {
    optimizerGbs = modelParamsB * 0.002 * 8; // ~0.2% trainable adapters in FP32 Adam
  } else if (currentWorkflow.isQlora) {
    optimizerGbs = modelParamsB * 0.002 * 8 * 0.5; // Paged AdamW saved overhead
  }

  // Activations & KV Cache
  const kvCacheGbs = Math.max(0.5, modelParamsB * 0.1);

  const totalVram = weightsGbs + gradientsGbs + optimizerGbs + kvCacheGbs;
  const isOom = totalVram > capacity;
  const overflowGbs = totalVram - capacity;

  // Heights percentages relative to capacity (capped for visual box)
  const weightsPct = Math.min((weightsGbs / capacity) * 100, 100);
  const gradsPct = Math.min((gradientsGbs / capacity) * 100, 100);
  const optPct = Math.min((optimizerGbs / capacity) * 100, 100);
  const kvPct = Math.min((kvCacheGbs / capacity) * 100, 100);

  return (
    <div className="flex flex-col w-full min-h-full p-4 lg:p-8 space-y-8 bg-white dark:bg-[#09090B] text-black dark:text-white">
      
      {/* 📖 SECTION 1: THEORY & FORMULA BANNER */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
            SECTION 1
          </span>
          <h2 className="text-xl font-bold tracking-tight">Theory & Formula Banner: VRAM Breakdown</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          GPU Memory (VRAM) consumption in Deep Learning and LLMs is governed by four main memory pools. 
          While inference only requires storing base model weights and activations, <strong>Full Fine-Tuning</strong> demands storing gradients and full FP32 Adam optimizer states (<InlineMath math="(m_t, v_t)" />), consuming up to <strong>16× the VRAM of inference</strong>!
        </p>

        <div className="py-3 px-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-sm">
          <BlockMath math="\text{Total VRAM} = M_{\text{weights}} + M_{\text{gradients}} + M_{\text{optimizer}} + M_{\text{activations/KV}}" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">1. Weights (<InlineMath math="W" />)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">{`N × bytes/param (FP32=4B, FP16=2B, INT8=1B, INT4=0.5B)`}</div>
          </div>
          <div className="p-3 rounded border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">2. Gradients (<InlineMath math="\nabla W" />)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">Stored only for trainable parameters (FP32=4B, FP16=2B).</div>
          </div>
          <div className="p-3 rounded border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20">
            <div className="font-bold text-purple-600 dark:text-purple-400">3. Optimizer States</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">FP32 AdamW: <InlineMath math="m_t" /> (4B) + <InlineMath math="v_t" /> (4B) = <strong>8 bytes/param</strong>.</div>
          </div>
          <div className="p-3 rounded border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="font-bold text-emerald-600 dark:text-emerald-400">4. Activations & KV</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">Context window KV Cache + intermediate layer activations.</div>
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
            <h3 className="text-lg font-bold tracking-tight">Dynamic Visual Canvas: Memory Overflow & Stacked Pools</h3>
          </div>

          {/* Interactive Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-zinc-500 font-mono">Hardware Limit:</span>
            {HARDWARE_PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => setCapacity(preset.cap)}
                className={cn(
                  "px-3 py-1.5 rounded border font-mono transition-all",
                  capacity === preset.cap
                    ? "bg-blue-600 text-white border-blue-600 font-bold"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Stacked GPU Memory Canvas */}
        <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-[420px] flex flex-col justify-between overflow-hidden">
          
          {/* Top Capacity Bar Indicator */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 font-mono text-xs">
              <Server size={16} className="text-blue-500" />
              <span>Target GPU VRAM: <strong className="text-blue-600 dark:text-blue-400">{capacity} GB</strong></span>
            </div>
            
            <div className="flex items-center gap-2 font-mono text-xs">
              <span>Allocated: <strong className={cn(isOom ? "text-red-500" : "text-emerald-500")}>{totalVram.toFixed(1)} GB</strong></span>
            </div>
          </div>

          {/* Canvas Main Box */}
          <div className="relative w-full max-w-lg mx-auto h-[280px] my-4 flex items-end justify-center border-b-4 border-zinc-800 dark:border-zinc-200">
            
            {/* Dotted Capacity Line */}
            <div className="absolute inset-x-0 bottom-0 pointer-events-none border-t-2 border-dashed border-red-500/60 z-20" style={{ bottom: '100%' }}>
              <span className="absolute -top-3 right-0 bg-red-500 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                Capacity Cutoff ({capacity} GB)
              </span>
            </div>

            {/* Stacked Animated Container */}
            <div className="w-48 relative rounded-t-lg overflow-hidden flex flex-col-reverse shadow-2xl transition-all duration-500 border border-zinc-400 dark:border-zinc-600" style={{ height: `${Math.min((totalVram / capacity) * 100, 130)}%` }}>
              
              {/* Weights (Blue) */}
              <motion.div
                layout
                initial={false}
                animate={{ height: `${(weightsGbs / totalVram) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono font-bold p-1 overflow-hidden"
                title={`Weights: ${weightsGbs.toFixed(1)} GB`}
              >
                {weightsGbs > 1 && `Weights: ${weightsGbs.toFixed(1)}G`}
              </motion.div>

              {/* Gradients (Amber) */}
              {gradientsGbs > 0 && (
                <motion.div
                  layout
                  initial={false}
                  animate={{ height: `${(gradientsGbs / totalVram) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-amber-500 text-white flex items-center justify-center text-[10px] font-mono font-bold p-1 overflow-hidden border-t border-amber-400"
                  title={`Gradients: ${gradientsGbs.toFixed(1)} GB`}
                >
                  {gradientsGbs > 0.5 && `Grads: ${gradientsGbs.toFixed(1)}G`}
                </motion.div>
              )}

              {/* Adam Optimizer (Purple) */}
              {optimizerGbs > 0 && (
                <motion.div
                  layout
                  initial={false}
                  animate={{ height: `${(optimizerGbs / totalVram) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-purple-600 text-white flex items-center justify-center text-[10px] font-mono font-bold p-1 overflow-hidden border-t border-purple-400"
                  title={`Adam States: ${optimizerGbs.toFixed(1)} GB`}
                >
                  {optimizerGbs > 1 && `Adam: ${optimizerGbs.toFixed(1)}G`}
                </motion.div>
              )}

              {/* KV Cache / Activations (Emerald) */}
              <motion.div
                layout
                initial={false}
                animate={{ height: `${(kvCacheGbs / totalVram) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="bg-emerald-500 text-white flex items-center justify-center text-[10px] font-mono font-bold p-1 overflow-hidden border-t border-emerald-400"
                title={`KV Cache: ${kvCacheGbs.toFixed(1)} GB`}
              >
                {kvCacheGbs > 0.3 && `KV: ${kvCacheGbs.toFixed(1)}G`}
              </motion.div>

            </div>

            {/* Pulsing OOM Overlay tag when totalVram > capacity */}
            <AnimatePresence>
              {isOom && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute -top-12 inset-x-0 flex justify-center z-30 pointer-events-none"
                >
                  <div className="bg-red-600 text-white px-4 py-2 rounded-full font-mono text-xs font-bold shadow-lg flex items-center gap-2 animate-pulse border-2 border-white dark:border-black">
                    <AlertTriangle size={16} />
                    <span>[ ⚠️ OUT OF MEMORY: OVERFLOW +{overflowGbs.toFixed(1)} GB ]</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-600"></div>
              <span>Weights (W)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500"></div>
              <span>Gradients (∇W)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-purple-600"></div>
              <span>Adam States (m_t, v_t)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500"></div>
              <span>KV Cache / Activations</span>
            </div>
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
            <h3 className="text-lg font-bold tracking-tight">Step-by-Step Numerical Lab (LLaMA-3 Benchmark Table)</h3>
          </div>

          {/* Model Size Slider */}
          <div className="flex items-center gap-3 text-xs font-mono bg-white dark:bg-black p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <span>Model Size (N): <strong className="text-blue-600 dark:text-blue-400">{modelParamsB}B Params</strong></span>
            <input
              type="range"
              min="1"
              max="70"
              value={modelParamsB}
              onChange={(e) => setModelParamsB(parseFloat(e.target.value))}
              className="w-32 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Worked Numerical Calculations Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                <th className="p-3">Workflow Mode</th>
                <th className="p-3">Base Precision</th>
                <th className="p-3">Weights (W)</th>
                <th className="p-3">Gradients (∇W)</th>
                <th className="p-3">Adam States (m_t, v_t)</th>
                <th className="p-3">Total VRAM</th>
                <th className="p-3">Fits on {capacity}GB GPU?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {WORKFLOWS.map((wf) => {
                const wGbs = modelParamsB * (wf.baseBits / 8);
                const gGbs = wf.isFullFt ? modelParamsB * 2 : (wf.isLora || wf.isQlora ? modelParamsB * 0.002 * 2 : 0);
                const oGbs = wf.isFullFt ? modelParamsB * 8 : (wf.isLora ? modelParamsB * 0.002 * 8 : (wf.isQlora ? modelParamsB * 0.002 * 4 : 0));
                const totGbs = wGbs + gGbs + oGbs + Math.max(0.5, modelParamsB * 0.1);
                const fits = totGbs <= capacity;
                const isSelected = wf.id === workflowId;

                return (
                  <tr 
                    key={wf.id}
                    onClick={() => setWorkflowId(wf.id)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/30",
                      isSelected && "bg-blue-50 dark:bg-blue-950/50 font-bold border-l-4 border-l-blue-600"
                    )}
                  >
                    <td className="p-3 font-sans font-bold flex items-center gap-2">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setWorkflowId(wf.id)}
                        className="accent-blue-600"
                      />
                      {wf.label}
                    </td>
                    <td className="p-3 text-zinc-500">{wf.baseBits}-bit</td>
                    <td className="p-3 text-blue-600 dark:text-blue-400">{wGbs.toFixed(1)} GB</td>
                    <td className="p-3 text-amber-600 dark:text-amber-400">{gGbs.toFixed(1)} GB</td>
                    <td className="p-3 text-purple-600 dark:text-purple-400">{oGbs.toFixed(1)} GB</td>
                    <td className="p-3 font-bold">{totGbs.toFixed(1)} GB</td>
                    <td className="p-3">
                      {fits ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
                          ✅ Fits cleanly
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-bold">
                          ❌ Overflow (+{(totGbs - capacity).toFixed(1)}GB)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
