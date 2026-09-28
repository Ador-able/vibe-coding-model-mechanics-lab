import { parameters, runTransformer, serializeRun, vocabulary, type Matrix, type TransformerRun } from './model';
import './style.css';

let lastToken: 'D' | 'E' = 'D';
let queryPosition = 1;
const format = (value: number) => value === -Infinity ? '−∞' : Number(value.toFixed(3)).toString();
const percent = (value: number) => `${(value * 100).toFixed(2)}%`;
const stageNames = {
  embedding: 'Embedding 查表', position: '人工位置向量', hiddenInput: 'Embedding + 位置',
  normBeforeAttention: '注意力之前的 LayerNorm', query: 'Q 投影', key: 'K 投影', value: 'V 投影',
  scaledScores: 'QKᵀ / √4', maskedScores: '应用遮罩后的得分', attentionWeights: '注意力权重',
  attentionMix: '注意力加权汇总', attentionOutput: '注意力输出投影', afterAttentionResidual: '第一次残差相加',
  normBeforeFfn: 'FFN 之前的 LayerNorm', ffnExpanded: 'FFN 线性展开到6维', ffnActivated: 'ReLU',
  ffnOutput: 'FFN 线性映射回4维', afterFfnResidual: '第二次残差相加', finalNorm: 'FinalNorm',
  logits: '词表投影的 logits', probabilities: '下一个 token 的概率',
} satisfies Record<keyof TransformerRun['stages'], string>;

document.querySelector<HTMLElement>('#app')!.innerHTML = `
  <header>
    <span class="eyebrow">模型机制实验</span>
    <h1>Transformer 把这些计算接起来</h1>
    <p>用一个最小 decoder 块，观察向量怎样经过注意力、FFN 和残差连接，变成候选分布。</p>
    <p class="scope"><strong>人工模型</strong>单层、单头、4维、pre-LayerNorm；权重未训练，不是 Qwen 内部记录，也不具备中文理解能力。</p>
  </header>
  <div class="controls">
    <div class="input-control"><span class="control-label">教学 token</span><div id="token-sequence"></div><button id="change-future" type="button">把最后一位换成 E</button></div>
    <label class="mask-control"><input id="causal-mask" type="checkbox" checked />启用因果遮罩</label>
  </div>
  <p id="mask-warning" role="status"></p>
  <section class="architecture" aria-labelledby="architecture-title">
    <h2 id="architecture-title">单层 decoder 的计算流程</h2>
    <div class="diagram-scroll"><svg id="architecture-diagram" viewBox="0 0 1180 380" role="img" aria-labelledby="flow-title flow-description">
      <title id="flow-title">四个位置经过同一个 decoder 块</title><desc id="flow-description"></desc>
      <defs><marker id="flow-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#98b0b9" /></marker></defs>
      <g id="flow-content"></g>
    </svg></div>
    <p class="flow-caption">每行对应一个位置，首组向量是 embedding 与位置向量的和。仅绘出所选行的注意力连线与残差旁路，其它行也参与计算；FFN 逐行使用同一组参数。小格示意向量分量，绿/棕区分正负，未选中行淡化；精确数值见下方矩阵。</p>
  </section>
  <section class="comparison" aria-labelledby="comparison-title">
    <div class="comparison-heading"><h2 id="comparison-title">第 2 位的输出，用来预测下一个 token</h2><label>观察位置 <select id="query-position"><option value="0">第 1 位</option><option value="1" selected>第 2 位</option><option value="2">第 3 位</option><option value="3">第 4 位</option></select></label></div>
    <div class="comparison-grid">
      <div><h3>注意力权重 <span>行是查询位置，列是被读取的位置</span></h3><div id="heatmap"></div><p id="readable-range"></p></div>
      <div><h3>候选分布 <span>固定前三位，只改最后一位</span></h3><div id="distribution"></div></div>
    </div>
    <p id="difference" aria-live="polite"></p>
  </section>
  <details class="inspection">
    <summary>核查各阶段矩阵与人工参数</summary>
    <label class="stage-picker">计算阶段 <select id="stage">${Object.entries(stageNames).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}</select></label>
    <div id="stage-matrix" class="table-scroll"></div>
    <p>LayerNorm 逐行计算，γ=1、β=0、ε=0.00001。两个子层均先归一化，再计算并加回残差。FFN 为 4→6→4，使用 ReLU。最后再做一次归一化和 4→5 的词表投影。</p>
    <details><summary>查看全部人工参数</summary><pre id="parameters"></pre></details>
  </details>
`;

const mask = document.querySelector<HTMLInputElement>('#causal-mask')!;
const changeFuture = document.querySelector<HTMLButtonElement>('#change-future')!;
const positionSelect = document.querySelector<HTMLSelectElement>('#query-position')!;
const stageSelect = document.querySelector<HTMLSelectElement>('#stage')!;
stageSelect.value = 'attentionWeights';
document.querySelector('#parameters')!.textContent = serializeRun(parameters);

