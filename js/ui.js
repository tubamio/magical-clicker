function setBtnState(btn, enabled){ if(!btn) return; btn.disabled=!enabled; btn.classList.toggle('is-disabled', !enabled); }
import { fmt, getFormatMode, setFormatMode } from './format.js';
import { JOBS, getJobBonuses } from './jobs.js';
import { clickGainByLevel, clickNextCost, globalMultiplier, clickTotalCost, maxAffordableClicks } from './click.js';
import {
  nextUnitCost, totalCostUnits, maxAffordableUnits, buyUnits,
  nextUpgradeCost, totalCostUpgrades, maxAffordableUpgrades, upgrade,
  powerFor, totalPps
} from './economy.js';
import { prestigeGain, REBIRTHS, rebirthMultiplier } from './prestige.js';
import { FEATURES } from './features.js';

/* ===== メイドスマイル強化（最大回数） ===== */
export function renderClick(state){
    const jb = getJobBonuses(state.job);
    const gain = clickGainByLevel(state.clickLv).times(rebirthMultiplier(state.rebirth)).times(jb.tap);
    setText('tapGain', '+' + fmt(gain));

    setText('clickLvNow', String(state.clickLv));
    setText('clickLvNext', String(state.clickLv + 1));

    function sim(n){
      const beforeClick = clickGainByLevel(state.clickLv).times(rebirthMultiplier(state.rebirth)).times(jb.tap);
      const afterClick  = clickGainByLevel(state.clickLv + n).times(rebirthMultiplier(state.rebirth)).times(jb.tap);
      const beforeMult  = globalMultiplier(state.clickLv);
      const afterMult   = globalMultiplier(state.clickLv + n);
      return {
        beforeClick,
        afterClick,
        deltaClick: afterClick.minus(beforeClick),
        beforeMult,
        afterMult,
        deltaMult: afterMult.minus(beforeMult),
      };
    }

    const s1 = sim(1);
    setText('c1a', fmt(s1.beforeClick));
    setText('c1b', fmt(s1.afterClick));
    setText('c1d', fmt(s1.deltaClick));
    setText('m1a', fmt(s1.beforeMult));
    setText('m1b', fmt(s1.afterMult));
    setText('m1d', fmt(s1.deltaMult));

    const nMax = maxAffordableClicks(state.clickLv, state.power);
    const sM = sim(nMax);
    setText('cMa', fmt(sM.beforeClick));
    setText('cMb', fmt(sM.afterClick));
    setText('cMd', fmt(nMax>0 ? sM.deltaClick : new Decimal(0)));
    setText('mMa', fmt(sM.beforeMult));
    setText('mMb', fmt(sM.afterMult));
    setText('mMd', fmt(nMax>0 ? sM.deltaMult : new Decimal(0)));

    const b1 = document.getElementById('upgradeClick');
    const bm = document.getElementById('upgradeClickMax');
    const cost1 = clickNextCost(state.clickLv);
    const sumCost = clickTotalCost(state.clickLv, nMax);
    b1.disabled = state.power.lt(cost1);
    b1.textContent = `単体強化（${fmt(cost1)}）`;
    bm.disabled = (nMax <= 0);
    bm.textContent = `まとめ強化 ×${fmt(nMax)}（${fmt(sumCost)}）`;
  }

function setText(id, value){ const n=document.getElementById(id); if(n) n.textContent = value; }
export function renderKPI(state){
  const jb = getJobBonuses(state.job);
  setText('power', fmt(state.power));
  const pps = totalPps(state).times(globalMultiplier(state.clickLv)).times(rebirthMultiplier(state.rebirth)).times(jb.gen);
  setText('pps', fmt(pps));
  setText('prestigeCurr', fmt(state.prestige||0));
  setText('prestigeGain', fmt(prestigeGain(state.power) * jb.prestige));
}

