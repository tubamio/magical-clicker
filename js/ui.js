import { fmt } from './format.js';
import { clickGainByLevel, clickNextCost, clickNextDelta, globalMultiplier } from './click.js';
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
  document.getElementById('tapGain').textContent = '+' + (gain<10?gain.toFixed(2):gain.toFixed(0));

  document.getElementById('clickLvInfo').textContent = `Lv ${state.clickLv}`;
  document.getElementById('clickDelta').textContent = (clickNextDelta(state.clickLv)).toFixed(2);
  document.getElementById('clickCost').textContent  = fmt(clickNextCost(state.clickLv));
  document.getElementById('clickAfter').textContent = '+' + clickGainByLevel(state.clickLv+1).toFixed(2);

  const b1 = document.getElementById('upgradeClick');
  const bm = document.getElementById('upgradeClickMax');
  b1.disabled = state.power < clickNextCost(state.clickLv);
  const nMax = maxAffordableClick(state);
  bm.disabled = (nMax <= 0);
  bm.textContent = `最大強化 ×${nMax}`;
}

export function renderKPI(state){
  document.getElementById('power').textContent = fmt(state.power);
  const pps = totalPps(state) * globalMultiplier(state.clickLv);
  document.getElementById('pps').textContent   = fmt(pps);
}

/* ===== ジェネ ===== */
function simulateTotalAfterUpgrade(state, g, n){
  const curr = totalPps(state) * globalMultiplier(state.clickLv);
  const beforeEach = powerFor(g);
  const afterEach  = powerFor({...g, level:(g.level|0)+n});
  const deltaEach  = afterEach - beforeEach;

  const beforeTotal = curr;
  const afterTotal  = (totalPps({
    ...state,
    gens: state.gens.map(x=> x.id===g.id ? {...g, level:(g.level|0)+n } : x)
  }) * globalMultiplier(state.clickLv));
  const deltaTotal  = afterTotal - beforeTotal;

  return { beforeEach, afterEach, deltaEach, beforeTotal, afterTotal, deltaTotal };
}

function genRow(state, g, onUpdate){
  const row = document.createElement('div');
  row.className = 'gen';
  row.innerHTML = `
    <div class="left">
      <div class="name">${g.name} <span class="muted">x<span class="own">${g.count|0}</span></span></div>
      <div class="desc">単体/sec: <span class="eachPps">${fmt(powerFor(g))}</span></div>
      <div class="desc">次の購入単価: <span class="price">${fmt(nextUnitCost(g))}</span></div>
      <div class="desc upEffect">
        強化+1効果：単体 <span class="e1a"></span> → <span class="e1b"></span>（+<span class="e1d"></span>）／ 総 <span class="t1a"></span> → <span class="t1b"></span>（+<span class="t1d"></span>）
      </div>
      <div class="desc upEffectMax">
        最大強化効果：単体 <span class="eMa"></span> → <span class="eMb"></span>（+<span class="eMd"></span>）／ 総 <span class="tMa"></span> → <span class="tMb"></span>（+<span class="tMd"></span>）
      </div>
    </div>
    <div class="right">
      <div class="row gap8">
        <button class="btn buy buy1">購入 1</button>
        <button class="btn buy alt buyMax">最大購入</button>
      </div>
      <div class="row gap8 mt8">
        <button class="btn up up1">強化 +1</button>
        <button class="btn up alt upMax">最大強化</button>
      </div>
    </div>`;

  const ownEl = row.querySelector('.own');
  const eachEl= row.querySelector('.eachPps');
  const priceEl=row.querySelector('.price');

  const btnBuy1=row.querySelector('.buy1');
  const btnBuyM=row.querySelector('.buyMax');
  const btnUp1 =row.querySelector('.up1');
  const btnUpM =row.querySelector('.upMax');

  const e1a=row.querySelector('.e1a'), e1b=row.querySelector('.e1b'), e1d=row.querySelector('.e1d');
  const t1a=row.querySelector('.t1a'), t1b=row.querySelector('.t1b'), t1d=row.querySelector('.t1d');
  const eMa=row.querySelector('.eMa'), eMb=row.querySelector('.eMb'), eMd=row.querySelector('.eMd');
  const tMa=row.querySelector('.tMa'), tMb=row.querySelector('.tMb'), tMd=row.querySelector('.tMd');

  function refresh(){
    ownEl.textContent = g.count|0;
    eachEl.textContent= fmt(powerFor(g));
    priceEl.textContent= fmt(nextUnitCost(g));

    // 購入
    const nMax=maxAffordableUnits(g,state.power);
    const sumU=totalCostUnits(g,nMax);
    btnBuy1.disabled = state.power<nextUnitCost(g);
    btnBuyM.disabled = (nMax<=0);
    btnBuyM.textContent=`最大購入 ×${nMax}（${fmt(sumU)}）`;

    // 強化
    const up1=nextUpgradeCost(g);
    const kMax=maxAffordableUpgrades(g,state.power);
    const sumK=totalCostUpgrades(g,kMax);
    btnUp1.disabled= state.power<up1;
    btnUpM.disabled=(kMax<=0);
    btnUpM.textContent=`最大強化 ×${kMax}（${fmt(sumK)}）`;

    // 強化効果（PPSは全体倍率込みで評価）
    const s1=simulateTotalAfterUpgrade(state,g,1);
    e1a.textContent=fmt(s1.beforeEach); e1b.textContent=fmt(s1.afterEach); e1d.textContent=fmt(s1.deltaEach);
    t1a.textContent=fmt(s1.beforeTotal); t1b.textContent=fmt(s1.afterTotal); t1d.textContent=fmt(s1.deltaTotal);

    const sM=simulateTotalAfterUpgrade(state,g,Math.max(kMax,0));
    eMa.textContent=fmt(sM.beforeEach); eMb.textContent=fmt(sM.afterEach); eMd.textContent=fmt(Math.max(0,sM.deltaEach));
    tMa.textContent=fmt(sM.beforeTotal); tMb.textContent=fmt(sM.afterTotal); tMd.textContent=fmt(Math.max(0,sM.deltaTotal));
  }

  btnBuy1.addEventListener('click',()=>{if(!btnBuy1.disabled){if(buyUnits(state,g.id,'1'))onUpdate();refresh();}});
  btnBuyM.addEventListener('click',()=>{if(!btnBuyM.disabled){if(buyUnits(state,g.id,'max'))onUpdate();refresh();}});
  btnUp1 .addEventListener('click',()=>{if(!btnUp1.disabled ){if(upgrade (state,g.id,'1'))onUpdate();refresh();}});
  btnUpM .addEventListener('click',()=>{if(!btnUpM.disabled ){if(upgrade (state,g.id,'max'))onUpdate();refresh();}});

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
