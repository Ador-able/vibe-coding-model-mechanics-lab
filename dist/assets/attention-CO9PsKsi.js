import"./modulepreload-polyfill-P2Xu9kJm.js";import{c as e}from"./model-BJzIDxdc.js";function t(e=!1){return[{name:`A`,key:[2,0],value:[1,0]},{name:`B`,key:[0,2],value:[0,1]},{name:`C`,key:[-2,0],value:e?[3,1]:[1,1]}]}function n(t,n){let r=t.length,i=Math.sqrt(r),a=n.map(({key:e})=>t[0]*e[0]+t[1]*e[1]),o=a.map(e=>e/i),s=e(o),c=n.map((e,t)=>({...e,score:a[t],scaledScore:o[t],weight:s[t],contribution:e.value.map(e=>e*s[t])})),l=[0,0];for(let e of c)l[0]+=e.contribution[0],l[1]+=e.contribution[1];return{query:t,keyDimension:r,divisor:i,rows:c,output:l}}var r=!1,i=e=>Number(e.toFixed(3)).toString(),a=e=>`[${e.map(i).join(`, `)}]`,o=e=>`${(e*100).toFixed(2)}%`,s=[`#32877d`,`#527fae`,`#b08037`];document.querySelector(`#app`).innerHTML=`
  <header>
    <span class="eyebrow">模型机制实验</span>
    <h1>注意力让模型结合相关内容</h1>
    <p>用 Q 与各位置的 K 算出权重，再按这些权重汇总 V。</p>
    <p class="scope"><strong>人工数值</strong>A、B、C 是三个示例位置，不对应词语；不是模型实测，向量维度没有固定语义。</p>
  </header>
  <section class="experiment" aria-label="注意力数值实验">
    <div class="controls">
      <div class="query-control"><span id="query-label">Q = (1, 0)</span><button id="toggle-query" type="button">切换为 Q = (0, 1)</button></div>
      <label class="value-control"><input id="change-value" type="checkbox" />只把 C 的 V 改为 (3, 1)</label>
    </div>
    <p class="formula">Q · K <span>→</span> 除以 √2 <span>→</span> softmax 权重 <span>→</span> 权重 × V <span>→</span> 相加</p>
    <div class="diagram-scroll">
      <svg id="attention-diagram" viewBox="0 0 1080 340" role="img" aria-labelledby="diagram-title diagram-description">
        <title id="diagram-title">三个位置的加权贡献汇总为一个向量</title>
        <desc id="diagram-description"></desc>
        <defs><marker id="sum-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#a8bac1" /></marker></defs>
        <g id="diagram-content"></g>
      </svg>
    </div>
    <p class="legend">柱长表示注意力权重；右侧先列出每个位置的加权贡献，再逐维相加。</p>
    <div id="observation" aria-live="polite"></div>
  </section>
  <details class="calculation">
    <summary>查看逐项计算</summary>
    <div id="calculation-table" class="table-scroll"></div>
    <p>这里 Q、K 都是二维向量，因此 dₖ = 2。softmax 使用未舍入的得分，输出也使用未舍入的权重；页面显示最多三位小数。</p>
  </details>
`;var c=document.querySelector(`#toggle-query`),l=document.querySelector(`#change-value`);function u(){let e=r?[0,1]:[1,0],u=n(e,t(l.checked)),d=n(e,t());document.querySelector(`#query-label`).textContent=`Q = (${e.join(`, `)})`,c.textContent=r?`切换为 Q = (1, 0)`:`切换为 Q = (0, 1)`,document.querySelector(`#diagram-content`).innerHTML=`
    <text class="column-heading" x="24" y="30">位置与 K / V</text>
    <text class="column-heading" x="285" y="30">注意力权重</text>
    <text class="column-heading" x="615" y="30">权重 × V</text>
    <text class="column-heading" x="924" y="30">加权和</text>
    ${u.rows.map((e,t)=>{let n=90+t*100;return`
        <circle cx="38" cy="${n}" r="21" fill="${s[t]}" fill-opacity=".11" />
        <text class="position-name" x="38" y="${n+6}" text-anchor="middle" fill="${s[t]}">${e.name}</text>
        <text class="position-vector" x="77" y="${n-6}">K = ${a(e.key)}</text>
        <text class="position-vector ${t===2&&l.checked?`changed-value`:``}" x="77" y="${n+21}">V = ${a(e.value)}</text>
        <rect x="285" y="${n-9}" width="185" height="18" rx="4" fill="#eef3f4" />
        <rect x="285" y="${n-9}" width="${185*e.weight}" height="18" rx="4" fill="${s[t]}" />
        <text class="weight-label" x="486" y="${n+6}" fill="${s[t]}">${o(e.weight)}</text>
        <text class="contribution" x="630" y="${n+6}">${a(e.contribution)}</text>
        <path class="merge-line" d="M800,${n} C842,${n} 842,190 884,190" marker-end="url(#sum-arrow)" />
      `}).join(``)}
    <rect class="sum-box" x="890" y="146" width="180" height="88" rx="9" />
    <text class="sum-label" x="980" y="174" text-anchor="middle">输出向量</text>
    <text class="sum-value" x="980" y="207" text-anchor="middle">${a(u.output)}</text>
  `,document.querySelector(`#diagram-description`).textContent=`查询向量 Q 为 ${a(e)}。${u.rows.map(e=>`位置 ${e.name} 的权重为 ${o(e.weight)}，贡献为 ${a(e.contribution)}。`).join(``)}输出为 ${a(u.output)}。`;let f=u.rows.reduce((e,t)=>t.weight>e.weight?t:e);document.querySelector(`#observation`).innerHTML=l.checked?`<p><strong>同一组 Q、K 下，只改 V，权重不变。</strong>与当前 Q 下的原 V 相比，C 的权重仍是 ${o(u.rows[2].weight)}；它提供的向量变了，加权贡献随之变化。</p><p class="output-change"><span>原 V：${a(d.output)}</span><b>→</b><span>改 C 的 V：${a(u.output)}</span></p>`:`<p><strong>当前 ${f.name} 的权重最大：${o(f.weight)}。</strong>切换 Q 时，K 和 V 保持不变；Q 与各位置 K 的得分改变，权重与输出也会改变。</p>`,document.querySelector(`#calculation-table`).innerHTML=`
    <table><thead><tr><th>位置</th><th>Q · K</th><th>除以 √2</th><th>softmax 权重</th><th>V</th><th>加权贡献</th></tr></thead><tbody>
    ${u.rows.map(e=>`<tr><th>${e.name}</th><td>${i(e.score)}</td><td>${i(e.scaledScore)}</td><td>${i(e.weight)}</td><td>${a(e.value)}</td><td>${a(e.contribution)}</td></tr>`).join(``)}
    </tbody><tfoot><tr><th colspan="5">逐维相加</th><td>${a(u.output)}</td></tr></tfoot></table>`}c.addEventListener(`click`,()=>{r=!r,u()}),l.addEventListener(`change`,u),u();