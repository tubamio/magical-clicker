import { fmt } from './format.js';

export function nextCost(gen, count){
  // 単純指数コスト： baseCost * costMul^count
  return gen.baseCost * Math.pow(gen.costMul, count);
}

export function totalPps(state){
  let pps = 0;
  for (const g of state.generators){
    pps += g.count * g.basePps * state.mult.pps;
  }
  return pps;
}

export function clickGain(state){
  const g = state.generators.find(x=>x.id==='hand');
  const base = (g?.clickGain ?? 1) * state.mult.click;
  return base;
}

export function purchase(state, genId){
  const g = state.generators.find(x=>x.id===genId);
  if (!g) return false;
  const cost = nextCost(g, g.count);
  if (state.score < cost) return false;
  state.score -= cost;
  g.count += 1;
  return true;
}

export function tick(state, dt){
  state.score += totalPps(state) * dt;
}
