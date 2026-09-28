import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Tokenizer } from '@huggingface/tokenizers';
import { analyze, models } from '../src/tokenization.ts';
import reference from './reference.json';

for (const model of models) {
  test(`${model.name} 的编码和完整解码与独立 Rust 样本一致`, async () => {
    const config = await Promise.all(['tokenizer.json', 'tokenizer_config.json'].map(async (name) => JSON.parse(await readFile(new URL(`../public/tokenizers/${model.key}/${name}`, import.meta.url), 'utf8'))));
    const tokenizer = new Tokenizer(config[0], config[1]);
    for (const sample of reference.cases.filter((item) => item.model === model.key)) {
      const actual = analyze(sample.text, tokenizer);
      assert.deepEqual(actual.ids, sample.ids, sample.text);
      assert.deepEqual(actual.tokens, sample.tokens, sample.text);
      assert.equal(actual.decoded, sample.decoded, sample.text);
    }
  });
}

test('课程配置字节与下载清单的 SHA256 一致', async () => {
  for (const model of models) {
    for (const file of model.files) {
      const bytes = await readFile(new URL(`../public/tokenizers/${model.key}/${file.name}`, import.meta.url));
      assert.equal(bytes.length, file.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
    }
  }
});