const rowY = (row: number) => 156 + row * 44;
function vectorGlyph(row: readonly number[], x: number, y: number, active: boolean) {
  return row.map((value, index) => `<rect x="${x + index * 9}" y="${y - 9}" width="7" height="18" rx="2" fill="${value >= 0 ? '#358f88' : '#b99052'}" fill-opacity="${active ? 0.3 + 0.6 * Math.min(1, Math.abs(value)) : 0.15}" />`).join('');
}
const arrow = (x1: number, x2: number, y: number, active: boolean) => `<path d="M${x1},${y} H${x2}" class="row-link ${active ? 'active-link' : ''}" marker-end="url(#flow-arrow)" />`;

function architecture(run: TransformerRun) {
  const s = run.stages;
  const selectedY = rowY(queryPosition);
  const stages = [
    [139, 'Embedding + 位置'], [258, 'Norm'], [393, 'QKV → 注意力 → Wₒ'], [529, '残差'],
    [593, 'Norm'], [690, 'FFN'], [802, '残差'], [868, 'FinalNorm'], [977, '词表投影'], [1103, 'softmax'],
  ] as const;
  document.querySelector('#flow-content')!.innerHTML = `
    <rect class="block-boundary" x="221" y="103" width="616" height="221" rx="10" />
    <text class="block-title" x="532" y="343" text-anchor="middle">一个 pre-LayerNorm decoder 块 · 单头注意力 + 逐位置 FFN</text>
    ${stages.map(([x, label]) => `<text class="stage-label" x="${x}" y="125" text-anchor="middle">${label}</text>`).join('')}
    <path class="residual-path" d="M190,${selectedY} V64 H550 V${selectedY} H542" marker-end="url(#flow-arrow)" />
    <text class="residual-label" x="358" y="54" text-anchor="middle">保留原向量，稍后相加</text>
    <path class="residual-path" d="M548,${selectedY} V82 H823 V${selectedY} H814" marker-end="url(#flow-arrow)" />
    <text class="residual-label" x="674" y="72" text-anchor="middle">保留注意力后的向量</text>
    ${run.tokens.map((token, row) => {
      const y = rowY(row);
      const active = row === queryPosition;
      return `<text class="token-label ${active ? 'selected-token' : ''}" x="28" y="${y + 5}">${row + 1} ${token}</text>
        ${arrow(61, 117, y, active)}${vectorGlyph(s.hiddenInput[row], 125, y, active)}${arrow(165, 238, y, active)}
        <rect class="norm-box ${active ? 'selected-box' : ''}" x="239" y="${y - 14}" width="38" height="28" rx="4" /><text class="norm-text" x="258" y="${y + 4}" text-anchor="middle">LN</text>
        ${arrow(279, 320, y, active)}${vectorGlyph(s.value[row], 326, y, active)}${vectorGlyph(s.attentionOutput[row], 472, y, active)}
        ${arrow(508, 516, y, active)}<circle class="add-node" cx="529" cy="${y}" r="11" /><text class="add-text" x="529" y="${y + 5}" text-anchor="middle">+</text>
        ${arrow(541, 573, y, active)}<rect class="norm-box ${active ? 'selected-box' : ''}" x="574" y="${y - 14}" width="38" height="28" rx="4" /><text class="norm-text" x="593" y="${y + 4}" text-anchor="middle">LN</text>
        ${arrow(614, 647, y, active)}<rect class="ffn-box ${active ? 'selected-box' : ''}" x="648" y="${y - 14}" width="90" height="28" rx="4" /><text class="ffn-text" x="693" y="${y + 4}" text-anchor="middle">4 → 6 → 4</text>
        ${arrow(740, 788, y, active)}<circle class="add-node" cx="802" cy="${y}" r="11" /><text class="add-text" x="802" y="${y + 5}" text-anchor="middle">+</text>
        ${arrow(814, 848, y, active)}<rect class="norm-box ${active ? 'selected-box' : ''}" x="849" y="${y - 14}" width="38" height="28" rx="4" /><text class="norm-text" x="868" y="${y + 4}" text-anchor="middle">LN</text>
        ${arrow(889, 945, y, active)}${vectorGlyph(s.logits[row], 956, y, active)}${arrow(1004, 1067, y, active)}${vectorGlyph(s.probabilities[row], 1081, y, active)}`;
    }).join('')}
    ${run.tokens.map((_, source) => run.allowed[queryPosition][source] ? `<path class="attention-connection" d="M365,${rowY(source)} C405,${rowY(source)} 429,${selectedY} 470,${selectedY}" style="stroke-width:${1 + s.attentionWeights[queryPosition][source] * 5}" />` : '').join('')}
    <text class="small-label" x="343" y="314" text-anchor="middle">各位置的 V</text><text class="small-label" x="487" y="314" text-anchor="middle">汇总并投影</text>
  `;
  document.querySelector('#flow-description')!.textContent = `四个位置分别归一化，经 QKV 投影和注意力汇总后做第一次残差相加，再分别归一化、执行 FFN 并做第二次残差相加。最后归一化、投影到五个教学候选并做 softmax。当前突出第 ${queryPosition + 1} 个位置。`;
}

