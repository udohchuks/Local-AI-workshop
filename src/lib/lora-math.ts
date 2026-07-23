export interface Matrix2D {
  rows: number;
  cols: number;
  data: number[][];
}

// Multiply 2x2 matrix by 2x1 vector
export function multiplyMatVec2D(mat: number[][], vec: number[]): number[] {
  return [
    mat[0][0] * vec[0] + mat[0][1] * vec[1],
    mat[1][0] * vec[0] + mat[1][1] * vec[1],
  ];
}

// Multiply 1x2 matrix (A) by 2x1 vector (x) -> 1x1 scalar
export function multiplyRowVec2D(rowMat: number[][], vec: number[]): number {
  return rowMat[0][0] * vec[0] + rowMat[0][1] * vec[1];
}

// Multiply 2x1 column matrix (B) by scalar (ax) -> 2x1 vector
export function multiplyColScalar2D(colMat: number[][], scalar: number): number[] {
  return [
    colMat[0][0] * scalar,
    colMat[1][0] * scalar,
  ];
}

export interface LoraForwardPassInput {
  x: number[]; // 2x1
  W0: number[][]; // 2x2
  A: number[][]; // 1x2 (r=1)
  B: number[][]; // 2x1 (r=1)
  alpha: number;
  r: number;
}

export interface LoraForwardPassResult {
  basePass: number[]; // W0 * x
  downProj: number; // A * x
  upProj: number[]; // B * (A * x)
  scalingFactor: number; // alpha / r
  scaledDelta: number[]; // (alpha / r) * B * (A * x)
  finalOutput: number[]; // W0 * x + scaledDelta
}

export function computeLoraForwardPass(input: LoraForwardPassInput): LoraForwardPassResult {
  const { x, W0, A, B, alpha, r } = input;
  
  const basePass = multiplyMatVec2D(W0, x);
  const downProj = multiplyRowVec2D(A, x);
  const upProj = multiplyColScalar2D(B, downProj);
  const scalingFactor = alpha / Math.max(r, 1);
  const scaledDelta = [
    upProj[0] * scalingFactor,
    upProj[1] * scalingFactor,
  ];
  const finalOutput = [
    basePass[0] + scaledDelta[0],
    basePass[1] + scaledDelta[1],
  ];

  return {
    basePass,
    downProj,
    upProj,
    scalingFactor,
    scaledDelta,
    finalOutput,
  };
}

export interface LoraParamStats {
  baseParams: number;
  loraParams: number;
  percentage: number;
  scalingFactor: number;
}

export function calculateLoraParamStats(
  dIn: number = 4096,
  dOut: number = 4096,
  r: number = 8,
  alpha: number = 16
): LoraParamStats {
  const baseParams = dIn * dOut;
  const loraParams = r * dIn + dOut * r; // A + B matrices
  const percentage = (loraParams / baseParams) * 100;
  const scalingFactor = alpha / Math.max(r, 1);

  return {
    baseParams,
    loraParams,
    percentage,
    scalingFactor,
  };
}

export interface ModelVramBreakdown {
  weightsGbs: number;
  gradientsGbs: number;
  optimizerGbs: number;
  totalGbs: number;
}

export function calculateFullFtVram(
  numParamsBillion: number,
  baseBits: number = 16
): ModelVramBreakdown {
  const bytesPerWeight = baseBits / 8;
  const weightsGbs = numParamsBillion * bytesPerWeight;
  const gradientsGbs = numParamsBillion * 2; // FP16 grads
  const optimizerGbs = numParamsBillion * 8; // FP32 Adam (m_t=4B, v_t=4B)
  const totalGbs = weightsGbs + gradientsGbs + optimizerGbs;

  return {
    weightsGbs,
    gradientsGbs,
    optimizerGbs,
    totalGbs,
  };
}

export function calculateLoraVram(
  numParamsBillion: number,
  baseBits: number = 16,
  loraParamFraction: number = 0.002 // 0.2%
): ModelVramBreakdown {
  const bytesPerWeight = baseBits / 8;
  const weightsGbs = numParamsBillion * bytesPerWeight;
  const trainableParamsBillion = numParamsBillion * loraParamFraction;
  const gradientsGbs = trainableParamsBillion * 2; // FP16 grads for adapters
  const optimizerGbs = trainableParamsBillion * 8; // FP32 Adam for adapters
  const totalGbs = weightsGbs + gradientsGbs + optimizerGbs;

  return {
    weightsGbs,
    gradientsGbs,
    optimizerGbs,
    totalGbs,
  };
}

export function calculateQloraVram(
  numParamsBillion: number = 65,
  r: number = 64
): {
  baseNf4Gbs: number;
  doubleQuantGbs: number;
  adaptersGbs: number;
  pagedAdamGbs: number;
  totalGbs: number;
} {
  // NF4 = 4 bits per param = 0.5 bytes / param
  const baseNf4Gbs = numParamsBillion * 0.5;
  // Double quantization saves scale overhead -> ~0.05 GB for 65B
  const doubleQuantGbs = 0.05 * (numParamsBillion / 65);
  // LoRA Adapters for r=64 (~0.8 GB for 65B)
  const adaptersGbs = 0.8 * (numParamsBillion / 65) * (r / 64);
  // Paged AdamW optimizer states (~2.4 GB for 65B adapters)
  const pagedAdamGbs = 2.4 * (numParamsBillion / 65) * (r / 64);
  const totalGbs = baseNf4Gbs + doubleQuantGbs + adaptersGbs + pagedAdamGbs;

  return {
    baseNf4Gbs,
    doubleQuantGbs,
    adaptersGbs,
    pagedAdamGbs,
    totalGbs,
  };
}
