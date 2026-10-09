import"./modulepreload-polyfill-P2Xu9kJm.js";import{c as e,i as t,n}from"./model-BJzIDxdc.js";var r=[.5,1,2],i=[1,.8,.5],a=[2026,2027],o=t(n()).map(({token:e,logit:t})=>({token:e,logit:t}));function s(t){let n=e(o.map(({logit:e})=>e/t));return o.map((e,t)=>({...e,probability:n[t]}))}function c(e,t){let n=[...e].sort((e,t)=>t.probability-e.probability),r=0,i=!1,a=n.map(e=>{let n=t===1||!i;return r+=e.probability,r>=t&&(i=!0),{...e,cumulative:r,retained:n}}),o=a.reduce((e,t)=>e+(t.retained?t.probability:0),0);return{topP:t,retainedMass:o,rows:a.map(e=>({...e,sampleProbability:e.retained?e.probability/o:0}))}}function l(e){let t=e>>>0;return()=>(t=Math.imul(1664525,t)+1013904223>>>0,t/4294967296)}function u(e,t){let n=l(t),r=e.rows.filter(e=>e.retained),i=[];for(let e=0;e<100;e++){let e=n(),t=0,a=r[r.length-1].token;for(let n of r)if(t+=n.sampleProbability,e<t){a=n.token;break}i.push(a)}return{seed:t,drawCount:100,draws:i,rows:e.rows.map(e=>{let t=i.filter(t=>t===e.token).length;return{token:e.token,theoreticalProbability:e.sampleProbability,count:t,frequency:t/100}})}}var d=null,f=e=>`${(e*100).toFixed(2)}%`,p=[`#287f76`,`#416fa3`,`#a6782c`];document.querySelector(`#app`).innerHTML=`
  <header>
    <span class="eyebrow">模型机制实验</span>
    <h1>生成参数怎样影响回答</h1>
    <p>固定同一个前缀和候选得分，依次观察温度、top-p 与抽样频率。</p>
    <p class="scope"><strong>人工分布</strong>得分由人预设，未经训练，不调用模型 API；候选概率不是任务正确率。</p>
    <p class="input-summary">固定前缀：<b>早餐喝</b><span>人工 logits：${o.map(({token:e,logit:t})=>`${e} ${t}`).join(` · `)}</span></p>
  </header>

  <section aria-labelledby="temperature-title">
    <div class="section-heading"><h2 id="temperature-title"><span>1</span>温度改变概率分布</h2><label>用于后续步骤的温度 <select id="temperature"><option value="0.5">T = 0.5</option><option value="1" selected>T = 1</option><option value="2">T = 2</option></select></label></div>
    <div id="temperature-comparison" class="temperature-comparison"></div>
    <p class="note">三列来自同一时刻的候选。温度越低，当前高分项的概率越集中；温度越高，分布越平缓。</p>
  </section>

  <section aria-labelledby="nucleus-title">
    <div class="section-heading"><h2 id="nucleus-title"><span>2</span>top-p 保留累计概率足够的候选</h2><label>累计阈值 <select id="top-p"><option value="1">top-p = 1</option><option value="0.8" selected>top-p = 0.8</option><option value="0.5">top-p = 0.5</option></select></label></div>
    <p class="note" id="nucleus-source"></p>
    <div id="cumulative-plot"></div>
    <div id="nucleus-table" class="table-scroll"></div>
    <p id="nucleus-observation" class="observation"></p>
  </section>

  <section aria-labelledby="sampling-title">
    <div class="section-heading"><h2 id="sampling-title"><span>3</span>从同一分布抽样 100 次</h2><label>复现种子 <select id="seed">${a.map(e=>`<option value="${e}">${e}</option>`).join(``)}</select></label></div>
    <p class="note">每次都重新面对固定前缀“早餐喝”，只抽下一个 token；不是连续生成 100 个 token。</p>
    <div class="run-row"><button id="run-samples" type="button">运行 100 次抽样</button><p id="sample-parameters"></p></div>
    <div id="sample-results" aria-live="polite"></div>
  </section>

  <details class="inspection">
    <summary>查看计算公式、种子范围与原始结果</summary>
    <p>温度：pᵢ = softmax(logitᵢ / T)，本实验只提供 T &gt; 0。top-p 在温度之后执行：按概率降序累积，保留首次达到阈值的最小前缀，包含跨过阈值的那一项，再除以保留项的概率合计。</p>
    <p>抽样使用本地 32 位线性同余伪随机序列，并按累计概率选择候选；每次有放回抽样，分布保持不变。固定种子只复现本页算法，不保证云端模型可复现。修改参数或种子会清空旧结果；同一设置重复运行会复现同一组抽样。</p>
    <pre id="raw-results"></pre>
  </details>
`;var m=document.querySelector(`#temperature`),h=document.querySelector(`#top-p`),g=document.querySelector(`#seed`),_=()=>({temperature:r[m.selectedIndex],topP:i[h.selectedIndex],seed:a[g.selectedIndex]});function v(){let{temperature:e,topP:t,seed:n}=_(),i=c(s(e),t);document.querySelector(`#temperature-comparison`).innerHTML=r.map(t=>`<div class="temperature-column ${t===e?`selected-temperature`:``}"><h3>T = ${t}${t===e?`<span>当前选择</span>`:``}</h3>${s(t).map((e,t)=>`<div class="probability-row"><span>${e.token}</span><div class="probability-track"><div style="width:${e.probability*100}%;background:${p[t]}"></div></div><b>${f(e.probability)}</b></div>`).join(``)}</div>`).join(``),document.querySelector(`#nucleus-source`).textContent=`使用 T = ${e} 的分布，先按概率从大到小排列。下方虚线标出 top-p 阈值。`,document.querySelector(`#cumulative-plot`).innerHTML=`<div class="cumulative-label" style="left:${t*100}%;transform:translateX(${t===1?`-100%`:`-50%`})">阈值 ${f(t)}</div><div class="cumulative-track">${i.rows.map((e,t)=>`<div style="width:${e.probability*100}%;background:${e.retained?p[t]:`#e1e6e8`}" title="${e.token}：${f(e.probability)}，${e.retained?`保留`:`排除`}"></div>`).join(``)}<div class="threshold" style="left:${t*100}%"></div></div><div class="scale"><span>0%</span><span>累计概率 100%</span></div>`,document.querySelector(`#nucleus-table`).innerHTML=`<table><thead><tr><th>候选</th><th>温度后的概率</th><th>累计概率</th><th>处理</th><th>重新归一化后的抽样概率</th></tr></thead><tbody>${i.rows.map((e,n)=>{let r=n===0?0:i.rows[n-1].cumulative,a=t<1&&e.retained&&r<t&&e.cumulative>=t;return`<tr class="${e.retained?``:`excluded`}"><th><i class="color-dot" style="background:${p[n]}"></i>${e.token}</th><td>${f(e.probability)}</td><td>${f(e.cumulative)}</td><td>${e.retained?a?`保留 · 达到阈值`:`保留`:`排除`}</td><td class="sampling-probability">${f(e.sampleProbability)}</td></tr>`}).join(``)}</tbody></table>`;let a=i.rows.filter(e=>e.retained).length;document.querySelector(`#nucleus-observation`).textContent=t===1?`top-p = 1：保留全部候选，不截断尾部。`:`保留前 ${a} 项，原概率合计 ${f(i.retainedMass)}。跨过阈值的候选整项保留，再把保留项的概率重新归一化到 100%。`,document.querySelector(`#sample-parameters`).textContent=`T = ${e} · top-p = ${t} · 种子 ${n}`,document.querySelector(`#sample-results`).innerHTML=d===null?`<p class="empty">当前设置尚未抽样。</p>`:`
    <div class="table-scroll"><table class="sample-table"><thead><tr><th>候选</th><th>理论概率</th><th>抽中次数 / 100</th><th>本次频率</th></tr></thead><tbody>${d.rows.map((e,t)=>`<tr><th>${e.token}</th><td>${f(e.theoreticalProbability)}</td><td>${e.count}</td><td><div class="frequency-cell"><div class="frequency-track"><div style="width:${e.frequency*100}%;background:${p[t]}"></div><i style="left:${e.theoreticalProbability*100}%"></i></div><b>${f(e.frequency)}</b></div></td></tr>`).join(``)}</tbody></table></div><p class="note">彩色柱是本次频率，竖线是理论概率。有限次抽样的频率不必刚好等于理论概率。</p>`,document.querySelector(`#raw-results`).textContent=JSON.stringify({settings:{temperature:e,topP:t,seed:n},initialCandidates:o,distribution:i,samples:d},null,2)}for(let e of[m,h,g])e.addEventListener(`change`,()=>{d=null,v()});document.querySelector(`#run-samples`).addEventListener(`click`,()=>{let{temperature:e,topP:t,seed:n}=_();d=u(c(s(e),t),n),v()}),v();