function inspect(run: TransformerRun) {
  const key = stageSelect.value as keyof typeof stageNames;
  const matrix: Matrix = run.stages[key];
  document.querySelector('#stage-matrix')!.innerHTML = `<table class="matrix-table"><thead><tr><th>行</th>${matrix[0].map((_, i) => `<th>${i + 1}</th>`).join('')}</tr></thead><tbody>${matrix.map((row, i) => `<tr class="${i === queryPosition ? 'selected-matrix-row' : ''}"><th>${i + 1}</th>${row.map((value) => `<td>${format(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function render() {
  const run = runTransformer(lastToken, mask.checked);
  const baseline = runTransformer('D', mask.checked);
  const current = run.stages.probabilities[queryPosition];
  const before = baseline.stages.probabilities[queryPosition];
  const maxDifference = Math.max(...current.map((value, i) => Math.abs(value - before[i])));
  document.querySelector('#token-sequence')!.innerHTML = run.tokens.map((token, index) => `<span class="input-token ${index === queryPosition ? 'query-token' : ''} ${run.allowed[queryPosition][index] ? 'readable' : 'unreadable'}">${token}<small>${index + 1}</small></span>`).join('');
  changeFuture.textContent = lastToken === 'D' ? '把最后一位换成 E' : '还原最后一位 D';
  document.querySelector('#mask-warning')!.textContent = mask.checked ? '' : '因果遮罩已关闭：仅用于演示未来信息泄漏，不能当作正常的自回归生成。';
  document.querySelector('#comparison-title')!.textContent = `第 ${queryPosition + 1} 位的输出，用来预测下一个 token`;
  document.querySelector('#heatmap')!.innerHTML = `<table class="heatmap"><thead><tr><th>查询 ↓ / 读取 →</th>${run.tokens.map((token, i) => `<th>${i + 1} ${token}</th>`).join('')}</tr></thead><tbody>${run.tokens.map((token, i) => `<tr class="${i === queryPosition ? 'selected-query' : ''}"><th><button data-row="${i}" type="button" aria-label="观察第 ${i + 1} 位 ${token}">${i + 1} ${token}</button></th>${run.stages.attentionWeights[i].map((weight, j) => `<td class="${run.allowed[i][j] ? 'allowed' : 'masked'}" style="${run.allowed[i][j] ? `background:rgba(53,143,136,${0.08 + weight * 0.65})` : ''}" title="${run.allowed[i][j] ? `权重 ${format(weight)}` : '被因果遮罩阻断，权重为0'}">${run.allowed[i][j] ? percent(weight) : '—'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  document.querySelectorAll<HTMLButtonElement>('[data-row]').forEach((button) => button.addEventListener('click', () => {
    queryPosition = Number(button.dataset.row);
    positionSelect.value = String(queryPosition);
    render();
  }));
  document.querySelector('#readable-range')!.textContent = mask.checked ? `第 ${queryPosition + 1} 位只能读取第 1—${queryPosition + 1} 位（含自身）。灰格的权重为 0。` : queryPosition < 3 ? `当前允许读取全部 4 个位置，包括第 ${queryPosition + 1} 位之后的位置。` : '当前允许读取全部 4 个位置，第 4 位本身就是被改动的位置。';
  document.querySelector('#distribution')!.innerHTML = `<table class="distribution"><thead><tr><th>候选</th><th>最后一位 D</th><th>当前：${lastToken}</th><th>差值（百分点）</th></tr></thead><tbody>${vocabulary.map((token, i) => {
    const difference = (current[i] - before[i]) * 100;
    return `<tr><th>${token}</th><td>${percent(before[i])}</td><td class="current-probability"><div class="bar" style="width:${current[i] * 100}%"></div><span>${percent(current[i])}</span></td><td>${difference > 0 ? '+' : ''}${format(difference)}</td></tr>`;
  }).join('')}</tbody></table>`;
  document.querySelector('#difference')!.textContent = lastToken === 'D' ? '把最后一位从 D 换成 E，比较同一位置的两次实际计算结果。'
    : queryPosition === 3 ? `改变的是当前所观察的位置，因此它的输入和输出可以改变。最大概率差为 ${(maxDifference * 100).toFixed(3)} 个百分点。`
    : mask.checked ? '最后一位已从 D 改成 E；当前观察位置的分布完全不变。未来输入被因果遮罩阻断。'
    : `最后一位已从 D 改成 E；未来信息进入了当前计算。最大概率差为 ${(maxDifference * 100).toFixed(3)} 个百分点。`;
  architecture(run);
  inspect(run);
}

changeFuture.addEventListener('click', () => { lastToken = lastToken === 'D' ? 'E' : 'D'; render(); });
mask.addEventListener('change', render);
positionSelect.addEventListener('change', () => { queryPosition = positionSelect.selectedIndex; render(); });
stageSelect.addEventListener('change', () => inspect(runTransformer(lastToken, mask.checked)));
render();
