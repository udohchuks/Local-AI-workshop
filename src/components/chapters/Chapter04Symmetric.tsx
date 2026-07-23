import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { quantizeSymmetric } from "../../lib/quantization-math";

export function Chapter04Symmetric() {
  const [inputs, setInputs] = useState<number[]>([-6.4, -1.2, 0.0, 2.5, 8.1]);
  const [currentStep, setCurrentStep] = useState<number>(1); // Step 1 to 4

  const res = quantizeSymmetric(inputs);

  const handleCellEdit = (index: number, val: number) => {
    const next = [...inputs];
    next[index] = val;
    setInputs(next);
  };

  return (
    <div className="flex flex-col w-full min-h-full p-4 lg:p-8 space-y-8 bg-white dark:bg-[#09090B] text-black dark:text-white">
      
      {/* 📖 SECTION 1: THEORY & FORMULA BANNER */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
            SECTION 1
          </span>
          <h2 className="text-xl font-bold tracking-tight">Theory & Formula Banner: Symmetric Quantization Walkthrough</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          Symmetric Quantization constrains the zero-point to exactly <InlineMath math="z = 0" />, ensuring real float 0.0 maps directly to integer 0. 
          The scale factor <InlineMath math="s" /> is computed directly from the maximum absolute value <InlineMath math="\alpha = \max(|x_{\min}|, |x_{\max}|)" />.
        </p>

        <div className="py-3 px-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-sm space-y-2">
          <BlockMath math="\alpha = \max(|x_{\min}|, |x_{\max}|), \quad s = \frac{\alpha}{127}" />
          <BlockMath math="q = \text{clamp}\left( \text{round}\left(\frac{x}{s}\right), -128, 127 \right), \quad \hat{x} = q \times s" />
        </div>
      </section>

      {/* 🎨 SECTION 2: DYNAMIC VISUAL CANVAS & ANIMATION */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
              SECTION 2
            </span>
            <h3 className="text-lg font-bold tracking-tight">Dynamic Visual Canvas: 4-Step Interactive Grid Snapping</h3>
          </div>

          {/* Step buttons */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={`step-${step}`}
                onClick={() => setCurrentStep(step)}
                className={cn(
                  "px-3 py-1.5 rounded font-mono text-xs transition-all",
                  currentStep === step
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                )}
              >
                Step {step}
              </button>
            ))}
          </div>
        </div>

        {/* Step description banner */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-mono text-blue-700 dark:text-blue-300">
          {currentStep === 1 && "Step 1: Identify Absolute Maximum Value α = max(|x_min|, |x_max|)"}
          {currentStep === 2 && `Step 2: Calculate Scale Factor s = α / 127 = ${res.scale.toFixed(6)}`}
          {currentStep === 3 && "Step 3: Round inputs to integer grid ticks q_i = round(x_i / s)"}
          {currentStep === 4 && `Step 4: Dequantize x_hat = q_i * s & compute Red Delta Error Bars (MAE = ${res.mae.toFixed(4)})`}
        </div>

        {/* Canvas visualizer */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-6 min-h-[260px] flex flex-col justify-center">
          <div className="relative w-full h-28 flex items-center border-b border-zinc-300 dark:border-zinc-700 px-8">
            {/* Center zero line */}
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-zinc-400">
              <span className="text-[10px] font-mono font-bold text-zinc-500 bg-white dark:bg-black px-1 rounded absolute -top-3 -left-3">
                0.0 (z=0)
              </span>
            </div>

            {inputs.map((val, idx) => {
              const alpha = Math.max(...inputs.map(v => Math.abs(v))) || 1;
              const posX = 50 + (val / alpha) * 40; // 10% to 90%
              const err = res.errors[idx];

              return (
                <div
                  key={`sym-point-${idx}`}
                  className="absolute flex flex-col items-center -ml-4 transition-all duration-500"
                  style={{ left: `${posX}%` }}
                >
                  {/* Red error bar in Step 4 */}
                  {currentStep === 4 && err > 0.001 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      className="w-1 bg-red-500 rounded-full mb-1"
                      style={{ height: `${Math.min(30, err * 500)}px` }}
                    />
                  )}

                  {/* Point */}
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-mono text-white font-bold shadow-md",
                    currentStep >= 3 ? "bg-purple-600" : "bg-blue-600"
                  )}>
                    {res.quantized[idx]}
                  </div>

                  <span className="text-[10px] font-mono font-bold mt-1 text-black dark:text-white">
                    {val.toFixed(1)}
                  </span>
                  {currentStep === 4 && (
                    <span className="text-[9px] font-mono text-red-500 font-bold">
                      Δ {err.toFixed(3)}
                    </span>
                  )}
                </div>
              );
            })}
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
            <h3 className="text-lg font-bold tracking-tight">Step-by-Step Numerical Lab & Editable Array</h3>
          </div>

          <div className="text-xs font-mono">
            <span>Scale (<InlineMath math="s" />): <strong className="text-blue-600">{res.scale.toFixed(6)}</strong></span>
            <span className="ml-4">Mean Absolute Error (MAE): <strong className="text-red-500">{res.mae.toFixed(4)}</strong></span>
          </div>
        </div>

        {/* Worked Calculation Data Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                <th className="p-3">Input (<InlineMath math="x_i" />) [Editable]</th>
                <th className="p-3">Exact <InlineMath math="x_i / s" /></th>
                <th className="p-3">Quantized (<InlineMath math="q_i" />)</th>
                <th className="p-3">Dequantized (<InlineMath math="\hat{x}_i = q_i \cdot s" />)</th>
                <th className="p-3">Error (<InlineMath math="|x_i - \hat{x}_i|" />)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {inputs.map((val, idx) => {
                const exact = res.exactRatios[idx];
                const q = res.quantized[idx];
                const dequant = res.dequantized[idx];
                const err = res.errors[idx];

                return (
                  <tr key={`sym-row-${idx}`}>
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
                    <td className="p-3 font-bold text-purple-600">{q}</td>
                    <td className="p-3 font-bold text-black dark:text-white">{dequant.toFixed(3)}</td>
                    <td className="p-3 font-bold text-red-500">{err.toFixed(4)}</td>
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