export function renderRebirths(state, onRebirth){
  const list = document.getElementById('rebirthList');
  if(!list) return;
  list.innerHTML='';
  REBIRTHS.forEach(r=>{
    const div=document.createElement('div');
    div.className='rebirth-item';
    const owned = (state.rebirth >= r.level);
    const next  = (state.rebirth + 1 === r.level);
    const btn = document.createElement('button');
    btn.className = owned ? 'btn good' : 'btn ghost';
    btn.textContent = owned ? `L${r.level} ${r.name}✓` : `L${r.level} ${r.name}`;
    if(next){
      btn.className = 'btn warn';
      btn.disabled = state.prestige < r.req;
      btn.addEventListener('click', ()=>{ if(!btn.disabled && onRebirth) onRebirth(); });
    }else{
      btn.disabled = true;
    }
    div.appendChild(btn);
    const cond=document.createElement('div');
    cond.className='cond muted';
    cond.textContent = `条件：ハートスター ${fmt(r.req)}`;
    div.appendChild(cond);
    const eff=document.createElement('div');
    eff.className='eff';
    eff.textContent = `効果：${r.effect}`;
    div.appendChild(eff);
    if(r.feature){
      const feat=document.createElement('div');
      feat.className='feat';
      feat.textContent = `新要素：${r.feature}`;
      div.appendChild(feat);
    }
    list.appendChild(div);
  });
}

export function renderFeatures(state, handlers){
  const panel=document.getElementById('featurePanel');
  if(!panel) return;
  panel.innerHTML='';
  FEATURES.forEach(f=>{
    if(state.rebirth < f.level) return;
    const item=document.createElement('div');
    item.className='feature-item';
    const btn=document.createElement('button');
    btn.className='btn';
    if(f.id==='autoTap'){
      btn.textContent = state.autoTap ? `${f.name}：ON` : `${f.name}：OFF`;
      btn.addEventListener('click', ()=>handlers&&handlers.toggleAutoTap&&handlers.toggleAutoTap());
    }else if(f.id==='genRebirth'){
      btn.textContent = `${f.name}（${state.genRebirths||0}回）`;
      btn.addEventListener('click', ()=>handlers&&handlers.doGenRebirth&&handlers.doGenRebirth());
    }else if(f.id==='autoGen'){
      btn.textContent = state.autoGen ? `${f.name}：ON` : `${f.name}：OFF`;
      btn.addEventListener('click', ()=>handlers&&handlers.toggleAutoGen&&handlers.toggleAutoGen());
    }else if(f.id==='convert'){
      btn.textContent = f.name;
      btn.addEventListener('click', ()=>handlers&&handlers.convertPrestige&&handlers.convertPrestige());
    }else if(f.id==='hyper'){
      if(state.hyperActive){
        btn.textContent = `${f.name}［${Math.ceil(state.hyperTime)}s］`;
      }else{
        const cd=Math.ceil(state.hyperCooldown||0);
        btn.textContent = cd>0 ? `${f.name}（${cd}s）` : f.name;
        btn.disabled = cd>0;
      }
      btn.addEventListener('click', ()=>handlers&&handlers.activateHyper&&handlers.activateHyper());
    }else if(f.id==='autoClickUp'){
      btn.textContent = state.autoClickUp ? `${f.name}：ON` : `${f.name}：OFF`;
      btn.addEventListener('click', ()=>handlers&&handlers.toggleAutoClickUp&&handlers.toggleAutoClickUp());
    }else if(f.id==='surge'){
      const cd=Math.ceil(state.surgeCooldown||0);
      btn.textContent = cd>0 ? `${f.name}（${cd}s）` : f.name;
      btn.disabled = cd>0;
      btn.addEventListener('click', ()=>handlers&&handlers.activateSurge&&handlers.activateSurge());
    }
    item.appendChild(btn);
    const d=document.createElement('div');
    d.className='desc';
    d.textContent = f.desc;
    item.appendChild(d);
    panel.appendChild(item);
  });
}

