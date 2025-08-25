import { fmt, fmtInt } from './format.js';
import { GENERATORS } from './data.js';
import { nextCost, totalPps, clickGain, purchase, tick } from './economy.js';
import { save, load, exportSave, importSave } from './save.js';

// ---- state ----
const state = {
  score: 0,
  mult: { pps: 1, click: 1 },
  generators: GENERATORS.map(g=>({ ...g, count: 0 })),
};

// ---- DOM ----
const elScore = document.getElementById('score');
const elPps   = document.getElementById('pps');
const elClickGain = document.getElementById('clickGain');
const elGenList = document.getElementById('generators');
const elUpList  = document.getElementById('upgrades');
const elClick = document.getElementById('clickButton');

// ---- init UI ----
function renderGenerators(){
  elGenList.innerHTML = '';
  for (const g of state.generators){
    if (g.id === 'hand') continue; // 手動はボタンで
    const cost = nextCost(g, g.count);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = \`
      <div>
        <div class="title">\${g.name} <span class="small">x\${fmtInt(g.count)}</span></div>
        <div class="desc">+ \${fmt(g.basePps)} /s</div>
      </div>
      <div>
        <button data-id="\${g.id}">購入 <span class="price">\${fmt(cost)}</span></button>
      </div>\`;
    const btn = card.querySelector('button');
    btn.addEventListener('click', ()=>{
      if (purchase(state, g.id)) updateHUD();
    });
    elGenList.appendChild(card);
  }
}

function updateHUD(){
  elScore.textContent = fmt(state.score);
  elPps.textContent = fmt(totalPps(state));
  elClickGain.textContent = fmt(clickGain(state));
  // 購入ボタンの有効/無効
  for (const btn of elGenList.querySelectorAll('button[data-id]')){
    const id = btn.getAttribute('data-id');
    const g = state.generators.find(x=>x.id===id);
    const cost = nextCost(g, g.count);
    btn.disabled = state.score < cost;
    btn.querySelector('.price').textContent = fmt(cost);
  }
}

elClick.addEventListener('click', ()=>{
  state.score += clickGain(state);
  updateHUD();
});

// ---- upgrades (placeholders) ----
function renderUpgrades(){
  elUpList.innerHTML = '';
  // 例: クリック2倍（500）
  const up = document.createElement('div');
  up.className = 'card';
  up.innerHTML = \`
    <div>
      <div class="title">クリック強化</div>
      <div class="desc">クリック獲得量を2倍にする</div>
    </div>
    <div><button id="up-click">購入 <span class="price">500</span></button></div>\`;
  up.querySelector('#up-click').addEventListener('click', ()=>{
    const price = 500;
    if (state.score >= price){
      state.score -= price;
      state.mult.click *= 2;
      updateHUD();
      up.querySelector('button').disabled = true;
      up.querySelector('button').textContent = '購入済み';
    }
  });
  elUpList.appendChild(up);
}

// ---- save/load ----
const saved = load();
if (saved){
  state.score = saved.score ?? 0;
  state.mult = saved.mult ?? state.mult;
  if (Array.isArray(saved.generators)){
    for (const g of saved.generators){
      const t = state.generators.find(x=>x.id===g.id);
      if (t) t.count = g.count|0;
    }
  }
}

document.getElementById('saveBtn').addEventListener('click', ()=> save(state));
document.getElementById('exportBtn').addEventListener('click', ()=>{
  const txt = exportSave();
  navigator.clipboard.writeText(txt).catch(()=>{});
  alert('エクスポート文字列をクリップボードにコピーしました');
});
document.getElementById('importBtn').addEventListener('click', ()=>{
  const str = prompt('エクスポート文字列を貼り付けてください');
  if (!str) return;
  if (importSave(str)) location.reload();
  else alert('読み込み失敗…');
});

renderGenerators();
renderUpgrades();
updateHUD();

// ---- main loop ----
let last = performance.now();
function loop(t){
  const dt = Math.max(0, (t - last) / 1000);
  last = t;
  tick(state, dt);
  if ((Math.floor(t/1000) % 10) === 0){ /* noop to prevent too many saves */ }
  updateHUD();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// 自動セーブ
setInterval(()=> save(state), 10000);
