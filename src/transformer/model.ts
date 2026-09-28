import { softmax } from '../generation/model';

export type Matrix = number[][];
export const vocabulary = ['A', 'B', 'C', 'D', 'E'] as const;
export type TeachingToken = typeof vocabulary[number];
export const modelWidth = 4;
export const layerNormEpsilon = 1e-5;

// 固定人工参数，只用于验证计算链与因果性，没有经过训练。
export const parameters = {
  embeddings: [
    [1, 0, -1, 0.5], [0.2, 1, 0.4, -0.6], [-0.4, 0.3, 1, 0.2],
    [0.8, -0.7, 0.1, 1], [-1, 0.9, 0.6, -0.2],
  ],
  positions: [[0, 0, 0, 0], [0.1, 0.2, -0.1, 0], [0.2, -0.1, 0, 0.1], [-0.1, 0.1, 0.2, 0.3]],
  query: [[0.6, 0.1, 0, -0.2], [0, 0.7, 0.2, 0.1], [0.2, -0.1, 0.5, 0], [-0.1, 0.2, 0, 0.6]],
  key: [[0.5, -0.2, 0.1, 0], [0.1, 0.6, 0, 0.2], [0, 0.1, 0.7, -0.1], [0.2, 0, -0.2, 0.5]],
  value: [[0.5, 0.1, -0.1, 0], [0, 0.7, 0.2, -0.1], [0.2, 0, 0.5, 0.1], [-0.1, 0.2, 0, 0.6]],
  attentionOutput: [[0.7, 0.1, 0, 0.1], [-0.1, 0.6, 0.2, 0], [0.1, 0, 0.8, -0.1], [0, 0.2, 0.1, 0.7]],
  ffnInput: [
    [0.4, -0.2, 0.1, 0.6, 0, -0.3], [0.1, 0.5, -0.4, 0, 0.3, 0.2],
    [-0.2, 0.1, 0.6, -0.1, 0.4, 0], [0.3, 0, -0.1, 0.2, -0.2, 0.5],
  ],
  ffnInputBias: [0.1, 0, -0.1, 0.2, 0, 0.05],
  ffnOutput: [[0.4, 0.1, -0.2, 0], [-0.1, 0.5, 0, 0.2], [0.2, -0.1, 0.4, 0.1], [0.1, 0.2, 0, 0.3], [0, -0.2, 0.3, 0.1], [0.2, 0, -0.1, 0.4]],
  ffnOutputBias: [0, 0.05, -0.05, 0],
  vocabularyOutput: [[0.7, -0.4, 0.1, 0.3, -0.2], [0, 0.6, -0.3, 0.2, 0.1], [-0.4, 0.1, 0.8, -0.2, 0.3], [0.2, -0.1, 0, 0.5, -0.6]],
};

const multiply = (left: Matrix, right: Matrix): Matrix => left.map((row) => right[0].map((_, column) => row.reduce((sum, value, index) => sum + value * right[index][column], 0)));
const transpose = (matrix: Matrix): Matrix => matrix[0].map((_, column) => matrix.map((row) => row[column]));
const add = (left: Matrix, right: Matrix): Matrix => left.map((row, i) => row.map((value, j) => value + right[i][j]));
const bias = (matrix: Matrix, values: number[]): Matrix => matrix.map((row) => row.map((value, index) => value + values[index]));

// 每个位置独立归一化；不跨位置统计，γ=1、β=0。
function layerNorm(matrix: Matrix): Matrix {
  return matrix.map((row) => {
    const mean = row.reduce((sum, value) => sum + value, 0) / row.length;
    const variance = row.reduce((sum, value) => sum + (value - mean) ** 2, 0) / row.length;
    return row.map((value) => (value - mean) / Math.sqrt(variance + layerNormEpsilon));
  });
}

export function runTransformer(lastToken: 'D' | 'E' = 'D', causal = true) {
  const tokens: TeachingToken[] = ['A', 'B', 'C', lastToken];
  const embedding = tokens.map((token) => [...parameters.embeddings[vocabulary.indexOf(token)]]);
  const hiddenInput = add(embedding, parameters.positions);
  const normBeforeAttention = layerNorm(hiddenInput);
  const query = multiply(normBeforeAttention, parameters.query);
  const key = multiply(normBeforeAttention, parameters.key);
  const value = multiply(normBeforeAttention, parameters.value);
  const scaledScores = multiply(query, transpose(key)).map((row) => row.map((score) => score / Math.sqrt(modelWidth)));
  const allowed = tokens.map((_, i) => tokens.map((_, j) => !causal || j <= i));
  const maskedScores = scaledScores.map((row, i) => row.map((score, j) => allowed[i][j] ? score : -Infinity));
  const attentionWeights = maskedScores.map(softmax);
  const attentionMix = multiply(attentionWeights, value);
  const attentionOutput = multiply(attentionMix, parameters.attentionOutput);
  const afterAttentionResidual = add(hiddenInput, attentionOutput);
  const normBeforeFfn = layerNorm(afterAttentionResidual);
  const ffnExpanded = bias(multiply(normBeforeFfn, parameters.ffnInput), parameters.ffnInputBias);
  const ffnActivated = ffnExpanded.map((row) => row.map((value) => Math.max(0, value)));
  const ffnOutput = bias(multiply(ffnActivated, parameters.ffnOutput), parameters.ffnOutputBias);
  const afterFfnResidual = add(afterAttentionResidual, ffnOutput);
  const finalNorm = layerNorm(afterFfnResidual);
  const logits = multiply(finalNorm, parameters.vocabularyOutput);
  const probabilities = logits.map(softmax);
  return {
    tokens, causal, allowed,
    stages: {
      embedding, position: parameters.positions, hiddenInput, normBeforeAttention,
      query, key, value, scaledScores, maskedScores, attentionWeights, attentionMix,
      attentionOutput, afterAttentionResidual, normBeforeFfn, ffnExpanded, ffnActivated,
      ffnOutput, afterFfnResidual, finalNorm, logits, probabilities,
    },
  };
}

export type TransformerRun = ReturnType<typeof runTransformer>;

// JSON 中用字符串保留遮罩的 -∞，避免被隐式转为 null。
export const serializeRun = (value: unknown) => JSON.stringify(value, (_, item) => item === -Infinity ? '-Infinity' : item, 2);
