// 既定パラメータ（必要最小）
  const DEFAULTS = {
    g1:{ basePps:0.18,   baseCost:  12, costMul:1.14, upBaseCost:  50, upCostMul:1.16 },
    g2:{ basePps:1.80,   baseCost:  80, costMul:1.16, upBaseCost: 250, upCostMul:1.17 },
    g3:{ basePps:14.4,   baseCost: 700, costMul:1.17, upBaseCost:1000, upCostMul:1.18 },
    g4:{ basePps:115.2,  baseCost:5400, costMul:1.19, upBaseCost:4000, upCostMul:1.19 },
    g5:{ basePps:936.0,  baseCost:4.0e4,costMul:1.20, upBaseCost:1.7e4,upCostMul:1.20 },
    g6:{ basePps:7560,   baseCost:3.0e5,costMul:1.21, upBaseCost:8.0e4,upCostMul:1.21 },
    g7:{ basePps:6.12e4, baseCost:2.2e6,costMul:1.22, upBaseCost:3.7e5,upCostMul:1.22 },
    g8:{ basePps:4.86e5, baseCost:1.7e7,costMul:1.23, upBaseCost:1.7e6,upCostMul:1.23 },
    g9:{ basePps:3.78e6, baseCost:1.2e8,costMul:1.24, upBaseCost:7.5e6,upCostMul:1.24 },
  };

function ensureParams(gen){
  const d = DEFAULTS[gen.id] || DEFAULTS.g1;
  if (gen.level == null)      gen.level = 0;
  if (gen.basePps == null)    gen.basePps = d.basePps;
  if (gen.baseCost == null)   gen.baseCost = d.baseCost;
  if (gen.costMul == null)    gen.costMul = d.costMul;
  if (gen.upBaseCost == null) gen.upBaseCost = d.upBaseCost;
  if (gen.upCostMul == null)  gen.upCostMul = d.upCostMul;
  return gen;
}

// 強化式：1.1^Lv × 2^(floor(Lv/10))
export function powerFor(gen){
  ensureParams(gen);
  const lv = gen.level|0;
  const linear = Math.pow(1.10, lv);
  const step   = Math.pow(2, Math.floor(lv/10));
  return gen.basePps * linear * step;
}

export function totalPps(state){
  let p = 0;
  for (const g of state.gens){
    ensureParams(g);
    p += (g.count|0) * powerFor(g);
  }
  return p; // ←全体倍率は click.js の globalMultiplier を掛ける側で反映
}

export function nextUnitCost(gen){
  ensureParams(gen);
  return gen.baseCost * Math.pow(gen.costMul, gen.count|0);
}

// 等比合計
function sumGeometric(c0, r, n){
  return c0 * (Math.pow(r, n) - 1) / (r - 1);
}

export function totalCostUnits(gen, n){
  ensureParams(gen);
  const r  = gen.costMul;
  const c0 = gen.baseCost * Math.pow(r, gen.count|0);
  if (n <= 0) return 0;
  return sumGeometric(c0, r, n);
}

export function maxAffordableUnits(gen, budget){
  ensureParams(gen);
  const r  = gen.costMul;
  const c0 = gen.baseCost * Math.pow(r, gen.count|0);
  if (budget < c0) return 0;
  const nApprox = Math.floor(Math.log((budget/c0)*(r-1)+1)/Math.log(r));
  let lo = 0, hi = Math.max(1, nApprox+3);
  const costOf = (n)=> sumGeometric(c0, r, n);
  while (costOf(hi) <= budget) hi *= 2;
  while (lo < hi){
    const mid = Math.floor((lo+hi+1)/2);
    if (costOf(mid) <= budget) lo = mid; else hi = mid-1;
  }
  return lo;
}

export function buyUnits(state, id, mode='1'){
  const g = state.gens.find(x=>x.id===id);
  if (!g) return false;
  ensureParams(g);
  let n = (mode==='max') ? maxAffordableUnits(g, state.power) : 1;
  if (n <= 0) return false;
  const cost = totalCostUnits(g, n);
  if (state.power < cost) return false;
  state.power -= cost;
  g.count = (g.count|0) + n;
  return true;
}

// 強化（レベル）側
export function nextUpgradeCost(gen){
  ensureParams(gen);
  return gen.upBaseCost * Math.pow(gen.upCostMul, gen.level|0);
}
export function totalCostUpgrades(gen, n){
  ensureParams(gen);
  const r  = gen.upCostMul;
  const c0 = gen.upBaseCost * Math.pow(r, gen.level|0);
  if (n <= 0) return 0;
  return sumGeometric(c0, r, n);
}
export function maxAffordableUpgrades(gen, budget){
  ensureParams(gen);
  if ((gen.count|0) <= 0) return 0;
  const r  = gen.upCostMul;
  const c0 = gen.upBaseCost * Math.pow(r, gen.level|0);
  if (budget < c0) return 0;
  const nApprox = Math.floor(Math.log((budget/c0)*(r-1)+1)/Math.log(r));
  let lo = 0, hi = Math.max(1, nApprox+3);
  const costOf = (n)=> sumGeometric(c0, r, n);
  while (costOf(hi) <= budget) hi *= 2;
  while (lo < hi){
    const mid = Math.floor((lo+hi+1)/2);
    if (costOf(mid) <= budget) lo = mid; else hi = mid-1;
  }
  return lo;
}
export function upgrade(state, id, mode='1'){
  const g = state.gens.find(x=>x.id===id);
  if (!g) return false;
  ensureParams(g);
   if ((g.count|0) <= 0) return false;
  let n = (mode==='max') ? maxAffordableUpgrades(g, state.power) : 1;
  if (n <= 0) return false;
  const cost = totalCostUpgrades(g, n);
  if (state.power < cost) return false;
  state.power -= cost;
  g.level = (g.level|0) + n;
  return true;
}
