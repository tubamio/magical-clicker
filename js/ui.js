// js/ui.js
import { fmt } from './format.js';
import { clickGainByLevel, clickNextCost, clickNextDelta } from './click.js';
import { nextUnitCost, buy, totalPps } from './economy.js';

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
  // 単価（次の一体）を算出
  const unit = nextUnitCost(g);

  const row = document.createElement('div');
  row.className = 'gen';
  row.innerHTML = `
    <div>
      <div class="name">${g.name} <span class="muted">x<span class="own">${g.count}</span></span></div>
      <div class="desc">${g.desc}</div>
    </div>
    <div class="row" style="justify-content:flex-end">
      <span class="pill">単価: <span class="price">${fmt(unit)}</span></span>
      <button class="btn buy1">購入 1</button>
      <button class="btn buy10">購入 10</button>
      <button class="btn buymax">最大購入</button>
    </div>`;

  // ボタンの活性/価格更新
  const refreshButtons = ()=>{
    const unitNow = nextUnitCost(g);
    row.querySelector('.price').textContent = fmt(unitNow);
    row.querySelector('.own').textContent   = g.count;
    // 所持で1体買えるかどうか
    row.querySelector('.buy1').disabled  = (state.power < unitNow);
    // 10体の合計コスト（お金足りなければ無効）
    // ここは economy 側に任せても良いが簡易チェックを行う
    row.querySelector('.buy10').disabled = !buyCheck(state, g, '10');
    row.querySelector('.buymax').disabled = !buyCheck(state, g, 'max');
  };

  // 「買えるかだけ事前判定」用の薄いコピー
  const buyCheck = (state0, g0, mode)=>{
    const clone = { power: state0.power, gens: state0.gens.map(x=>({...x})) };
    return buy(clone, g0.id, mode);
  };

  // ハンドラ
  row.querySelector('.buy1').addEventListener('click', ()=>{
    if (buy(state, g.id, '1')) onUpdate();
    refreshButtons();
  });
  row.querySelector('.buy10').addEventListener('click', ()=>{
    if (buy(state, g.id, '10')) onUpdate();
    refreshButtons();
  });
  row.querySelector('.buymax').addEventListener('click', ()=>{
    if (buy(state, g.id, 'max')) onUpdate();
    refreshButtons();
  });

  // 初期状態反映
  refreshButtons();
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
