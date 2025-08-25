import { GENERATORS } from './data.js';
import { save, load, reset } from './save.js';
import { renderAll } from './ui.js';
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

// initial render
update();
