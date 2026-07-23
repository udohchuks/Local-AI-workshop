import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { quantizeAsymmetric } from "../../lib/quantization-math";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export function Chapter05Asymmetric() {
  const [step, setStep] = useState(0);
  const floatValues = [-6.4, -1.2, 0.0, 2.5, 8.1];
  
  const { scale: s, zeroPoint: z, quantized } = quantizeAsymmetric(floatValues);
  const alpha = Math.max(...floatValues);
  const beta = Math.min(...floatValues);

  const width = 600;
  const padding = 40;
  const usableWidth = width - padding * 2;
  const floatRange = alpha - beta;
  const intRange = 255;

  const floatToX = (v: number) => padding + ((v - beta) / floatRange) * usableWidth;
  const intToX = (v: number) => padding + ((v - (-128)) / intRange) * usableWidth;

  const steps = [
    "Find Min/Max",
    "Scale Factor",
    "Zero-Point",
    "Mapping"
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full h-full animate-in fade-in duration-500">
      <section className="w-full lg:w-[420px] p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-border-main dark:border-border-dark flex flex-col gap-6 shrink-0 bg-white dark:bg-bg-dark overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-3xl font-serif leading-tight italic">Asymmetric Walkthrough</h2>
          <p className="text-sm text-text-muted dark:text-text-muted-dark leading-relaxed">
            Asymmetric quantization scales from the exact min and max values, mapping them fully across the INT8 range <InlineMath math="[-128, 127]" />. We use a "Zero-Point" (<InlineMath math="z" />) to ensure <InlineMath math="0.0" /> perfectly maps to an integer.
          </p>
        </div>
        
        <div className="p-5 bg-sidebar-bg dark:bg-[#121214] border-l-4 border-brand-blue text-[11px] leading-relaxed">
          <div className="text-text-muted dark:text-text-muted-dark mb-3 font-bold uppercase tracking-widest font-sans">Formulae</div>
          <div className="text-[13px] overflow-x-auto overflow-y-hidden space-y-2">
            <BlockMath math={`\\textcolor{#eab308}{s} = \\frac{\\textcolor{#06b6d4}{\\alpha} - \\textcolor{#10b981}{\\beta}}{255}`} />
            <BlockMath math={`\\textcolor{#3b82f6}{z} = \\text{round}\\left(-\\frac{\\textcolor{#10b981}{\\beta}}{\\textcolor{#eab308}{s}}\\right) - 128`} />
            <BlockMath math={`\\text{x}_{\\text{quantized}} = \\text{clamp}\\left(\\text{round}\\left(\\frac{\\textcolor{#a855f7}{x}}{\\textcolor{#eab308}{s}}\\right) + \\textcolor{#3b82f6}{z}, -128, 127\\right)`} />
          </div>
        </div>
        
        {/* Step Navigation */}
        <div className="mt-8 space-y-2">
          {steps.map((title, idx) => (
            <button
              key={idx}
              onClick={() => setStep(idx)}
              className={cn(
                "w-full text-left p-3 rounded text-sm font-bold tracking-wide transition-colors border",
                step === idx 
                  ? "bg-brand-blue text-white border-brand-blue" 
                  : "bg-white dark:bg-card-dark text-text-muted border-border-main dark:border-border-dark hover:border-brand-blue/50"
              )}
            >
              {idx + 1}. {title}
            </button>
          ))}
        </div>
      </section>

      <section className="flex-1 bg-bg-app dark:bg-bg-dark relative flex flex-col p-4 lg:p-8 overflow-y-auto items-center">
        
        {/* Float Array */}
        <div className="flex gap-2 justify-center mb-16">
          {floatValues.map((v, i) => {
            const isMin = v === beta;
            const isMax = v === alpha;
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="h-6 mb-2 flex items-end">
                  {step >= 0 && (isMin || isMax) && (
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", isMin ? "text-brand-emerald" : "text-cyan-500")}>
                      {isMin ? "lowest (β)" : "highest (α)"}
                    </span>
                  )}
                </div>
                <div className={cn(
                  "w-14 h-14 flex items-center justify-center text-white font-mono text-base font-bold shadow-sm transition-colors",
                  isMin ? "bg-brand-emerald" : isMax ? "bg-cyan-500" : "bg-[#8B5CF6]"
                )}>
                  {v.toFixed(2)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Central Display Area */}
        <div className="w-full max-w-3xl flex flex-col items-center pb-20">
            
            {step >= 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 pt-10"
              >
                <div className="text-xl font-serif text-text-main dark:text-text-dark max-w-lg leading-relaxed mx-auto">
                  First, we identify the <span className="text-brand-emerald font-bold not-italic">minimum (β = {beta})</span> and <span className="text-cyan-500 font-bold not-italic">maximum (α = {alpha})</span> values from our input tensor.
                </div>
                <p className="text-text-muted text-sm">These boundaries will be mapped to the extremes of our INT8 range <InlineMath math="[-128, 127]" />.</p>
                
                <div className="pt-8 text-left space-y-6 border-t border-border-main/50 dark:border-border-dark/50 mt-8 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between border-b border-border-main/20 dark:border-border-dark/20 pb-4">
                    <div className="text-xl">
                      <BlockMath math={`\\textcolor{#eab308}{s} = \\frac{\\textcolor{#06b6d4}{\\alpha} - \\textcolor{#10b981}{\\beta}}{255}`} />
                    </div>
                    <span className="text-sm text-text-muted">(scale factor)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border-main/20 dark:border-border-dark/20 pb-4">
                    <div className="text-xl">
                      <BlockMath math={`\\textcolor{#3b82f6}{z} = \\text{round}\\left(-\\frac{\\textcolor{#10b981}{\\beta}}{\\textcolor{#eab308}{s}}\\right) - 128`} />
                    </div>
                    <span className="text-sm text-text-muted">(zeropoint)</span>
                  </div>
                  <div className="flex items-center justify-between pb-4">
                    <div className="text-xl">
                      <BlockMath math={`\\text{x}_{\\text{quantized}} = \\text{round}\\left(\\frac{\\textcolor{#a855f7}{x}}{\\textcolor{#eab308}{s}}\\right) + \\textcolor{#3b82f6}{z}`} />
                    </div>
                    <span className="text-sm text-text-muted">(quantization)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step >= 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center pt-10"
              >
                <div className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Scale Factor (<InlineMath math="\textcolor{#eab308}{s}" />)</div>
                <div className="flex items-center justify-center relative max-w-lg mx-auto">
                  <div className="text-2xl lg:text-3xl">
                    <BlockMath math={`\\textcolor{#eab308}{s} = \\frac{\\textcolor{#06b6d4}{${alpha}} - \\textcolor{#10b981}{${beta}}}{255} = \\textcolor{#eab308}{${s.toFixed(5)}}`} />
                  </div>
                  <span className="absolute right-0 text-sm text-text-muted">(scale factor)</span>
                </div>
                <p className="text-text-muted mt-4 max-w-md mx-auto text-sm">
                  The scale factor represents how many float units correspond to a single INT8 bin.
                </p>
              </motion.div>
            )}

            {step >= 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center pt-10"
              >
                <div className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Zero-Point (<InlineMath math="\textcolor{#3b82f6}{z}" />)</div>
                <div className="flex items-center justify-center relative max-w-lg mx-auto">
                  <div className="text-2xl lg:text-3xl">
                    <BlockMath math={`\\textcolor{#3b82f6}{z} = \\text{round}\\left(-\\frac{\\textcolor{#10b981}{${beta}}}{\\textcolor{#eab308}{${s.toFixed(5)}}}\\right) - 128 = \\textcolor{#3b82f6}{${z}}`} />
                  </div>
                  <span className="absolute right-0 text-sm text-text-muted">(zeropoint)</span>
                </div>
                <p className="text-text-muted mt-4 max-w-md mx-auto text-sm">
                  The zero-point ensures that a float value of exactly <InlineMath math="0.0" /> maps perfectly to an integer without error.
                </p>
              </motion.div>
            )}

            {step >= 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center justify-between mt-16"
              >
                {/* Visualizer Canvas */}
                <div className="relative w-full max-w-[600px] h-[200px] mt-4">
                  {/* Float Axis */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-[#E9D5FF] dark:bg-[#4C1D95] rounded-full">
                    {floatValues.map((v, i) => (
                      <div key={i} className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8B5CF6] border-2 border-white dark:border-bg-dark shadow" style={{ left: `${floatToX(v)}px`, transform: 'translate(-50%, -50%)' }} />
                    ))}
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-emerald border-2 border-white dark:border-bg-dark shadow z-10" style={{ left: `${floatToX(beta)}px`, transform: 'translate(-50%, -50%)' }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-500 border-2 border-white dark:border-bg-dark shadow z-10" style={{ left: `${floatToX(alpha)}px`, transform: 'translate(-50%, -50%)' }} />
                  </div>
                  
                  {/* INT Axis */}
                  <div className="absolute bottom-10 left-0 right-0 h-2 bg-[#FBCFE8] dark:bg-[#831843] rounded-full">
                    {quantized.map((q, i) => (
                      <div key={i} className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#EC4899] border-2 border-white dark:border-bg-dark shadow" style={{ left: `${intToX(q)}px`, transform: 'translate(-50%, -50%)' }} />
                    ))}
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-emerald border-2 border-white dark:border-bg-dark shadow z-10" style={{ left: `${intToX(-128)}px`, transform: 'translate(-50%, -50%)' }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-500 border-2 border-white dark:border-bg-dark shadow z-10" style={{ left: `${intToX(127)}px`, transform: 'translate(-50%, -50%)' }} />
                    {/* Zero point marker */}
                    <div className="absolute top-full mt-2 -translate-x-1/2 text-xs font-bold text-brand-crimson" style={{ left: `${intToX(z)}px` }}><InlineMath math="z" />={z}</div>
                  </div>

                  {/* Connecting Lines */}
                  <svg className="absolute inset-0 w-full h-[160px] pointer-events-none" style={{ top: '8px' }}>
                    {floatValues.map((v, i) => (
                      <motion.line 
                        key={i}
                        x1={floatToX(v)} y1={0}
                        x2={intToX(quantized[i])} y2={152}
                        stroke="var(--color-border-main)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    ))}
                  </svg>
                </div>

                {/* Quantized Array */}
                <div className="flex gap-2 justify-center pb-8 mt-auto">
                  {quantized.map((q, i) => {
                    const isZeroPoint = q === z;
                    return (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center"
                      >
                        <div className={cn(
                          "w-14 h-14 flex items-center justify-center text-white font-mono text-base font-bold shadow-sm transition-colors mt-8",
                          isZeroPoint ? "bg-brand-crimson" : "bg-[#EC4899]"
                        )}>
                          {q}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
        </div>
      </section>
    </div>
  );
}
