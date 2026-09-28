import { writeFile } from 'node:fs/promises';
import { layerNormEpsilon, parameters, runTransformer, serializeRun } from '../src/transformer/model.ts';

await writeFile(new URL('../evidence/Transformer实验结果.json', import.meta.url), serializeRun({
  scope: '单层、单头、4维、pre-LayerNorm 的人工 decoder；未训练，不是 Qwen 内部记录。',
  normalization: { gamma: 1, beta: 0, epsilon: layerNormEpsilon, scope: '每个位置独立计算均值与方差' },
  parameters,
  maskedOriginal: runTransformer('D', true),
  maskedChangedFuture: runTransformer('E', true),
  unmaskedOriginal: runTransformer('D', false),
  unmaskedChangedFuture: runTransformer('E', false),
}) + '\n');
