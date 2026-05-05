import { getJobBonuses } from './jobs.js';
const D = (x)=> new Decimal(x);

export const DEFAULTS = {
  g1:{ basePps:D(5),       baseCost:D(10),      costMul:D(1.12), upBaseCost:D(25),      upCostMul:D(1.10) },
  g2:{ basePps:D(5e2),     baseCost:D(2e3),     costMul:D(1.13), upBaseCost:D(4e3),     upCostMul:D(1.105) },
  g3:{ basePps:D(5e4),     baseCost:D(3e5),     costMul:D(1.14), upBaseCost:D(6e5),     upCostMul:D(1.11) },
  g4:{ basePps:D(5e6),     baseCost:D(5e7),     costMul:D(1.15), upBaseCost:D(8e7),     upCostMul:D(1.115) },
  g5:{ basePps:D(5e8),     baseCost:D(8e9),     costMul:D(1.16), upBaseCost:D(1.2e10),  upCostMul:D(1.12) },
  g6:{ basePps:D(5e10),    baseCost:D(1.2e12),  costMul:D(1.17), upBaseCost:D(1.8e12),  upCostMul:D(1.125) },
  g7:{ basePps:D(5e12),    baseCost:D(1.8e14),  costMul:D(1.18), upBaseCost:D(2.5e14),  upCostMul:D(1.13) },
  g8:{ basePps:D(5e14),    baseCost:D(2.5e16),  costMul:D(1.19), upBaseCost:D(3.5e16),  upCostMul:D(1.135) },
  g9:{ basePps:D(5e16),    baseCost:D(3.5e18),  costMul:D(1.20), upBaseCost:D(5.0e18),  upCostMul:D(1.14) },
  g10:{ basePps:D(5e18),   baseCost:D(5.0e20),  costMul:D(1.21), upBaseCost:D(7.0e20),  upCostMul:D(1.145) },
};

function ensureParams(gen){
  const d = DEFAULTS[gen.id] || DEFAULTS.g1;
  if (gen.level == null)      gen.level = 0;
  if (gen.basePps == null)    gen.basePps = d.basePps; else gen.basePps = new Decimal(gen.basePps);
  if (gen.baseCost == null)   gen.baseCost = d.baseCost; else gen.baseCost = new Decimal(gen.baseCost);
  if (gen.costMul == null)    gen.costMul = d.costMul; else gen.costMul = new Decimal(gen.costMul);
  if (gen.upBaseCost == null) gen.upBaseCost = d.upBaseCost; else gen.upBaseCost = new Decimal(gen.upBaseCost);
  if (gen.upCostMul == null)  gen.upCostMul = d.upCostMul; else gen.upCostMul = new Decimal(gen.upCostMul);
  return gen;
}

export function powerFor(gen){
  ensureParams(gen);
  const lv = gen.level|0;
  const linear = Decimal.pow(1.12, lv);
  const step   = Decimal.pow(2.0, Math.floor(lv/10));
  return gen.basePps.times(linear).times(step);
}

export function totalPps(state){
  let p = new Decimal(0);
  for (const g of state.gens){
    ensureParams(g);
    p = p.plus(new Decimal(g.count|0).times(powerFor(g)));
  }
  return p;
}

export function nextUnitCost(gen){
  ensureParams(gen);
  return gen.baseCost.times(Decimal.pow(gen.costMul, gen.count|0));
}

export function totalCostUnits(gen, n){
  ensureParams(gen);
  let total = new Decimal(0);
  let cost = nextUnitCost(gen);
  for(let i=0;i<n;i++){
    total = total.plus(cost);
    cost = cost.times(gen.costMul);
  }
  return total;
}

export function maxAffordableUnits(gen, budget){
  ensureParams(gen);
  let n=0;
  let cost = nextUnitCost(gen);
  let total = new Decimal(0);
  while (budget.gte(total.plus(cost))){
    total = total.plus(cost);
    n++;
    cost = cost.times(gen.costMul);
    if (n>1e6) break;
  }
  return n;
}

export function buyUnits(state, id, mode='1'){
  const g = state.gens.find(x=>x.id===id);
  if (!g) return false;
  ensureParams(g);
  let n = (mode==='max') ? maxAffordableUnits(g, state.power) : 1;
  if (n <= 0) return false;
  const cost = totalCostUnits(g, n);
  if (state.power.lt(cost)) return false;
  state.power = state.power.minus(cost);
  g.count = (g.count|0) + n;
  return true;
}

export function nextUpgradeCost(gen, jb={}){
  ensureParams(gen);
  let cost = gen.upBaseCost.times(Decimal.pow(gen.upCostMul, gen.level|0));
  if(jb.upgCost) cost = cost.times(jb.upgCost);
  return cost;
}

export function totalCostUpgrades(gen, n, jb={}){
  ensureParams(gen);
  let total = new Decimal(0);
  let cost = nextUpgradeCost(gen, jb);
  for(let i=0;i<n;i++){
    total = total.plus(cost);
    cost = cost.times(gen.upCostMul);
  }
  return total;
}

export function maxAffordableUpgrades(gen, budget, jb={}){
  ensureParams(gen);
  if ((gen.count|0) <= 0) return 0;
  let n=0;
  let cost = nextUpgradeCost(gen, jb);
  let total = new Decimal(0);
  while (budget.gte(total.plus(cost))){
    total = total.plus(cost);
    n++;
    cost = cost.times(gen.upCostMul);
    if (n>1e6) break;
  }
  return n;
}

export function upgrade(state, id, mode='1'){
  const g = state.gens.find(x=>x.id===id);
  if (!g) return false;
  ensureParams(g);
  if ((g.count|0) <= 0) return false;
  const jb = getJobBonuses ? getJobBonuses(state.job) : {};
  let n = (mode==='max') ? maxAffordableUpgrades(g, state.power, jb) : 1;
  if (n <= 0) return false;
  const cost = totalCostUpgrades(g, n, jb);
  if (state.power.lt(cost)) return false;
  state.power = state.power.minus(cost);
  g.level = (g.level|0) + n;
  return true;
}
