import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { NF4_QUANTILE_TABLE, quantizeNF4, floatToIeee754, ieee754ToFloat } from "../../lib/quantization-math";
import { Binary, Activity } from "lucide-react";

export function Chapter02BitAnatomy() {
  const [selectedFormat, setSelectedFormat] = useState<"FP32" | "FP16" | "BF16" | "NF4">("FP32");
  
  // State for interactive bit manipulation for FP32
  const [signBit, setSignBit] = useState<number>(0);
  const [exponentBits, setExponentBits] = useState<number[]>([1, 0, 0, 0, 0, 0, 0, 1]); // 129 -> unbiased 2
  const [mantissaBits, setMantissaBits] = useState<number[]>([1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1]); // ~0.6

  // Interactive Target Value for Numerical Lab (Section 3)
  const [targetVal, setTargetVal] = useState<number>(6.4);
  const [nf4TestVal, setNf4TestVal] = useState<number>(0.55);

  // Compute calculated float from FP32 bit-strip
  const computedFloatVal = ieee754ToFloat(signBit, exponentBits, mantissaBits);
  const expValueInt = exponentBits.reduce((acc, bit, i) => acc + bit * Math.pow(2, exponentBits.length - 1 - i), 0);
  const mantissaValueFrac = mantissaBits.reduce((acc, bit, i) => acc + bit * Math.pow(2, -(i + 1)), 0);

  // NF4 calculation
  const nf4Result = quantizeNF4(nf4TestVal);

  const toggleExponentBit = (idx: number) => {
    const next = [...exponentBits];
    next[idx] = next[idx] === 0 ? 1 : 0;
    setExponentBits(next);
  };

  const toggleMantissaBit = (idx: number) => {
    const next = [...mantissaBits];
    next[idx] = next[idx] === 0 ? 1 : 0;
    setMantissaBits(next);
  };

  // Set bit strip directly from target value
  const applyTargetValToBits = (val: number) => {
    setTargetVal(val);
    const ieee = floatToIeee754(val);
    setSignBit(ieee.sign);
    setExponentBits(ieee.exponent);
    setMantissaBits(ieee.mantissa);
  };

  return (
    <div className="flex flex-col w-full min-h-full p-4 lg:p-8 space-y-8 bg-white dark:bg-[#09090B] text-black dark:text-white">
      
      {/* 📖 SECTION 1: THEORY & FORMULA BANNER */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
            SECTION 1
          </span>
          <h2 className="text-xl font-bold tracking-tight">Theory & Formula Banner: Bit Anatomy (IEEE-754 & NF4)</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          Floating-point representation standardizes real continuous numbers into binary representation via three bitfields: <strong>Sign (S)</strong>, <strong>Exponent (E)</strong>, and <strong>Mantissa (M)</strong>. 
          NormalFloat 4 (<strong>NF4</strong>) is an information-theoretically optimal 4-bit quantile representation designed for zero-mean Gaussian LLM weights.
        </p>

        <div className="py-3 px-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-sm">
          <BlockMath math={`\\text{Value} = (-1)^S \\times 2^{E - \\text{Bias}} \\times \\left(1 + \\frac{M}{2^{\\text{bits}}}\\right)`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="font-bold text-blue-600 dark:text-blue-400">FP32 (32-bit)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">1 Sign, 8 Exponent (Bias 127), 23 Mantissa. Precision limit: ~10⁻⁷.</div>
          </div>
          <div className="p-3 rounded border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
            <div className="font-bold text-indigo-600 dark:text-indigo-400">FP16 (16-bit)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">1 Sign, 5 Exponent (Bias 15), 10 Mantissa. High risk of underflow.</div>
          </div>
          <div className="p-3 rounded border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20">
            <div className="font-bold text-purple-600 dark:text-purple-400">BF16 (16-bit)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">1 Sign, 8 Exponent (Bias 127), 7 Mantissa. Preserves full FP32 dynamic range.</div>
          </div>
          <div className="p-3 rounded border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="font-bold text-emerald-600 dark:text-emerald-400">NF4 (4-bit)</div>
            <div className="text-zinc-500 dark:text-zinc-400 mt-1">Quantile bins optimized for N(0,1) Gaussian distribution.</div>
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
            <h3 className="text-lg font-bold tracking-tight">Dynamic Visual Canvas: Clickable Bit-Strip & Gaussian Quantiles</h3>
          </div>

          <div className="flex items-center gap-2">
            {(["FP32", "FP16", "BF16", "NF4"] as const).map(fmt => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded border transition-all",
                  selectedFormat === fmt
                    ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Bit-Strip Box */}
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <Binary size={16} />
              <span>Interactive Bit-Strip (Click any bit to flip 0 to 1):</span>
            </div>
            <div className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
              Decoded Value = {computedFloatVal.toFixed(6)}
            </div>
          </div>

          {/* Render Bit-Strips */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Sign Bit */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-red-500">SIGN (1b)</span>
              <button
                onClick={() => setSignBit(signBit === 0 ? 1 : 0)}
                className={cn(
                  "w-9 h-10 rounded border-2 flex items-center justify-center font-bold text-sm shadow-sm transition-all",
                  signBit === 1 ? "bg-red-500 text-white border-red-600" : "bg-white dark:bg-zinc-900 border-red-300 dark:border-red-800 text-red-500"
                )}
              >
                {signBit}
              </button>
            </div>

            <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>

            {/* Exponent Bits */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-amber-500">EXPONENT ({exponentBits.length}b)</span>
              <div className="flex gap-1">
                {exponentBits.map((bit, idx) => (
                  <button
                    key={`exp-${idx}`}
                    onClick={() => toggleExponentBit(idx)}
                    className={cn(
                      "w-7 h-10 rounded border flex items-center justify-center font-bold transition-all",
                      bit === 1 ? "bg-amber-500 text-white border-amber-600" : "bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-800 text-amber-600"
                    )}
                  >
                    {bit}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>

            {/* Mantissa Bits */}
            <div className="flex flex-col gap-1 overflow-x-auto">
              <span className="text-[10px] font-bold text-blue-500">MANTISSA (23b)</span>
              <div className="flex gap-1">
                {mantissaBits.map((bit, idx) => (
                  <button
                    key={`mant-${idx}`}
                    onClick={() => toggleMantissaBit(idx)}
                    className={cn(
                      "w-6 h-10 rounded border flex items-center justify-center text-xs font-bold transition-all",
                      bit === 1 ? "bg-blue-600 text-white border-blue-700" : "bg-white dark:bg-zinc-900 border-blue-200 dark:border-blue-900 text-blue-500"
                    )}
                  >
                    {bit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logarithmic / Gaussian Bell Curve Canvas View */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-black relative min-h-[160px] flex flex-col justify-center">
            <div className="text-[11px] font-mono text-zinc-500 mb-2 flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" />
              <span>Gaussian Bell Curve & NF4 Quantile Bin Mapping (<InlineMath math="\\mathcal{N}(0,1)" />):</span>
            </div>

            {/* Gaussian Bell Curve visualization with NF4 Quantile lines */}
            <div className="relative w-full h-24 flex items-end border-b border-zinc-300 dark:border-zinc-700 px-4">
              {NF4_QUANTILE_TABLE.map((qVal, idx) => {
                const posX = ((qVal + 1) / 2) * 100;
                const isSelectedBin = idx === nf4Result.index;

                return (
                  <div
                    key={`nf4-bin-${idx}`}
                    className="absolute bottom-0 flex flex-col items-center group cursor-pointer"
                    style={{ left: `${posX}%` }}
                    onClick={() => setNf4TestVal(qVal)}
                  >
                    <div className={cn("w-0.5 h-16 transition-all", isSelectedBin ? "bg-emerald-500 w-1.5 z-10" : "bg-zinc-300 dark:bg-zinc-700")} />
                    <span className={cn("text-[9px] font-mono mt-1 opacity-70 group-hover:opacity-100", isSelectedBin && "text-emerald-500 font-bold opacity-100")}>
                      {idx}
                    </span>
                  </div>
                );
              })}

              {/* Crosshair indicator */}
              <div 
                className="absolute bottom-0 w-3 h-3 rounded-full bg-blue-600 -ml-1.5 border-2 border-white shadow-lg transition-all duration-300 z-20"
                style={{ left: `${((Math.max(-1, Math.min(1, nf4TestVal)) + 1) / 2) * 100}%`, bottom: '24px' }}
                title={`Target Value: ${nf4TestVal}`}
              />
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
            <h3 className="text-lg font-bold tracking-tight">Step-by-Step Numerical Lab & Worked Bit Calculations</h3>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span>Target Float <InlineMath math="x" />:</span>
            <input
              type="number"
              step="0.1"
              value={targetVal}
              onChange={(e) => applyTargetValToBits(parseFloat(e.target.value) || 0)}
              className="w-24 p-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-bold text-blue-600 dark:text-blue-400"
            />
          </div>
        </div>

        {/* Step-by-Step Worked Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          
          {/* FP32 Worked Breakdown */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] space-y-3">
            <div className="font-bold text-sm text-blue-600 dark:text-blue-400 flex items-center justify-between">
              <span>FP32 Bit Encoding Breakdown</span>
              <span><InlineMath math={`x = ${targetVal}`} /></span>
            </div>

            <div className="space-y-2 text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-2">
              <div><strong>Sign Bit (<InlineMath math="S" />):</strong> <span className="text-red-500 font-bold">{signBit}</span> ({signBit === 0 ? "Positive (+)" : "Negative (-)"})</div>
              <div><strong>Exponent (<InlineMath math="E" />):</strong> <span className="text-amber-500 font-bold">{expValueInt}</span> (Binary: `{exponentBits.join("")}`)</div>
              <div><strong>Unbiased Exponent (<InlineMath math="E - 127" />):</strong> {expValueInt} - 127 = <strong>{expValueInt - 127}</strong></div>
              <div><strong>Mantissa Fraction (<InlineMath math="M" />):</strong> <span className="text-blue-500 font-bold">{mantissaValueFrac.toFixed(6)}</span></div>
              <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-bold mt-2">
                Decoded Math: <InlineMath math={`(-1)^{${signBit}} \\times 2^{${expValueInt - 127}} \\times (1 + ${mantissaValueFrac.toFixed(4)}) = \\mathbf{${computedFloatVal.toFixed(4)}}`} />
              </div>
            </div>
          </div>

          {/* NF4 16-Bin Lookup Table & Quantization */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] space-y-3">
            <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>NF4 Quantile Lookup & Mapping</span>
              <div className="flex items-center gap-1">
                <span><InlineMath math="x_{\text{NF4}} =" /></span>
                <input
                  type="number"
                  step="0.05"
                  value={nf4TestVal}
                  onChange={(e) => setNf4TestVal(parseFloat(e.target.value) || 0)}
                  className="w-20 p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-bold text-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-2 text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-2">
              <div><strong>Nearest Bin Index:</strong> <span className="text-emerald-500 font-bold">Index {nf4Result.index}</span></div>
              <div><strong>Quantized Bin Value:</strong> <span className="font-bold text-black dark:text-white">{nf4Result.binValue.toFixed(4)}</span></div>
              <div><strong>Quantization Error (<InlineMath math="\epsilon" />):</strong> <span className="text-red-500 font-bold">{nf4Result.error.toFixed(4)}</span></div>

              <div className="text-[11px] font-bold text-zinc-500 mt-2">NF4 16 Quantile Bins:</div>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                {NF4_QUANTILE_TABLE.map((val, idx) => (
                  <div
                    key={`table-bin-${idx}`}
                    className={cn(
                      "p-1 rounded text-center border",
                      idx === nf4Result.index
                        ? "bg-emerald-500 text-white font-bold border-emerald-600"
                        : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    )}
                  >
                    [{idx}] {val}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
