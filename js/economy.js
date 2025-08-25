// js/economy.js
// --- 既定パラメータ（idごと） ---
// data.js が name/desc/count だけでも動くよう、基礎コスト/倍率/出力をここで定義
const DEFAULTS = {
  g1:{ basePps:0.10,  baseCost:  15, costMul:1.15 },
  g2:{ basePps:1.00,  baseCost: 100, costMul:1.17 },
  g3:{ basePps:8.00,  baseCost: 850, costMul:1.18 },
  g4:{ basePps:64.0,  baseCost: 6_500, costMul:1.20 },
  g5:{ basePps:520.0, baseCost: 48_000, costMul:1.21 },
  g6:{ basePps:4_200, baseCost: 360_000, costMul:1.22 },
  g7:{ basePps:34_000,baseCost: 2_700_000, costMul:1.23 },
  g8:{ basePps:270_000,baseCost: 20_000_000, costMul:1.24 },
  g9:{ basePps:2_100_000,baseCost: 150_000_000, costMul:1.25 },
};

// パラメータ取得（なければ DEFAULTS を適用＆キャッシュ）
function ensureParams(gen){
  const d = DEFAULTS[gen.id] || DEFAULTS.g1;
  if (gen.basePps == null)  gen.basePps  = d.basePps;
  if (gen.baseCost == null) gen.baseCost = d.baseCost;
  if (gen.costMul == null)  gen.costMul  = d.costMul;
  return gen;
}

// n体目の「次の一体の価格」
export function nextUnitCost(gen){
  const g = ensureParams(gen);
  return g.baseCost * Math.pow(g.costMul, g.count);
}

// 等比合計：c0*(r^n - 1)/(r - 1)
function sumGeometric(c0, r, n){
  return c0 * (Math.pow(r, n) - 1) / (r - 1);
}

// まとめ購入：今の所持で買える最大体数
export function maxAffordable(gen, budget){
  const g = ensureParams(gen);
  const r  = g.costMul;
  const c0 = g.baseCost * Math.pow(r, g.count);
  if (budget < c0) return 0;
  // 近似
  const nApprox = Math.floor(Math.log((budget/c0)*(r-1)+1)/Math.log(r));
  // 安全に二分探索で詰める
  let lo = 0, hi = Math.max(1, nApprox + 3);
  const costOf = (n)=> sumGeometric(c0, r, n);
  while (costOf(hi) <= budget) hi *= 2;
  while (lo < hi){
    const mid = Math.floor((lo + hi + 1) / 2);
    if (costOf(mid) <= budget) lo = mid; else hi = mid - 1;
  }
  return lo;
}

// まとめ購入API（mode: '1'|'10'|'max'）
export function buy(state, id, mode='1'){
  const g = state.gens.find(x=>x.id===id);
  if (!g) return false;
  ensureParams(g);
  const r  = g.costMul;
  const c0 = g.baseCost * Math.pow(r, g.count);

  let n = 1;
  if (mode === '10') n = 10;
  if (mode === 'max') n = maxAffordable(g, state.power);
  if (n <= 0) return false;

  const cost = sumGeometric(c0, r, n);
  if (state.power < cost) return false;

  state.power -= cost;
  g.count += n;
  return true;
}

// 出力計算（将来のPPS用）
export function totalPps(state){
  let p = 0;
  for (const gen of state.gens){
    ensureParams(gen);
    p += gen.count * gen.basePps;
  }
  return p; // クリック/全体バフは次段で拡張予定
}
