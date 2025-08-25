import { fmt } from './format.js';
import { clickGainByLevel, clickNextCost, clickNextDelta } from './click.js';

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
  document.getElementById('pps').textContent = '0';
}

export function renderGens(state){
  const list = document.getElementById('genlist');
  list.innerHTML = '';
  state.gens.forEach(g=>{
    const row = document.createElement('div');
    row.className = 'gen';
    row.innerHTML = `
      <div>
        <div class="name">${g.name} <span class="muted">x${g.count}</span></div>
        <div class="desc">${g.desc}</div>
      </div>
      <div class="row" style="justify-content:flex-end">
        <button class="btn" disabled>購入（次段）</button>
        <button class="btn warn" disabled>強化（次段）</button>
      </div>`;
    list.appendChild(row);
  });
}

export function renderAll(state){
  renderKPI(state);
  renderClick(state);
  renderGens(state);
}
