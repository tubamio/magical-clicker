export const VERSION = 'Ver.0.1.2.1';
import { GENERATORS } from './data.js';
import { save, load, reset } from './save.js';
import { renderAll, renderKPI, lightRefresh, bindFormatToggle } from './ui.js';
import { clickGainByLevel, clickNextCost, globalMultiplier, clickTotalCost, maxAffordableClicks } from './click.js';
import { prestigeGain } from './prestige.js';

const state = {
  power: 0,
  clickLv: 0,
  gens: JSON.parse(JSON.stringify(GENERATORS)),
  prestige: 0,
};

// Restore
const saved = load();
if (saved){
  state.power = saved.power ?? 0;
  state.clickLv = saved.clickLv ?? 0;
  state.prestige = saved.prestige ?? 0;
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

document.getElementById('upgradeClickMax').addEventListener('click', ()=>{
  const n = maxAffordableClicks(state.clickLv, state.power);
  const cost = clickTotalCost(state.clickLv, n);
  if (n>0 && state.power >= cost){
    state.power -= cost;
    state.clickLv += n;
    update();
  }
});

document.getElementById('saveBtn').addEventListener('click', ()=>{ save(state); alert('保存しました'); });
document.getElementById('loadBtn').addEventListener('click', ()=>{
  const s = load(); if (!s) return alert('保存がありません');
  state.power = s.power ?? 0; state.clickLv = s.clickLv ?? 0; state.prestige = s.prestige ?? 0; state.gens = Array.isArray(s.gens)? s.gens: state.gens;
  update(); alert('読込しました');
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if (!confirm('ハードリセットしますか？')) return;
  reset();
  state.power=0; state.clickLv=0; state.prestige=0; state.gens = JSON.parse(JSON.stringify(GENERATORS));
  update();
});

document.getElementById('prestigeBtn').addEventListener('click', ()=>{
  const gain = prestigeGain(state.power);
  if (gain <= 0) return alert('転生にはもっとキラキラが必要です');
  if (!confirm(`転生して ${gain} きらめきを得ますか？`)) return;
  state.prestige += gain;
  state.power = 0;
  state.clickLv = 0;
  state.gens = JSON.parse(JSON.stringify(GENERATORS));
  update();
});

// initial render
update();
try{ const v=document.getElementById('version'); if(v) v.textContent = VERSION; }catch{}
try{ bindFormatToggle && bindFormatToggle(state); }catch{}


import { totalPps } from './economy.js';

let __lastTs = 0;
let __sinceUI = 0;
function __loop(ts){
  if(!__lastTs) __lastTs = ts;
  const dt = Math.max(0, (ts-__lastTs)/1000);
  __lastTs = ts;
  try{
    const pps = totalPps(state) * globalMultiplier(state.clickLv);
    if (Number.isFinite(pps) && pps>0) { state.power += pps * dt; }
    renderKPI(state);
    __sinceUI += dt;
    if (__sinceUI >= 0.1){ lightRefresh(state); __sinceUI = 0; }
  }catch{}
  requestAnimationFrame(__loop);
}
requestAnimationFrame(__loop);


try{ const v=document.getElementById('verText'); if(v) v.textContent='0.1.2.1'; }catch(e){}
