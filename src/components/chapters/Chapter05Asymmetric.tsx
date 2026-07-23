import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { quantizeSymmetric, quantizeAsymmetric } from "../../lib/quantization-math";
import { ArrowRight, Check, AlertCircle } from "lucide-react";

export function Chapter05Asymmetric() {
  const [inputs, setInputs] = useState<number[]>([-6.4, -1.2, 0.0, 2.5, 8.1]);

  const asymRes = quantizeAsymmetric(inputs);
  const symRes = quantizeSymmetric(inputs);

  const handleCellEdit = (index: number, val: number) => {
    const next = [...inputs];
    next[index] = val;
    setInputs(next);
  };

  const errorRatio = symRes.mae > 0 ? (symRes.mae / (asymRes.mae || 0.000001)) : 1;

  return (
    <div className="flex flex-col w-full min-h-full p-4 lg:p-8 space-y-8 bg-white dark:bg-[#09090B] text-black dark:text-white">
      
      {/* 📖 SECTION 1: THEORY & FORMULA BANNER */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
            SECTION 1
          </span>
          <h2 className="text-xl font-bold tracking-tight">Theory & Formula Banner: Asymmetric Quantization Walkthrough</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          Asymmetric Quantization introduces an integer offset <strong>Zero-Point (z)</strong> to map asymmetric float ranges [β, α] across the full 256-bin spectrum [-128, 127]. 
          This avoids wasting discrete integer bins on unused negative ranges, resulting in up to <strong>~5.8× smaller quantization error</strong> than Symmetric mode!
        </p>

        <div className="py-3 px-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-sm space-y-2">
          <BlockMath math="s = \frac{\alpha - \beta}{255}, \quad z = \text{round}\left(-\frac{\beta}{s}\right) - 128" />
          <BlockMath math="q = \text{clamp}\left( \text{round}\left(\frac{x}{s}\right) + z, -128, 127 \right), \quad \hat{x} = (q - z) \times s" />
        </div>
      </section>

      {/* 🎨 SECTION 2: DYNAMIC VISUAL CANVAS & ANIMATION */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
              SECTION 2
            </span>
            <h3 className="text-lg font-bold tracking-tight">Dynamic Visual Canvas: Zero-Point Sliding & Comparative Errors</h3>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
              Zero-Point <InlineMath math={`z = ${asymRes.zeroPoint}`} />
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
              ~{errorRatio.toFixed(1)}× Smaller Error
            </span>
          </div>
        </div>

        {/* Side-by-side Comparative Error Bar Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
          
          {/* Symmetric Mode Card */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] space-y-4">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="font-bold text-purple-600 flex items-center gap-1">Symmetric Mode (<InlineMath math="z=0" />)</span>
              <span className="text-red-500 font-bold">MAE = {symRes.mae.toFixed(4)}</span>
            </div>

            <div className="space-y-2">
              {inputs.map((val, idx) => (
                <div key={`sym-bar-${idx}`} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="w-12 text-zinc-500">{val.toFixed(1)}</span>
                  <div className="flex-1 mx-3 bg-zinc-100 dark:bg-zinc-800 h-3 rounded overflow-hidden">
                    <motion.div
                      layout
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, symRes.errors[idx] * 4000)}%` }}
                      className="bg-red-500 h-full"
                    />
                  </div>
                  <span className="w-14 text-right font-bold text-red-500">{symRes.errors[idx].toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asymmetric Mode Card */}
          <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">Asymmetric Mode (<InlineMath math={`z = ${asymRes.zeroPoint}`} />)</span>
              <span className="text-emerald-600 font-bold">MAE = {asymRes.mae.toFixed(4)}</span>
            </div>

            <div className="space-y-2">
              {inputs.map((val, idx) => (
                <div key={`asym-bar-${idx}`} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="w-12 text-zinc-500">{val.toFixed(1)}</span>
                  <div className="flex-1 mx-3 bg-zinc-100 dark:bg-zinc-800 h-3 rounded overflow-hidden">
                    <motion.div
                      layout
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, asymRes.errors[idx] * 4000)}%` }}
                      className="bg-emerald-500 h-full"
                    />
                  </div>
                  <span className="w-14 text-right font-bold text-emerald-600">{asymRes.errors[idx].toFixed(4)}</span>
                </div>
              ))}
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
            <h3 className="text-lg font-bold tracking-tight">Step-by-Step Numerical Lab & Asymmetric Calculation Table</h3>
          </div>

          <div className="text-xs font-mono space-x-4">
            <span>Scale (s): <strong className="text-blue-600">{asymRes.scale.toFixed(6)}</strong></span>
            <span>Zero-Point (z): <strong className="text-emerald-600">{asymRes.zeroPoint}</strong></span>
          </div>
        </div>

        {/* Asymmetric Calculation Data Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                <th className="p-3">Input (<InlineMath math="x_i" />) [Editable]</th>
                <th className="p-3">Exact <InlineMath math="(x_i / s) + z" /></th>
                <th className="p-3">Quantized (<InlineMath math="q_i" />)</th>
                <th className="p-3">Dequantized (<InlineMath math="\hat{x}_i = (q_i - z)s" />)</th>
                <th className="p-3">Error (<InlineMath math="|x_i - \hat{x}_i|" />)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {inputs.map((val, idx) => {
                const exact = asymRes.exactRatios[idx];
                const q = asymRes.quantized[idx];
                const dequant = asymRes.dequantized[idx];
                const err = asymRes.errors[idx];

                return (
                  <tr key={`asym-row-${idx}`}>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.1"
                        value={val}
                        onChange={(e) => handleCellEdit(idx, parseFloat(e.target.value) || 0)}
                        className="w-20 p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-bold text-blue-600"
                      />
                    </td>
                    <td className="p-3 text-zinc-500">{exact.toFixed(2)}</td>
                    <td className="p-3 font-bold text-emerald-600">{q}</td>
                    <td className="p-3 font-bold text-black dark:text-white">{dequant.toFixed(3)}</td>
                    <td className="p-3 font-bold text-emerald-500">{err.toFixed(4)}</td>
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
