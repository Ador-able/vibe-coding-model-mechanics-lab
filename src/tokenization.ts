import { Tokenizer } from '@huggingface/tokenizers';
import manifest from '../public/tokenizers/manifest.json';

export const models = manifest.models;
export const presets = [
  { name: '中文', text: '今天我们用 AI 写一封邮件。' },
  { name: '英文', text: 'Hello, world!' },
  { name: '数字', text: '1234567890' },
  { name: '代码', text: 'const total = price * 2;' },
  { name: '生僻字与表情', text: '龘🙂' },
];

const cache = new Map<string, Promise<Tokenizer>>();

export function loadTokenizer(key: string): Promise<Tokenizer> {
  const existing = cache.get(key);
  if (existing) return existing;
  const model = models.find((item) => item.key === key);
  if (!model) throw new Error('没有找到所选分词器。');
  const loading = Promise.all(['tokenizer.json', 'tokenizer_config.json'].map(async (name) => {
    const response = await fetch(`/tokenizers/${key}/${name}`);
    if (!response.ok) throw new Error('本地分词器文件读取失败，请重新安装课程项目。');
    return response.json() as Promise<object>;
  })).then(([definition, config]) => new Tokenizer(definition, config));
  cache.set(key, loading);
  loading.catch(() => cache.delete(key));
  return loading;
}

export function analyze(text: string, tokenizer: Tokenizer) {
  const encoded = tokenizer.encode(text, { add_special_tokens: false });
  // 库不接受空 ID 数组；空输入对应空输出。
  const decoded = encoded.ids.length
    ? tokenizer.decode(encoded.ids, { skip_special_tokens: false, clean_up_tokenization_spaces: false })
    : '';
  return {
    input: text,
    count: encoded.ids.length,
    ids: encoded.ids,
    tokens: encoded.tokens,
    decoded,
    exactRoundTrip: decoded === text,
  };
}
