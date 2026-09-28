import assert from 'node:assert/strict';
import test from 'node:test';
import { runTransformer, vocabulary } from '../src/transformer/model.ts';

test('因果遮罩阻断未来输入，前面三个位置的中间表示与输出分布完全不变', () => {
  const before = runTransformer('D', true);
  const after = runTransformer('E', true);
  for (const stage of ['afterAttentionResidual', 'afterFfnResidual', 'finalNorm', 'logits', 'probabilities'] as const) {
    assert.deepEqual(before.stages[stage].slice(0, 3), after.stages[stage].slice(0, 3));
  }
  before.stages.attentionWeights.forEach((row, i) => row.forEach((weight, j) => {
    if (j > i) assert.equal(weight, 0);
  }));
  assert.notDeepEqual(before.stages.probabilities[3], after.stages.probabilities[3]);
});

test('关闭遮罩后，改变第4个 token 会改变第2个位置的预测分布', () => {
  const before = runTransformer('D', false);
  const after = runTransformer('E', false);
  assert.ok(before.stages.attentionWeights[1][3] > 0);
  const largestDifference = Math.max(...before.stages.probabilities[1].map((value, i) => Math.abs(value - after.stages.probabilities[1][i])));
  assert.ok(largestDifference > 0.01, `实际差异 ${largestDifference} 应足以观察`);
});

test('完整计算链保持矩阵形状、有效数值和逐行概率归一化', () => {
  for (const causal of [true, false]) for (const lastToken of ['D', 'E'] as const) {
    const result = runTransformer(lastToken, causal);
    for (const [name, matrix] of Object.entries(result.stages)) {
      assert.equal(matrix.length, 4, `${name} 保留4个位置`);
      const width = name === 'ffnExpanded' || name === 'ffnActivated' ? 6 : name === 'logits' || name === 'probabilities' ? vocabulary.length : 4;
      matrix.forEach((row, i) => {
        assert.equal(row.length, width, name);
        row.forEach((value, j) => {
          if (name === 'maskedScores' && !result.allowed[i][j]) assert.equal(value, -Infinity);
          else assert.ok(Number.isFinite(value), `${name}[${i},${j}] 应为有限值`);
        });
      });
    }
    for (const matrix of [result.stages.attentionWeights, result.stages.probabilities]) matrix.forEach((row) => {
      assert.ok(row.every((value) => value >= 0 && value <= 1));
      assert.ok(Math.abs(row.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
    });
  }
});
