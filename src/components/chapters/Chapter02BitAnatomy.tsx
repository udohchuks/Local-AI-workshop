import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { ieee754ToFloat } from "../../lib/quantization-math";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

type Format = "FP32" | "BF16" | "FP16" | "INT8" | "INT4" | "INT2" | "INT1";

const FORMATS: Record<Format, { sign: number, exp: number, mantissa: number, expBias: number, isInt?: boolean }> = {
  FP32: { sign: 1, exp: 8, mantissa: 23, expBias: 127 },
  BF16: { sign: 1, exp: 8, mantissa: 7, expBias: 127 },
  FP16: { sign: 1, exp: 5, mantissa: 10, expBias: 15 },
  INT8: { sign: 1, exp: 0, mantissa: 7, expBias: 0, isInt: true },
  INT4: { sign: 1, exp: 0, mantissa: 3, expBias: 0, isInt: true },
  INT2: { sign: 1, exp: 0, mantissa: 1, expBias: 0, isInt: true },
  INT1: { sign: 1, exp: 0, mantissa: 0, expBias: 0, isInt: true },
};

export function Chapter02BitAnatomy() {
  const [format, setFormat] = useState<Format>("FP32");
  
  // Initialize to Pi approx
  const [bits, setBits] = useState<number[]>([
    0, // Sign
    1, 0, 0, 0, 0, 0, 0, 0, // Exponent (128)
    1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1 // Mantissa
  ]);

  // When format changes, resize bits array padding with 0s or truncating
  useEffect(() => {
    const totalBits = FORMATS[format].sign + FORMATS[format].exp + FORMATS[format].mantissa;
    setBits(prev => {
      const newBits = [...prev];
      while (newBits.length < totalBits) newBits.push(0);
      return newBits.slice(0, totalBits);
    });
  }, [format]);

  const toggleBit = (idx: number) => {
    setBits(prev => {
      const next = [...prev];
      next[idx] = next[idx] === 0 ? 1 : 0;
      return next;
    });
  };

  const f = FORMATS[format];
  const signBit = bits[0];
  const expBits = bits.slice(1, 1 + f.exp);
  const mantissaBits = bits.slice(1 + f.exp);

  let decimalValue = 0;
  if (format === "FP32" || format === "BF16") {
    // We pad mantissa to 23 for our helper
    const paddedMantissa = [...mantissaBits];
    while (paddedMantissa.length < 23) paddedMantissa.push(0);
    decimalValue = ieee754ToFloat(signBit, expBits, paddedMantissa);
  } else if (format === "FP16") {
    // Custom fp16 logic for display purposes
    const expVal = expBits.reduce((acc, b, i) => acc + b * Math.pow(2, expBits.length - 1 - i), 0);
    const mantissaVal = mantissaBits.reduce((acc, b, i) => acc + b * Math.pow(2, -(i + 1)), 0);
    if (expVal === 0) {
      decimalValue = Math.pow(-1, signBit) * Math.pow(2, 1 - 15) * mantissaVal;
    } else if (expVal === 31) {
      decimalValue = mantissaVal === 0 ? (signBit === 1 ? -Infinity : Infinity) : NaN;
    } else {
      decimalValue = Math.pow(-1, signBit) * Math.pow(2, expVal - 15) * (1 + mantissaVal);
    }
  } else if (f.isInt) {
    if (f.mantissa === 0) {
      // INT1 specific mapping (e.g. 0 -> -1, 1 -> 1 or just standard sign)
      decimalValue = signBit === 1 ? -1 : 0;
    } else {
      // Two's complement integer reading
      const magnitude = mantissaBits.reduce((acc, b, i) => acc + b * Math.pow(2, f.mantissa - 1 - i), 0);
      decimalValue = -signBit * Math.pow(2, f.mantissa) + magnitude;
    }
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full h-full animate-in fade-in duration-500">
      {/* Narrative Pane */}
      <section className="w-full lg:w-[420px] p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-border-main dark:border-border-dark flex flex-col gap-6 shrink-0 bg-white dark:bg-bg-dark overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-3xl font-serif leading-tight italic">Anatomy of a Bit</h2>
          <p className="text-sm text-text-muted dark:text-text-muted-dark leading-relaxed">
            Understanding data formats is crucial. IEEE-754 formats use an exponent for scale, whereas Integer formats map linearly. Lower precision like INT4 and INT2 squeeze values aggressively.
          </p>
        </div>
        
        <div className="p-5 bg-sidebar-bg dark:bg-[#121214] border-l-4 border-brand-blue text-[11px] leading-relaxed">
          <div className="text-text-muted dark:text-text-muted-dark mb-3 font-bold uppercase tracking-widest font-sans">Math Engine</div>
          <div className="text-[13px] overflow-x-auto overflow-y-hidden">
            {f.isInt ? (
              <BlockMath math={`\\text{Value} = -S \\times 2^{${f.mantissa}} + \\sum_{i=0}^{${f.mantissa - 1}} M_i 2^i`} />
            ) : (
              <BlockMath math={`\\text{Value} = (-1)^S \\times 2^{E - ${f.expBias}} \\times \\left(1 + \\sum_{i=1}^{${f.mantissa}} M_i 2^{-i}\\right)`} />
            )}
          </div>
        </div>

        <div className="mt-auto space-y-4 pt-8 lg:pt-0">
          <div className="text-[10px] font-bold uppercase text-text-muted dark:text-text-muted-dark tracking-widest">Active Constraints</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-border-main dark:border-border-dark rounded">
              <div className="text-[9px] uppercase opacity-50">Exponent Bits</div>
              <div className="text-sm font-mono">{f.exp}</div>
            </div>
            <div className="p-3 border border-border-main dark:border-border-dark rounded">
              <div className="text-[9px] uppercase opacity-50">Mantissa/Int Bits</div>
              <div className="text-sm font-mono">{f.mantissa}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visualizer */}
      <section className="flex-1 bg-bg-app dark:bg-bg-dark relative flex flex-col p-4 lg:p-8 overflow-y-auto">
        <div className="flex-1 border border-dashed border-[#D4D4D8] dark:border-[#3F3F46] rounded-xl flex flex-col p-6 lg:p-10 relative overflow-hidden bg-white dark:bg-[#18181B] shadow-inner min-h-[400px]">
          
          <div className="flex gap-2 justify-center mb-12">
            {(Object.keys(FORMATS) as Format[]).map(fmt => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={cn(
                  "px-4 py-2 rounded font-mono text-xs border transition-colors",
                  format === fmt
                    ? "bg-text-main dark:bg-white text-white dark:text-black border-text-main dark:border-white font-bold"
                    : "bg-white dark:bg-card-dark border-border-main dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                )}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-center items-center gap-16 overflow-x-auto">
            <div className="flex gap-1 min-w-max pb-4">
              {bits.map((bit, idx) => {
                let group = "";
                if (idx === 0) group = "sign";
                else if (idx <= f.exp) group = "exp";
                else group = "mantissa";

                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleBit(idx)}
                    className={cn(
                      "w-6 h-10 sm:w-8 sm:h-12 flex items-center justify-center font-mono text-sm font-bold transition-colors select-none",
                      group === "sign" && "bg-black text-white dark:bg-white dark:text-black",
                      group === "exp" && "border-2 border-border-main dark:border-border-dark text-brand-blue",
                      group === "mantissa" && "border border-dashed border-border-main dark:border-border-dark",
                      bit === 1 ? "bg-brand-emerald/20 text-brand-emerald border-brand-emerald" : (group === "mantissa" ? "text-text-muted dark:text-text-muted-dark" : ""),
                      group === "sign" && bit === 1 && "bg-brand-crimson dark:bg-brand-crimson text-white dark:text-white"
                    )}
                  >
                    {bit}
                  </motion.button>
                );
              })}
            </div>

            <div className="w-full max-w-2xl space-y-4">
              <div className="flex justify-between text-[10px] font-mono text-text-muted dark:text-text-muted-dark uppercase">
                <span>-∞</span>
                <span className="font-bold text-text-main dark:text-text-dark text-xs">
                  Value: {Number.isNaN(decimalValue) ? "NaN" : decimalValue.toExponential(4)}
                </span>
                <span>+∞</span>
              </div>
              <div className="h-1 bg-border-main dark:bg-border-dark rounded-full relative overflow-visible">
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-brand-blue rounded-full shadow-sm"
                  animate={{
                    left: Number.isNaN(decimalValue) ? "50%" : `${Math.max(0, Math.min(100, 50 + (Math.sign(decimalValue) * Math.log10(Math.abs(decimalValue) + 1) * 5)))}%`
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