export function renderJobs(state, onChange){
  const panel=document.getElementById('jobPanel');
  if(!panel) return;
  panel.innerHTML='';
  JOBS.forEach(j=>{
    const item=document.createElement('div');
    item.className='job-item';
    const btn=document.createElement('button');
    btn.className = state.job===j.id ? 'btn good' : 'btn';
    btn.textContent = state.job===j.id ? `${j.name}✓` : j.name;
    btn.addEventListener('click', ()=>{ if(onChange) onChange(j.id); });
    item.appendChild(btn);
    const d=document.createElement('div');
    d.className='desc';
    d.textContent = j.desc;
    item.appendChild(d);
    panel.appendChild(item);
  });
}

/* ===== ジェネ ===== */
function simulateTotalAfterUpgrade(state, g, n){
  const jb = getJobBonuses(state.job);
  const mult = rebirthMultiplier(state.rebirth) * jb.gen;
  const curr = totalPps(state).times(globalMultiplier(state.clickLv)).times(mult);
  const beforeEach = powerFor(g).times(mult);
  const afterEach  = powerFor({...g, level:(g.level|0)+n}).times(mult);
  const deltaEach  = afterEach.minus(beforeEach);

  const beforeTotal = curr;
  const afterTotal  = totalPps({
    ...state,
    gens: state.gens.map(x=> x.id===g.id ? {...g, level:(g.level|0)+n } : x)
  }).times(globalMultiplier(state.clickLv)).times(mult);
  const deltaTotal  = afterTotal.minus(beforeTotal);

  return { beforeEach, afterEach, deltaEach, beforeTotal, afterTotal, deltaTotal };
}

