import React, { useState } from "react";
import { cn } from "../../lib/utils";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { computeLoraForwardPass, calculateLoraParamStats } from "../../lib/lora-math";
import { GitBranch, ArrowRight } from "lucide-react";

export function Chapter07LoraWalkthrough() {
  const [rankR, setRankR] = useState<number>(8);
  const [alpha, setAlpha] = useState<number>(16);

  // Editable 2D Vector Math Input State
  const [xVec, setXVec] = useState<number[]>([1.0, 2.0]);
  const [w0Mat, setW0Mat] = useState<number[][]>([
    [0.5, -0.2],
    [0.1, 0.8],
  ]);
  const [aMat, setAMat] = useState<number[][]>([[0.1, 0.3]]);
  const [bMat, setBMat] = useState<number[][]>([[0.4], [-0.5]]);

  const stats = calculateLoraParamStats(4096, 4096, rankR, alpha);

  // Compute worked forward pass
  const passResult = computeLoraForwardPass({
    x: xVec,
    W0: w0Mat,
    A: aMat,
    B: bMat,
    alpha,
    r: rankR,
  });

  const handleW0Change = (rIdx: number, cIdx: number, val: number) => {
    const next = w0Mat.map(row => [...row]);
    next[rIdx][cIdx] = val;
    setW0Mat(next);
  };

  return (
    <div className="flex flex-col w-full min-h-full p-4 lg:p-8 space-y-8 bg-white dark:bg-[#09090B] text-black dark:text-white">
      
      {/* 📖 SECTION 1: THEORY & FORMULA BANNER */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
            SECTION 1
          </span>
          <h2 className="text-xl font-bold tracking-tight">Theory & Formula Banner: Low-Rank Adaptation (LoRA) Walkthrough</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          LoRA factorizes dense weight updates <InlineMath math="\Delta W \in \mathbb{R}^{d \times k}" /> into two low-rank matrices <InlineMath math="A \in \mathbb{R}^{r \times k}" /> and <InlineMath math="B \in \mathbb{R}^{d \times r}" /> where <InlineMath math="r \ll \min(d, k)" />. 
          During initialization, <InlineMath math="A \sim \mathcal{N}(0, \sigma^2)" /> is Gaussian initialized and <InlineMath math="B = 0" /> is zero initialized, guaranteeing <InlineMath math="\Delta W = 0" /> at training start!
        </p>

        <div className="py-3 px-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-sm space-y-2">
          <BlockMath math="\Delta W = \frac{\alpha}{r} (B \cdot A), \quad \text{where } A \in \mathbb{R}^{r \times k}, \; B \in \mathbb{R}^{d \times r}" />
          <BlockMath math="\text{Forward Pass: } h = W_0 x + \frac{\alpha}{r} (B \cdot A) x" />
        </div>
      </section>

      {/* 🎨 SECTION 2: DYNAMIC VISUAL CANVAS & ANIMATION */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
              SECTION 2
            </span>
            <h3 className="text-lg font-bold tracking-tight">Dynamic Visual Canvas: Matrix Rank Bottleneck Pipeline</h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span>Rank (<InlineMath math="r" />):</span>
              <input
                type="range"
                min="1"
                max="64"
                value={rankR}
                onChange={(e) => setRankR(parseInt(e.target.value))}
                className="w-24 accent-blue-600 cursor-pointer"
              />
              <span className="font-bold text-blue-600">{rankR}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Alpha (<InlineMath math="\alpha" />):</span>
              <input
                type="range"
                min="1"
                max="32"
                value={alpha}
                onChange={(e) => setAlpha(parseInt(e.target.value))}
                className="w-24 accent-purple-600 cursor-pointer"
              />
              <span className="font-bold text-purple-600">{alpha}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Bypass Canvas */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-[320px] flex flex-col justify-between relative overflow-hidden">
          
          {/* Top pipeline stats */}
          <div className="flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-blue-500" />
              <span>Input Vector <InlineMath math="x \in \mathbb{R}^{4096}" /></span>
            </div>
            <div className="flex items-center gap-2 font-bold text-emerald-600">
              <span>LoRA Scaling Multiplier <InlineMath math={`\\frac{\\alpha}{r} = \\frac{${alpha}}{${rankR}} = ${stats.scalingFactor.toFixed(2)}`} /></span>
            </div>
          </div>

          {/* Main Dual Flow Diagram */}
          <div className="my-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            
            {/* Input Node */}
            <div className="w-20 h-20 rounded-xl bg-blue-600 text-white font-mono text-xs font-bold flex flex-col items-center justify-center shadow-lg">
              <span><InlineMath math="x" /></span>
              <span className="text-[9px] opacity-80">[1.0, 2.0]</span>
            </div>

            {/* Path Split */}
            <div className="flex-1 flex flex-col items-center gap-6">
              
              {/* Main Frozen Path (W0) */}
              <div className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex justify-between items-center text-xs font-mono shadow-sm">
                <span className="font-bold text-zinc-500">Frozen Base Path (<InlineMath math="W_0 x" />)</span>
                <span className="font-bold text-blue-600">[{passResult.basePass[0].toFixed(2)}, {passResult.basePass[1].toFixed(2)}]^T</span>
              </div>

              {/* LoRA Bypass Path (A -> B -> Scaling) */}
              <div className="w-full p-3 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2 font-bold text-emerald-600">
                  <span>Down-Proj <InlineMath math="A" /> (<InlineMath math={`r=${rankR}`} />)</span>
                  <ArrowRight size={12} />
                  <span>Up-Proj <InlineMath math="B" /></span>
                  <ArrowRight size={12} />
                  <span>Scale <InlineMath math="\times \frac{\alpha}{r}" /></span>
                </div>
                <span className="font-bold text-emerald-600">[{passResult.scaledDelta[0].toFixed(2)}, {passResult.scaledDelta[1].toFixed(2)}]^T</span>
              </div>

            </div>

            {/* Summation Output Node */}
            <div className="w-24 h-24 rounded-xl bg-purple-600 text-white font-mono text-xs font-bold flex flex-col items-center justify-center shadow-xl">
              <span>Output <InlineMath math="h" /></span>
              <span className="text-[10px] text-purple-200 mt-1">[{passResult.finalOutput[0].toFixed(2)}, {passResult.finalOutput[1].toFixed(2)}]</span>
            </div>

          </div>

          <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-zinc-200 dark:border-zinc-800 text-zinc-500">
            <span>Base Params: <strong>16.7M</strong></span>
            <span>LoRA Params: <strong className="text-emerald-600">65.5K (0.39% of base weight!)</strong></span>
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
            <h3 className="text-lg font-bold tracking-tight">Step-by-Step 2D Worked Vector Forward Pass</h3>
          </div>

          <div className="text-xs font-mono font-bold text-blue-600">
            Scaling Multiplier <InlineMath math={`\\frac{\\alpha}{r} = ${passResult.scalingFactor.toFixed(1)}`} />
          </div>
        </div>

        {/* Editable 2D Vector Math Forward Pass Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-mono">
          
          {/* Inputs & Matrices (Editable) */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] space-y-4">
            <div className="font-bold text-sm text-blue-600">Editable Vector & Matrix Inputs</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold">Input Vector <InlineMath math="x \in \mathbb{R}^{2\times 1}" />:</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={xVec[0]}
                    onChange={(e) => setXVec([parseFloat(e.target.value) || 0, xVec[1]])}
                    className="w-16 p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-bold"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={xVec[1]}
                    onChange={(e) => setXVec([xVec[0], parseFloat(e.target.value) || 0])}
                    className="w-16 p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold">Matrix <InlineMath math="A \in \mathbb{R}^{1\times 2}" />:</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    value={aMat[0][0]}
                    onChange={(e) => setAMat([[parseFloat(e.target.value) || 0, aMat[0][1]]])}
                    className="w-16 p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-bold text-emerald-600"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={aMat[0][1]}
                    onChange={(e) => setAMat([[aMat[0][0], parseFloat(e.target.value) || 0]])}
                    className="w-16 p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-bold text-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 font-bold">Base Weight <InlineMath math="W_0 \in \mathbb{R}^{2\times 2}" />:</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[0, 1].map(r => [0, 1].map(c => (
                  <input
                    key={`w0-${r}-${c}`}
                    type="number"
                    step="0.1"
                    value={w0Mat[r][c]}
                    onChange={(e) => handleW0Change(r, c, parseFloat(e.target.value) || 0)}
                    className="w-full p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-bold"
                  />
                )))}
              </div>
            </div>
          </div>

          {/* Worked Steps Breakdown */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] space-y-3">
            <div className="font-bold text-sm text-purple-600">5-Step Calculations</div>

            <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <div>
                <strong>1. Base Pass <InlineMath math="W_0 x" />:</strong>
                <div className="font-bold text-black dark:text-white">
                  [{w0Mat[0][0]}({xVec[0]}) + {w0Mat[0][1]}({xVec[1]}), {w0Mat[1][0]}({xVec[0]}) + {w0Mat[1][1]}({xVec[1]})]^T = <strong>[{passResult.basePass[0].toFixed(2)}, {passResult.basePass[1].toFixed(2)}]^T</strong>
                </div>
              </div>

              <div>
                <strong>2. Down-Projection <InlineMath math="A x" />:</strong>
                <div className="font-bold text-emerald-600">
                  {aMat[0][0]}({xVec[0]}) + {aMat[0][1]}({xVec[1]}) = <strong>{passResult.downProj.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <strong>3. Up-Projection <InlineMath math="B(Ax)" />:</strong>
                <div className="font-bold text-emerald-600">
                  [{bMat[0][0]}({passResult.downProj.toFixed(2)}), {bMat[1][0]}({passResult.downProj.toFixed(2)})]^T = <strong>[{passResult.upProj[0].toFixed(2)}, {passResult.upProj[1].toFixed(2)}]^T</strong>
                </div>
              </div>

              <div>
                <strong>4. Scaled Adapter Delta <InlineMath math="\frac{\alpha}{r} B(Ax)" />:</strong>
                <div className="font-bold text-purple-600">
                  {passResult.scalingFactor.toFixed(1)} * [{passResult.upProj[0].toFixed(2)}, {passResult.upProj[1].toFixed(2)}]^T = <strong>[{passResult.scaledDelta[0].toFixed(2)}, {passResult.scaledDelta[1].toFixed(2)}]^T</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-black dark:text-white font-bold">
                5. Final Combined Output <InlineMath math="h = W_0 x + \Delta W x" />:
                <div className="text-sm text-purple-600 font-bold mt-0.5">
                  [{passResult.basePass[0].toFixed(2)}, {passResult.basePass[1].toFixed(2)}]^T + [{passResult.scaledDelta[0].toFixed(2)}, {passResult.scaledDelta[1].toFixed(2)}]^T = <strong>[{passResult.finalOutput[0].toFixed(2)}, {passResult.finalOutput[1].toFixed(2)}]^T</strong>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
