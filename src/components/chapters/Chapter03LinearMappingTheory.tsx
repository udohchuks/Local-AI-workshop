import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { quantizeSymmetric, quantizeAsymmetric } from "../../lib/quantization-math";
import { ArrowRightLeft } from "lucide-react";

export function Chapter03LinearMappingTheory() {
  const [minBound, setMinBound] = useState<number>(-6.4);
  const [maxBound, setMaxBound] = useState<number>(8.1);
  const [mode, setMode] = useState<"Asymmetric" | "Symmetric">("Asymmetric");

  // Sample values for visualization
  const sampleValues = [minBound, -1.2, 0.0, 2.5, maxBound];

  let scale = 0;
  let zeroPoint = 0;

  if (mode === "Asymmetric") {
    const res = quantizeAsymmetric(sampleValues);
    scale = res.scale;
    zeroPoint = res.zeroPoint;
  } else {
    const res = quantizeSymmetric(sampleValues);
    scale = res.scale;
    zeroPoint = 0;
  }

  const rangeFloat = maxBound - minBound;

  return (
    <div className="flex flex-col w-full min-h-full p-4 lg:p-8 space-y-8 bg-white dark:bg-[#09090B] text-black dark:text-white">
      
      {/* 📖 SECTION 1: THEORY & FORMULA BANNER */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
            SECTION 1
          </span>
          <h2 className="text-xl font-bold tracking-tight">Theory & Formula Banner: Linear Mapping Theory</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          Quantization maps continuous floating-point numbers <InlineMath math="[\beta, \alpha] \in \mathbb{R}" /> to discrete integers <InlineMath math="[q_{\min}, q_{\max}] \in \mathbb{Z}" /> via an <strong>affine linear transformation</strong>. 
          The <strong>Scale ($s$)</strong> defines the real-world float distance per integer grid step, while the <strong>Zero-Point ($z$)</strong> anchors float 0.0 to an integer index.
        </p>

        <div className="py-3 px-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-sm space-y-2">
          <BlockMath math={`q = \\text{clamp}\\left( \\text{round}\\left(\\frac{x}{s}\\right) + z, \\; q_{\\min}, \\; q_{\\max} \\right), \\quad \\hat{x} = (q - z) \\times s`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="font-bold text-blue-600 dark:text-blue-400">Scale ($s$)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">
              <InlineMath math="s = \frac{\alpha - \beta}{q_{\max} - q_{\min}}" />: Real distance between integer steps.
            </div>
          </div>
          <div className="p-3 rounded border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20">
            <div className="font-bold text-purple-600 dark:text-purple-400">Zero-Point ($z$)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">
              <InlineMath math="z = \text{round}\left(-\frac{\beta}{s}\right) + q_{\min}" />: Integer index corresponding to float 0.0.
            </div>
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
            <h3 className="text-lg font-bold tracking-tight">Dynamic Visual Canvas: Dual-Axis Stretching Rays</h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={() => setMode("Asymmetric")}
              className={cn(
                "px-3 py-1.5 rounded border transition-all",
                mode === "Asymmetric" ? "bg-blue-600 text-white font-bold border-blue-600" : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
              )}
            >
              Asymmetric
            </button>
            <button
              onClick={() => setMode("Symmetric")}
              className={cn(
                "px-3 py-1.5 rounded border transition-all",
                mode === "Symmetric" ? "bg-purple-600 text-white font-bold border-purple-600" : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
              )}
            >
              Symmetric
            </button>
          </div>
        </div>

        {/* Dual Axis Visual Canvas */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-8 relative min-h-[300px] flex flex-col justify-center">
          
          {/* Top Continuous Float Axis */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              <span>CONTINUOUS FLOAT AXIS (<InlineMath math="\mathbb{R}" />)</span>
              <span>Bounds: [{minBound}, {maxBound}]</span>
            </div>

            <div className="relative h-10 w-full bg-blue-500/10 border border-blue-400/40 rounded-lg flex items-center px-4">
              <div className="absolute inset-x-4 h-0.5 bg-blue-500"></div>

              {sampleValues.map((v, idx) => {
                const pct = ((v - minBound) / (maxBound - minBound || 1)) * 100;
                return (
                  <motion.div
                    key={`float-node-${idx}`}
                    layout
                    className="absolute flex flex-col items-center -ml-3"
                    style={{ left: `${Math.max(2, Math.min(98, pct))}%` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
                    <span className="text-[10px] font-mono font-bold mt-1 text-blue-600 dark:text-blue-400">
                      {v.toFixed(1)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Connecting Ray Particles */}
          <div className="h-12 w-full relative flex items-center justify-center">
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2">
              <ArrowRightLeft size={14} className="text-zinc-500 animate-pulse" />
              <span>Affine Linear Scaling (<InlineMath math={`s = ${scale.toFixed(5)}, z = ${zeroPoint}`} />)</span>
            </div>
          </div>

          {/* Bottom Discrete Integer Axis */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              <span>DISCRETE INT8 AXIS (<InlineMath math="\mathbb{Z}" />)</span>
              <span>Grid: [-128, 127]</span>
            </div>

            <div className="relative h-10 w-full bg-purple-500/10 border border-purple-400/40 rounded-lg flex items-center px-4">
              <div className="absolute inset-x-4 h-0.5 bg-purple-500"></div>

              {sampleValues.map((v, idx) => {
                let q = 0;
                if (mode === "Asymmetric") {
                  q = Math.round(v / scale) + zeroPoint;
                } else {
                  q = Math.round(v / scale);
                }
                const pct = ((q - (-128)) / 255) * 100;

                return (
                  <motion.div
                    key={`int-node-${idx}`}
                    layout
                    className="absolute flex flex-col items-center -ml-3"
                    style={{ left: `${Math.max(2, Math.min(98, pct))}%` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-purple-600 border-2 border-white shadow-md"></div>
                    <span className="text-[10px] font-mono font-bold mt-1 text-purple-600 dark:text-purple-400">
                      {q}
                    </span>
                  </motion.div>
                );
              })}
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
            <h3 className="text-lg font-bold tracking-tight">Step-by-Step Numerical Lab & Editable Bounds</h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span>Min (<InlineMath math="\beta" />):</span>
              <input
                type="number"
                step="0.5"
                value={minBound}
                onChange={(e) => setMinBound(parseFloat(e.target.value) || -1)}
                className="w-20 p-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-bold text-blue-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>Max (<InlineMath math="\alpha" />):</span>
              <input
                type="number"
                step="0.5"
                value={maxBound}
                onChange={(e) => setMaxBound(parseFloat(e.target.value) || 1)}
                className="w-20 p-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-bold text-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Calculated Linear Mapping Parameters Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-white dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-zinc-500">Continuous Range (<InlineMath math="\alpha - \beta" />)</div>
            <div className="text-base font-bold text-black dark:text-white">{rangeFloat.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-zinc-500">Discrete Integer Range</div>
            <div className="text-base font-bold text-black dark:text-white">255 (INT8: -128 to 127)</div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-zinc-500">Calculated Scale (<InlineMath math="s" />)</div>
            <div className="text-base font-bold text-blue-600 dark:text-blue-400">{scale.toFixed(6)}</div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-zinc-500">Calculated Zero-Point (<InlineMath math="z" />)</div>
            <div className="text-base font-bold text-purple-600 dark:text-purple-400">{zeroPoint}</div>
          </div>
        </div>
      </section>

    </div>
  );
}