function genRow(state, g, onUpdate){
  const row = document.createElement('div');
  row.className = 'gen';
  row.innerHTML = `
    <div class="left">
      <div class="name">${g.name} <span class="muted">x<span class="own">${fmt(g.count)}</span></span></div>
      <div class="desc">単体/sec: <span class="eachPps">${fmt(powerFor(g))}</span></div>
      <div class="desc lvline">Lv <span class="lvNow">0</span> → <span class="lvNext">1</span></div>
      <div class="desc upEffect">
        強化+1効果：単体 <span class="e1a"></span> → <span class="e1b"></span>（+<span class="e1d"></span>）｜全体 <span class="t1a"></span> → <span class="t1b"></span>（+<span class="t1d"></span>）
      </div>
      <div class="desc upEffectMax">
        まとめ強化効果：単体 <span class="eMa"></span> → <span class="eMb"></span>（+<span class="eMd"></span>）｜全体 <span class="tMa"></span> → <span class="tMb"></span>（+<span class="tMd"></span>）
      </div>
    </div>
    <div class="right">
      <div class="buttons">
        <div class="row">
          <button class="btn buy1">購入</button>
          <button class="btn buyMax">まとめ購入</button>
        </div>
        <div class="row mt8">
          <button class="btn up1">強化＋1</button>
          <button class="btn upMax">まとめ強化</button>
        </div>
      </div>
    </div>
  `;

  const ownEl = row.querySelector('.own');
  const eachEl = row.querySelector('.eachPps');

  const btnBuy1 = row.querySelector('.buy1');
  const btnBuyM = row.querySelector('.buyMax');
  const btnUp1  = row.querySelector('.up1');
  const btnUpM  = row.querySelector('.upMax');

  if (btnBuy1) btnBuy1.classList.add('btn','btn-buy');
  if (btnBuyM) btnBuyM.classList.add('btn','btn-buy-agg');
  if (btnUp1)  btnUp1.classList.add('btn','btn-upg');
  if (btnUpM)  btnUpM.classList.add('btn','btn-upg-agg');

  const e1a=row.querySelector('.e1a'), e1b=row.querySelector('.e1b'), e1d=row.querySelector('.e1d');
  const t1a=row.querySelector('.t1a'), t1b=row.querySelector('.t1b'), t1d=row.querySelector('.t1d');
  const eMa=row.querySelector('.eMa'), eMb=row.querySelector('.eMb'), eMd=row.querySelector('.eMd');
  const tMa=row.querySelector('.tMa'), tMb=row.querySelector('.tMb'), tMd=row.querySelector('.tMd');

  function refresh(){
    ownEl.textContent = fmt(g.count);
    eachEl.textContent = fmt(powerFor(g).times(getJobBonuses(state.job).gen));

    const nMax = maxAffordableUnits(g, state.power);
    const sumU = totalCostUnits(g, nMax);
    if (btnBuy1){
      const price1 = nextUnitCost(g);
      btnBuy1.disabled = state.power.lt(price1);
      btnBuy1.textContent = `購入（${fmt(price1)}）`;
    }
    if (btnBuyM){
      btnBuyM.disabled = (nMax<=0);
      btnBuyM.textContent = `まとめ購入 ×${fmt(nMax)}（${fmt(sumU)}）`;
    }

    const up1 = nextUpgradeCost(g);
    const kMax = (g.count>0) ? maxAffordableUpgrades(g, state.power) : 0;
    const sumK = totalCostUpgrades(g, kMax);
    if (btnUp1){
      btnUp1.disabled = state.power.lt(up1) || (g.count|0) <= 0;
      btnUp1.textContent = `強化＋1（${fmt(up1)}）`;
      const willHit10 = (((g.level|0) + 1) % 10 === 0);
      btnUp1.classList.toggle('milestone', willHit10);
    }
    if (btnUpM){
      btnUpM.disabled = (kMax<=0);
      btnUpM.textContent = `まとめ強化 ×${fmt(kMax)}（${fmt(sumK)}）`;
      const cross10 = ((g.level|0)%10) + kMax >= 10;
      btnUpM.classList.toggle('milestone', cross10);
    }

    const s1 = simulateTotalAfterUpgrade(state,g,1);
    e1a.textContent=fmt(s1.beforeEach); e1b.textContent=fmt(s1.afterEach); e1d.textContent=fmt(s1.deltaEach);
    t1a.textContent=fmt(s1.beforeTotal); t1b.textContent=fmt(s1.afterTotal); t1d.textContent=fmt(s1.deltaTotal);

      const sM = simulateTotalAfterUpgrade(state,g,kMax);
      eMa.textContent=fmt(sM.beforeEach); eMb.textContent=fmt(sM.afterEach); eMd.textContent=fmt(kMax>0 ? sM.deltaEach : 0);
      tMa.textContent=fmt(sM.beforeTotal); tMb.textContent=fmt(sM.afterTotal); tMd.textContent=fmt(kMax>0 ? sM.deltaTotal : 0);

    const lvNowEl=row.querySelector('.lvNow');
    const lvNextEl=row.querySelector('.lvNext');
    if (lvNowEl) lvNowEl.textContent = String(g.level|0);
    if (lvNextEl) lvNextEl.textContent = String((g.level|0)+1);
  }

  if (btnBuy1) btnBuy1.addEventListener('click',()=>{ if(!btnBuy1.disabled && buyUnits(state,g.id,'1')){ onUpdate(); refresh(); } });
  if (btnBuyM) btnBuyM.addEventListener('click',()=>{ if(!btnBuyM.disabled && buyUnits(state,g.id,'max')){ onUpdate(); refresh(); } });
  if (btnUp1)  btnUp1.addEventListener('click',()=>{ if(!btnUp1.disabled  && upgrade(state,g.id,'1')){ onUpdate(); refresh(); } });
  if (btnUpM)  btnUpM.addEventListener('click',()=>{ if(!btnUpM.disabled  && upgrade(state,g.id,'max')){ onUpdate(); refresh(); } });

  refresh();
  return row;
}

export function renderGens(state){
  const list=document.getElementById('genlist'); list.innerHTML='';
  state.gens.forEach(g=> list.appendChild(genRow(state,g,()=>renderKPI(state))));
}

export function renderAll(state, onRebirth, handlers){
  renderKPI(state); renderClick(state); renderGens(state); renderRebirths(state, onRebirth); renderFeatures(state, handlers); renderJobs(state, handlers && handlers.changeJob);
}

export function bindFormatToggle(state, handlers){
  const btn = document.getElementById('fmtToggle');
  if(!btn) return;
  const apply = ()=>{ btn.textContent = (getFormatMode()==='eng' ? '表記：工学式' : '表記：日本式'); };
  btn.addEventListener('click', ()=>{
    setFormatMode(getFormatMode()==='eng' ? 'jp' : 'eng');
    apply();
    if(state) renderAll(state, null, handlers);
  });
  apply();
}


