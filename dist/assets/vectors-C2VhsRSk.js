import"./modulepreload-polyfill-P2Xu9kJm.js";function e(e,t){let n=Math.hypot(...e),r=Math.hypot(...t),i=e[0]*t[0]+e[1]*t[1];return{lengthA:n,lengthB:r,dot:i,distance:Math.hypot(e[0]-t[0],e[1]-t[1]),cosine:n===0||r===0?null:Math.max(-1,Math.min(1,i/(n*r)))}}var t=[[.2,.8,-.1],[.3,.7,0],[-.6,.1,.9]];function n(e){return e.map(e=>t[e])}var r=[1,1],i=[[2,0,2],[0,1,2],[1,1,0]],a=[{label:`同向：B = (2, 2)`,value:[2,2]},{label:`更长：B = (3, 3)`,value:[3,3]},{label:`垂直：B = (−1, 1)`,value:[-1,1]},{label:`反向：B = (−1, −1)`,value:[-1,-1]},{label:`零向量`,value:[0,0]}];document.querySelector(`#app`).innerHTML=`
  <header>
    <span class="eyebrow">模型机制实验</span>
    <h1>向量用一组数字表示信息</h1>
    <p>先按 token ID 取出一行数字，再观察向量的方向和长度。</p>
    <p class="scope">本页所有向量均为人工示例，不是模型的真实向量，也不代表词语含义。</p>
  </header>

  <section aria-labelledby="lookup-title">
    <div class="section-title"><span>01</span><h2 id="lookup-title">按编号查表，得到向量</h2></div>
    <div class="lookup-layout">
      <div>
        <p class="label">人工 embedding 表 · 每行 3 个数字</p>
        <table class="embedding-table">
          <thead><tr><th>token ID</th><th>第 1 维</th><th>第 2 维</th><th>第 3 维</th></tr></thead>
          <tbody>${t.map((e,t)=>`<tr class="id-${t}"><th>${t}</th>${e.map(e=>`<td>${e}</td>`).join(``)}</tr>`).join(``)}</tbody>
        </table>
      </div>
      <div>
        <label class="label" for="sequence">输入的 token ID 序列</label>
        <select id="sequence">${i.map((e,t)=>`<option value="${t}">[${e.join(`, `)}]</option>`).join(``)}</select>
        <div id="lookup-result" aria-live="polite"></div>
      </div>
    </div>
    <p class="note">取出的顺序由输入序列决定。同一个编号出现两次，就从这张表取出同一行两次。</p>
  </section>

  <section aria-labelledby="geometry-title">
    <div class="section-title"><span>02</span><h2 id="geometry-title">方向相同，长度也可以不同</h2></div>
    <p class="intro">换成便于画图的二维人工向量。固定 <strong class="a-color">A = (1, 1)</strong>，改变 <strong class="b-color">B</strong> 的两个坐标。</p>
    <div class="presets">${a.map((e,t)=>`<button type="button" data-preset="${t}">${e.label}</button>`).join(``)}</div>
    <div class="geometry-layout">
      <div class="plot-wrap">
        <svg id="plot" viewBox="0 0 420 380" role="img" aria-labelledby="plot-title plot-description">
          <title id="plot-title">两个向量从同一个原点出发</title>
          <desc id="plot-description"></desc>
          <defs>
            <marker id="arrow-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 Z" fill="#217a78" /></marker>
            <marker id="arrow-b" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L9,4.5 L0,9 Z" fill="#ad6815" /></marker>
          </defs>
          <g id="grid"></g>
          <g id="vectors"></g>
        </svg>
        <p class="plot-caption"><span class="a-color">━━ A</span><span class="b-color">━━ B</span><span>┄┄ 两个端点之间的距离</span></p>
      </div>
      <div class="observations">
        <div class="coordinates">
          <h3 id="b-title">B = (2, 2)</h3>
          <label for="bx">第 1 维 x <output id="bx-value">2</output></label>
          <input id="bx" type="range" min="-4" max="4" step="0.5" value="2" />
          <label for="by">第 2 维 y <output id="by-value">2</output></label>
          <input id="by" type="range" min="-4" max="4" step="0.5" value="2" />
        </div>
        <div id="metrics" aria-live="polite"></div>
      </div>
    </div>
    <details>
      <summary>查看公式和零向量的情况</summary>
      <dl class="formulas">
        <div><dt>长度</dt><dd>|A| = √(Aₓ² + Aᵧ²)</dd></div>
        <div><dt>内积</dt><dd>A · B = AₓBₓ + AᵧBᵧ</dd></div>
        <div><dt>余弦相似度</dt><dd>cos(A, B) = (A · B) / (|A| × |B|)</dd></div>
        <div><dt>欧氏距离</dt><dd>d(A, B) = √((Aₓ − Bₓ)² + (Aᵧ − Bᵧ)²)</dd></div>
      </dl>
      <p>零向量没有方向，余弦相似度未定义；内积和欧氏距离仍可计算。这里的坐标轴不表示任何真实语义。</p>
    </details>
  </section>
`;var o=document.querySelector(`#sequence`),s=document.querySelector(`#lookup-result`),c=document.querySelector(`#bx`),l=document.querySelector(`#by`),u=[...document.querySelectorAll(`[data-preset]`)];function d(){let e=i[o.selectedIndex];s.innerHTML=n(e).map((t,n)=>`
    <div class="lookup-row"><span class="position">第 ${n+1} 个</span><b class="id-chip id-${e[n]}">ID ${e[n]}</b><span class="lookup-arrow">→</span><code>[${t.join(`, `)}]</code></div>
  `).join(``)}var f={x:210,y:190},p=36,m=e=>({x:f.x+e[0]*p,y:f.y-e[1]*p}),h=e=>Number(e.toFixed(3)).toString();document.querySelector(`#grid`).innerHTML=Array.from({length:9},(e,t)=>t-4).map(e=>{let{x:t,y:n}=m([e,e]);return`<path class="${e===0?`axis`:`grid-line`}" d="M${t},${f.y-144} V${f.y+144} M${f.x-144},${n} H${f.x+144}" />
    ${e===0?``:`<text class="tick" x="${t}" y="${f.y+18}" text-anchor="middle">${e}</text><text class="tick" x="${f.x-10}" y="${n+4}" text-anchor="end">${e}</text>`}`}).join(``)+`<text class="axis-label" x="${f.x-14}" y="${f.y+19}">0</text><text class="axis-label" x="370" y="195">x</text><text class="axis-label" x="205" y="30">y</text>`;function g(){let t=[c.valueAsNumber,l.valueAsNumber];if(t.some(e=>!Number.isFinite(e)||e<-4||e>4))return;let n=e(r,t),i=m(r),o=m(t),s=n.distance===0;document.querySelector(`#b-title`).textContent=`B = (${t.join(`, `)})`,document.querySelector(`#bx-value`).textContent=h(t[0]),document.querySelector(`#by-value`).textContent=h(t[1]),u.forEach((e,n)=>e.setAttribute(`aria-pressed`,String(a[n].value.every((e,n)=>e===t[n])))),document.querySelector(`#vectors`).innerHTML=`
    ${n.lengthB===0?``:`<path class="vector-b" d="M${f.x},${f.y} L${o.x},${o.y}" marker-end="url(#arrow-b)" />`}
    <path class="vector-a" d="M${f.x},${f.y} L${i.x},${i.y}" marker-end="url(#arrow-a)" />
    <path class="distance-line" d="M${i.x},${i.y} L${o.x},${o.y}" />
    <circle class="point-a" cx="${i.x}" cy="${i.y}" r="3" />
    <circle class="point-b" cx="${o.x}" cy="${o.y}" r="${s?6:3}" />
    <text class="label-a" x="${i.x+12}" y="${i.y+16}">A</text>
    <text class="label-b" x="${o.x+12}" y="${o.y-9}">B</text>
  `,document.querySelector(`#plot-description`).textContent=`A 的坐标为 (1, 1)，B 的坐标为 (${t.join(`, `)})。两个端点之间的欧氏距离为 ${h(n.distance)}。`,document.querySelector(`#metrics`).innerHTML=`
    <p class="lengths">长度 |A| = ${h(n.lengthA)} <span>|B| = ${h(n.lengthB)}</span></p>
    <dl class="metric-list">
      <div><dt>余弦相似度<small>比较方向</small></dt><dd>${n.cosine===null?`<span class="undefined">未定义</span>`:h(n.cosine)}</dd></div>
      <div><dt>内积<small>同时受方向和长度影响</small></dt><dd>${h(n.dot)}</dd></div>
      <div><dt>欧氏距离<small>两个端点之间的距离</small></dt><dd>${h(n.distance)}</dd></div>
    </dl>
    <p class="observation">${n.cosine===null?`B 是零向量，没有方向。`:s?`A 与 B 完全重合，距离为 0。`:Math.abs(n.cosine-1)<1e-10?`方向相同，余弦为 1；长度不同，距离不为 0。`:n.dot===0?`两个向量相互垂直，余弦和内积都为 0。`:Math.abs(n.cosine+1)<1e-10?`两个向量方向相反，余弦为 −1。`:`拖动坐标，比较方向、长度和端点位置的变化。`}</p>
  `}o.addEventListener(`change`,d),c.addEventListener(`input`,g),l.addEventListener(`input`,g),u.forEach((e,t)=>e.addEventListener(`click`,()=>{[c.value,l.value]=a[t].value.map(String),g()})),d(),g();