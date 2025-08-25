import { fmt, fmtInt } from './format.js';
import { GENERATORS } from './data.js';
import { nextCost, totalPps, clickGain, buy, tick } from './economy.js';
import { save, load } from './save.js';

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    score: 0,
    mult: { pps: 1, click: 1 },
    generators: GENERATORS.map(g=>({ ...g, count: 0 })),
  };

  const saved = load();
  if (saved){
    state.score = saved.score ?? 0;
    state.mult  = saved.mult  ?? state.mult;
    if (Array.isArray(saved.generators)){
      for (const g of saved.generators){
        const t = state.generators.find(x=>x.id===g.id);
        if (t) t.count = g.count|0;
      }
    }
  }

  const $ = id=>document.getElementById(id);
  const elScore = $('score'), elPps = $('pps'), elClickGain = $('clickGain');
  const elGenList = $('generators'), elClick = $('clickButton');

  const buyModeSel = document.createElement('select');
  buyModeSel.innerHTML = `<option value="1">1</option><option value="10">10</option><option value="max">Max</option>`;
  // ヘッダー等に置くなら既存のレイアウトに合わせて追加してね
  document.querySelector('header .stats')?.appendChild(buyModeSel);

  function updateHUD(){
    elScore.textContent = fmt(state.score);
    elPps.textContent = fmt(totalPps(state));
    elClickGain.textContent = fmt(clickGain(state));
    for (const btn of elGenList.querySelectorAll('button[data-id]')){
      const id = btn.getAttribute('data-id');
      const g = state.generators.find(x=>x.id===id);
      const cost = nextCost(g, g.count);
      btn.disabled = state.score < cost;
      btn.querySelector('.price').textContent = fmt(cost);
      btn.closest('.card').querySelector('.own').textContent = fmtInt(g.count);
    }
  }

  function renderGenerators(){
    elGenList.innerHTML = '';
    for (const g of state.generators){
      if (g.id === 'hand') continue;
      const cost = nextCost(g, g.count);
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div>
          <div class="title">${g.name} <span class="small">x<span class="own">${fmtInt(g.count)}</span></span></div>
          <div class="desc">+ ${fmt(g.basePps)} /s</div>
        </div>
        <div>
          <button data-id="${g.id}">購入 <span class="price">${fmt(cost)}</span></button>
        </div>`;
      const btn = card.querySelector('button');
      btn.addEventListener('click', ()=>{
        const mode = buyModeSel.value;
        if (buy(state, g.id, mode)) updateHUD();
      });
      elGenList.appendChild(card);
    }
  }

  elClick.addEventListener('click', ()=>{ state.score += clickGain(state); updateHUD(); });

  renderGenerators();
  updateHUD();

  let last = performance.now();
  function loop(t){
    const dt = Math.max(0, (t - last) / 1000);
    last = t;
    tick(state, dt);
    updateHUD();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  setInterval(()=> save(state), 10000);
});