export function lightRefresh(state, onRebirth, handlers){
  // update click info, features and buttons
  try{
    renderClick(state);
    renderFeatures(state, handlers);
  }catch{}

  // update generator rows
  const rows = Array.from(document.querySelectorAll('#genlist .gen'));
  rows.forEach((row, idx)=>{
    const g = state.gens[idx];
    if (!g) return;
    const btnBuy1=row.querySelector('.buy1');
    const btnBuyM=row.querySelector('.buyMax');
    const btnUp1 =row.querySelector('.up1');
    const btnUpM =row.querySelector('.upMax');

    const nMax = maxAffordableUnits(g,state.power);
    const sumU = totalCostUnits(g,nMax);
    if(btnBuy1){
      const price1 = nextUnitCost(g);
      btnBuy1.disabled = state.power.lt(price1);
      btnBuy1.textContent = `購入（${fmt(price1)}）`;
    }
    if(btnBuyM){
      btnBuyM.disabled = (nMax<=0);
      btnBuyM.textContent = `まとめ購入 ×${fmt(nMax)}（${fmt(sumU)}）`;
    }

    const up1 = nextUpgradeCost(g);
    const kMax = (g.count>0) ? maxAffordableUpgrades(g,state.power) : 0;
    const sumK = totalCostUpgrades(g,kMax);
    if(btnUp1){
      btnUp1.disabled = state.power.lt(up1) || (g.count|0) <= 0;
      btnUp1.textContent = `強化＋1（${fmt(up1)}）`;
      const willHit10 = (((g.level|0)+1)%10===0);
      btnUp1.classList.toggle('milestone', willHit10);
    }
    if(btnUpM){
      btnUpM.disabled = (kMax<=0);
      btnUpM.textContent = `まとめ強化 ×${fmt(kMax)}（${fmt(sumK)}）`;
      const cross10 = ((g.level|0)%10) + kMax >= 10;
      btnUpM.classList.toggle('milestone', cross10);
    }

    const e1a=row.querySelector('.e1a'), e1b=row.querySelector('.e1b'), e1d=row.querySelector('.e1d');
    const t1a=row.querySelector('.t1a'), t1b=row.querySelector('.t1b'), t1d=row.querySelector('.t1d');
    const eMa=row.querySelector('.eMa'), eMb=row.querySelector('.eMb'), eMd=row.querySelector('.eMd');
    const tMa=row.querySelector('.tMa'), tMb=row.querySelector('.tMb'), tMd=row.querySelector('.tMd');
    const s1 = simulateTotalAfterUpgrade(state,g,1);
    if(e1a) e1a.textContent=fmt(s1.beforeEach);
    if(e1b) e1b.textContent=fmt(s1.afterEach);
    if(e1d) e1d.textContent=fmt(s1.deltaEach);
    if(t1a) t1a.textContent=fmt(s1.beforeTotal);
    if(t1b) t1b.textContent=fmt(s1.afterTotal);
    if(t1d) t1d.textContent=fmt(s1.deltaTotal);

    const sM = simulateTotalAfterUpgrade(state,g,kMax);
    if(eMa) eMa.textContent=fmt(sM.beforeEach);
    if(eMb) eMb.textContent=fmt(sM.afterEach);
    if(eMd) eMd.textContent=fmt(kMax>0 ? sM.deltaEach : 0);
    if(tMa) tMa.textContent=fmt(sM.beforeTotal);
    if(tMb) tMb.textContent=fmt(sM.afterTotal);
    if(tMd) tMd.textContent=fmt(kMax>0 ? sM.deltaTotal : 0);

    const lvNowEl=row.querySelector('.lvNow');
    const lvNextEl=row.querySelector('.lvNext');
    if (lvNowEl) lvNowEl.textContent = String(g.level|0);
    if (lvNextEl) lvNextEl.textContent = String((g.level|0)+1);
  });
  try{ renderRebirths(state, onRebirth); }catch{}
}
