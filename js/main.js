export const VERSION = 'Ver.0.1.6.2';
import { GENERATORS } from './data.js';
import { getJobBonuses } from './jobs.js';
import { save, load, reset } from './save.js';
import { renderAll, renderKPI, lightRefresh, bindFormatToggle } from './ui.js';
import { clickGainByLevel, clickNextCost, globalMultiplier, clickTotalCost, maxAffordableClicks } from './click.js';
import { prestigeGain, REBIRTHS, rebirthMultiplier } from './prestige.js';
import { totalPps, nextUnitCost, buyUnits, DEFAULTS } from './economy.js';

const state = {
  power: new Decimal(0),
  clickLv: 0,
  gens: JSON.parse(JSON.stringify(GENERATORS)),
  prestige: 0,
  rebirth: 0,
  genRebirths:0,
  autoTap:false,
  autoGen:false,
  hyperActive:false,
  hyperCooldown:0,
  hyperTime:0,
  autoClickUp:false,
  surgeCooldown:0,
  job:'magical',
  jobPoints:{},
  jobCat:'magic',
};

function applyGenBoost(){
  const powMul = Decimal.pow(10, state.genRebirths||0);
  const costMul = Decimal.pow(20, state.genRebirths||0);
  state.gens.forEach(g=>{
    const d = DEFAULTS[g.id] || DEFAULTS.g1;
    g.basePps = d.basePps.times(powMul);
    g.baseCost = d.baseCost.times(costMul);
    g.costMul = d.costMul;
    g.upBaseCost = d.upBaseCost.times(costMul);
    g.upCostMul = d.upCostMul;
    g.level = g.level||0;
  });
}

// Restore
const saved = load();
if (saved){
  state.power = saved.power ? new Decimal(saved.power) : new Decimal(0);
  state.clickLv = saved.clickLv ?? 0;
  state.prestige = saved.prestige ?? 0;
  state.rebirth = saved.rebirth ?? 0;
  state.genRebirths = saved.genRebirths ?? 0;
  state.job = saved.job || 'magical';
  state.jobPoints = saved.jobPoints || {};
  state.jobCat = saved.jobCat || 'magic';
  if (Array.isArray(saved.gens)){
    state.gens = saved.gens;
  }
}
applyGenBoost();

const featureHandlers = {
  toggleAutoTap(){ state.autoTap = !state.autoTap; update(); },
  doGenRebirth(){
    state.genRebirths = (state.genRebirths|0) + 1;
    state.gens = JSON.parse(JSON.stringify(GENERATORS));
    applyGenBoost();
    update();
  },
  toggleAutoGen(){ state.autoGen = !state.autoGen; update(); },
  convertPrestige(){
    if(state.power.lt(1e6)) return alert('エンジェルハートが足りません');
    state.power = state.power.minus(1e6);
    state.prestige += getJobBonuses(state.job).prestige;
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
    state.power = state.power.times(1e6);
    state.surgeCooldown = 120;
    update();
  },
  changeJob(id){
    state.job = id;
    state.jobPoints[id] = (state.jobPoints[id]||0) + 1;
    update();
  }
};

function update(){
  renderAll(state, performRebirth, featureHandlers);
}

document.getElementById('tapBtn').addEventListener('click', ()=>{
  const jb = getJobBonuses(state.job);
  const mult = rebirthMultiplier(state.rebirth) * (state.hyperActive?10:1) * jb.tap;
  state.power = state.power.plus(clickGainByLevel(state.clickLv).times(mult));
  update();
});

document.getElementById('upgradeClick').addEventListener('click', ()=>{
  const cost = clickNextCost(state.clickLv);
  if (state.power.gte(cost)){
    state.power = state.power.minus(cost);
    state.clickLv += 1;
    update();
  }
});

document.getElementById('upgradeClickMax').addEventListener('click', ()=>{
  const n = maxAffordableClicks(state.clickLv, state.power);
  const cost = clickTotalCost(state.clickLv, n);
  if (n>0 && state.power.gte(cost)){
    state.power = state.power.minus(cost);
    state.clickLv += n;
    update();
  }
});

