import { GENERATORS } from './data.js';
import { save, load, reset } from './save.js';
import { renderAll, renderKPI, lightRefresh, bindFormatToggle } from './ui.js';
export const VERSION = 'Ver.0.1.1.0';
import { clickGainByLevel, clickNextCost } from './click.js';

const state = {
  power: 0,
  clickLv: 0,
  gens: JSON.parse(JSON.stringify(GENERATORS)),
};

// Restore
const saved = load();
if (saved){
  state.power = saved.power ?? 0;
  state.clickLv = saved.clickLv ?? 0;
  if (Array.isArray(saved.gens)){
    state.gens = saved.gens;
  }
}

function update(){
  renderAll(state);
}

document.getElementById('tapBtn').addEventListener('click', ()=>{
  state.power += clickGainByLevel(state.clickLv);
  update();
});

document.getElementById('upgradeClick').addEventListener('click', ()=>{
  const cost = clickNextCost(state.clickLv);
  if (state.power >= cost){
    state.power -= cost;
    state.clickLv += 1;
    update();
  }
});

document.getElementById('saveBtn').addEventListener('click', ()=>{ save(state); alert('保存しました'); });
document.getElementById('loadBtn').addEventListener('click', ()=>{
  const s = load(); if (!s) return alert('保存がありません');
  state.power = s.power ?? 0; state.clickLv = s.clickLv ?? 0; state.gens = Array.isArray(s.gens)? s.gens: state.gens;
  update(); alert('読込しました');
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if (!confirm('ハードリセットしますか？')) return;
  reset();
  state.power=0; state.clickLv=0; state.gens = JSON.parse(JSON.stringify(GENERATORS));
  update();
});


// ===== Auto PPS Game Loop =====
import { totalPps } from './economy.js';
let __lastTs = 0;
let __sinceUI = 0;
function __loop(ts){
  if(!__lastTs) __lastTs = ts;
  const dt = Math.max(0, (ts-__lastTs)/1000);
  __lastTs = ts;
  const pps = totalPps(state) * Math.pow(1.03, state.clickLv|0);
  if (Number.isFinite(pps) && pps>0) state.power += pps * dt;
  __sinceUI += dt;
  // 軽量UI更新：KPI毎フレーム、ボタン有効/ラベルは ~10FPS 程度
  try{ renderKPI(state); }catch{}
  if (__sinceUI >= 0.1) { try{ lightRefresh(state); }catch{} __sinceUI = 0; }
  requestAnimationFrame(__loop);
}
requestAnimationFrame(__loop);
// ===== /Auto PPS Game Loop =====

bindFormatToggle();
// initial render
update();
try{ const v=document.getElementById('version'); if(v) v.textContent = VERSION; }catch{}
try{ const v2=document.getElementById('version-footer'); if(v2) v2.textContent = VERSION; }catch{}
try{ const v3=document.getElementById('version-about'); if(v3) v3.textContent = VERSION; }catch{}
console.log('Magical Clicker', VERSION);
try{ const v=document.getElementById('version'); if(v) v.textContent = VERSION; console.log('Magical Clicker', VERSION);}catch{}
