import { GLOBAL } from './data.js';

export function nextCost(gen, count){
  return gen.baseCost * Math.pow(gen.costMul, count);
}

export function totalPps(state){
  let p = 0;
  for (const g of state.generators){
    p += g.count * (g.basePps ?? 0);
  }
  return p * state.mult.pps * GLOBAL.globalMult;
}

export function clickGain(state){
  const g = state.generators.find(x=>x.id==='hand');
  const base = (g?.clickGain ?? 1);
  return base * state.mult.click * GLOBAL.clickMult;
}

// 等比合計：c0*(r^n - 1)/(r - 1)
const sumCost = (c0, r, n)=> c0 * (Math.pow(r, n) - 1) / (r - 1);

export function maxAffordable(gen, budget){
  const r = gen.costMul;
  const c0 = gen.baseCost * Math.pow(r, gen.count);
  if (budget < c0) return 0;
  const nApprox = Math.floor(Math.log((budget/c0)*(r-1)+1)/Math.log(r));
  let lo = 0, hi = Math.max(1, nApprox+3);
  const costOf = (n)=> sumCost(c0, r, n);
  while (costOf(hi) <= budget) hi *= 2;
  while (lo < hi){
    const mid = Math.floor((lo+hi+1)/2);
    if (costOf(mid) <= budget) lo = mid; else hi = mid-1;
  }
  return lo;
}

export function buy(state, id, mode='1'){ // mode: '1'|'10'|'max'
  const g = state.generators.find(x=>x.id===id);
  if (!g) return false;
  const r = g.costMul;
  const c0 = g.baseCost * Math.pow(r, g.count);
  let n = 1;
  if (mode==='10') n = 10;
  if (mode==='max') n = maxAffordable(g, state.score);
  if (n <= 0) return false;
  const cost = sumCost(c0, r, n);
  if (state.score < cost) return false;
  state.score -= cost;
  g.count += n;
  return true;
}

export function tick(state, dt){
  state.score += totalPps(state) * dt;
}
