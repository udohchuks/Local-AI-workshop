import React, { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { quantizeSymmetric, quantizeAsymmetric } from "../../lib/quantization-math";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

export function Chapter03LinearMappingTheory() {
  const [mode, setMode] = useState<"symmetric" | "asymmetric">("symmetric");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Example float values
  const floatValues = [-2.5, -1.0, 0.0, 3.2, 5.5, 7.5];

  const sym = quantizeSymmetric(floatValues);
  const asym = quantizeAsymmetric(floatValues);

  const { scale, quantized, dequantized } = mode === "symmetric" ? sym : asym;
  const zeroPoint = mode === "symmetric" ? 0 : asym.zeroPoint;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const minFloat = Math.min(...floatValues, 0);
    const maxFloat = Math.max(...floatValues, 0);
    const floatRange = maxFloat - minFloat;

    const floatToX = (v: number) => {
      // 10% padding on sides
      const padding = width * 0.1;
      const usableWidth = width - padding * 2;
      return padding + ((v - minFloat) / floatRange) * usableWidth;
    };

    const intToX = (v: number) => {
      const padding = width * 0.1;
      const usableWidth = width - padding * 2;
      return padding + ((v - (-128)) / 255) * usableWidth;
    };

    // Animation variables
    let progress = 0;
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Colors based on theme
      const isDark = document.documentElement.classList.contains("dark");
      const textColor = isDark ? "#FAFAFA" : "#09090B";
      const axisColor = isDark ? "#3F3F46" : "#09090B"; 
      const brandBlue = "#3B82F6";
      const brandEmerald = "#10B981";

      const topY = 60;
      const bottomY = height - 60;

      // Draw Top Axis (Float)
      ctx.beginPath();
      ctx.moveTo(width * 0.05, topY);
      ctx.lineTo(width * 0.95, topY);
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw tick marks for Float Space
      ctx.fillStyle = textColor;
      ctx.font = "10px JetBrains Mono";
      ctx.textAlign = "center";
      
      // Draw 3 reference ticks on top axis
      const refTicks = [minFloat, (minFloat + maxFloat) / 2, maxFloat];
      refTicks.forEach(tick => {
        const x = floatToX(tick);
        ctx.beginPath();
        ctx.moveTo(x, topY - 3);
        ctx.lineTo(x, topY + 3);
        ctx.strokeStyle = textColor;
        ctx.stroke();
      });

      ctx.textAlign = "left";
      ctx.fillText("Continuous Float Space (ℝ)", width * 0.05, topY - 20);

      // Draw Bottom Axis (Int)
      ctx.beginPath();
      ctx.moveTo(width * 0.05, bottomY);
      ctx.lineTo(width * 0.95, bottomY);
      ctx.strokeStyle = isDark ? "#3F3F46" : "#D4D4D8";
      ctx.stroke();

      ctx.textAlign = "right";
      ctx.fillText("Quantized INT8 Space (ℤ)", width * 0.95, bottomY + 30);

      // Draw tick marks for Integer Space
      ctx.textAlign = "center";
      [-128, 0, 127].forEach(tick => {
        const x = intToX(tick);
        ctx.beginPath();
        ctx.moveTo(x, bottomY - 3);
        ctx.lineTo(x, bottomY + 3);
        ctx.strokeStyle = isDark ? "#3F3F46" : "#D4D4D8";
        ctx.stroke();
        ctx.fillStyle = textColor;
        ctx.fillText(tick.toString(), x, bottomY + 20);
      });

      // Animate connections
      progress += 0.02;
      if (progress > 1) progress = 1;

      floatValues.forEach((floatVal, i) => {
        const startX = floatToX(floatVal);
        const endX = intToX(quantized[i]);

        // Draw Line
        ctx.beginPath();
        ctx.moveTo(startX, topY + 5);
        const currentY = topY + 5 + (bottomY - topY - 10) * progress;
        const currentX = startX + (endX - startX) * progress;
        
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw Float Point
        ctx.beginPath();
        ctx.arc(startX, topY, 3, 0, Math.PI * 2);
        ctx.fillStyle = brandBlue;
        ctx.fill();

        // Draw Int Point (fade in based on progress)
        ctx.globalAlpha = progress;
        ctx.beginPath();
        ctx.arc(endX, bottomY, 4, 0, Math.PI * 2);
        ctx.fillStyle = brandEmerald;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Zero Point indicator
      if (mode === "asymmetric" && progress === 1) {
        const zx = intToX(zeroPoint || 0);
        ctx.beginPath();
        ctx.arc(zx, bottomY, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#EF4444";
        ctx.fillText(`z=${zeroPoint}`, zx, bottomY - 15);
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, floatValues, quantized, zeroPoint]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full h-full animate-in fade-in duration-500">
      {/* Narrative Pane */}
      <section className="w-full lg:w-[420px] p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-border-main dark:border-border-dark flex flex-col gap-6 shrink-0 bg-white dark:bg-bg-dark overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-3xl font-serif leading-tight italic">The Logic of Compression</h2>
          <p className="text-sm text-text-muted dark:text-text-muted-dark leading-relaxed">
            Quantization maps high-precision float values to lower-precision integers. By squeezing weights into fewer bits, we drastically reduce memory footprint at the cost of precision.
          </p>
        </div>
        
        <div className="p-5 bg-sidebar-bg dark:bg-[#121214] border-l-4 border-brand-blue text-[11px] leading-relaxed">
          <div className="text-text-muted dark:text-text-muted-dark mb-3 font-bold uppercase tracking-widest font-sans">
            {mode === "symmetric" ? "Linear Symmetric Quantization" : "Asymmetric Quantization"}
          </div>
          <div className="text-[13px] overflow-x-auto overflow-y-hidden space-y-2">
            {mode === "symmetric" ? (
              <>
                <BlockMath math={`\\textcolor{#eab308}{s} = \\frac{\\textcolor{#06b6d4}{\\alpha}}{127}`} />
                <BlockMath math={`\\text{x}_{\\text{quantized}} = \\text{clamp}\\left(\\text{round}\\left(\\frac{\\textcolor{#a855f7}{x}}{\\textcolor{#eab308}{s}}\\right), -127, 127\\right)`} />
              </>
            ) : (
              <>
                <BlockMath math={`\\textcolor{#eab308}{s} = \\frac{\\textcolor{#06b6d4}{\\alpha} - \\textcolor{#10b981}{\\beta}}{255}`} />
                <BlockMath math={`\\textcolor{#3b82f6}{z} = \\text{round}\\left(-\\frac{\\textcolor{#10b981}{\\beta}}{\\textcolor{#eab308}{s}}\\right) - 128`} />
                <BlockMath math={`\\text{x}_{\\text{quantized}} = \\text{clamp}\\left(\\text{round}\\left(\\frac{\\textcolor{#a855f7}{x}}{\\textcolor{#eab308}{s}}\\right) + \\textcolor{#3b82f6}{z}, -128, 127\\right)`} />
              </>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-4 pt-8 lg:pt-0">
          <div className="text-[10px] font-bold uppercase text-text-muted dark:text-text-muted-dark tracking-widest">Active Constraints</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-border-main dark:border-border-dark rounded">
              <div className="text-[9px] uppercase opacity-50">Scale (s)</div>
              <div className="text-sm font-mono">{scale.toFixed(5)}</div>
            </div>
            <div className="p-3 border border-border-main dark:border-border-dark rounded">
              <div className="text-[9px] uppercase opacity-50">Zero-Pt (z)</div>
              <div className="text-sm font-mono">{mode === "symmetric" ? "0" : zeroPoint}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visualizer */}
      <section className="flex-1 bg-bg-app dark:bg-bg-dark relative flex flex-col p-4 lg:p-8 overflow-y-auto">
        <div className="flex-1 border border-dashed border-[#D4D4D8] dark:border-[#3F3F46] rounded-xl flex flex-col p-6 lg:p-10 relative overflow-hidden bg-white dark:bg-[#18181B] shadow-inner min-h-[400px]">
          
          <div className="flex-1 relative flex items-center justify-center">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full max-h-[300px]"
              style={{ display: "block" }}
            />
          </div>

          {/* Simulation Controls */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <button 
                onClick={() => setMode(mode === "symmetric" ? "asymmetric" : "symmetric")}
                className="px-4 py-2 bg-text-main dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded transition-colors hover:opacity-90"
              >
                Toggle Mode
              </button>
            </div>
            <div className="flex gap-4 sm:gap-8 items-center">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-text-muted dark:text-text-muted-dark font-mono uppercase">Avg Error (MSE)</span>
                <span className="text-xs font-mono font-bold">
                  {(floatValues.reduce((acc, val, i) => acc + Math.pow(val - dequantized[i], 2), 0) / floatValues.length).toFixed(7)}
                </span>
              </div>
              <div className="w-24 h-12 bg-white dark:bg-bg-dark border border-border-main dark:border-border-dark rounded-lg flex flex-col justify-center px-3 relative overflow-hidden">
                <span className="text-[9px] uppercase font-bold text-brand-blue relative z-10">
                  {mode}
                </span>
                <div className="absolute bottom-0 left-0 h-1 bg-brand-blue transition-all duration-300"
                     style={{ width: mode === "symmetric" ? "100%" : "100%", opacity: mode === "symmetric" ? 0.5 : 1 }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
