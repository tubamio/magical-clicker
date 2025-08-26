/* ===== UI helpers ===== */
const el = id => document.getElementById(id);
const fmt = (n) => window.formatJP ? window.formatJP(n) : (n||0).toLocaleString(); // 既存formatに寄せる

function setButtonDisabled(button, disabled){
  button.disabled = !!disabled;
  button.classList.toggle('is-disabled', !!disabled);
}

function highlightMilestone(element, isOn){
  element.classList.toggle('milestone', !!isOn);
}

/* ===== Click upgrade panel ===== */
export function renderClickPanel(state, economy){
  const { clickLv, power } = state;
  const nowPower = economy.clickPower(clickLv);          // = 1 * 4^Lv * 1.03^Lv を内部で計算する実装を想定
  const nextPower = economy.clickPower(clickLv + 1);
  const delta = nextPower - nowPower;
  const nextCost = economy.clickCost(clickLv);

  el('clickLvText').textContent = clickLv;
  el('clickPowerNow').textContent = fmt(nowPower);
  el('clickPowerNext').textContent = '×4';
  el('clickDelta').textContent = delta > 0 ? `(+${fmt(delta)})` : '';
  el('clickNextCost').textContent = fmt(nextCost);

  setButtonDisabled(el('clickUp1'), power < nextCost);
  setButtonDisabled(el('clickUpMax'), power < nextCost);

  // Lv10の倍数でハイライト
  highlightMilestone(el('clickPanel'), (clickLv + 1) % 10 === 0);
}

/* ===== Generators list ===== */
export function renderGenerators(state, economy, data){
  const list = el('genList');
  list.innerHTML = '';

  data.forEach((g, idx) => {
    const owned = state.gens[idx]?.count || 0;
    const lvl   = state.gens[idx]?.level || 0;

    const baseOut = economy.genOutput(idx, 0);  // 1台あたりの基礎PPS（Lv補正なし）
    const outPer  = economy.genOutput(idx, lvl); // 1台あたりの最終PPS（Lv補正込み）
    const totalOut= outPer * owned;

    const buyCost = economy.genCost(idx, owned); // 次の1個の費用
    const upCost  = economy.genUpCost(idx, lvl); // 強化+1の費用

    // 最大購入/最大強化の計算（maxAffordable は経済側の安全版を使用）
    const canBuyN   = economy.maxAffordableBuy(idx, state.power, owned);
    const canBuySum = economy.sumBuyCost(idx, owned, canBuyN);

    const canUpN    = economy.maxAffordableUp(idx, state.power, lvl);
    const nextPer   = economy.genOutput(idx, lvl + canUpN);
    const diffOut   = nextPer * owned - totalOut;

    const row = document.createElement('div');
    row.className = 'tr';
    row.innerHTML = `
      <div class="name">${g.name}</div>
      <div>${owned}台 <div class="meta">Lv <b>${lvl}</b></div></div>
      <div>
        <div>${fmt(totalOut)}/s</div>
        <div class="meta">単体: <b>${fmt(outPer)}/s</b></div>
      </div>
      <div>
        <div class="meta">次: <b>${fmt(buyCost)}</b></div>
        <div class="row" style="gap:8px;margin-top:6px;">
          <button class="btn btn-buy" data-act="buy1" data-idx="${idx}">購入 +1</button>
          <button class="btn btn-buy btn-max" data-act="buyMax" data-idx="${idx}">最大購入</button>
        </div>
        <div class="meta">
          <span>まとめ: <b>${canBuyN}</b></span>
          <span>合計費用: <b>${fmt(canBuySum)}</b></span>
        </div>
      </div>
      <div>
        <div class="meta">+1: <b>${fmt(upCost)}</b></div>
        <div class="row" style="gap:8px;margin-top:6px;">
          <button class="btn btn-upg" data-act="up1" data-idx="${idx}">強化 +1</button>
          <button class="btn btn-upg btn-max" data-act="upMax" data-idx="${idx}">最大強化</button>
        </div>
        <div class="meta">
          <span>まとめ: <b>${canUpN}</b></span>
          <span>効果変化: <b class="${diffOut>=0?'diff-plus':'diff-minus'}">${diffOut>=0?'+':''}${fmt(diffOut)}/s</b></span>
        </div>
      </div>
    `;

    // マイルストーン演出（強化が10の倍数に到達するなら光る）
    const willHit10 = ((lvl + 1) % 10 === 0) || ((lvl + canUpN) % 10 === 0);
    if (willHit10) row.classList.add('milestone');

    // 資金による無効化
    const b1 = row.querySelector('[data-act="buy1"]');
    const bm = row.querySelector('[data-act="buyMax"]');
    const u1 = row.querySelector('[data-act="up1"]');
    const um = row.querySelector('[data-act="upMax"]');

    setButtonDisabled(b1, state.power < buyCost);
    setButtonDisabled(bm, canBuyN <= 0);
    setButtonDisabled(u1, state.power < upCost);
    setButtonDisabled(um, canUpN <= 0);

    list.appendChild(row);
  });
}

/* ===== Wire events (呼び出し側で一度だけ) ===== */
export function wireUIEvents(dispatch){
  // Click core
  el('tapButton')?.addEventListener('click', () => dispatch({type:'tap'}));
  el('clickUp1')?.addEventListener('click', () => dispatch({type:'clickUp', n:1}));
  el('clickUpMax')?.addEventListener('click', () => dispatch({type:'clickUp', n:'max'}));

  // Generators (委譲)
  el('genList')?.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('button[data-act]');
    if(!btn) return;
    const idx = +btn.dataset.idx;
    const act = btn.dataset.act;
    if(act==='buy1')  dispatch({type:'genBuy', idx, n:1});
    if(act==='buyMax')dispatch({type:'genBuy', idx, n:'max'});
    if(act==='up1')   dispatch({type:'genUp', idx, n:1});
    if(act==='upMax') dispatch({type:'genUp', idx, n:'max'});
  });

  // System
  el('saveBtn')?.addEventListener('click', ()=> dispatch({type:'save'}));
  el('loadBtn')?.addEventListener('click', ()=> dispatch({type:'load'}));
  el('resetBtn')?.addEventListener('click',()=> dispatch({type:'clearSave'}));
  el('hardReset')?.addEventListener('click',()=> dispatch({type:'hardReset'}));
}

/* ===== HUD ===== */
export function renderHud(state){
  el('powerText').textContent = fmt(state.power);
  el('ppsText').textContent   = fmt(state.pps || 0);
}
