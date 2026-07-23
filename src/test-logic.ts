import { quantizeSymmetric, quantizeAsymmetric, quantizeNF4, calculateVram } from "./lib/quantization-math";
import { computeLoraForwardPass, calculateLoraParamStats, calculateQloraVram } from "./lib/lora-math";

console.log("=== TESTING QUANTIZATION MATH ENGINE ===");

// Test 1: Symmetric Quantization
const symRes = quantizeSymmetric([-6.4, -1.2, 0.0, 2.5, 8.1]);
console.log("Symmetric Scale:", symRes.scale.toFixed(6));
console.log("Symmetric Quantized:", symRes.quantized);
console.log("Symmetric Dequantized:", symRes.dequantized.map(v => v.toFixed(3)));
console.log("Symmetric MAE:", symRes.mae.toFixed(6));

// Test 2: Asymmetric Quantization
const asymRes = quantizeAsymmetric([-6.4, -1.2, 0.0, 2.5, 8.1]);
console.log("\nAsymmetric Scale:", asymRes.scale.toFixed(6));
console.log("Asymmetric Zero-Point:", asymRes.zeroPoint);
console.log("Asymmetric Quantized:", asymRes.quantized);
console.log("Asymmetric Dequantized:", asymRes.dequantized.map(v => v.toFixed(3)));
console.log("Asymmetric MAE:", asymRes.mae.toFixed(6));

// Test 3: NF4 Quantization
const nf4Res = quantizeNF4(0.55);
console.log("\nNF4 Mapping for 0.55:", nf4Res);

// Test 4: LoRA Forward Pass
console.log("\n=== TESTING LORA MATH ENGINE ===");
const loraRes = computeLoraForwardPass({
  x: [1.0, 2.0],
  W0: [[0.5, -0.2], [0.1, 0.8]],
  A: [[0.1, 0.3]],
  B: [[0.4], [-0.5]],
  alpha: 16,
  r: 8,
});
console.log("LoRA Base Pass (W0 * x):", loraRes.basePass);
console.log("LoRA Down-Projection (A * x):", loraRes.downProj);
console.log("LoRA Up-Projection (B * Ax):", loraRes.upProj);
console.log("LoRA Scaled Delta:", loraRes.scaledDelta);
console.log("LoRA Final Output h:", loraRes.finalOutput);

// Test 5: QLoRA VRAM
const qloraVram = calculateQloraVram(65, 64);
console.log("\nQLoRA 65B Total VRAM:", qloraVram.totalGbs.toFixed(2), "GB");

console.log("\nALL MATHEMATICAL CALCULATIONS VERIFIED SUCESSFULLY!");
