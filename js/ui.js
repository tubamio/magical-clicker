// js/ui.js
import { fmt } from './format.js';
import { clickGainByLevel, clickNextCost, clickNextDelta } from './click.js';
import {
  nextUnitCost, totalCostUnits, maxAffordableUnits, buyUnits,
  nextUpgradeCost, totalCostUpgrades, maxAffordableUpgrades, upgrade,
  powerFor, totalPps
} from './economy.js';

/* ===== クリック強化の情報をまとめて更新 ===== */
function maxAffordableClick(state){
  // クリック強化の費用は click.js 管理（costMulの等比）
  // ここでは所持で何回いけるかを等比で計算する簡易ループ（レベルはそこまで大きくない想定）
  let lv = state.clickLv;
  let money = state.power;
  let n = 0;
  while (money >= clickNextCost(lv) && n < 1e6) {
    money -= clickNextCost(lv);
    lv += 1; n += 1;
  }
  return n;
}

export function renderClick(state){
  const gain = clickGainByLevel(state.clickLv);
  document.getElementById('tapGain').textContent = '+' + (gain<10 ? gain.toFixed(2) : gain.toFixed(0));

  // 情報ピル
  document.getElementById('clickLvInfo').textContent = `Lv ${state.clickLv}`;
  const delta = clickNextDelta(state.clickLv);
  document.getElementById('clickDelta').textContent = (delta<10? delta.toFixed(2): delta.toFixed(0));
  const cost  = clickNextCost(state.clickLv);
  document.getElementById('clickCost').textContent  = fmt(cost);
  const after = clickGainByLevel(state.clickLv+1);
  document.getElementById('clickAfter').textContent = '+' + (after<10? after.toFixed(2): after.toFixed(0));

  // ボタン活性
  const b1 = document.getElementById('upgradeClick');
  const bm = document.getElementById('upgradeClickMax');
  b1.disabled = state.power < cost;
  const nMax = maxAffordableClick(state);
  bm.disabled = (nMax <= 0);
  bm.textContent = `最大強化 ×${nMax}`;
}

export function renderKPI(state){
  document.getElementById('power').textContent = fmt(state.power);
  document.getElementById('pps').textContent   = fmt(totalPps(state));
}

/* ===== ジェネ行 ===== */
function simulateTotalAfterUpgrade(state, g, n){
  // n回強化後の総/sec（他ジェネはそのまま）
  const curr = totalPps(state);
  const beforeEach = powerFor(g);
  const afterEach  = powerFor({...g, level:(g.level|0)+n});
  const deltaEach  = afterEach - beforeEach;

  const beforeTotal = curr;
  const afterTotal  = curr - (g.count|0)*beforeEach + (g.count|0)*afterEach;
  const deltaTotal  = afterTotal - beforeTotal;

  return { beforeEach, afterEach, deltaEach, beforeTotal, afterTotal, deltaTotal };
}

