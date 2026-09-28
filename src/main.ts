import './style.css';
import { analyze, loadTokenizer, models, presets } from './tokenization.ts';

document.querySelector<HTMLElement>('#app')!.innerHTML = `
  <header><span class="eyebrow">模型的工作方式</span><h1>文本怎样变成 token</h1><p>输入一段文本，观察分词器返回的编号，再把编号还原成文本。</p></header>
  <form id="lab-form">
    <label for="input">输入文本</label>
    <textarea id="input" rows="3" maxlength="2000"></textarea>
    <div class="controls"><select id="model" aria-label="选择分词器"></select><button class="primary" type="submit">查看分词</button></div>
  </form>
  <p id="status" role="status"></p>
  <section id="results" aria-live="polite"></section>
  <footer>仅分词，不运行模型。使用官方公开配置；未套用聊天模板，也未自动添加特殊 token。结果不等于在线服务的账单用量。</footer>`;

const form = document.querySelector<HTMLFormElement>('#lab-form')!;
const input = document.querySelector<HTMLTextAreaElement>('#input')!;
const select = document.querySelector<HTMLSelectElement>('#model')!;
const button = document.querySelector<HTMLButtonElement>('.primary')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const results = document.querySelector<HTMLElement>('#results')!;
input.value = presets[0].text;
select.replaceChildren(...models.map((model) => new Option(model.name, model.key)));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  button.disabled = true;
  select.disabled = true;
  input.disabled = true;
  results.replaceChildren();
  status.textContent = '正在读取本地分词器……';
  try {
    const tokenizer = await loadTokenizer(select.value);
    const data = analyze(input.value, tokenizer);
    const model = models.find((item) => item.key === select.value)!;
    const section = document.createElement('article');
    section.innerHTML = '<h2></h2><p class="count"></p><h3>token ID</h3><pre class="ids"></pre><h3>完整解码</h3><pre class="decoded"></pre><p class="round-trip"></p>';
    section.querySelector('h2')!.textContent = model.name;
    section.querySelector('.count')!.textContent = `${data.count} 个 token`;
    section.querySelector('.ids')!.textContent = JSON.stringify(data.ids);
    section.querySelector('.decoded')!.textContent = data.decoded || '（空文本）';
    section.querySelector('.round-trip')!.textContent = data.exactRoundTrip ? '完整解码与输入一致。' : '完整解码与原输入不同，请注意分词器的文本规范化规则。';
    results.append(section);
    status.textContent = '';
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : '分词失败，请重试。';
  } finally {
    button.disabled = false;
    select.disabled = false;
    input.disabled = false;
  }
});
