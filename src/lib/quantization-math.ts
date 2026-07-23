export function calculateVram(paramsBillion: number, precisionBits: number): number {
  return paramsBillion * (precisionBits / 8);
}

// NF4 16 Quantile lookup table for N(0,1)
export const NF4_QUANTILE_TABLE = [
  -1.0,
  -0.6962,
  -0.5251,
  -0.3949,
  -0.2844,
  -0.1848,
  -0.0910,
  0.0,
  0.0796,
  0.1609,
  0.2471,
  0.3393,
  0.4407,
  0.5585,
  0.7042,
  1.0
];

export function quantizeNF4(value: number): {
  index: number;
  binValue: number;
  error: number;
} {
  // Clamp value to NF4 range [-1.0, 1.0]
  const clamped = Math.max(-1.0, Math.min(1.0, value));
  let minDiff = Infinity;
  let bestIdx = 0;

  for (let i = 0; i < NF4_QUANTILE_TABLE.length; i++) {
    const diff = Math.abs(clamped - NF4_QUANTILE_TABLE[i]);
    if (diff < minDiff) {
      minDiff = diff;
      bestIdx = i;
    }
  }

  const binValue = NF4_QUANTILE_TABLE[bestIdx];
  return {
    index: bestIdx,
    binValue,
    error: Math.abs(value - binValue),
  };
}

export function ieee754ToFloat(sign: number, exponent: number[], mantissa: number[]): number {
  const exponentVal = exponent.reduce((acc, bit, i) => acc + bit * Math.pow(2, exponent.length - 1 - i), 0);
  const mantissaVal = mantissa.reduce((acc, bit, i) => acc + bit * Math.pow(2, -(i + 1)), 0);

  if (exponentVal === 0) {
    if (mantissaVal === 0) return sign === 1 ? -0 : 0;
    // Subnormal
    return Math.pow(-1, sign) * Math.pow(2, 1 - 127) * mantissaVal;
  }
  
  if (exponentVal === 255) {
    return mantissaVal === 0 ? (sign === 1 ? -Infinity : Infinity) : NaN;
  }

  return Math.pow(-1, sign) * Math.pow(2, exponentVal - 127) * (1 + mantissaVal);
}

export function floatToIeee754(value: number): { sign: number, exponent: number[], mantissa: number[] } {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value);
  const intVal = view.getUint32(0);
  
  const sign = (intVal >>> 31) & 1;
  const exponentVal = (intVal >>> 23) & 0xff;
  const mantissaVal = intVal & 0x7fffff;

  const exponent: number[] = [];
  for (let i = 7; i >= 0; i--) {
    exponent.push((exponentVal >>> i) & 1);
  }

  const mantissa: number[] = [];
  for (let i = 22; i >= 0; i--) {
    mantissa.push((mantissaVal >>> i) & 1);
  }

  return { sign, exponent, mantissa };
}

// Convert FP16 bits (1 sign, 5 exponent, 10 mantissa) to float
export function fp16BitsToFloat(sign: number, exponent: number[], mantissa: number[]): number {
  const expVal = exponent.reduce((acc, b, i) => acc + b * Math.pow(2, exponent.length - 1 - i), 0);
  const mantVal = mantissa.reduce((acc, b, i) => acc + b * Math.pow(2, -(i + 1)), 0);
  
  if (expVal === 0) {
    return Math.pow(-1, sign) * Math.pow(2, -14) * mantVal;
  }
  if (expVal === 31) {
    return mantVal === 0 ? (sign === 1 ? -Infinity : Infinity) : NaN;
  }
  return Math.pow(-1, sign) * Math.pow(2, expVal - 15) * (1 + mantVal);
}

// Convert BF16 bits (1 sign, 8 exponent, 7 mantissa) to float
export function bf16BitsToFloat(sign: number, exponent: number[], mantissa: number[]): number {
  const expVal = exponent.reduce((acc, b, i) => acc + b * Math.pow(2, exponent.length - 1 - i), 0);
  const mantVal = mantissa.reduce((acc, b, i) => acc + b * Math.pow(2, -(i + 1)), 0);
  
  if (expVal === 0) {
    return Math.pow(-1, sign) * Math.pow(2, -126) * mantVal;
  }
  if (expVal === 255) {
    return mantVal === 0 ? (sign === 1 ? -Infinity : Infinity) : NaN;
  }
  return Math.pow(-1, sign) * Math.pow(2, expVal - 127) * (1 + mantVal);
}

export function quantizeSymmetric(values: number[]): { scale: number, quantized: number[], dequantized: number[], exactRatios: number[], errors: number[], mae: number } {
  if (values.length === 0) return { scale: 1, quantized: [], dequantized: [], exactRatios: [], errors: [], mae: 0 };
  const alpha = Math.max(...values.map(v => Math.abs(v)));
  const scale = alpha / 127;
  
  const exactRatios = values.map(v => (scale === 0 ? 0 : v / scale));
  const quantized = values.map(v => {
    if (scale === 0) return 0;
    let q = Math.round(v / scale);
    if (q > 127) q = 127;
    if (q < -128) q = -128;
    return q;
  });
  
  const dequantized = quantized.map(q => q * scale);
  const errors = values.map((v, i) => Math.abs(v - dequantized[i]));
  const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length;

  return { scale, quantized, dequantized, exactRatios, errors, mae };
}

export function quantizeAsymmetric(values: number[]): { scale: number, zeroPoint: number, quantized: number[], dequantized: number[], exactRatios: number[], errors: number[], mae: number } {
  if (values.length === 0) return { scale: 1, zeroPoint: 0, quantized: [], dequantized: [], exactRatios: [], errors: [], mae: 0 };
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  const range = max - min;
  const scale = range === 0 ? 1 : range / 255;
  let zeroPoint = Math.round(-min / scale) - 128;
  
  if (zeroPoint < -128) zeroPoint = -128;
  if (zeroPoint > 127) zeroPoint = 127;

  const exactRatios = values.map(v => (v / scale) + zeroPoint);
  const quantized = values.map(v => {
    let q = Math.round(v / scale) + zeroPoint;
    if (q > 127) q = 127;
    if (q < -128) q = -128;
    return q;
  });

  const dequantized = quantized.map(q => (q - zeroPoint) * scale);
  const errors = values.map((v, i) => Math.abs(v - dequantized[i]));
  const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length;
  
  return { scale, zeroPoint, quantized, dequantized, exactRatios, errors, mae };
}

export function calculateMSE(original: number[], dequantized: number[]): number {
  if (original.length === 0 || original.length !== dequantized.length) return 0;
  const sum = original.reduce((acc, val, i) => acc + Math.pow(val - dequantized[i], 2), 0);
  return sum / original.length;
}

export function calculateMAE(original: number[], dequantized: number[]): number {
  if (original.length === 0 || original.length !== dequantized.length) return 0;
  const sum = original.reduce((acc, val, i) => acc + Math.abs(val - dequantized[i]), 0);
  return sum / original.length;
}