document.getElementById('saveBtn').addEventListener('click', ()=>{ save(state); alert('保存しました'); });
document.getElementById('loadBtn').addEventListener('click', ()=>{
  const s = load(); if (!s) return alert('保存がありません');
    state.power = s.power ? new Decimal(s.power) : new Decimal(0);
    state.clickLv = s.clickLv ?? 0; state.prestige = s.prestige ?? 0; state.rebirth = s.rebirth ?? 0; state.genRebirths = s.genRebirths ?? 0; state.job = s.job || 'magical';
    state.jobPoints = s.jobPoints || {};
    state.jobCat = s.jobCat || 'magic';
    state.gens = Array.isArray(s.gens)? s.gens: state.gens;
  applyGenBoost();
  state.autoTap=false; state.autoGen=false; state.hyperActive=false; state.hyperCooldown=0; state.hyperTime=0; state.autoClickUp=false; state.surgeCooldown=0;
  update(); alert('読込しました');
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if (!confirm('ハードリセットしますか？')) return;
  reset();
    state.power=new Decimal(0); state.clickLv=0; state.prestige=0; state.rebirth=0; state.genRebirths=0; state.job='magical'; state.jobPoints={}; state.gens = JSON.parse(JSON.stringify(GENERATORS));
  state.jobCat='magic';
  applyGenBoost();
  state.autoTap=false; state.autoGen=false; state.hyperActive=false; state.hyperCooldown=0; state.hyperTime=0; state.autoClickUp=false; state.surgeCooldown=0;
  update();
});

document.getElementById('prestigeBtn').addEventListener('click', ()=>{
  const gain = Math.floor(prestigeGain(state.power) * getJobBonuses(state.job).prestige);
  if (gain <= 0) return alert('覚醒にはもっとエンジェルハートが必要です');
  if (!confirm(`覚醒して ${gain} ハートスターを得ますか？`)) return;
  state.prestige += gain;
  state.power = new Decimal(0);
  state.clickLv = 0;
  state.gens = JSON.parse(JSON.stringify(GENERATORS));
  applyGenBoost();
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
    const jb = getJobBonuses(state.job);
    const mult = rebirthMultiplier(state.rebirth) * (state.hyperActive?10:1);
    const pps = totalPps(state).times(globalMultiplier(state.clickLv)).times(mult).times(jb.gen);
    if (pps.gt(0)) { state.power = state.power.plus(pps.times(dt)); }
    if(state.autoTap){
      state.power = state.power.plus(clickGainByLevel(state.clickLv).times(mult).times(jb.tap).times(dt));
    }
    if(state.autoGen){
      const g = state.gens[0];
      const price = nextUnitCost(g);
      if(state.power.gte(price)) buyUnits(state,'g1','1');
    }
    if(state.autoClickUp){
      const cost = clickNextCost(state.clickLv);
      if(state.power.gte(cost)){ state.power = state.power.minus(cost); state.clickLv += 1; }
    }
    if(state.hyperActive){
      state.hyperTime -= dt;
      if(state.hyperTime <= 0) state.hyperActive=false;
    }
    if(state.hyperCooldown>0) state.hyperCooldown -= dt;
    if(state.surgeCooldown>0) state.surgeCooldown -= dt;

    renderKPI(state);
    __sinceUI += dt;
    if (__sinceUI >= 0.1){ lightRefresh(state, performRebirth, featureHandlers); __sinceUI = 0; }
  }catch{}
  requestAnimationFrame(__loop);
}
requestAnimationFrame(__loop);


try{ const v=document.getElementById('verText'); if(v) v.textContent='0.1.6.2'; }catch(e){}

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
  state.power = new Decimal(0);
  state.clickLv = 0;
  state.gens = JSON.parse(JSON.stringify(GENERATORS));
  applyGenBoost();
  state.autoTap=false; state.autoGen=false; state.hyperActive=false; state.hyperCooldown=0; state.hyperTime=0; state.autoClickUp=false; state.surgeCooldown=0;
  flashRebirth();
  update();
}
