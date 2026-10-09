import"./modulepreload-polyfill-P2Xu9kJm.js";import{a as e,i as t,n,o as r,r as i,s as a,t as o}from"./model-BJzIDxdc.js";var s=n(),c=document.querySelector(`#app`),l=e=>e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`),u=e=>`${(e*100).toFixed(2)}%`,d=e=>e===`highest`?`选最高概率`:`手动选择`;c.innerHTML=`
  <header>
    <span class="eyebrow">模型机制实验</span>
    <h1>生成回答是在逐步选择下一个 token</h1>
    <p class="scope"><strong>人工演示</strong>词表与得分由人预设，不是真实模型的内部记录，也没有运行模型推理。</p>
  </header>
  <section class="generation" aria-label="逐步生成">
    <div class="topline"><p id="step-status"></p><button id="reset" class="quiet" type="button">重来</button></div>
    <div class="context-block">
      <h2>当前上下文</h2>
      <div id="context" aria-live="polite"></div>
      <p class="sequence-note">灰色是初始文本，色块是每一步选出的教学 token；切分方式不代表 Qwen 等真实分词器。</p>
    </div>
    <div class="flow" aria-hidden="true"><span>当前上下文</span><i>→</i><span>候选得分</span><i>→</i><span>softmax 概率</span><i>→</i><span>选一个，再追加</span></div>
    <div id="candidates"></div>
    <div class="action-row"><button id="advance" class="primary" type="button">选最高概率</button><p id="action-note"></p></div>
    <p id="message" role="alert"></p>
  </section>
  <section class="records-section" aria-labelledby="records-title">
    <h2 id="records-title">逐步记录</h2>
    <div id="records"></div>
  </section>
  <details class="explanation">
    <summary>查看计算方法与停止条件</summary>
    <p>对本步人工候选计算 pᵢ = exp(zᵢ − max(z)) / Σ exp(zⱼ − max(z))。概率总和为 1；页面显示到小数点后两位，显示值相加可能有舍入误差。</p>
    <p>“选最高概率”每次取概率最大的一项，并列时取表中靠前的一项。“手动选它”只帮助比较不同分支，不等于模型随机采样。</p>
    <p>选出 &lt;EOS&gt; 表示结束，它不作为普通文字拼进上下文。本演示最多生成 6 个 token（包括结束标记，不包括初始文本）。到达上限而没有选出 &lt;EOS&gt;，属于长度截断。</p>
    <p>句号后只保留 &lt;EOS&gt; 候选是本演示的人为规则。真实模型可以在句号后继续生成更多句子；这里的候选集合也不是任何真实模型的完整词表。</p>
  </details>
`;var f=document.querySelector(`#advance`),p=document.querySelector(`#message`);function m(e,t){return`<table class="candidate-table"><thead><tr><th>下一 token</th><th>得分 logit</th><th>概率</th>${t?`<th><span class="sr-only">手动选择</span></th>`:``}</tr></thead><tbody>${e.map((e,n)=>`
    <tr><th>${l(e.token)}</th><td class="score">${e.logit}</td><td class="probability"><div class="probability-cell"><span>${u(e.probability)}</span><div class="bar-track" aria-hidden="true"><div style="width:${e.probability*100}%"></div></div></div></td>${t?`<td class="choose-cell"><button type="button" class="choose" data-choice="${n}" aria-label="手动选择 ${l(e.token)}">手动选它</button></td>`:``}</tr>
  `).join(``)}</tbody></table>`}function h(){let n=t(s),o=s.stopReason!==null,c=s.records.length;document.querySelector(`#step-status`).textContent=o?`已停止 · 共选出 ${c} 个 token`:`第 ${c+1} 步 · 已选出 ${c} / 6 个 token`,document.querySelector(`#context`).innerHTML=`<span class="initial">${a}</span>${s.records.filter(e=>e.selected!==i).map(e=>`<span class="token">${l(e.selected)}</span>`).join(``)}`;let p=document.querySelector(`#candidates`);o?p.innerHTML=`<div class="stop-message ${s.stopReason}"><h3>${s.stopReason===`eos`?`选出了结束标记 <code>&lt;EOS&gt;</code>`:`达到 6 token 上限`}</h3><p>${s.stopReason===`eos`?`本次序列结束，不再选择下一个 token。`:`本次被长度限制截断，没有选出结束标记。`}</p><p class="result-text">${l(e(s))}</p></div>`:(p.innerHTML=m(n,!0),p.querySelectorAll(`[data-choice]`).forEach((e,t)=>e.addEventListener(`click`,()=>g(n[t].token,`manual`)))),f.disabled=o,f.textContent=o?`本次已停止`:`选最高概率：${r(n).token}`,document.querySelector(`#action-note`).textContent=o?`点击“重来”，可比较另一条分支。`:`每次只追加一个 token。手动选择仅用于比较分支。`,document.querySelector(`#records`).innerHTML=c===0?`<p class="empty">选择一个 token 后，这里会保留当时的上下文和候选概率。</p>`:s.records.map((e,t)=>{let n=e.candidates.find(t=>t.token===e.selected);return`<details class="step-record"><summary><span class="step-number">${t+1}</span><span class="record-context">${l(e.context)}</span><span class="record-arrow">→</span><b>${l(e.selected)}</b><span class="record-probability">${u(n.probability)}</span><span class="record-mode">${d(e.mode)}</span></summary>${m(e.candidates,!1)}</details>`}).join(``)}function g(e,t){p.textContent=``;try{s=o(s,e,t),h()}catch(e){p.textContent=e instanceof Error?e.message:`本步未能完成，请重来。`}}f.addEventListener(`click`,()=>{s.stopReason===null&&g(r(t(s)).token,`highest`)}),document.querySelector(`#reset`).addEventListener(`click`,()=>{s=n(),p.textContent=``,h()}),h();