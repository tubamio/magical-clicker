// js/ui.js
import { fmt } from './format.js';
import { clickGainByLevel, clickNextCost, clickNextDelta } from './click.js';
import {
  nextUnitCost, totalCostUnits, maxAffordableUnits, buyUnits,
  nextUpgradeCost, totalCostUpgrades, maxAffordableUpgrades, upgrade,
  powerFor, totalPps
} from './economy.js';

export function renderClick(state){
  const elTapGain = document.getElementById('tapGain');
  const elClickInfo = document.getElementById('clickInfo');
  const gain = clickGainByLevel(state.clickLv);
  elTapGain.textContent = '+' + (gain<10 ? gain.toFixed(2) : gain.toFixed(0));
  const nextDelta = clickNextDelta(state.clickLv);
  const nextCost  = clickNextCost(state.clickLv);
  elClickInfo.textContent = `クリック強化 Lv ${state.clickLv} / 次: +${(nextDelta<10? nextDelta.toFixed(2): nextDelta.toFixed(0))}（費用 ${fmt(nextCost)}）`;
}

export function renderKPI(state){
  document.getElementById('power').textContent = fmt(state.power);
  document.getElementById('pps').textContent   = fmt(totalPps(state));
}

function genRow(state, g, onUpdate){
  const row = document.createElement('div');
  row.className = 'gen';
  row.innerHTML = `
    <div>
      <div class="name">${g.name} <span class="muted">x<span class="own">${g.count|0}</span></span></div>
      <div class="desc">単体/sec: <span class="eachPps">${fmt(powerFor(g))}</span></div>
    </div>
    <div class="right">
      <div class="row" style="justify-content:flex-end;gap:8px">
        <button class="btn buy">${/* 単体購入 */''}</button>
        <button class="btn buy alt">${/* 最大購入 */''}</button>
      </div>
      <div class="row" style="justify-content:flex-end;gap:8px">
        <button class="btn up">${/* 強化+1 */''}</button>
        <button class="btn up alt">${/* 最大強化 */''}</button>
      </div>
    </div>`;

  const ownEl   = row.querySelector('.own');
  const eachEl  = row.querySelector('.eachPps');
  const btnBuy1 = row.querySelector('.btn.buy:not(.alt)');
  const btnBuyM = row.querySelector('.btn.buy.alt');
  const btnUp1  = row.querySelector('.btn.up:not(.alt)');
  const btnUpM  = row.querySelector('.btn.up.alt');

  function refresh(){
    // 単体出力
    eachEl.textContent = fmt(powerFor(g));
    ownEl.textContent  = g.count|0;

    // 購入まわり
    const unit = nextUnitCost(g);
    const nMax = maxAffordableUnits(g, state.power);
    const sumU = totalCostUnits(g, nMax);

    btnBuy1.textContent = `購入 1（${fmt(unit)}）`;
    btnBuy1.disabled = state.power < unit;

    btnBuyM.textContent = `最大購入 ×${nMax}（${fmt(sumU)}）`;
    btnBuyM.disabled = (nMax <= 0);

    // 強化まわり
    const up1  = nextUpgradeCost(g);
    const kMax = maxAffordableUpgrades(g, state.power);
    const sumK = totalCostUpgrades(g, kMax);

    btnUp1.textContent = `強化 +1（${fmt(up1)}）`;
    btnUp1.disabled = state.power < up1;

    btnUpM.textContent = `最大強化 ×${kMax}（${fmt(sumK)}）`;
    btnUpM.disabled = (kMax <= 0);
  }

  // handlers
  btnBuy1.addEventListener('click', ()=>{ if (buyUnits(state, g.id, '1'))  onUpdate(); refresh(); });
  btnBuyM.addEventListener('click', ()=>{ if (buyUnits(state, g.id, 'max')) onUpdate(); refresh(); });
  btnUp1 .addEventListener('click', ()=>{ if (upgrade (state, g.id, '1'))  onUpdate(); refresh(); });
  btnUpM .addEventListener('click', ()=>{ if (upgrade (state, g.id, 'max')) onUpdate(); refresh(); });

  refresh();
  return row;
}

export function renderGens(state){
  const list = document.getElementById('genlist');
  list.innerHTML = '';
  state.gens.forEach(g=>{
    list.appendChild(genRow(state, g, ()=> {
      renderKPI(state);
      // 行の再描画（価格や出力が変わる）
      list.replaceChild(genRow(state, g, ()=>{ renderKPI(state); }), list.lastChild);
      // ↑最末尾にしか差し替わらないのを避けるなら、全再描画でもOK：
      // renderGens(state);
    }));
  });
}

export function renderAll(state){
  renderKPI(state);
  renderClick(state);
  renderGens(state);
}