function genRow(state, g, onUpdate){
  const row = document.createElement('div');
  row.className = 'gen';
  row.innerHTML = `
    <div class="left">
      <div class="name">${g.name} <span class="muted">x<span class="own">${g.count|0}</span></span></div>
      <div class="desc">
        単体/sec: <span class="eachPps">${fmt(powerFor(g))}</span>
      </div>
      <div class="desc upEffect">
        強化+1効果：単体 <span class="e1a"></span> → <span class="e1b"></span>（+<span class="e1d"></span>）／ 総 <span class="t1a"></span> → <span class="t1b"></span>（+<span class="t1d"></span>）
      </div>
      <div class="desc upEffectMax">
        最大強化効果：単体 <span class="eMa"></span> → <span class="eMb"></span>（+<span class="eMd"></span>）／ 総 <span class="tMa"></span> → <span class="tMb"></span>（+<span class="tMd"></span>）
      </div>
    </div>
    <div class="right">
      <div class="row" style="justify-content:flex-end;gap:8px">
        <span class="pill">単価: <span class="price">${fmt(nextUnitCost(g))}</span></span>
        <button class="btn buy buy1">購入 1</button>
        <button class="btn buy alt buyMax">最大購入 ×0（0）</button>
      </div>
      <div class="row" style="justify-content:flex-end;gap:8px">
        <span class="pill">強化費用: <span class="upPrice">${fmt(nextUpgradeCost(g))}</span></span>
        <button class="btn up up1">強化 +1</button>
        <button class="btn up alt upMax">最大強化 ×0（0）</button>
      </div>
    </div>`;

  const ownEl   = row.querySelector('.own');
  const eachEl  = row.querySelector('.eachPps');
  const priceEl = row.querySelector('.price');
  const upPrice = row.querySelector('.upPrice');

  const btnBuy1 = row.querySelector('.buy1');
  const btnBuyM = row.querySelector('.buyMax');
  const btnUp1  = row.querySelector('.up1');
  const btnUpM  = row.querySelector('.upMax');

  const e1a=row.querySelector('.e1a'), e1b=row.querySelector('.e1b'), e1d=row.querySelector('.e1d');
  const t1a=row.querySelector('.t1a'), t1b=row.querySelector('.t1b'), t1d=row.querySelector('.t1d');
  const eMa=row.querySelector('.eMa'), eMb=row.querySelector('.eMb'), eMd=row.querySelector('.eMd');
  const tMa=row.querySelector('.tMa'), tMb=row.querySelector('.tMb'), tMd=row.querySelector('.tMd');

  function refresh(){
    // 所有数／単体出力
    ownEl.textContent  = g.count|0;
    eachEl.textContent = fmt(powerFor(g));

    // 購入（単価・最大）
    const unit = nextUnitCost(g);
    const nMax = maxAffordableUnits(g, state.power);
    const sumU = totalCostUnits(g, nMax);
    priceEl.textContent = fmt(unit);
    btnBuy1.disabled = state.power < unit;
    btnBuyM.disabled = (nMax <= 0);
    btnBuyM.textContent = `最大購入 ×${nMax}（${fmt(sumU)}）`;

    // 強化（費用・最大）
    const up1  = nextUpgradeCost(g);
    const kMax = maxAffordableUpgrades(g, state.power);
    const sumK = totalCostUpgrades(g, kMax);
    upPrice.textContent = fmt(up1);
    btnUp1.disabled = state.power < up1;
    btnUpM.disabled = (kMax <= 0);
    btnUpM.textContent = `最大強化 ×${kMax}（${fmt(sumK)}）`;

    // 強化効果の見える化
    const s1 = simulateTotalAfterUpgrade(state, g, 1);
    e1a.textContent = fmt(s1.beforeEach);
    e1b.textContent = fmt(s1.afterEach);
    e1d.textContent = fmt(s1.deltaEach);
    t1a.textContent = fmt(s1.beforeTotal);
    t1b.textContent = fmt(s1.afterTotal);
    t1d.textContent = fmt(s1.deltaTotal);

    const sM = simulateTotalAfterUpgrade(state, g, Math.max(kMax,0));
    eMa.textContent = fmt(sM.beforeEach);
    eMb.textContent = fmt(sM.afterEach);
    eMd.textContent = fmt(Math.max(0,sM.deltaEach));
    tMa.textContent = fmt(sM.beforeTotal);
    tMb.textContent = fmt(sM.afterTotal);
    tMd.textContent = fmt(Math.max(0,sM.deltaTotal));
  }

  // handlers（無効時はCSSで完全無反応）
  btnBuy1.addEventListener('click', ()=>{ if (btnBuy1.disabled) return; if (buyUnits(state, g.id, '1'))  onUpdate(); refresh(); });
  btnBuyM.addEventListener('click', ()=>{ if (btnBuyM.disabled) return; if (buyUnits(state, g.id, 'max')) onUpdate(); refresh(); });
  btnUp1 .addEventListener('click', ()=>{ if (btnUp1.disabled)  return; if (upgrade (state, g.id, '1'))  onUpdate(); refresh(); });
  btnUpM .addEventListener('click', ()=>{ if (btnUpM.disabled)  return; if (upgrade (state, g.id, 'max')) onUpdate(); refresh(); });

  refresh();
  return row;
}

export function renderGens(state){
  const list = document.getElementById('genlist');
  list.innerHTML = '';
  state.gens.forEach(g=>{
    list.appendChild(genRow(state, g, ()=> {
      renderKPI(state);
    }));
  });
}

export function renderAll(state){
  renderKPI(state);
  renderClick(state);
  renderGens(state);
}
