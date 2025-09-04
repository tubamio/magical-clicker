function setBtnState(btn, enabled){ if(!btn) return; btn.disabled=!enabled; btn.classList.toggle('is-disabled', !enabled); }
import { fmt, getFormatMode, setFormatMode } from './format.js';
import { clickGainByLevel, clickNextCost, globalMultiplier, clickTotalCost } from './click.js';
import {
  nextUnitCost, totalCostUnits, maxAffordableUnits, buyUnits,
  nextUpgradeCost, totalCostUpgrades, maxAffordableUpgrades, upgrade,
  powerFor, totalPps
} from './economy.js';

/* ===== クリック強化（最大回数） ===== */
function maxAffordableClick(state){
  let lv = state.clickLv, money = state.power, n = 0;
  while (money >= clickNextCost(lv) && n < 1e6) {
    money -= clickNextCost(lv); lv++; n++;
  }
  return n;
}

export function renderClick(state){
    const gain = clickGainByLevel(state.clickLv);
    setText('tapGain', '+' + fmt(gain));

    setText('clickLvNow', String(state.clickLv));
    setText('clickLvNext', String(state.clickLv + 1));

    function sim(n){
      const beforeClick = clickGainByLevel(state.clickLv);
      const afterClick  = clickGainByLevel(state.clickLv + n);
      const beforeMult  = globalMultiplier(state.clickLv);
      const afterMult   = globalMultiplier(state.clickLv + n);
      return {
        beforeClick,
        afterClick,
        deltaClick: afterClick - beforeClick,
        beforeMult,
        afterMult,
        deltaMult: afterMult - beforeMult,
      };
    }

    const s1 = sim(1);
    setText('c1a', fmt(s1.beforeClick));
    setText('c1b', fmt(s1.afterClick));
    setText('c1d', fmt(s1.deltaClick));
    setText('m1a', fmt(s1.beforeMult));
    setText('m1b', fmt(s1.afterMult));
    setText('m1d', fmt(s1.deltaMult));

    const nMax = maxAffordableClick(state);
    const sM = sim(nMax);
    setText('cMa', fmt(sM.beforeClick));
    setText('cMb', fmt(sM.afterClick));
    setText('cMd', fmt(nMax>0 ? sM.deltaClick : 0));
    setText('mMa', fmt(sM.beforeMult));
    setText('mMb', fmt(sM.afterMult));
    setText('mMd', fmt(nMax>0 ? sM.deltaMult : 0));

    const b1 = document.getElementById('upgradeClick');
    const bm = document.getElementById('upgradeClickMax');
    const cost1 = clickNextCost(state.clickLv);
    const sumCost = clickTotalCost(state.clickLv, nMax);
    b1.disabled = state.power < cost1;
    b1.textContent = `単体強化（${fmt(cost1)}）`;
    bm.disabled = (nMax <= 0);
    bm.textContent = `まとめ強化 ×${fmt(nMax)}（${fmt(sumCost)}）`;
  }

function setText(id, value){ const n=document.getElementById(id); if(n) n.textContent = value; }
export function renderKPI(state){
  setText('power', fmt(state.power));
  const pps = totalPps(state) * globalMultiplier(state.clickLv);
  setText('pps', fmt(pps));
}

/* ===== ジェネ ===== */
function simulateTotalAfterUpgrade(state, g, n){
  const baseLevel = g.level|0;
  const normalized = {
    ...state,
    gens: state.gens.map(x=> ({ ...x, level:(x.level|0) }))
  };
  const beforeTotal = totalPps(normalized) * globalMultiplier(state.clickLv);
  const beforeEach  = powerFor({ ...g, level: baseLevel });
  const afterEach   = powerFor({ ...g, level: baseLevel + n });
  const afterState  = {
    ...normalized,
    gens: normalized.gens.map(x=> x.id===g.id ? { ...x, level: baseLevel + n } : x)
  };
  const afterTotal  = totalPps(afterState) * globalMultiplier(state.clickLv);
  return {
    beforeEach,
    afterEach,
    deltaEach: afterEach - beforeEach,
    beforeTotal,
    afterTotal,
    deltaTotal: afterTotal - beforeTotal,
  };
}

function genRow(state, g, onUpdate){
  const row = document.createElement('div');
  row.className = 'gen';
  row.innerHTML = `
    <div class="left">
      <div class="name">${g.name} <span class="muted">x<span class="own">${fmt(g.count)}</span></span></div>
      <div class="desc flavor">${g.desc}</div>
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
    eachEl.textContent = fmt(powerFor(g));

      const nMax = maxAffordableUnits(g, state.power);
    const sumU = totalCostUnits(g, nMax);
    if (btnBuy1){
      const price1 = nextUnitCost(g);
      btnBuy1.disabled = state.power < price1;
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
        btnUp1.disabled = state.power < up1 || (g.count|0) <= 0;
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

export function renderAll(state){
  renderKPI(state); renderClick(state); renderGens(state);
}

export function bindFormatToggle(state){
  const btn = document.getElementById('fmtToggle');
  if(!btn) return;
  const apply = ()=>{ btn.textContent = (getFormatMode()==='eng' ? '表記：工学式' : '表記：日本式'); };
  btn.addEventListener('click', ()=>{
    setFormatMode(getFormatMode()==='eng' ? 'jp' : 'eng');
    apply();
    if(state) renderAll(state);
  });
  apply();
}


export function lightRefresh(state){
  // update click info and buttons
  try{
    renderClick(state);
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
      btnBuy1.disabled = state.power < price1;
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
      btnUp1.disabled = state.power < up1 || (g.count|0) <= 0;
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

    const lvNowEl=row.querySelector('.lvNow');
    const lvNextEl=row.querySelector('.lvNext');
    if (lvNowEl) lvNowEl.textContent = String(g.level|0);
    if (lvNextEl) lvNextEl.textContent = String((g.level|0)+1);
  });
}
