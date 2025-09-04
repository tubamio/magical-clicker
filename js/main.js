export const VERSION = 'Ver.0.1.4.0';
import { GENERATORS } from './data.js';
import { save, load, reset } from './save.js';
import { renderAll, renderKPI, lightRefresh, bindFormatToggle } from './ui.js';
import { clickGainByLevel, clickNextCost, globalMultiplier, clickTotalCost, maxAffordableClicks } from './click.js';
import { prestigeGain, REBIRTHS, rebirthMultiplier } from './prestige.js';
import { totalPps, nextUnitCost, buyUnits } from './economy.js';

const state = {
  power: 0,
  clickLv: 0,
  gens: JSON.parse(JSON.stringify(GENERATORS)),
  prestige: 0,
  rebirth: 0,
  autoTap:false,
  burstCooldown:0,
  autoGen:false,
  hyperActive:false,
  hyperCooldown:0,
  hyperTime:0,
  autoClickUp:false,
  surgeCooldown:0,
};

// Restore
const saved = load();
if (saved){
  state.power = saved.power ?? 0;
  state.clickLv = saved.clickLv ?? 0;
  state.prestige = saved.prestige ?? 0;
  state.rebirth = saved.rebirth ?? 0;
  if (Array.isArray(saved.gens)){
    state.gens = saved.gens;
  }
}

const featureHandlers = {
  toggleAutoTap(){ state.autoTap = !state.autoTap; update(); },
  doBurst(){
    if(state.burstCooldown>0) return;
    const mult = rebirthMultiplier(state.rebirth) * (state.hyperActive?10:1);
    state.power += clickGainByLevel(state.clickLv) * mult * 100;
    state.burstCooldown = 10;
    update();
  },
  toggleAutoGen(){ state.autoGen = !state.autoGen; update(); },
  convertPrestige(){
    if(state.power < 1e6) return alert('エンジェルハートが足りません');
    state.power -= 1e6;
    state.prestige += 1;
    update();
  },
  activateHyper(){
    if(state.hyperCooldown>0) return;
    state.hyperActive = true;
    state.hyperTime = 30;
    state.hyperCooldown = 60;
    update();
  },
  toggleAutoClickUp(){ state.autoClickUp = !state.autoClickUp; update(); },
  activateSurge(){
    if(state.surgeCooldown>0) return;
    state.power *= 1e6;
    state.surgeCooldown = 120;
    update();
  }
};

function update(){
  renderAll(state, performRebirth, featureHandlers);
}

document.getElementById('tapBtn').addEventListener('click', ()=>{
  const mult = rebirthMultiplier(state.rebirth) * (state.hyperActive?10:1);
  state.power += clickGainByLevel(state.clickLv) * mult;
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
  state.power = s.power ?? 0; state.clickLv = s.clickLv ?? 0; state.prestige = s.prestige ?? 0; state.rebirth = s.rebirth ?? 0; state.gens = Array.isArray(s.gens)? s.gens: state.gens;
  state.autoTap=false; state.burstCooldown=0; state.autoGen=false; state.hyperActive=false; state.hyperCooldown=0; state.hyperTime=0; state.autoClickUp=false; state.surgeCooldown=0;
  update(); alert('読込しました');
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if (!confirm('ハードリセットしますか？')) return;
  reset();
  state.power=0; state.clickLv=0; state.prestige=0; state.rebirth=0; state.gens = JSON.parse(JSON.stringify(GENERATORS));
  state.autoTap=false; state.burstCooldown=0; state.autoGen=false; state.hyperActive=false; state.hyperCooldown=0; state.hyperTime=0; state.autoClickUp=false; state.surgeCooldown=0;
  update();
});

document.getElementById('prestigeBtn').addEventListener('click', ()=>{
  const gain = prestigeGain(state.power);
  if (gain <= 0) return alert('覚醒にはもっとエンジェルハートが必要です');
  if (!confirm(`覚醒して ${gain} ハートスターを得ますか？`)) return;
  state.prestige += gain;
  state.power = 0;
  state.clickLv = 0;
  state.gens = JSON.parse(JSON.stringify(GENERATORS));
  update();
});

// initial render
update();
try{ const v=document.getElementById('version'); if(v) v.textContent = VERSION; }catch{}
try{ bindFormatToggle && bindFormatToggle(state, featureHandlers); }catch{}

let __lastTs = 0;
let __sinceUI = 0;
function __loop(ts){
  if(!__lastTs) __lastTs = ts;
  const dt = Math.max(0, (ts-__lastTs)/1000);
  __lastTs = ts;
  try{
    const mult = rebirthMultiplier(state.rebirth) * (state.hyperActive?10:1);
    const pps = totalPps(state) * globalMultiplier(state.clickLv) * mult;
    if (Number.isFinite(pps) && pps>0) { state.power += pps * dt; }
    if(state.autoTap){
      state.power += clickGainByLevel(state.clickLv) * mult * dt;
    }
    if(state.autoGen){
      const g = state.gens[0];
      const price = nextUnitCost(g);
      if(state.power >= price) buyUnits(state,'g1','1');
    }
    if(state.autoClickUp){
      const cost = clickNextCost(state.clickLv);
      if(state.power >= cost){ state.power -= cost; state.clickLv += 1; }
    }
    if(state.hyperActive){
      state.hyperTime -= dt;
      if(state.hyperTime <= 0) state.hyperActive=false;
    }
    if(state.hyperCooldown>0) state.hyperCooldown -= dt;
    if(state.burstCooldown>0) state.burstCooldown -= dt;
    if(state.surgeCooldown>0) state.surgeCooldown -= dt;

    renderKPI(state);
    __sinceUI += dt;
    if (__sinceUI >= 0.1){ lightRefresh(state, performRebirth, featureHandlers); __sinceUI = 0; }
  }catch{}
  requestAnimationFrame(__loop);
}
requestAnimationFrame(__loop);


try{ const v=document.getElementById('verText'); if(v) v.textContent='0.1.4.0'; }catch(e){}

function flashRebirth(){
  try{
    document.body.classList.add('rebirth-flash');
    setTimeout(()=>document.body.classList.remove('rebirth-flash'),1000);
  }catch{}
}

function performRebirth(){
  const next = REBIRTHS[state.rebirth];
  if(!next) return alert('これ以上の転生はありません');
  if(state.prestige < next.req) return alert('転生にはもっとハートスターが必要です');
  if(!confirm(`L${next.level} ${next.name} に転生しますか？`)) return;
  state.rebirth += 1;
  state.prestige = 0;
  state.power = 0;
  state.clickLv = 0;
  state.gens = JSON.parse(JSON.stringify(GENERATORS));
  state.autoTap=false; state.burstCooldown=0; state.autoGen=false; state.hyperActive=false; state.hyperCooldown=0; state.hyperTime=0; state.autoClickUp=false; state.surgeCooldown=0;
  flashRebirth();
  update();
}
