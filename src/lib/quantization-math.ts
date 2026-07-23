export function calculateVram(paramsBillion: number, precisionBits: number): number {
  return (paramsBillion * (precisionBits / 8));
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

  const exponent = [];
  for (let i = 7; i >= 0; i--) {
    exponent.push((exponentVal >>> i) & 1);
  }

  const mantissa = [];
  for (let i = 22; i >= 0; i--) {
    mantissa.push((mantissaVal >>> i) & 1);
  }

  return { sign, exponent, mantissa };
}

export function quantizeSymmetric(values: number[]): { scale: number, quantized: number[], dequantized: number[] } {
  if (values.length === 0) return { scale: 1, quantized: [], dequantized: [] };
  const alpha = Math.max(...values.map(Math.abs));
  const scale = alpha / 127;
  
  const quantized = values.map(v => {
    let q = Math.round(v / scale);
    if (q > 127) q = 127;
    if (q < -127) q = -127;
    return q;
  });
  
  const dequantized = quantized.map(q => q * scale);
  
  return { scale, quantized, dequantized };
}

export function quantizeAsymmetric(values: number[]): { scale: number, zeroPoint: number, quantized: number[], dequantized: number[] } {
  if (values.length === 0) return { scale: 1, zeroPoint: 0, quantized: [], dequantized: [] };
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  const scale = (max - min) / 255;
  let zeroPoint = Math.round(-min / scale) - 128;
  
  if (zeroPoint < -128) zeroPoint = -128;
  if (zeroPoint > 127) zeroPoint = 127;

  const quantized = values.map(v => {
    let q = Math.round(v / scale) + zeroPoint;
    if (q > 127) q = 127;
    if (q < -128) q = -128;
    return q;
  });

  const dequantized = quantized.map(q => (q - zeroPoint) * scale);
  
  return { scale, zeroPoint, quantized, dequantized };
}

export function calculateMSE(original: number[], dequantized: number[]): number {
  if (original.length === 0 || original.length !== dequantized.length) return 0;
  const sum = original.reduce((acc, val, i) => acc + Math.pow(val - dequantized[i], 2), 0);
  return sum / original.length;
}
